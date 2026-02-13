"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MOCK_GENERATED_NAMES } from "@/lib/mock-data";
import { GeneratedName } from "@/types";

export default function InferencePage() {
  const [temperature, setTemperature] = useState(0.7);
  const [numNames, setNumNames] = useState(5);
  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([]);

  const handleGenerate = () => {
    // Simulate generation by picking from mock data
    const selected = MOCK_GENERATED_NAMES.slice(0, numNames).map(name => ({
      ...name,
      temperature,
    }));
    setGeneratedNames(selected);
  };

  const handleClear = () => {
    setGeneratedNames([]);
  };

  const getTemperatureLabel = () => {
    if (temperature < 0.4) return "Conservative";
    if (temperature < 0.8) return "Balanced";
    return "Creative";
  };

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
              <span className="text-sm font-mono text-muted-foreground">05</span>
              <h1 className="text-4xl font-bold">Inference</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              After training, the model can generate new names. It starts with BOS
              and repeatedly predicts the next token until it generates BOS again.
              Temperature controls how random the choices are.
            </p>
          </div>

          {/* Controls */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <Label className="text-base mb-3 block">
                Temperature: {temperature.toFixed(2)} ({getTemperatureLabel()})
              </Label>
              <Slider
                value={[temperature]}
                onValueChange={(vals) => setTemperature(vals[0])}
                min={0.1}
                max={1.5}
                step={0.1}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Low: safe and common names • High: creative and unusual names
              </p>
            </div>

            <div>
              <Label className="text-base mb-3 block">
                Number of names: {numNames}
              </Label>
              <Slider
                value={[numNames]}
                onValueChange={(vals) => setNumNames(vals[0])}
                min={1}
                max={5}
                step={1}
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex gap-4 mb-12">
            <Button onClick={handleGenerate} size="lg" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Names
            </Button>
            {generatedNames.length > 0 && (
              <Button
                onClick={handleClear}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Generated Names */}
          {generatedNames.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-bold mb-6">Generated Names</h2>
              <div className="grid gap-4">
                {generatedNames.map((item, idx) => (
                  <Card key={idx} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-3xl font-bold mb-1">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Generated with temperature {item.temperature.toFixed(2)}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(item.name)}
                      >
                        Copy
                      </Button>
                    </div>

                    <div className="border-t pt-4">
                      <div className="text-sm font-medium mb-2">Token sequence:</div>
                      <div className="flex flex-wrap gap-2">
                        {item.tokens.map((token, tokenIdx) => (
                          <span
                            key={tokenIdx}
                            className={`px-2 py-1 border rounded font-mono text-sm ${
                              token.char === "BOS" ? "border-2" : ""
                            }`}
                          >
                            {token.char}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {generatedNames.length === 0 && (
            <div className="text-center py-12 border rounded">
              <p className="text-muted-foreground">
                Click "Generate Names" to create new names
              </p>
            </div>
          )}

          {/* Explanation */}
          <div className="border-t pt-8 mt-12">
            <h3 className="font-bold mb-3">How it works</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• The model starts with BOS token</li>
              <li>• At each step, it predicts probabilities for the next token</li>
              <li>• Temperature scales these probabilities before sampling</li>
              <li>• Low temperature makes the model more confident (picks highest probability)</li>
              <li>• High temperature makes the model more exploratory (considers more options)</li>
              <li>• Generation stops when the model predicts BOS again</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
