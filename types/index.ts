// Core types for MicroGPT Visual Explorer

export interface Token {
  char: string;
  id: number;
}

export interface Embedding {
  tokenId: number;
  position: number;
  values: number[]; // length = n_embd (16)
}

export interface TrainingStep {
  step: number;
  loss: number;
  learningRate: number;
}

export interface GeneratedName {
  name: string;
  tokens: Token[];
  temperature: number;
}

export interface AttentionHead {
  headIndex: number;
  queryValues: number[];
  keyValues: number[][];
  valueValues: number[][];
  attentionWeights: number[];
}

export interface ForwardPassState {
  position: number;
  inputEmbedding: number[];
  afterNorm: number[];
  attentionOutput: number[];
  afterResidual1: number[];
  mlpOutput: number[];
  finalOutput: number[];
  logits: number[];
}

// Constants from microgpt.py
export const MODEL_CONFIG = {
  n_embd: 16,      // embedding dimension
  n_head: 4,       // number of attention heads
  n_layer: 1,      // number of layers
  block_size: 16,  // maximum sequence length
  vocab_size: 27,  // 26 letters + BOS token
} as const;

export const BOS_TOKEN_ID = 26;

export type SectionKey = 'tokenizer' | 'embeddings' | 'forward-pass' | 'training' | 'inference';
