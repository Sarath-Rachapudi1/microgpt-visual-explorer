"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, X, Copy, Check, Play, Pause, RotateCcw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExplanationBox } from "@/components/ui/explanation-box";
import { generateRandomName, generateMockLogits, softmax } from "@/lib/mock-data";
import { ID_TO_CHAR } from "@/lib/constants";
import { GeneratedName } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

function ProbabilityBars({
  probs,
  sampledChar,
}: {
  probs: number[];
  sampledChar?: string;
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
            className={`font-mono text-sm w-6 text-right font-bold ${
              item.char === sampledChar
                ? "text-emerald-600 dark:text-emerald-400"
                : ""
            }`}
          >
            {item.char}
          </span>
          <div className="flex-1 h-5 bg-muted rounded-sm overflow-hidden">
            <div
              className={`h-full rounded-sm transition-all ${
                item.char === sampledChar
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

export default function InferencePage() {
  const [temperature, setTemperature] = useState(0.5);
  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([]);
  const [selectedTracePos, setSelectedTracePos] = useState<number>(0);
  const [selectedNameIdx, setSelectedNameIdx] = useState<number>(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingCount, setGeneratingCount] = useState(0);

  // Training state from localStorage
  const [trainingSteps, setTrainingSteps] = useState(0);

  // Walkthrough animation state
  const [isWalkthroughPlaying, setIsWalkthroughPlaying] = useState(false);

  // Comparison mode state
  const [comparisonMode, setComparisonMode] = useState(false);
  const [compareTemps, setCompareTemps] = useState([0.3, 0.8, 1.5]);

  // Load training state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const steps = parseInt(localStorage.getItem('trainingSteps') || '0');
      setTrainingSteps(steps);
    }
  }, []);

  const handleGenerate = async (count: number = 1) => {
    setIsGenerating(true);
    setGeneratingCount(count);

    if (comparisonMode) {
      // In comparison mode, replace with new names at different temperatures
      const names: GeneratedName[] = [];
      for (let i = 0; i < compareTemps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        names.push(generateRandomName(compareTemps[i]));
        setGeneratedNames([...names]);
      }
    } else {
      // In normal mode, generate incrementally and ADD to existing
      const newNames: GeneratedName[] = [];
      for (let i = 0; i < count; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const newName = generateRandomName(temperature);
        newNames.push(newName);
        // Add to existing names incrementally
        setGeneratedNames((prev) => [...prev, newName]);
      }
    }

    setHasGenerated(true);
        setIsGenerating(false);
    setGeneratingCount(0);
  };

  const handleRegenerate = async () => {
    const currentCount = generatedNames.length;

    setIsGenerating(true);
    setGeneratingCount(currentCount);

    if (comparisonMode) {
      // Regenerate with comparison temperatures
      const names: GeneratedName[] = [];
      for (let i = 0; i < compareTemps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        names.push(generateRandomName(compareTemps[i]));
        setGeneratedNames([...names]);
      }
    } else {
      // Regenerate same count, replacing all
      const names: GeneratedName[] = [];
      for (let i = 0; i < currentCount; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const newName = generateRandomName(temperature);
        names.push(newName);
        setGeneratedNames([...names]);
      }
    }

    setSelectedNameIdx(0);
    setSelectedTracePos(0);
    setIsGenerating(false);
    setGeneratingCount(0);
  };

  const handleClear = () => {
    setGeneratedNames([]);
    setHasGenerated(false);
    setSelectedNameIdx(0);
    setSelectedTracePos(0);
      };

  const handleCopy = (name: string, idx: number) => {
    navigator.clipboard.writeText(name);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const getTemperatureLabel = () => {
    if (temperature <= 0.3) return "Very Conservative";
    if (temperature <= 0.5) return "Conservative";
    if (temperature <= 0.8) return "Balanced";
    if (temperature <= 1.2) return "Creative";
    return "Very Creative";
  };

  const currentName = generatedNames[selectedNameIdx];

  // Generate mock probabilities for the selected position in the trace
  const traceProbs = useMemo(() => {
    if (!currentName) return [];
    const targetToken = currentName.tokens[selectedTracePos + 1];
    const logits = generateMockLogits(targetToken?.id);
    return softmax(logits);
  }, [currentName, selectedTracePos]);

  // Walkthrough animation effect
  useEffect(() => {
    if (!isWalkthroughPlaying || !currentName) return;

    const maxSteps = currentName.tokens.length - 1;
    const interval = setInterval(() => {
      setSelectedTracePos((prev) => {
        const next = prev + 1;
        if (next > maxSteps) {
          setIsWalkthroughPlaying(false);
          return maxSteps;
        }
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isWalkthroughPlaying, currentName]);

  // Build the trace text
  const buildTraceText = (name: GeneratedName, pos: number) => {
    const probs = softmax(generateMockLogits(name.tokens[pos + 1]?.id));
    const sorted = probs
      .map((p, idx) => ({ char: ID_TO_CHAR[idx], prob: p }))
      .sort((a, b) => b.prob - a.prob)
      .slice(0, 5);
    const sampledChar = name.tokens[pos + 1]?.char || "BOS";
    const topStr = sorted
      .map((s) => `${s.char}:${(s.prob * 100).toFixed(0)}%`)
      .join(", ");
    return `pos ${pos}: [${topStr}] → '${sampledChar}'`;
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
              <span className="text-sm font-mono text-muted-foreground">05</span>
              <h1 className="text-4xl font-bold">Inference</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              After training, the model generates new names it has never seen.
              Starting from BOS, it predicts the next character, samples one,
              feeds it back in, and repeats until BOS appears again.
            </p>
          </div>

          {/* Generate Controls */}
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-bold mb-4 text-amber-700 dark:text-amber-400">
              Generate
            </h2>

            {trainingSteps === 0 && (
              <ExplanationBox variant="insight" className="mb-4">
                <strong>Model not trained.</strong> Go to <Link href="/training" className="font-bold underline">Training</Link> and
                train for 200+ steps first. You can generate now, but results will be random.
              </ExplanationBox>
            )}

            {trainingSteps > 0 && trainingSteps < 200 && (
              <ExplanationBox variant="insight" className="mb-4">
                <strong>Trained: {trainingSteps} steps.</strong> Train for 200+ steps in <Link href="/training" className="font-bold underline">Training</Link> for better results.
              </ExplanationBox>
            )}

            {trainingSteps >= 200 && !hasGenerated && (
              <ExplanationBox variant="dynamic" className="mb-4">
                <strong>Ready!</strong> Model trained for {trainingSteps} steps. Generate to see results.
              </ExplanationBox>
            )}

            <div className="space-y-4">
              {/* Generation Buttons Row */}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => handleGenerate(1)}
                  size="lg"
                  className="gap-2"
                  disabled={isGenerating}
                >
                  {isGenerating && generatingCount === 1 ? (
                    <>
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Generating 1...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {generatedNames.length > 0 ? 'Add 1 More' : 'Generate 1'}
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => handleGenerate(10)}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  disabled={isGenerating}
                >
                  {isGenerating && generatingCount === 10 ? (
                    <>
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Generating 10...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {generatedNames.length > 0 ? 'Add 10 More' : 'Generate 10'}
                    </>
                  )}
                </Button>

                {generatedNames.length > 0 && !comparisonMode && (
                  <>
                    <Button
                      onClick={handleRegenerate}
                      variant="outline"
                      size="lg"
                      className="gap-2"
                      disabled={isGenerating}
                    >
                      {isGenerating && generatingCount === generatedNames.length ? (
                        <>
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4" />
                          Regenerate All ({generatedNames.length})
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleClear}
                      variant="outline"
                      size="lg"
                      className="gap-2"
                      disabled={isGenerating}
                    >
                      <X className="h-4 w-4" />
                      Clear All
                    </Button>
                  </>
                )}

                {generatedNames.length > 0 && comparisonMode && (
                  <Button
                    onClick={handleRegenerate}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-4 w-4" />
                        Regenerate Comparison
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Temperature Control Row */}
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Label className="text-sm font-semibold whitespace-nowrap">
                  Temperature:
                </Label>
                <Slider
                  value={[temperature]}
                  onValueChange={(vals) => setTemperature(vals[0])}
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  className="flex-1 max-w-xs"
                  disabled={isGenerating}
                />
                <span className="font-mono text-lg font-bold w-12">{temperature.toFixed(1)}</span>
                <div className="text-xs text-muted-foreground ml-2">
                  {getTemperatureLabel()}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <ExplanationBox variant="info">
                <strong>Temperature</strong> controls randomness. Low ({`<`}0.5) = picks most likely characters (safe).
                High ({`>`}1.0) = more random picks (creative).
              </ExplanationBox>

              {generatedNames.length > 0 && !comparisonMode && (
                <ExplanationBox variant="dynamic">
                  <strong>{generatedNames.length} names generated.</strong> Click "Add 1/10 More" to keep adding.
                  Click "Regenerate All" to replace with new ones.
                </ExplanationBox>
              )}
            </div>

            {/* Comparison Mode Toggle */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="comparison-mode"
                  checked={comparisonMode}
                  onChange={(e) => setComparisonMode(e.target.checked)}
                  className="w-5 h-5 rounded cursor-pointer"
                  disabled={isGenerating}
                />
                <Label htmlFor="comparison-mode" className="text-base font-semibold cursor-pointer flex items-center gap-2">
                  Comparison Mode
                  <span className="text-xs font-normal text-muted-foreground">(compare 3 temperatures)</span>
                </Label>
              </div>
              {comparisonMode && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border-2 border-amber-500/30">
                  <p className="text-sm font-semibold mb-3">
                    Set 3 temperatures to compare:
                  </p>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {compareTemps.map((temp, idx) => (
                      <div key={idx} className="flex flex-col gap-2">
                        <label className="text-xs font-semibold">
                          Temp {idx + 1}
                        </label>
                        <input
                          type="text"
                          value={temp.toFixed(1)}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) {
                              const newTemps = [...compareTemps];
                              newTemps[idx] = Math.max(0.1, Math.min(2.0, val));
                              setCompareTemps(newTemps);
                            }
                          }}
                          className="px-3 py-2 border-2 rounded text-center font-mono font-bold text-lg"
                          disabled={isGenerating}
                        />
                        <span className="text-xs text-center text-muted-foreground">
                          {temp <= 0.3 ? "Safe" : temp <= 0.8 ? "Balanced" : temp <= 1.2 ? "Creative" : "Wild"}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Generates one name at each temperature to show how randomness affects output.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Dynamic Temperature Explanation */}
          <ExplanationBox
            title={`Temperature ${temperature.toFixed(1)}: ${getTemperatureLabel()}`}
            variant="dynamic"
            className="mb-8"
          >
            <p>
              {temperature <= 0.3 && "At this very low temperature, the model almost always picks the single most likely next character. Generated names will be very predictable and repetitive — you'll see the same common patterns over and over."}
              {temperature > 0.3 && temperature <= 0.5 && "At this conservative temperature, the model strongly prefers likely characters but occasionally takes a less obvious choice. Names will look realistic and common."}
              {temperature > 0.5 && temperature <= 0.8 && "This balanced temperature gives the model room to explore while still favoring likely characters. You'll get a nice mix of common patterns and occasional surprises."}
              {temperature > 0.8 && temperature <= 1.2 && "At this creative temperature, the model considers many characters almost equally. Names will be more unusual and varied — some will look real, others won't."}
              {temperature > 1.2 && "At this very high temperature, the probability distribution is nearly flattened. The model picks characters almost at random. Expect gibberish — but occasionally you'll stumble on something interesting!"}
            </p>
          </ExplanationBox>

          {/* Temperature Math Explanation */}
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-bold mb-4">How Temperature Works</h2>
            <ExplanationBox variant="info" className="mb-4">
              <p className="mb-2">
                <strong>1. Model outputs logits:</strong> Raw scores for each character (e.g., a: 2.5, b: -0.3, c: 1.8)
              </p>
              <p className="mb-2">
                <strong>2. Divide by temperature:</strong>
              </p>
              <div className="bg-muted/50 p-2 rounded font-mono text-sm mb-2">
                adjusted = logit / temperature
              </div>
              <p className="mb-2 text-sm">
                Low temp (0.3) = bigger differences = sharper peak<br/>
                High temp (2.0) = smaller differences = flatter spread
              </p>
              <p className="mb-2">
                <strong>3. Convert to probabilities (softmax):</strong>
              </p>
              <div className="bg-muted/50 p-2 rounded font-mono text-sm">
                prob = exp(adjusted) / sum(all exp values)
              </div>
            </ExplanationBox>

            {/* Temperature Comparison Chart */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Effect on Distribution</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Same raw scores, different temperatures:
              </p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={useMemo(() => {
                  const baseLogits = [2.5, 1.8, 1.5, 0.9, 0.5, -0.3, -1.0];
                  const chars = ['a', 'e', 'n', 'r', 's', 'x', 'z'];

                  const temps = [0.3, 1.0, 2.0];
                  return chars.map((char, idx) => {
                    const item: any = { char };
                    temps.forEach(t => {
                      const adjustedLogits = baseLogits.map(l => l / t);
                      const probs = softmax(adjustedLogits);
                      item[`T=${t}`] = (probs[idx] * 100);
                    });
                    return item;
                  });
                }, [])}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="char"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    label={{ value: 'Probability %', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.25rem",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="T=0.3" fill="#3b82f6" name="T=0.3 (Sharp)" />
                  <Bar dataKey="T=1.0" fill="#10b981" name="T=1.0 (Normal)" />
                  <Bar dataKey="T=2.0" fill="#f59e0b" name="T=2.0 (Flat)" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2">
                Low temp (blue) = sharp peak. High temp (orange) = even spread.
              </p>
            </div>
          </Card>

          {/* Generated Names */}
          {generatedNames.length > 0 && (
            <Card className="p-6 mb-8 border-2 border-emerald-500/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  Generated: {generatedNames.length} {generatedNames.length === 1 ? 'name' : 'names'}
                  {comparisonMode && <span className="text-sm font-normal text-muted-foreground ml-2">(Comparison)</span>}
                </h2>
                <div className="text-sm text-muted-foreground">
                  Click to see how it was made
                </div>
              </div>

              {comparisonMode && (
                <ExplanationBox variant="insight" className="mb-4">
                  <p>
                    Each name generated with different temperature. Lower temp = safer/common, higher temp = creative/unusual.
                  </p>
                </ExplanationBox>
              )}

              {!comparisonMode && hasGenerated && (
                <ExplanationBox variant="info" className="mb-4">
                  <p>
                    All names generated at temperature {temperature.toFixed(1)}. Each one uses random sampling, so they're all different.
                  </p>
                </ExplanationBox>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {generatedNames.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-2">
                    {comparisonMode && (
                      <div className="text-xs text-center font-semibold text-muted-foreground bg-muted/50 rounded px-2 py-1">
                        T={item.temperature.toFixed(1)}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setSelectedNameIdx(idx);
                        setSelectedTracePos(0);
                                                setIsWalkthroughPlaying(false);
                      }}
                      className={`px-4 py-3 rounded-lg border-2 font-mono text-lg transition-all ${
                        selectedNameIdx === idx
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 font-bold shadow-lg scale-105"
                          : "border-muted hover:border-foreground hover:shadow-md"
                      }`}
                    >
                      {item.name}
                    </button>
                  </div>
                ))}
              </div>

              {selectedNameIdx >= 0 && currentName && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm">
                    <strong>Viewing:</strong> {currentName.name}
                    {comparisonMode && <span className="text-muted-foreground ml-2">(temp {currentName.temperature.toFixed(1)})</span>}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Step-by-Step Walkthrough */}
          {currentName && (
            <Card className="p-6 mb-8 border-2 border-emerald-500/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Generation Process</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isWalkthroughPlaying) {
                      setIsWalkthroughPlaying(false);
                    } else {
                                            setSelectedTracePos(0);
                      setIsWalkthroughPlaying(true);
                    }
                  }}
                  className="gap-2"
                >
                  {isWalkthroughPlaying ? (
                    <><Pause className="h-4 w-4" /> Pause</>
                  ) : (
                    <><Play className="h-4 w-4" /> Auto-play</>
                  )}
                </Button>
              </div>

              <ExplanationBox variant="insight" className="mb-4">
                <p>
                  <strong>How "{currentName.name}" was built:</strong> The model predicted one character at a time.
                  Use the buttons below or click Auto-play to step through the process.
                </p>
              </ExplanationBox>

              <div className="space-y-4">
                {/* Current State */}
                <div className="bg-muted/30 p-4 rounded">
                  <div className="text-sm font-semibold mb-3">
                    Step {selectedTracePos + 1} of {currentName.tokens.length}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-semibold mb-1">Input to model:</div>
                      <div className="font-mono text-lg bg-white dark:bg-black p-2 rounded">
                        {currentName.tokens.slice(0, selectedTracePos + 1).map((t, i) => (
                          <span key={i} className={i === selectedTracePos ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>
                            {t.char === "BOS" ? "[START]" : t.char}
                          </span>
                        ))}
                        <span className="text-muted-foreground">_</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold mb-1">Process:</div>
                      <ol className="text-sm space-y-1">
                        <li>1. Run input through network (forward pass)</li>
                        <li>2. Get scores for all 27 characters (logits)</li>
                        <li>3. Divide by temp ({currentName.temperature.toFixed(1)}) to control randomness</li>
                        <li>4. Convert to probabilities (softmax)</li>
                        <li>5. Randomly pick from probabilities</li>
                        <li>6. Result: <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          "{currentName.tokens[selectedTracePos + 1]?.char || 'END'}"
                        </span></li>
                        {currentName.tokens[selectedTracePos + 1]?.char !== "BOS" && (
                          <li>7. Add to input and repeat</li>
                        )}
                        {currentName.tokens[selectedTracePos + 1]?.char === "BOS" && (
                          <li>7. Got END token - stop</li>
                        )}
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Visual Flow */}
                <div className="flex items-center gap-2 text-xs justify-center flex-wrap p-3 bg-muted/20 rounded">
                  <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded font-semibold">
                    {currentName.tokens[selectedTracePos]?.char || "START"}
                  </div>
                  <span>→</span>
                  <div className="px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded">
                    Network
                  </div>
                  <span>→</span>
                  <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded">
                    ÷ {currentName.temperature.toFixed(1)}
                  </div>
                  <span>→</span>
                  <div className="px-3 py-2 bg-pink-500/10 border border-pink-500/30 rounded">
                    Probabilities
                  </div>
                  <span>→</span>
                  <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded font-bold">
                    {currentName.tokens[selectedTracePos + 1]?.char || "END"}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Generation Trace + Probabilities */}
          {currentName && (
            <>
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-2">
                  Detailed Analysis
                </h2>
                <p className="text-muted-foreground">
                  See exactly what happened at each step when generating "{currentName.name}".
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {/* Trace */}
                <Card className="p-6 border-2 border-amber-500/30">
                  <h3 className="text-lg font-bold mb-2">
                    Step-by-Step Trace
                  </h3>
                  <ExplanationBox variant="info" className="mb-4">
                    Click any step below to see the probabilities the model computed at that point.
                  </ExplanationBox>

                  <div className="mb-3">
                    <div className="text-xs font-semibold mb-2">
                      Viewing step {selectedTracePos + 1} of {currentName.tokens.length - 1}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {currentName.tokens.slice(0, -1).map((token, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedTracePos(idx);
                            setIsWalkthroughPlaying(false);
                          }}
                          className={`px-3 py-2 rounded-lg border-2 font-mono text-sm transition-all ${
                            selectedTracePos === idx
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 font-bold shadow-md"
                              : "border-muted hover:border-foreground"
                          }`}
                        >
                          <div className="text-xs text-muted-foreground">#{idx}</div>
                          <div className="font-bold">{token.char === "BOS" ? "START" : token.char}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                {/* Trace log */}
                <div className="bg-muted/50 rounded p-3 font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
                  {currentName.tokens.slice(0, -1).map((_, idx) => (
                    <div
                      key={idx}
                      className={`${
                        selectedTracePos === idx ? "text-foreground font-bold" : "text-muted-foreground"
                      }`}
                    >
                      {buildTraceText(currentName, idx)}
                    </div>
                  ))}
                </div>

                {/* Copy button */}
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(currentName.name, selectedNameIdx)}
                    className="gap-1"
                  >
                    {copiedIdx === selectedNameIdx ? (
                      <><Check className="h-3 w-3" /> Copied</>
                    ) : (
                      <><Copy className="h-3 w-3" /> Copy name</>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Probabilities */}
              <Card className="p-6 border-2 border-blue-500/30">
                <h3 className="text-lg font-bold mb-2">
                  Probabilities at Step {selectedTracePos + 1}
                </h3>
                <ExplanationBox variant="info" className="mb-4">
                  <p className="mb-2">
                    <strong>Input:</strong> {currentName.tokens.slice(0, selectedTracePos + 1).map(t => t.char === "BOS" ? "[START]" : t.char).join("")}
                  </p>
                  <p className="mb-2">
                    <strong>Model output:</strong> Probability for each of 27 possible next characters.
                  </p>
                  <p>
                    <strong>Sampled:</strong> <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {currentName.tokens[selectedTracePos + 1]?.char}</span> (shown in green below)
                  </p>
                </ExplanationBox>

                <div className="bg-muted/30 p-3 rounded-lg mb-3">
                  <div className="text-xs font-semibold mb-2">Top 10 predictions:</div>
                  <ProbabilityBars
                    probs={traceProbs}
                    sampledChar={currentName.tokens[selectedTracePos + 1]?.char}
                  />
                </div>

                <div className="text-xs text-muted-foreground">
                  Temperature {currentName.temperature.toFixed(1)} controls spread: lower = sharper peak, higher = flatter distribution.
                </div>
              </Card>
            </div>
          </>
          )}

          {/* Empty State */}
          {generatedNames.length === 0 && (
            <Card className="p-12 mb-12 text-center border-2 border-dashed">
              <div className="max-w-md mx-auto space-y-4">
                <h3 className="text-xl font-bold">No names generated yet</h3>
                <p className="text-muted-foreground">
                  Click "Generate 1" or "Generate 10" above to create names.
                  You can then explore how each was built character-by-character.
                </p>
                <div className="pt-4 border-t mt-4">
                  <div className="text-sm text-muted-foreground text-left">
                    <strong>Temperature guide:</strong>
                    <div className="mt-2 space-y-1">
                      <div>0.1 - 0.5 = Safe, predictable names</div>
                      <div>0.5 - 1.0 = Balanced variety</div>
                      <div>1.0 - 2.0 = Creative, unusual names</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* How inference works */}
          <div className="border-t pt-8">
            <h3 className="font-bold mb-3">How inference works</h3>
            <ExplanationBox variant="insight">
              <ul className="space-y-2">
                <li>• The model starts with the <strong>BOS token</strong> as input</li>
                <li>• At each step, it runs a full <strong>forward pass</strong> to get probabilities for all 27 tokens</li>
                <li>• <strong>Temperature</strong> scales the logits before softmax — dividing by T makes the distribution sharper (low T) or flatter (high T)</li>
                <li>• A character is <strong>sampled</strong> from this distribution (not just argmax, which would be greedy)</li>
                <li>• The sampled character becomes the input for the next step</li>
                <li>• Generation <strong>stops</strong> when BOS is predicted — the model decides the name is complete</li>
                <li>• The same model can generate infinitely many different names due to the randomness in sampling</li>
              </ul>
            </ExplanationBox>
          </div>
        </div>
      </div>
    </main>
  );
}
