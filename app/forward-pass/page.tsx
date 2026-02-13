"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ExplanationBox } from "@/components/ui/explanation-box";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateMockEmbedding, generateMockLogits, softmax } from "@/lib/mock-data";
import { ALPHABET, CHAR_TO_ID, ID_TO_CHAR, MODEL_CONFIG } from "@/lib/constants";

function VectorDisplay({ values, label }: { values: number[]; label: string }) {
  const maxAbs = Math.max(...values.map(Math.abs));
  return (
    <div className="mb-4">
      <div className="text-sm font-mono text-muted-foreground mb-1">{label}</div>
      <div className="flex gap-[2px]">
        {values.map((val, idx) => {
          const normalized = maxAbs > 0 ? Math.abs(val) / maxAbs : 0;
          const isNegative = val < 0;
          return (
            <div
              key={idx}
              className={`flex-1 h-7 rounded-sm relative group cursor-help text-[10px] flex items-center justify-center font-mono transition-all ${
                isNegative
                  ? "bg-red-400/70 dark:bg-red-500/60"
                  : "bg-emerald-500/70 dark:bg-emerald-400/60"
              }`}
              style={{ opacity: 0.3 + normalized * 0.7 }}
              title={`Dim ${idx}: ${val.toFixed(4)}`}
            >
              <span className="hidden md:inline">{val.toFixed(1)}</span>
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {val.toFixed(3)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProbabilityBars({
  probs,
  highlightChar,
}: {
  probs: number[];
  highlightChar?: string;
}) {
  const labeled = probs.map((p, idx) => ({
    char: ID_TO_CHAR[idx] || "?",
    prob: p,
    id: idx,
  }));
  const sorted = [...labeled].sort((a, b) => b.prob - a.prob).slice(0, 10);
  const maxProb = sorted[0]?.prob || 1;

  return (
    <div className="space-y-1.5">
      {sorted.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <span
            className={`font-mono text-sm w-8 text-right font-bold ${
              item.char === highlightChar
                ? "text-emerald-600 dark:text-emerald-400"
                : ""
            }`}
          >
            {item.char}
          </span>
          <div className="flex-1 h-5 bg-muted rounded-sm overflow-hidden">
            <div
              className={`h-full rounded-sm transition-all ${
                item.char === highlightChar
                  ? "bg-emerald-500 dark:bg-emerald-400"
                  : "bg-amber-600/70 dark:bg-amber-500/60"
              }`}
              style={{ width: `${(item.prob / maxProb) * 100}%` }}
            />
          </div>
          <span className="text-xs font-mono text-muted-foreground w-12 text-right">
            {(item.prob * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ForwardPassPage() {
  const [selectedToken, setSelectedToken] = useState("g");
  const [selectedPosition, setSelectedPosition] = useState("0");
  const [activeStep, setActiveStep] = useState<string | null>(null);

  const tokenId = selectedToken === "BOS" ? 26 : CHAR_TO_ID[selectedToken];
  const posNum = parseInt(selectedPosition);

  const vectors = useMemo(() => {
    const tokEmb = generateMockEmbedding(tokenId);
    const posEmb = generateMockEmbedding(posNum + 100);
    const combined = tokEmb.map((v, i) => v + posEmb[i]);

    // RMSNorm: normalize
    const rms = Math.sqrt(combined.reduce((s, v) => s + v * v, 0) / combined.length);
    const afterNorm = combined.map((v) => (rms > 0 ? (v / rms) * 1.2 : v));

    // Attention + residual (simplified)
    const afterAttn = afterNorm.map((v, i) => v + Math.sin(i * 0.5 + tokenId) * 0.3);
    const afterRes1 = combined.map((v, i) => v + afterAttn[i]);

    // MLP + residual
    const afterMLP = afterRes1.map((v, i) => v + Math.cos(i * 0.3 + posNum) * 0.4);

    return { tokEmb, posEmb, combined, afterNorm, afterAttn: afterRes1, afterMLP };
  }, [tokenId, posNum]);

  const logits = useMemo(() => generateMockLogits(tokenId), [tokenId]);
  const probs = useMemo(() => softmax(logits), [logits]);

  const topPrediction = probs.indexOf(Math.max(...probs));
  const topChar = ID_TO_CHAR[topPrediction];

  // Count active neurons in MLP (simplified: positive values after ReLU)
  const activeNeurons = vectors.afterMLP.filter((v) => v > 0).length;

  const pipelineSteps = [
    {
      id: "token",
      label: `Token '${selectedToken}'`,
      sub: `wte[${tokenId}]`,
      desc: "Look up this character's\nembedding from the table",
    },
    {
      id: "position",
      label: `Position ${posNum}`,
      sub: `wpe[${posNum}]`,
      desc: "Look up this position's\nembedding from the table",
    },
    {
      id: "combined",
      label: "tok + pos",
      sub: "Add element-wise",
      desc: 'Now encodes both\n"what" and "where"',
    },
    {
      id: "rmsnorm",
      label: "RMSNorm",
      sub: "Normalize the vector",
      desc: "Keeps values in a\nstable range",
    },
    {
      id: "attention",
      label: "Attention",
      sub: 'Q = "what am I looking for?"',
      desc: `4 heads, each dim ${MODEL_CONFIG.head_dim}`,
    },
    {
      id: "mlp",
      label: "MLP",
      sub: "Linear → ReLU → Linear",
      desc: `Expands to ${MODEL_CONFIG.n_embd * 4} dims,\nthen back to ${MODEL_CONFIG.n_embd}\n${activeNeurons}/${MODEL_CONFIG.n_embd * 4} neurons active`,
    },
    {
      id: "output",
      label: "Output",
      sub: `lm_head: ${MODEL_CONFIG.n_embd} → ${MODEL_CONFIG.vocab_size} logits`,
      desc: `softmax → probabilities\nTop: '${topChar}' ${(probs[topPrediction] * 100).toFixed(0)}%`,
    },
  ];

  const stepExplanations: Record<string, string> = {
    token: `The model looks up token '${selectedToken}' (id=${tokenId}) in its token embedding table (wte). This table has ${MODEL_CONFIG.vocab_size} rows (one per character + BOS) and ${MODEL_CONFIG.n_embd} columns. The result is a ${MODEL_CONFIG.n_embd}-dimensional vector that represents what this character "means" to the model.`,
    position: `The model also looks up position ${posNum} in its position embedding table (wpe). This table has ${MODEL_CONFIG.block_size} rows (one per possible position) and ${MODEL_CONFIG.n_embd} columns. This tells the model WHERE in the sequence this character appears.`,
    combined: `The token and position embeddings are added element-by-element. This combined vector now encodes both the identity of the character ('${selectedToken}') and its location (position ${posNum}). This is the input that flows through the rest of the model.`,
    rmsnorm: `RMSNorm (Root Mean Square Normalization) scales the vector so its values are in a consistent range. This prevents any dimension from becoming too large or too small, making training more stable. It computes the RMS of all values and divides each by it.`,
    attention: `Multi-head attention is the core mechanism. The model creates Query, Key, and Value vectors. The Query asks "what am I looking for?", Keys say "what do I contain?", and Values say "what do I offer?". With ${MODEL_CONFIG.n_head} heads (each ${MODEL_CONFIG.head_dim} dims), the model can attend to different patterns simultaneously. A residual connection adds the result back to the input.`,
    mlp: `The MLP (Multi-Layer Perceptron) is a two-layer feed-forward network. It expands the ${MODEL_CONFIG.n_embd}-dim vector to ${MODEL_CONFIG.n_embd * 4} dimensions, applies ReLU activation (setting negative values to zero), then compresses back to ${MODEL_CONFIG.n_embd}. Currently ${activeNeurons} of ${MODEL_CONFIG.n_embd * 4} neurons are active (positive after ReLU). Another residual connection adds the result back.`,
    output: `The final ${MODEL_CONFIG.n_embd}-dimensional vector is multiplied by the output projection matrix (lm_head) to produce ${MODEL_CONFIG.vocab_size} logits — one score per possible next character. Softmax converts these scores to probabilities. The model predicts '${topChar}' is most likely (${(probs[topPrediction] * 100).toFixed(1)}%).`,
  };

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
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
              <span className="text-sm font-mono text-muted-foreground">03</span>
              <h1 className="text-4xl font-bold">Forward Pass</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Watch one token flow through the entire model. Each step transforms
              the {MODEL_CONFIG.n_embd}-number vector until it becomes {MODEL_CONFIG.vocab_size} probability
              scores — one for each possible next character.
            </p>
          </div>

          {/* Select Input */}
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-bold mb-4 text-amber-700 dark:text-amber-400">
              Select Input
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Token:</span>
                <div className="flex flex-wrap gap-1">
                  {ALPHABET.split("").slice(0, 10).map((char) => (
                    <button
                      key={char}
                      onClick={() => setSelectedToken(char)}
                      className={`w-9 h-9 rounded-full font-mono text-sm font-bold transition-all ${
                        selectedToken === char
                          ? "bg-emerald-500 text-white dark:bg-emerald-600"
                          : "bg-muted hover:bg-muted-foreground/20"
                      }`}
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Position:</span>
                <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 6 }, (_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        pos {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Pipeline Flow */}
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-bold mb-2 text-amber-700 dark:text-amber-400">
              Data flowing through the model
            </h2>
            <ExplanationBox variant="info" className="mb-4">
              Each box shows the data at that stage. Click a step to see its explanation.
              The {MODEL_CONFIG.n_embd} numbers get transformed at each step.
              Colors show values: <span className="text-red-500 font-medium">negative</span> to <span className="text-emerald-500 font-medium">positive</span>.
            </ExplanationBox>

            <div className="flex flex-wrap items-start justify-center gap-2 overflow-x-auto">
              {pipelineSteps.map((step, idx) => (
                <div key={step.id} className="flex items-start gap-2">
                  <button
                    onClick={() =>
                      setActiveStep(activeStep === step.id ? null : step.id)
                    }
                    className={`border rounded-lg p-3 min-w-[120px] max-w-[150px] text-center transition-all hover:border-foreground ${
                      activeStep === step.id
                        ? "border-2 border-foreground bg-muted/50"
                        : ""
                    }`}
                  >
                    <div className="font-bold text-sm">{step.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                      {step.sub}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 whitespace-pre-line">
                      {step.desc}
                    </div>
                  </button>
                  {idx < pipelineSteps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground mt-6 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Dynamic Explanation for selected step */}
          {activeStep && (
            <ExplanationBox
              title={pipelineSteps.find((s) => s.id === activeStep)?.label || ""}
              variant="dynamic"
              className="mb-8"
            >
              <p>{stepExplanations[activeStep]}</p>
            </ExplanationBox>
          )}

          {/* Two-column: Intermediate Vectors + Output Probabilities */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Intermediate Vectors */}
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4 text-amber-700 dark:text-amber-400">
                Intermediate Vectors ({MODEL_CONFIG.n_embd} dims)
              </h2>
              <VectorDisplay values={vectors.tokEmb} label={`Token embedding: wte['${selectedToken}']`} />
              <VectorDisplay values={vectors.posEmb} label={`Position embedding: wpe[${posNum}]`} />
              <VectorDisplay values={vectors.combined} label="Combined (tok + pos)" />
              <VectorDisplay values={vectors.afterNorm} label="After RMSNorm" />
              <VectorDisplay values={vectors.afterAttn} label="After Attention + Residual" />
              <VectorDisplay values={vectors.afterMLP} label="After MLP + Residual" />
            </Card>

            {/* Output Probabilities */}
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4 text-amber-700 dark:text-amber-400">
                Output: Next Token Probabilities
              </h2>
              <ExplanationBox variant="info" className="mb-4">
                The model's prediction for what character comes after
                '{selectedToken}' at position {posNum}. Higher bars = more likely.
              </ExplanationBox>
              <ProbabilityBars probs={probs} highlightChar={topChar} />
            </Card>
          </div>

          {/* Key Concepts */}
          <div className="border-t pt-8">
            <h2 className="text-xl font-bold mb-6">Key Concepts</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <ExplanationBox title="Attention" variant="insight">
                Allows the model to look at previous positions and decide which
                ones are relevant. Each of {MODEL_CONFIG.n_head} heads can focus on different patterns.
                Q="what am I looking for?", K="what do I contain?", V="what do I offer?"
              </ExplanationBox>
              <ExplanationBox title="Residual Connections" variant="insight">
                Add the output back to the input at certain points. This helps
                gradients flow during training and preserves original information
                alongside new insights.
              </ExplanationBox>
              <ExplanationBox title="RMSNorm" variant="info">
                Normalizes values so they're on a similar scale. Prevents any
                dimension from dominating and makes training more stable.
              </ExplanationBox>
              <ExplanationBox title="MLP" variant="info">
                A two-layer network: expand to 4x size ({MODEL_CONFIG.n_embd}→{MODEL_CONFIG.n_embd * 4}),
                apply ReLU activation, then compress back ({MODEL_CONFIG.n_embd * 4}→{MODEL_CONFIG.n_embd}).
                This refines and transforms the representation.
              </ExplanationBox>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
