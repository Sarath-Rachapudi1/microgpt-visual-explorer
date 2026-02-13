// Vocabulary and tokenization
export const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
export const VOCAB = ALPHABET.split('').concat(['BOS']);
export const CHAR_TO_ID: { [key: string]: number } = {};
ALPHABET.split('').forEach((char, idx) => {
  CHAR_TO_ID[char] = idx;
});
CHAR_TO_ID['BOS'] = 26;

export const ID_TO_CHAR: { [key: number]: string } = {};
Object.entries(CHAR_TO_ID).forEach(([char, id]) => {
  ID_TO_CHAR[id] = char;
});

// Model configuration
export const MODEL_CONFIG = {
  n_embd: 16,
  n_head: 4,
  n_layer: 1,
  block_size: 16,
  vocab_size: 27,
  head_dim: 4, // n_embd / n_head
} as const;

// Training configuration
export const TRAINING_CONFIG = {
  num_steps: 100,
  initial_loss: 3.3,
  final_loss: 2.2,
  learning_rate: 0.01,
  beta1: 0.85,
  beta2: 0.99,
} as const;

// Example names for generation
export const EXAMPLE_NAMES = [
  'emma', 'olivia', 'ava', 'isabella', 'sophia',
  'mia', 'charlotte', 'amelia', 'harper', 'evelyn'
];

// Section descriptions
export const SECTION_INFO = {
  tokenizer: {
    title: 'Tokenizer',
    description: 'The model cannot read letters—it only understands numbers. The tokenizer turns each letter into a number and adds a special BOS token to mark the start and end.',
  },
  embeddings: {
    title: 'Embeddings',
    description: 'After turning letters into IDs, the model changes each ID into a small list of numbers called an embedding. It combines token and position information.',
  },
  'forward-pass': {
    title: 'Forward Pass',
    description: 'Here we show what happens to one position as it passes through the tiny GPT. The model normalizes, attends to previous letters, and refines the information.',
  },
  training: {
    title: 'Training',
    description: 'During training, the model goes through many names and tries to guess the next letter at each position. It measures how bad its guesses are and improves.',
  },
  inference: {
    title: 'Inference',
    description: 'After training, the model can make up new names. It starts with BOS and repeatedly guesses the next letter until it decides to stop.',
  },
} as const;
