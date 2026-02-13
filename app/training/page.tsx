"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExplanationBox } from "@/components/ui/explanation-box";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { generateTrainingLossCurve } from "@/lib/mock-data";
import { EXAMPLE_NAMES } from "@/lib/constants";

export default function TrainingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [maxSteps, setMaxSteps] = useState(200);
  const [speed, setSpeed] = useState(10); // 1-100x speed
  const [inputSteps, setInputSteps] = useState("200");
  const [lossData, setLossData] = useState(() => generateTrainingLossCurve(200));

  // Update loss data when maxSteps changes
  useEffect(() => {
    setLossData(generateTrainingLossCurve(maxSteps));
  }, [maxSteps]);

  useEffect(() => {
    if (!isPlaying) return;

    // Speed: 150ms base, divided by speed multiplier
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = prev + 1;
        if (nextStep >= maxSteps - 1) {
          setIsPlaying(false);
          // Save training completion to localStorage
          if (typeof window !== 'undefined') {
            const totalTrained = Math.max(
              parseInt(localStorage.getItem('trainingSteps') || '0'),
              maxSteps
            );
            localStorage.setItem('trainingSteps', String(totalTrained));
            localStorage.setItem('lastTrainingDate', new Date().toISOString());
          }
          return maxSteps - 1;
        }
        return nextStep;
      });
    }, Math.max(10, 150 / speed));

    return () => clearInterval(interval);
  }, [isPlaying, speed, maxSteps]);

  const currentData = lossData.slice(0, currentStep + 1);
  const currentLoss = lossData[currentStep]?.loss || lossData[0].loss;
  const currentLR = lossData[currentStep]?.learningRate || 0.01;
  const progress = currentStep / (maxSteps - 1);

  // Determine the current phase within the training cycle
  const phaseIdx = currentStep % 4;
  const phaseNames = ["Forward", "Loss", "Backward", "Update"];
  const currentPhase = phaseNames[phaseIdx];

  // Pick a "current name" being trained on
  const currentName = EXAMPLE_NAMES[currentStep % EXAMPLE_NAMES.length];

  // Determine training stage (scaled to maxSteps)
  const getTrainingStage = () => {
    const progressPct = (currentStep / maxSteps) * 100;
    if (progressPct < 5) return { stage: "Early Training", desc: "The model is making nearly random predictions. Loss is high because it hasn't learned any patterns yet. The weights are still close to their random initial values." };
    if (progressPct < 20) return { stage: "Rapid Learning", desc: "The model is quickly picking up basic patterns — common letters, frequent bigrams, and name structure. Loss is dropping fast as gradients are large." };
    if (progressPct < 50) return { stage: "Pattern Recognition", desc: "The model has learned the basics and is now recognizing subtler patterns like 'qu' always appearing together or certain endings being more common." };
    if (progressPct < 80) return { stage: "Fine-Tuning", desc: "Diminishing returns — the model is squeezing out small improvements. The learning rate has decayed significantly, so updates are smaller." };
    return { stage: "Convergence", desc: "The model has nearly converged. Further training yields minimal improvement. The loss curve is flattening out." };
  };

  const { stage, desc: stageDesc } = getTrainingStage();

  // Calculate improvement
  const initialLoss = lossData[0].loss;
  const improvement = ((1 - currentLoss / initialLoss) * 100).toFixed(1);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const phases = [
    {
      phase: "Forward",
      icon: "→",
      desc: `Pass "${currentName}" through the model to get predictions for each next character`,
      detail: "The model processes each character position independently, predicting what comes next.",
    },
    {
      phase: "Loss",
      icon: "📉",
      desc: `Calculate how wrong the predictions are (current: ${currentLoss.toFixed(4)})`,
      detail: "Cross-entropy loss measures the gap between predicted probabilities and actual next characters.",
    },
    {
      phase: "Backward",
      icon: "←",
      desc: "Compute gradients — how much each parameter contributed to the error",
      detail: "Backpropagation traces the error backward through every operation, computing partial derivatives.",
    },
    {
      phase: "Update",
      icon: "⟳",
      desc: `Adjust all parameters using Adam optimizer (lr: ${currentLR.toFixed(6)})`,
      detail: "Adam uses momentum and adaptive learning rates to make smarter parameter updates.",
    },
  ];

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
              <span className="text-sm font-mono text-muted-foreground">04</span>
              <h1 className="text-4xl font-bold">Training</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              During training, the model processes many names and learns to predict
              the next letter. Loss measures how wrong the predictions are — lower is better.
              Press play to watch the model learn.
            </p>
          </div>

          {/* Batch Training Controls */}
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-bold mb-4">Training Controls</h2>
            <ExplanationBox variant="info" className="mb-4">
              <p>
                Set how many steps to train (1-1000), then click Play to watch the model learn.
                Use the speed slider to control how fast the animation runs (1-100x speed).
              </p>
            </ExplanationBox>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Label className="text-sm font-medium">Training Steps:</Label>
              <input
                type="number"
                value={inputSteps}
                onChange={(e) => setInputSteps(e.target.value)}
                onBlur={() => {
                  const val = parseInt(inputSteps) || 200;
                  const clamped = Math.max(10, Math.min(1000, val));
                  setInputSteps(String(clamped));
                  setMaxSteps(clamped);
                  setCurrentStep(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = parseInt(inputSteps) || 200;
                    const clamped = Math.max(10, Math.min(1000, val));
                    setInputSteps(String(clamped));
                    setMaxSteps(clamped);
                    setCurrentStep(0);
                  }
                }}
                className="w-20 px-2 py-1 border rounded text-sm"
                min="10"
                max="1000"
              />
              <div className="flex gap-2">
                {[50, 100, 200, 500, 1000].map(steps => (
                  <Button
                    key={steps}
                    variant={maxSteps === steps ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setMaxSteps(steps);
                      setInputSteps(String(steps));
                      setCurrentStep(0);
                      setIsPlaying(false);
                    }}
                  >
                    {steps}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <Label className="text-sm font-medium whitespace-nowrap">Speed: {speed}x</Label>
              <Slider
                value={[speed]}
                onValueChange={(vals) => setSpeed(vals[0])}
                min={1}
                max={100}
                step={1}
                className="w-48"
              />
              <div className="flex gap-2">
                {[1, 10, 50, 100].map(s => (
                  <Button
                    key={s}
                    variant="outline"
                    size="sm"
                    onClick={() => setSpeed(s)}
                  >
                    {s}x
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Playback Controls */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button variant="outline" size="icon" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <Label className="text-base mb-2 block">
                  Step: <strong>{currentStep}</strong> / {maxSteps - 1}
                </Label>
                <Slider
                  value={[currentStep]}
                  onValueChange={(vals) => {
                    setCurrentStep(vals[0]);
                    setIsPlaying(false);
                  }}
                  min={0}
                  max={maxSteps - 1}
                  step={1}
                />
              </div>
            </div>
          </div>

          {/* Dynamic Explanation Box */}
          <ExplanationBox
            title={`Step ${currentStep}: ${stage}`}
            variant="dynamic"
            className="mb-8"
          >
            <p className="mb-2">{stageDesc}</p>
            <p>
              Currently processing "<strong>{currentName}</strong>" —{" "}
              phase: <strong>{currentPhase}</strong>.
              Loss has improved <strong>{improvement}%</strong> from the initial value.
              {currentStep > 0 && (
                <> Learning rate: <code className="bg-muted px-1 rounded">{currentLR.toFixed(6)}</code> (decaying linearly).</>
              )}
            </p>
          </ExplanationBox>

          {/* What's Happening Now - Detailed Breakdown */}
          <Card className="p-6 mb-8 border-2 border-amber-500/30">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <span className="text-2xl">{phases[phaseIdx].icon}</span>
              What's Happening Right Now: {currentPhase} Phase
            </h2>

            <div className="space-y-3">
              {phaseIdx === 0 && (
                <ExplanationBox variant="info">
                  <p className="mb-2">
                    <strong>Forward Pass:</strong> The model reads the name "{currentName}" one character at a time.
                  </p>
                  <p className="mb-2">
                    For each position, it tries to predict what comes next. For example:
                  </p>
                  <ul className="space-y-1 ml-4">
                    <li>• Input: [start] → Predict: likely "{currentName[0]}"</li>
                    {currentName.length > 1 && <li>• Input: "{currentName[0]}" → Predict: likely "{currentName[1]}"</li>}
                    {currentName.length > 2 && <li>• Input: "{currentName.slice(0,2)}" → Predict: likely "{currentName[2]}"</li>}
                    <li>• ...and so on for all {currentName.length} characters</li>
                  </ul>
                  <p className="mt-2 text-xs">
                    The model processes each position through {"{"}embeddings → hidden layers → output logits{"}"} to get probability scores for all 27 possible next characters.
                  </p>
                </ExplanationBox>
              )}

              {phaseIdx === 1 && (
                <ExplanationBox variant="info">
                  <p className="mb-2">
                    <strong>Loss Calculation:</strong> Now we measure how wrong the predictions were.
                  </p>
                  <p className="mb-2">
                    Current loss: <code className="bg-muted px-1 rounded font-bold">{currentLoss.toFixed(4)}</code>
                    {currentLoss > 3.0 && " (very high - nearly random!)"}
                    {currentLoss > 2.5 && currentLoss <= 3.0 && " (still learning basics)"}
                    {currentLoss > 2.0 && currentLoss <= 2.5 && " (getting better!)"}
                    {currentLoss <= 2.0 && " (quite good!)"}
                  </p>
                  <p className="mb-2">
                    The loss uses <strong>cross-entropy</strong>, which compares the model's predicted probabilities to the actual next characters.
                  </p>
                  <div className="text-xs bg-muted/30 p-2 rounded mt-2">
                    <strong>Simple explanation:</strong> If the model predicted 80% chance for the correct letter, that's good (low loss).
                    If it only gave 5% chance to the correct letter, that's bad (high loss). Cross-entropy adds up all these mistakes across the entire name.
                  </div>
                </ExplanationBox>
              )}

              {phaseIdx === 2 && (
                <ExplanationBox variant="info">
                  <p className="mb-2">
                    <strong>Backward Pass (Backpropagation):</strong> Working backwards through the network to find what went wrong.
                  </p>
                  <p className="mb-2">
                    For every weight and parameter in the model, we calculate: "How much did YOU contribute to the error?"
                  </p>
                  <div className="text-xs bg-muted/30 p-2 rounded mt-2">
                    <strong>Analogy:</strong> Imagine you're baking a cake that turned out too sweet. Backpropagation is like figuring out which ingredient (sugar? vanilla? frosting?) made it too sweet, and by how much.
                    The <strong>gradient</strong> tells us: "If we change this weight a little bit, how much will the loss change?"
                  </div>
                  <p className="mt-2 text-xs">
                    This phase uses the <strong>chain rule from calculus</strong> to efficiently compute gradients for all {"{"}~thousands of{"}"} parameters at once.
                  </p>
                </ExplanationBox>
              )}

              {phaseIdx === 3 && (
                <ExplanationBox variant="info">
                  <p className="mb-2">
                    <strong>Parameter Update:</strong> Now we adjust the weights to reduce the error.
                  </p>
                  <p className="mb-2">
                    Learning rate: <code className="bg-muted px-1 rounded">{currentLR.toFixed(6)}</code> —
                    {progress < 0.2 && " large updates early on to learn fast"}
                    {progress >= 0.2 && progress < 0.6 && " medium updates for steady learning"}
                    {progress >= 0.6 && " tiny updates for fine-tuning"}
                  </p>
                  <div className="text-xs bg-muted/30 p-2 rounded mt-2">
                    <strong>Adam Optimizer:</strong> Instead of blindly following gradients, Adam is smart:
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• It <strong>remembers</strong> the direction it's been moving (momentum)</li>
                      <li>• It adapts the step size for each parameter individually</li>
                      <li>• It smooths out noisy gradients for more stable learning</li>
                    </ul>
                  </div>
                  <p className="mt-2 text-xs">
                    All {"{"}~thousands of{"}"} weights get updated simultaneously. The model is now slightly better at predicting names!
                  </p>
                </ExplanationBox>
              )}
            </div>
          </Card>

          {/* Metrics */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Current Loss</div>
              <div className="text-3xl font-bold font-mono">{currentLoss.toFixed(4)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {currentLoss > 3.0 ? "Nearly random" : currentLoss > 2.5 ? "Learning patterns" : "Getting good"}
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Learning Rate</div>
              <div className="text-3xl font-bold font-mono">{currentLR.toFixed(6)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {(progress * 100).toFixed(0)}% decayed
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Training Name</div>
              <div className="text-3xl font-bold font-mono">{currentName}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {currentName.length + 1} prediction targets
              </div>
            </Card>
          </div>

          {/* Loss Chart */}
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4">Loss Over Time</h2>
            <Card className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="step"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    domain={[2.0, 3.5]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.25rem",
                    }}
                  />
                  <ReferenceLine
                    y={3.3}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    label={{ value: "Random (ln27≈3.3)", fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="loss"
                    stroke="hsl(var(--foreground))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <ExplanationBox variant="info" className="mt-4">
                <p>
                  The dashed line at ~3.3 represents random guessing (ln(27) ≈ 3.3).
                  As the model learns, loss drops below this baseline. A loss of 2.2
                  means the model is significantly better than random — it has learned
                  real patterns in names.
                </p>
              </ExplanationBox>
            </Card>
          </div>

          {/* Training Cycle */}
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4">Training Cycle</h2>
            <ExplanationBox variant="insight" className="mb-6">
              Each training step repeats four phases. The currently active phase is highlighted.
              Click play above to watch them cycle through.
            </ExplanationBox>
            <div className="grid md:grid-cols-2 gap-4">
              {phases.map((item, idx) => (
                <Card
                  key={idx}
                  className={`p-6 transition-all ${
                    phaseIdx === idx ? "border-2 border-foreground bg-muted/30" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold flex items-center gap-2">
                      <span>{item.icon}</span> {item.phase}
                    </h3>
                    <span className="text-xs font-mono text-muted-foreground">
                      {idx + 1}/4
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{item.desc}</p>
                  {phaseIdx === idx && (
                    <p className="text-xs text-foreground/70 border-t pt-2 mt-2">
                      {item.detail}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* What the model learns */}
          <div className="border-t pt-8">
            <h3 className="font-bold mb-3">What the model learns</h3>
            <ExplanationBox variant="info">
              <ul className="space-y-2">
                <li>• You can train from <strong>10 to 1000 steps</strong> — more steps = better learning (but diminishing returns)</li>
                <li>• Each step uses <strong>one name</strong> from the dataset to update the model</li>
                <li>• Loss starts at ~3.3 (<strong>random guessing</strong> among 27 tokens: a-z + special token)</li>
                <li>• As training progresses, loss decreases — the model gets better at predicting next characters</li>
                <li>• Learning rate <strong>decays linearly</strong> from 0.01 to 0 — big updates early, small refinements late</li>
                <li>• <strong>Adam optimizer</strong> uses momentum and adaptive rates — it "remembers" previous gradients for smarter updates</li>
                <li>• The model learns patterns like:<br/>
                    &nbsp;&nbsp;→ Names often start with certain letters (A, J, M are common)<br/>
                    &nbsp;&nbsp;→ Letter combinations like "qu", "th", "er" appear frequently<br/>
                    &nbsp;&nbsp;→ Vowels and consonants alternate in realistic patterns<br/>
                    &nbsp;&nbsp;→ Names tend to end with vowels or certain consonants
                </li>
              </ul>
            </ExplanationBox>
          </div>
        </div>
      </div>
    </main>
  );
}
