import { TrainingStep, GeneratedName } from '@/types';
import { MODEL_CONFIG, TRAINING_CONFIG } from './constants';

// Generate mock embedding values (for visualization purposes)
export function generateMockEmbedding(seed: number = 0): number[] {
  const values: number[] = [];
  for (let i = 0; i < MODEL_CONFIG.n_embd; i++) {
    // Simple pseudo-random values between -1 and 1
    values.push(Math.sin(seed + i) * 0.8);
  }
  return values;
}

// Generate mock training loss curve
export function generateTrainingLossCurve(numSteps: number = 100): TrainingStep[] {
  const steps: TrainingStep[] = [];
  const { initial_loss, final_loss, learning_rate } = TRAINING_CONFIG;

  for (let step = 0; step < numSteps; step++) {
    // Exponential decay with some noise
    const progress = step / numSteps;
    const baseLoss = initial_loss - (initial_loss - final_loss) * (1 - Math.exp(-3 * progress));
    const noise = (Math.sin(step * 0.3) * 0.2 + Math.cos(step * 0.7) * 0.15) * (1 - progress * 0.5);
    const loss = Math.max(final_loss, baseLoss + noise);

    // Linear learning rate decay
    const lr = learning_rate * (1 - progress);

    steps.push({
      step,
      loss: Number(loss.toFixed(4)),
      learningRate: Number(lr.toFixed(6)),
    });
  }

  return steps;
}

// Mock generated names (pre-computed for demo)
export const MOCK_GENERATED_NAMES: GeneratedName[] = [
  {
    name: 'kamon',
    tokens: [
      { char: 'BOS', id: 26 },
      { char: 'k', id: 10 },
      { char: 'a', id: 0 },
      { char: 'm', id: 12 },
      { char: 'o', id: 14 },
      { char: 'n', id: 13 },
      { char: 'BOS', id: 26 },
    ],
    temperature: 0.5,
  },
  {
    name: 'ann',
    tokens: [
      { char: 'BOS', id: 26 },
      { char: 'a', id: 0 },
      { char: 'n', id: 13 },
      { char: 'n', id: 13 },
      { char: 'BOS', id: 26 },
    ],
    temperature: 0.5,
  },
  {
    name: 'karai',
    tokens: [
      { char: 'BOS', id: 26 },
      { char: 'k', id: 10 },
      { char: 'a', id: 0 },
      { char: 'r', id: 17 },
      { char: 'a', id: 0 },
      { char: 'i', id: 8 },
      { char: 'BOS', id: 26 },
    ],
    temperature: 0.7,
  },
  {
    name: 'liole',
    tokens: [
      { char: 'BOS', id: 26 },
      { char: 'l', id: 11 },
      { char: 'i', id: 8 },
      { char: 'o', id: 14 },
      { char: 'l', id: 11 },
      { char: 'e', id: 4 },
      { char: 'BOS', id: 26 },
    ],
    temperature: 0.8,
  },
  {
    name: 'alerin',
    tokens: [
      { char: 'BOS', id: 26 },
      { char: 'a', id: 0 },
      { char: 'l', id: 11 },
      { char: 'e', id: 4 },
      { char: 'r', id: 17 },
      { char: 'i', id: 8 },
      { char: 'n', id: 13 },
      { char: 'BOS', id: 26 },
    ],
    temperature: 1.0,
  },
];

// Mock logits (output scores for each token)
export function generateMockLogits(targetId?: number): number[] {
  const logits = Array(MODEL_CONFIG.vocab_size).fill(0).map(() => Math.random() * 2 - 4);
  // If target specified, make it slightly higher
  if (targetId !== undefined && targetId >= 0 && targetId < MODEL_CONFIG.vocab_size) {
    logits[targetId] += 2;
  }
  return logits;
}

// Convert logits to probabilities (softmax)
export function softmax(logits: number[]): number[] {
  const maxLogit = Math.max(...logits);
  const exps = logits.map(l => Math.exp(l - maxLogit));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sumExps);
}
