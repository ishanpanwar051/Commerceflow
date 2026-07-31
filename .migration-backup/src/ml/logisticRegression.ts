export class LogisticRegression {
  private weights: number[] = [];
  private bias = 0;
  private learningRate: number;
  private epochs: number;

  constructor(learningRate = 0.01, epochs = 1000) {
    this.learningRate = learningRate;
    this.epochs = epochs;
  }

  private sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-z));
  }

  predictProbability(features: number[]): number {
    let z = this.bias;
    for (let i = 0; i < features.length; i++) {
      z += this.weights[i] * features[i];
    }
    return this.sigmoid(z);
  }

  predict(features: number[]): number {
    return this.predictProbability(features) >= 0.5 ? 1 : 0;
  }

  train(X: number[][], y: number[]): void {
    const m = X.length;
    const n = X[0].length;

    this.weights = new Array(n).fill(0);
    this.bias = 0;

    for (let epoch = 0; epoch < this.epochs; epoch++) {
      const predictions = X.map(x => this.predictProbability(x));

      const dw = new Array(n).fill(0);
      let db = 0;

      for (let i = 0; i < m; i++) {
        const error = predictions[i] - y[i];
        for (let j = 0; j < n; j++) {
          dw[j] += X[i][j] * error;
        }
        db += error;
      }

      for (let j = 0; j < n; j++) {
        this.weights[j] -= (this.learningRate / m) * dw[j];
      }
      this.bias -= (this.learningRate / m) * db;
    }
  }

  getWeights(): number[] {
    return [...this.weights];
  }

  getBias(): number {
    return this.bias;
  }
}

export class FeatureScaler {
  private means: number[] = [];
  private stds: number[] = [];

  fit(data: number[][]): void {
    const n = data[0].length;
    this.means = [];
    this.stds = [];
    for (let j = 0; j < n; j++) {
      const col = data.map(row => row[j]);
      const mean = col.reduce((a, b) => a + b, 0) / col.length;
      const std = Math.sqrt(col.reduce((sum, val) => sum + (val - mean) ** 2, 0) / col.length);
      this.means.push(mean);
      this.stds.push(std || 1);
    }
  }

  transform(data: number[][]): number[][] {
    return data.map(row => row.map((val, j) => (val - this.means[j]) / this.stds[j]));
  }

  transformSingle(features: number[]): number[] {
    return features.map((val, j) => (val - this.means[j]) / this.stds[j]);
  }
}
