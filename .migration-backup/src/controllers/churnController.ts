import { Response, NextFunction } from 'express';
import { ChurnPredictionService } from '../services/churnPredictionService';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/helpers';

const churnService = new ChurnPredictionService();

export class ChurnController {
  async getPredictions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const forceRetrain = req.query.forceRetrain === 'true';
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await churnService.getChurnPredictions(forceRetrain);

      if (limit && limit < result.predictions.length) {
        result.predictions = result.predictions.slice(0, limit);
      }

      sendSuccess(res, result, 'Churn predictions fetched successfully');
    } catch (error) { next(error); }
  }
}
