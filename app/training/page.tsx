"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Pause } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { generateTrainingLossCurve } from "@/lib/mock-data";

export default function TrainingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lossData] = useState(() => generateTrainingLossCurve(100));

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= 99) {
          setIsPlaying(false);
          return 99;
        }
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentData = lossData.slice(0, currentStep + 1);
  const currentLoss = lossData[currentStep].loss;
  const currentLR = lossData[currentStep].learningRate;

  const phases = [
    { step: currentStep, phase: "Forward", active: currentStep % 4 === 0 },
    { step: currentStep, phase: "Loss", active: currentStep % 4 === 1 },
    { step: currentStep, phase: "Backward", active: currentStep % 4 === 2 },
    { step: currentStep, phase: "Update", active: currentStep % 4 === 3 },
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
              the next letter. Loss measures how wrong the predictions are—lower is better.
            </p>
          </div>

          {/* Controls */}
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
              <div className="flex-1">
                <Label className="text-base mb-2 block">
                  Step: {currentStep} / 99
                </Label>
                <Slider
                  value={[currentStep]}
                  onValueChange={(vals) => setCurrentStep(vals[0])}
                  min={0}
                  max={99}
                  step={1}
                />
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Current Loss</div>
              <div className="text-3xl font-bold font-mono">{currentLoss.toFixed(4)}</div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Learning Rate</div>
              <div className="text-3xl font-bold font-mono">{currentLR.toFixed(6)}</div>
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
                  <Line
                    type="monotone"
                    dataKey="loss"
                    stroke="hsl(var(--foreground))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Training Cycle */}
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4">Training Cycle</h2>
            <p className="text-muted-foreground mb-6">
              Each step consists of four phases that repeat
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {phases.map((item, idx) => (
                <Card
                  key={idx}
                  className={`p-6 transition-all ${
                    item.active ? "border-2 border-foreground" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">{item.phase}</h3>
                    <span className="text-xs font-mono text-muted-foreground">
                      {idx + 1}/4
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {idx === 0 && "Pass a name through the model to get predictions"}
                    {idx === 1 && "Calculate how wrong the predictions are"}
                    {idx === 2 && "Compute gradients for all parameters"}
                    {idx === 3 && "Adjust parameters using Adam optimizer"}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div className="border-t pt-8">
            <h3 className="font-bold mb-3">How it works</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• The model processes 1000 training steps total</li>
              <li>• Each step uses one name from the dataset</li>
              <li>• Loss starts around 3.3 (random guessing) and decreases</li>
              <li>• Learning rate decays linearly from 0.01 to 0</li>
              <li>• Adam optimizer adapts the learning rate for each parameter</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
