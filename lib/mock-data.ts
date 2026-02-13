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

// Apply temperature scaling to logits
export function applyTemperature(logits: number[], temperature: number): number[] {
  return logits.map(l => l / temperature);
}

// Sample from probability distribution
export function sampleFromDistribution(probs: number[]): number {
  const rand = Math.random();
  let cumsum = 0;
  for (let i = 0; i < probs.length; i++) {
    cumsum += probs[i];
    if (rand < cumsum) return i;
  }
  return probs.length - 1;
}

// Generate realistic character probabilities based on context
export function generateRealisticLogits(context: string, position: number): number[] {
  const logits = Array(27).fill(-5); // Start with low probability for all

  // Character frequency in names (rough estimates)
  const commonStarters = 'aejkmlsrc';
  const vowels = 'aeiou';
  const consonants = 'bcdfghjklmnpqrstvwxyz';

  const lastChar = context.length > 0 ? context[context.length - 1] : '';
  const isAfterVowel = vowels.includes(lastChar.toLowerCase());
  const isAfterConsonant = consonants.includes(lastChar.toLowerCase());

  // Position 0 (start of name)
  if (position === 0) {
    for (const c of commonStarters) {
      const idx = c.charCodeAt(0) - 'a'.charCodeAt(0);
      logits[idx] = 2 + Math.random() * 1.5;
    }
    // Less likely starters
    for (const c of 'bdfghintpvw') {
      const idx = c.charCodeAt(0) - 'a'.charCodeAt(0);
      logits[idx] = 0.5 + Math.random();
    }
  }
  // After vowel - prefer consonants
  else if (isAfterVowel) {
    for (const c of consonants) {
      const idx = c.charCodeAt(0) - 'a'.charCodeAt(0);
      logits[idx] = 1 + Math.random() * 1.5;
    }
    // Common consonants after vowels
    for (const c of 'nrtlsm') {
      const idx = c.charCodeAt(0) - 'a'.charCodeAt(0);
      logits[idx] += 1.5;
    }
    // End token more likely after vowel
    if (context.length >= 2) {
      logits[26] = 2 + Math.random();
    }
  }
  // After consonant - prefer vowels
  else if (isAfterConsonant) {
    for (const c of vowels) {
      const idx = c.charCodeAt(0) - 'a'.charCodeAt(0);
      logits[idx] = 2 + Math.random() * 1.5;
    }
    // 'a' and 'e' most common
    logits[0] += 1; // a
    logits[4] += 1; // e

    // Some consonant clusters are ok
    if ('str'.includes(lastChar)) {
      for (const c of 'tr') {
        const idx = c.charCodeAt(0) - 'a'.charCodeAt(0);
        logits[idx] += 0.5;
      }
    }
  }

  // End token becomes more likely as name gets longer
  if (context.length >= 2) {
    logits[26] = -1 + (context.length * 0.5);
  }
  if (context.length >= 4) {
    logits[26] += 1.5;
  }
  if (context.length >= 7) {
    logits[26] += 3; // Very likely to end
  }

  // Special patterns
  if (context.endsWith('qu')) {
    logits[4] += 2; // 'e' after 'qu'
  }
  if (context.endsWith('th')) {
    logits[0] += 1.5; // 'a' after 'th'
    logits[4] += 1.5; // 'e' after 'th'
  }

  return logits;
}

// Generate a random name using temperature-controlled sampling
export function generateRandomName(temperature: number = 1.0): GeneratedName {
  const CHAR_TO_ID: { [key: string]: number } = {};
  for (let i = 0; i < 26; i++) {
    CHAR_TO_ID[String.fromCharCode(97 + i)] = i;
  }
  CHAR_TO_ID['BOS'] = 26;

  const ID_TO_CHAR: { [key: number]: string } = {};
  for (let i = 0; i < 26; i++) {
    ID_TO_CHAR[i] = String.fromCharCode(97 + i);
  }
  ID_TO_CHAR[26] = 'BOS';

  const tokens: Array<{ char: string; id: number }> = [];
  tokens.push({ char: 'BOS', id: 26 });

  let context = '';
  let position = 0;
  const maxLength = 12;

  while (position < maxLength) {
    // Generate logits for current context
    const logits = generateRealisticLogits(context, position);

    // Apply temperature
    const scaledLogits = applyTemperature(logits, temperature);

    // Convert to probabilities
    const probs = softmax(scaledLogits);

    // Sample
    const sampledId = sampleFromDistribution(probs);
    const sampledChar = ID_TO_CHAR[sampledId];

    tokens.push({ char: sampledChar, id: sampledId });

    // Stop if we hit BOS (end token)
    if (sampledId === 26) break;

    context += sampledChar;
    position++;
  }

  // If we didn't end naturally, add BOS
  if (tokens[tokens.length - 1].id !== 26) {
    tokens.push({ char: 'BOS', id: 26 });
  }

  return {
    name: context,
    tokens,
    temperature,
  };
}
