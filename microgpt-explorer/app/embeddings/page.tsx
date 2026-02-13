"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { generateMockEmbedding } from "@/lib/mock-data";
import { CHAR_TO_ID } from "@/lib/constants";

export default function EmbeddingsPage() {
  const [selectedToken, setSelectedToken] = useState("e");
  const [position, setPosition] = useState(2);
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

  const tokens = ["BOS", ..."abcdefghijklmnopqrstuvwxyz".split("")];

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
              <h1 className="text-4xl font-bold">Embeddings</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              After turning letters into IDs, the model converts each ID into a
              list of 16 numbers called an embedding. It combines token embeddings
              (what the letter is) with position embeddings (where it appears).
            </p>
          </div>

          {/* Controls */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <Label className="text-base mb-3 block">Select Token</Label>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token} value={token}>
                      {token} {token === "BOS" ? "(id: 26)" : `(id: ${CHAR_TO_ID[token]})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base mb-3 block">
                Position: {position}
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

          {/* Token Embedding */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Token Embedding</h2>
            <p className="text-muted-foreground mb-4">
              A unique list of 16 numbers for token "{selectedToken}"
            </p>
            <Card className="p-6">
              <div className="mb-2 text-xs text-muted-foreground text-right">
                Hover over bars to see values
              </div>
              <div className="flex items-end gap-1 h-40 border-b border-l border-border p-2">
                {tokenEmbedding.map((val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-foreground transition-all hover:opacity-100 cursor-help relative group"
                    style={{
                      height: `${(Math.abs(val) * 0.8 + 0.2) * 100}%`,
                      opacity: 0.7,
                    }}
                    title={`Dimension ${idx}: ${val.toFixed(3)}`}
                  >
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {val.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Dim 0</span>
                <span>Dim 15</span>
              </div>
            </Card>
          </div>

          {/* Position Embedding */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Position Embedding</h2>
            <p className="text-muted-foreground mb-4">
              A unique list of 16 numbers for position {position}
            </p>
            <Card className="p-6">
              <div className="mb-2 text-xs text-muted-foreground text-right">
                Hover over bars to see values
              </div>
              <div className="flex items-end gap-1 h-40 border-b border-l border-border p-2">
                {positionEmbedding.map((val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-foreground transition-all hover:opacity-100 cursor-help relative group"
                    style={{
                      height: `${(Math.abs(val) * 0.8 + 0.2) * 100}%`,
                      opacity: 0.7,
                    }}
                    title={`Dimension ${idx}: ${val.toFixed(3)}`}
                  >
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {val.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Dim 0</span>
                <span>Dim 15</span>
              </div>
            </Card>
          </div>

          {/* Combined Embedding */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold">Combined Embedding</h2>
              <Plus className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">
              The model adds these two embeddings together element-wise. This combined
              representation contains both the token identity and its position.
            </p>
            <Card className="p-6 border-2">
              <div className="mb-2 text-xs text-muted-foreground text-right">
                Hover over bars to see values
              </div>
              <div className="flex items-end gap-1 h-40 border-b border-l border-border p-2">
                {combinedEmbedding.map((val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-foreground transition-all hover:opacity-100 cursor-help relative group"
                    style={{
                      height: `${(Math.abs(val) * 0.4 + 0.3) * 100}%`,
                      opacity: 0.8,
                    }}
                    title={`Dimension ${idx}: ${val.toFixed(3)}`}
                  >
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {val.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Dim 0</span>
                <span>Dim 15</span>
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded text-sm">
                <strong>Example:</strong> Dim 0: {tokenEmbedding[0]?.toFixed(2)} + {positionEmbedding[0]?.toFixed(2)} = {combinedEmbedding[0]?.toFixed(2)}
              </div>
            </Card>
          </div>

          {/* Explanation */}
          <div className="border-t pt-8">
            <h3 className="font-bold mb-3">How it works</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Each token has a learned embedding (16 numbers)</li>
              <li>• Each position (0-15) also has a learned embedding</li>
              <li>• The model adds these together element-wise</li>
              <li>• This combined embedding flows through the rest of the network</li>
              <li>• The model learns what these numbers should be during training</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
