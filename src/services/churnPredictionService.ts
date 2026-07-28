import { LogisticRegression, FeatureScaler } from '../ml/logisticRegression';
import { findTopK, ScoredItem } from '../dsa/topK';
import { getPrisma } from '../config/database';
import { getRedis, isRedisAvailable } from '../config/redis';
import { logger } from '../config/logger';

interface ChurnFeatures {
  daysSinceLastLogin: number;
  orderCount: number;
  daysSinceLastOrder: number;
  avgOrderValue: number;
}

interface ChurnResult {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  churnProbability: number;
  willChurn: boolean;
  features: ChurnFeatures;
}

const CHURN_CACHE_TTL = 3600;
const CHURN_THRESHOLD_DAYS = 90;
const BATCH_SIZE = 500;

export class ChurnPredictionService {
  async getChurnPredictions(forceRetrain = false): Promise<{
    predictions: ChurnResult[];
    topAtRisk: ScoredItem<ChurnResult>[];
    modelStats: { accuracy: number; totalUsers: number; atRiskCount: number };
  }> {
    const cacheKey = 'ml:churn:predictions';

    if (!forceRetrain && isRedisAvailable()) {
      const redis = getRedis();
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const prisma = getPrisma();
    const now = new Date();

    const featureRows: number[][] = [];
    const labels: number[] = [];
    const rawData: Array<{
      userId: string;
      email: string;
      firstName: string;
      lastName: string;
      features: ChurnFeatures;
    }> = [];

    let cursor: string | undefined;
    let totalProcessed = 0;
    const MAX_USERS = 5000;

    do {
      const batch = await prisma.user.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          ...(cursor ? { id: { gt: cursor } } : {}),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          lastLoginAt: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { id: 'asc' },
        take: BATCH_SIZE,
      });

      if (batch.length === 0) break;

      for (const user of batch) {
        const daysSinceLastLogin = user.lastLoginAt
          ? Math.floor((now.getTime() - user.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        const orderCount = user._count.orders;
        const daysSinceLastOrder = user.lastLoginAt
          ? Math.floor((now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        const avgOrderValue = 0;

        const features: ChurnFeatures = {
          daysSinceLastLogin: Math.min(daysSinceLastLogin, 365),
          orderCount: Math.min(orderCount, 50),
          daysSinceLastOrder: Math.min(daysSinceLastOrder, 365),
          avgOrderValue: Math.min(avgOrderValue, 500000),
        };

        const isChurned = daysSinceLastOrder > CHURN_THRESHOLD_DAYS;

        featureRows.push([
          features.daysSinceLastLogin,
          features.orderCount,
          features.avgOrderValue,
        ]);
        labels.push(isChurned ? 1 : 0);
        rawData.push({
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          features,
        });
      }

      totalProcessed += batch.length;
      cursor = batch[batch.length - 1].id;

      if (totalProcessed >= MAX_USERS) {
        logger.warn({ totalProcessed, MAX_USERS }, 'Churn prediction: hit user limit, sampling');
        break;
      }
    } while (true);

    if (featureRows.length === 0) {
      return { predictions: [], topAtRisk: [], modelStats: { accuracy: 0, totalUsers: 0, atRiskCount: 0 } };
    }

    const scaler = new FeatureScaler();
    scaler.fit(featureRows);
    const normalizedFeatures = scaler.transform(featureRows);

    const model = new LogisticRegression(0.01, 1000);
    model.train(normalizedFeatures, labels);

    const predictions: ChurnResult[] = [];
    const scoredItems: ScoredItem<ChurnResult>[] = [];
    let correct = 0;

    for (let i = 0; i < rawData.length; i++) {
      const { userId, email, firstName, lastName, features } = rawData[i];
      const normalized = scaler.transformSingle(featureRows[i]);
      const probability = model.predictProbability(normalized);
      const willChurn = model.predict(normalized) === 1;

      predictions.push({
        userId,
        email,
        firstName,
        lastName,
        churnProbability: Math.round(probability * 10000) / 100,
        willChurn,
        features,
      });

      scoredItems.push({ item: predictions[predictions.length - 1], score: probability });

      if (willChurn === (labels[i] === 1)) correct++;
    }

    const topAtRisk = findTopK(scoredItems, 10);
    const atRiskCount = predictions.filter(p => p.willChurn).length;
    const accuracy = rawData.length > 0 ? Math.round((correct / rawData.length) * 10000) / 100 : 0;

    const result = {
      predictions,
      topAtRisk,
      modelStats: { accuracy, totalUsers: rawData.length, atRiskCount },
    };

    if (isRedisAvailable()) {
      const redis = getRedis();
      await redis.setex(cacheKey, CHURN_CACHE_TTL, JSON.stringify(result));
    }
    logger.info({ accuracy, totalUsers: totalProcessed, atRiskCount }, 'Churn prediction completed');

    return result;
  }
}
