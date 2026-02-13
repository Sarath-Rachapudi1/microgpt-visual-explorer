import { Token } from '@/types';
import { CHAR_TO_ID, ID_TO_CHAR } from './constants';

export function tokenize(text: string): Token[] {
  const normalized = text.toLowerCase().replace(/[^a-z]/g, '');
  const tokens: Token[] = [{ char: 'BOS', id: 26 }];

  for (const char of normalized) {
    if (char in CHAR_TO_ID) {
      tokens.push({ char, id: CHAR_TO_ID[char] });
    }
  }

  tokens.push({ char: 'BOS', id: 26 });
  return tokens;
}

export function detokenize(tokens: Token[]): string {
  return tokens
    .filter(t => t.char !== 'BOS')
    .map(t => t.char)
    .join('');
}

export function getTokenPairs(tokens: Token[]): Array<{ current: Token; next: Token }> {
  const pairs: Array<{ current: Token; next: Token }> = [];

  for (let i = 0; i < tokens.length - 1; i++) {
    pairs.push({
      current: tokens[i],
      next: tokens[i + 1],
    });
  }

  return pairs;
}
