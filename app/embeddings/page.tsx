"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Equal } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { ExplanationBox } from "@/components/ui/explanation-box";
import { generateMockEmbedding } from "@/lib/mock-data";
import { CHAR_TO_ID, ALPHABET } from "@/lib/constants";

function EmbeddingBarChart({
  values,
  label,
  maxAbs,
}: {
  values: number[];
  label: string;
  maxAbs: number;
}) {
  return (
    <div>
      <div className="text-sm font-mono text-muted-foreground mb-2">{label}</div>
      <div className="flex gap-[2px]">
        {values.map((val, idx) => {
          const normalized = maxAbs > 0 ? Math.abs(val) / maxAbs : 0;
          const isNegative = val < 0;
          return (
            <div
              key={idx}
              className={`flex-1 h-8 rounded-sm relative group cursor-help transition-all ${
                isNegative
                  ? "bg-red-400/70 dark:bg-red-500/60"
                  : "bg-emerald-500/70 dark:bg-emerald-400/60"
              }`}
              style={{ opacity: 0.3 + normalized * 0.7 }}
              title={`Dim ${idx}: ${val.toFixed(3)}`}
            >
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {val.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function EmbeddingsPage() {
  const [selectedToken, setSelectedToken] = useState("a");
  const [position, setPosition] = useState(0);
  const [tokenEmbedding, setTokenEmbedding] = useState<number[]>([]);
  const [positionEmbedding, setPositionEmbedding] = useState<number[]>([]);
  const [combinedEmbedding, setCombinedEmbedding] = useState<number[]>([]);

  useEffect(() => {
    const tokenId = selectedToken === "BOS" ? 26 : CHAR_TO_ID[selectedToken];
    const tokEmb = generateMockEmbedding(tokenId);
    const posEmb = generateMockEmbedding(position + 100);

    setTokenEmbedding(tokEmb);
    setPositionEmbedding(posEmb);
    setCombinedEmbedding(tokEmb.map((val, idx) => val + posEmb[idx]));
  }, [selectedToken, position]);

  const allValues = [...tokenEmbedding, ...positionEmbedding, ...combinedEmbedding];
  const maxAbs = allValues.length > 0 ? Math.max(...allValues.map(Math.abs)) : 1;

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-mono text-muted-foreground">02</span>
              <h1 className="text-4xl font-bold">Embeddings (wte/wpe)</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              After turning letters into IDs, the model converts each ID into a
              list of 16 numbers called an embedding. It combines <strong>token embeddings</strong> (what)
              with <strong>position embeddings</strong> (where).
            </p>
          </div>

          {/* Select Input */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 text-amber-700 dark:text-amber-400">
              Select a Token
            </h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {ALPHABET.split("").map((char) => (
                <button
                  key={char}
                  onClick={() => setSelectedToken(char)}
                  className={`w-10 h-10 rounded-full font-mono text-sm font-bold transition-all ${
                    selectedToken === char
                      ? "bg-emerald-500 text-white dark:bg-emerald-600 scale-110"
                      : "bg-muted hover:bg-muted-foreground/20"
                  }`}
                >
                  {char}
                </button>
              ))}
              <button
                onClick={() => setSelectedToken("BOS")}
                className={`px-3 h-10 rounded-full font-mono text-xs font-bold transition-all ${
                  selectedToken === "BOS"
                    ? "bg-red-400 text-white dark:bg-red-500 scale-110"
                    : "bg-muted hover:bg-muted-foreground/20"
                }`}
              >
                BOS
              </button>
            </div>

            <div className="max-w-sm">
              <Label className="text-base mb-3 block">
                Position: <strong>{position}</strong>
              </Label>
              <Slider
                value={[position]}
                onValueChange={(vals) => setPosition(vals[0])}
                min={0}
                max={15}
                step={1}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Position in the sequence (0-15)
              </p>
            </div>
          </div>

          {/* Dynamic Explanation */}
          <ExplanationBox title={`'${selectedToken}' at position ${position}:`} variant="dynamic" className="mb-8">
            <p>
              The model looks up two things: <strong>wte['{selectedToken}']</strong> (the token embedding
              for '{selectedToken}', id={selectedToken === "BOS" ? 26 : CHAR_TO_ID[selectedToken]})
              and <strong>wpe[{position}]</strong> (the position embedding for position {position}).
              These are both learned 16-dimensional vectors — the model discovers what values
              work best during training.
            </p>
          </ExplanationBox>

          {/* Embedding Visualizations */}
          <Card className="p-6 mb-6">
            <EmbeddingBarChart
              values={tokenEmbedding}
              label={`wte['${selectedToken}'] (token embedding)`}
              maxAbs={maxAbs}
            />

            <div className="flex justify-center py-3">
              <Plus className="h-5 w-5 text-muted-foreground" />
            </div>

            <EmbeddingBarChart
              values={positionEmbedding}
              label={`wpe[${position}] (position embedding)`}
              maxAbs={maxAbs}
            />

            <div className="flex justify-center py-3">
              <Equal className="h-5 w-5 text-muted-foreground" />
            </div>

            <EmbeddingBarChart
              values={combinedEmbedding}
              label="combined (input to the model)"
              maxAbs={maxAbs}
            />

            <div className="mt-4 text-xs text-muted-foreground text-center">
              <span className="inline-flex items-center gap-1 mr-4">
                <span className="w-3 h-3 rounded-sm bg-emerald-500/70 inline-block" /> positive
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-red-400/70 inline-block" /> negative
              </span>
              <span className="ml-4">Hover over cells to see exact values</span>
            </div>
          </Card>

          {/* Example calculation */}
          <ExplanationBox title="Example calculation" variant="info" className="mb-8">
            <p>
              Dim 0: <code className="bg-muted px-1 rounded">{tokenEmbedding[0]?.toFixed(2)}</code>
              {" + "}
              <code className="bg-muted px-1 rounded">{positionEmbedding[0]?.toFixed(2)}</code>
              {" = "}
              <code className="bg-muted px-1 rounded font-bold">{combinedEmbedding[0]?.toFixed(2)}</code>
              {" — "}each of the 16 dimensions is added independently.
            </p>
          </ExplanationBox>

          {/* How wte + wpe combine */}
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4 text-amber-700 dark:text-amber-400">
              How wte + wpe combine
            </h2>
            <ExplanationBox variant="insight">
              <p className="mb-2">
                When the model processes a token, it looks up <code className="bg-muted px-1 rounded">wte[token_id]</code>{" "}
                and <code className="bg-muted px-1 rounded">wpe[position]</code>, then <strong className="text-emerald-600 dark:text-emerald-400">adds them together</strong>{" "}
                element-by-element. The result is a single vector that encodes both{" "}
                <strong className="text-blue-600 dark:text-blue-400">which</strong> character and{" "}
                <strong className="text-purple-600 dark:text-purple-400">where</strong> it is.
              </p>
              <p>
                Try changing the token and position above — notice how the combined embedding
                changes. The same letter at different positions produces different combined vectors,
                so the model knows that 'a' at position 0 is different from 'a' at position 5.
              </p>
            </ExplanationBox>
          </div>

          {/* Why embeddings? */}
          <div className="border-t pt-8">
            <h3 className="font-bold mb-3">Why embeddings?</h3>
            <ExplanationBox variant="info">
              <ul className="space-y-2">
                <li>• A bare number like "4" doesn't tell the model much. An embedding is a <strong>rich representation</strong> — 16 numbers that encode meaningful properties.</li>
                <li>• Similar letters might get similar embeddings, helping the model generalize.</li>
                <li>• Position embeddings let the model understand <strong>order</strong> — without them, "ab" and "ba" would look the same.</li>
                <li>• These embeddings are <strong>learned</strong> — they start random and improve during training.</li>
              </ul>
            </ExplanationBox>
          </div>
        </div>
      </div>
    </main>
  );
}
