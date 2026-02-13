"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { tokenize, getTokenPairs } from "@/lib/tokenizer";
import { Token } from "@/types";
import { ArrowRight } from "lucide-react";

export default function TokenizerPage() {
  const [inputText, setInputText] = useState("emma");
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    setTokens(tokenize(inputText));
  }, [inputText]);

  const pairs = getTokenPairs(tokens);

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
              The model cannot read letters—it only understands numbers.
              The tokenizer converts each letter into a unique number (0-25)
              and adds a special BOS token (26) to mark the beginning and end.
            </p>
          </div>

          {/* Input Section */}
          <div className="mb-12">
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

          {/* Token Sequence */}
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-6">Token Sequence</h2>
            <div className="flex flex-wrap gap-2">
              {tokens.map((token, idx) => (
                <Card
                  key={idx}
                  className={`px-4 py-3 ${
                    token.char === "BOS"
                      ? "border-2 border-foreground"
                      : "border"
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-2xl font-mono mb-1 ${
                      token.char === "BOS" ? "font-bold" : ""
                    }`}>
                      {token.char}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      id: {token.id}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              BOS (Beginning of Sequence) marks the start and end of each name
            </p>
          </div>

          {/* Prediction Pairs */}
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-6">Next-Token Prediction</h2>
            <p className="text-muted-foreground mb-6">
              At each position, the model sees the current token and learns to predict the next one.
            </p>
            <div className="space-y-2">
              {pairs.map((pair, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 py-3 px-4 border rounded"
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

          {/* Explanation */}
          <div className="border-t pt-8">
            <h3 className="font-bold mb-3">How it works</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Each letter a-z is assigned a number 0-25</li>
              <li>• BOS (Beginning of Sequence) gets id 26</li>
              <li>• The model processes these numbers, not the letters</li>
              <li>• During training, it learns patterns like "e often comes after m in names"</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
