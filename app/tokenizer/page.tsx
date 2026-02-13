"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExplanationBox } from "@/components/ui/explanation-box";
import { tokenize, getTokenPairs } from "@/lib/tokenizer";
import { Token } from "@/types";
import { CHAR_TO_ID } from "@/lib/constants";
import { ArrowRight } from "lucide-react";

export default function TokenizerPage() {
  const [inputText, setInputText] = useState("emma");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedPairIdx, setSelectedPairIdx] = useState<number | null>(null);

  useEffect(() => {
    setTokens(tokenize(inputText));
    setSelectedPairIdx(null);
  }, [inputText]);

  const pairs = getTokenPairs(tokens);
  const cleanText = inputText.toLowerCase().replace(/[^a-z]/g, "");

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-mono text-muted-foreground">01</span>
              <h1 className="text-4xl font-bold">Tokenizer</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              The model cannot read letters — it only understands numbers.
              The tokenizer converts each character to a numeric ID, and adds
              a special BOS (Begin/End of Sequence) token to mark the boundaries
              of each name.
            </p>
          </div>

          {/* Character → ID Mapping */}
          <div className="mb-12">
            <ExplanationBox title="Character → ID Mapping" variant="info">
              <p className="mb-3">
                Every unique character in the dataset gets a <strong>numeric ID</strong>.
                There are <strong>26</strong> characters (a–z) plus one special <strong>BOS</strong> token (id=26).
                Total vocabulary size: <strong>27</strong>.
              </p>
            </ExplanationBox>
            <div className="flex flex-wrap gap-2 mt-4">
              {Object.entries(CHAR_TO_ID).map(([char, id]) => (
                <div
                  key={char}
                  className={`flex flex-col items-center border rounded px-3 py-2 min-w-[44px] transition-all ${
                    char === "BOS"
                      ? "border-2 border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-950/30"
                      : cleanText.includes(char)
                        ? "border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                        : "border-muted"
                  }`}
                >
                  <span className={`font-mono font-bold text-sm ${char === "BOS" ? "text-red-600 dark:text-red-400" : ""}`}>
                    {char}
                  </span>
                  <span className="text-xs text-muted-foreground">{id}</span>
                </div>
              ))}
            </div>
            {cleanText && (
              <p className="text-xs text-muted-foreground mt-2">
                Characters highlighted in green are used in your input "{cleanText}"
              </p>
            )}
          </div>

          {/* Try It: Type a Name */}
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-2 text-amber-700 dark:text-amber-400">
              Try It: Type a Name
            </h2>
            <ExplanationBox variant="insight">
              <p>
                Type any name below. Watch how it becomes a sequence of token IDs.
                The model will learn from sequences like this — predicting each
                next token from the previous ones.
              </p>
            </ExplanationBox>

            <div className="mt-4">
              <Label htmlFor="name-input" className="text-base mb-3 block">
                Type a name
              </Label>
              <Input
                id="name-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value.toLowerCase())}
                placeholder="Enter a name..."
                className="text-lg h-12 max-w-md"
                maxLength={16}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Only letters a-z are used. Maximum 16 characters.
              </p>
            </div>
          </div>

          {/* Token Sequence Visualization */}
          {cleanText && (
            <div className="mb-12">
              <h2 className="text-xl font-bold mb-6">Token Sequence</h2>
              <div className="flex flex-wrap items-center gap-2">
                {tokens.map((token, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className={`flex flex-col items-center rounded-lg px-4 py-3 border-2 transition-all ${
                        token.char === "BOS"
                          ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-950/30"
                          : "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                      }`}
                    >
                      <span className={`text-xl font-mono font-bold ${
                        token.char === "BOS" ? "text-red-600 dark:text-red-400 text-sm" : ""
                      }`}>
                        {token.char}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        id: {token.id}
                      </span>
                    </div>
                    {idx < tokens.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              {/* Dynamic Explanation */}
              <ExplanationBox title="What just happened" variant="dynamic" className="mt-6">
                <p>
                  Your input "<strong>{cleanText}</strong>" was converted to{" "}
                  <strong>{tokens.length} tokens</strong>: a BOS token at the start,{" "}
                  {cleanText.length} character token{cleanText.length !== 1 ? "s" : ""} ({cleanText.split("").map(
                    (c, i) => (
                      <span key={i}>
                        {i > 0 ? ", " : ""}
                        <code className="bg-muted px-1 rounded">{c}→{CHAR_TO_ID[c]}</code>
                      </span>
                    )
                  )}), and a BOS token at the end.
                  The model sees only the numbers: [{tokens.map(t => t.id).join(", ")}].
                </p>
              </ExplanationBox>
            </div>
          )}

          {/* What the model must learn */}
          {pairs.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-bold mb-2 text-amber-700 dark:text-amber-400">
                What the model must learn:
              </h2>
              <ExplanationBox variant="info">
                <p>
                  For each position, the model sees the <strong className="text-emerald-600 dark:text-emerald-400">current token</strong>{" "}
                  and must predict the <strong className="text-blue-600 dark:text-blue-400">next token</strong>.
                  This is called <strong>next-token prediction</strong> — the core of how GPT works.
                </p>
              </ExplanationBox>

              <div className="flex flex-wrap gap-2 mt-4">
                {pairs.map((pair, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPairIdx(selectedPairIdx === idx ? null : idx)}
                    className={`px-3 py-2 rounded border font-mono text-sm transition-all hover:border-foreground ${
                      selectedPairIdx === idx ? "border-2 border-foreground bg-muted" : ""
                    }`}
                  >
                    {pair.current.char}→{pair.next.char}
                  </button>
                ))}
              </div>

              {selectedPairIdx !== null && (
                <ExplanationBox title="Prediction detail" variant="dynamic" className="mt-4">
                  <p>
                    At <strong>step {selectedPairIdx + 1}</strong>, the model sees token{" "}
                    "<strong>{pairs[selectedPairIdx].current.char}</strong>" (id: {pairs[selectedPairIdx].current.id})
                    and must learn to predict "{" "}
                    <strong>{pairs[selectedPairIdx].next.char}</strong>" (id: {pairs[selectedPairIdx].next.id}).
                    {selectedPairIdx === 0 && " This is the first prediction — after BOS, what letter does the name start with?"}
                    {selectedPairIdx === pairs.length - 1 && " This is the last prediction — the model must learn that the name ends here."}
                    {selectedPairIdx > 0 && selectedPairIdx < pairs.length - 1 && (
                      <> After seeing {pairs.slice(0, selectedPairIdx + 1).map(p => `"${p.current.char}"`).join("→")}, what comes next?</>
                    )}
                  </p>
                </ExplanationBox>
              )}

              {/* Full prediction table */}
              <div className="space-y-2 mt-6">
                {pairs.map((pair, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-4 py-3 px-4 border rounded cursor-pointer transition-all hover:bg-muted/50 ${
                      selectedPairIdx === idx ? "border-2 border-foreground bg-muted/50" : ""
                    }`}
                    onClick={() => setSelectedPairIdx(selectedPairIdx === idx ? null : idx)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="font-mono">
                        <span className="font-medium">{pair.current.char}</span>
                        <span className="text-muted-foreground text-sm ml-2">
                          (id: {pair.current.id})
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div className="font-mono">
                        <span className="font-medium">{pair.next.char}</span>
                        <span className="text-muted-foreground text-sm ml-2">
                          (id: {pair.next.id})
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Step {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How tokenization works in real GPTs */}
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4 text-amber-700 dark:text-amber-400">
              How tokenization works in real GPTs
            </h2>
            <ExplanationBox variant="insight">
              <p className="mb-2">
                This micro GPT uses <strong>character-level</strong> tokenization — each letter is one token.
              </p>
              <p>
                Real GPTs (like GPT-4) use <strong>subword tokenization</strong> (BPE) where common word
                parts like "ing", "tion", "the" become single tokens. This makes the vocabulary
                much larger (~50,000+ tokens) but allows the model to process text more efficiently.
              </p>
            </ExplanationBox>
          </div>
        </div>
      </div>
    </main>
  );
}
