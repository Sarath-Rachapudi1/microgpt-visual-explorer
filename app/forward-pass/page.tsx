"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ForwardPassPage() {
  const [position, setPosition] = useState(1);

  const steps = [
    {
      id: "input",
      title: "Input Embedding",
      description: "Combined token and position embedding",
      content: "The model receives a 16-dimensional vector that combines information about which letter it is (token embedding) and where it appears in the sequence (position embedding).",
    },
    {
      id: "norm1",
      title: "RMSNorm (Pre-Attention)",
      description: "Normalize the input",
      content: "Root Mean Square Normalization balances the numbers so no dimension dominates. This helps the model train more stably and makes the subsequent attention layer work better.",
    },
    {
      id: "attention",
      title: "Multi-Head Attention",
      description: "Look back at previous positions",
      content: "The model looks at all previous positions (including the current one) to decide what's important. With 4 attention heads, it can focus on different patterns simultaneously—one head might focus on the previous letter, another on letters two positions back, etc.",
    },
    {
      id: "residual1",
      title: "Add Residual Connection",
      description: "Combine attention output with original input",
      content: "The attention output is added back to the original input. This 'residual connection' helps gradients flow during training and preserves the original information alongside the new insights from attention.",
    },
    {
      id: "norm2",
      title: "RMSNorm (Pre-MLP)",
      description: "Normalize again before MLP",
      content: "Another normalization step to balance the values before they enter the feed-forward network.",
    },
    {
      id: "mlp",
      title: "MLP (Feed-Forward Network)",
      description: "Process through two-layer network",
      content: "A two-layer network expands the representation to 64 dimensions (4x the embedding size), applies ReLU activation to introduce non-linearity, then projects back to 16 dimensions. This refines the representation.",
    },
    {
      id: "residual2",
      title: "Add Residual Connection",
      description: "Combine MLP output with input to MLP",
      content: "Another residual connection adds the MLP output back to its input, again helping with gradient flow and information preservation.",
    },
    {
      id: "output",
      title: "Output Logits",
      description: "Project to vocabulary size",
      content: "The final 16-dimensional representation is projected to 27 dimensions (vocabulary size). Each dimension represents the model's score for one possible next token. Higher scores mean higher probability.",
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
              <span className="text-sm font-mono text-muted-foreground">03</span>
              <h1 className="text-4xl font-bold">Forward Pass</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Follow one token through the model. Each position processes
              independently, looking back at previous positions to make its
              prediction.
            </p>
          </div>

          {/* Position Selector */}
          <div className="mb-12">
            <Label className="text-base mb-3 block">
              Current Position: {position}
            </Label>
            <Slider
              value={[position]}
              onValueChange={(vals) => setPosition(vals[0])}
              min={0}
              max={4}
              step={1}
            />
            <p className="text-sm text-muted-foreground mt-2">
              Select a position in the sequence to trace through the model
            </p>
          </div>

          {/* Architecture Flow */}
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-6">Architecture Steps</h2>
            <p className="text-muted-foreground mb-6">
              Each step transforms the 16-dimensional representation
            </p>

            <Accordion type="single" collapsible className="space-y-2">
              {steps.map((step, idx) => (
                <AccordionItem key={step.id} value={step.id}>
                  <AccordionTrigger className="hover:bg-muted/50 px-4">
                    <div className="flex items-center gap-4 text-left">
                      <span className="text-sm font-mono text-muted-foreground">
                        {(idx + 1).toString().padStart(2, "0")}
                      </span>
                      <div>
                        <div className="font-bold">{step.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {step.description}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pt-4">
                    <Card className="p-4 bg-muted/30">
                      <p className="text-sm leading-relaxed">{step.content}</p>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Flow Diagram */}
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-6">Information Flow</h2>
            <Card className="p-8">
              <div className="flex flex-col items-center gap-3">
                {["Input (16)", "Norm", "Attention (16)", "+ Residual", "Norm", "MLP (16→64→16)", "+ Residual", "Logits (27)"].map((label, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 w-full">
                    <div className="border px-6 py-3 rounded w-full max-w-xs text-center font-mono text-sm">
                      {label}
                    </div>
                    {idx < 7 && <ArrowDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Key Concepts */}
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-6">Key Concepts</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6">
                <h3 className="font-bold mb-2">Attention</h3>
                <p className="text-sm text-muted-foreground">
                  Allows the model to look at previous positions and decide which
                  ones are relevant for predicting the next token. Each of 4 heads
                  can focus on different patterns.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-bold mb-2">Residual Connections</h3>
                <p className="text-sm text-muted-foreground">
                  Add the output back to the input at certain points. This helps
                  gradients flow during training and preserves information.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-bold mb-2">RMSNorm</h3>
                <p className="text-sm text-muted-foreground">
                  Normalizes the values so they're on a similar scale. This makes
                  training more stable and prevents any dimension from dominating.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-bold mb-2">MLP</h3>
                <p className="text-sm text-muted-foreground">
                  A simple two-layer network that refines the representation. It
                  expands to 4x the size, applies activation, then contracts back.
                </p>
              </Card>
            </div>
          </div>

          {/* Explanation */}
          <div className="border-t pt-8">
            <h3 className="font-bold mb-3">How it works</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Each position processes independently through the same network</li>
              <li>• Attention is the only operation that looks at other positions</li>
              <li>• The model has only 1 layer in this tiny version (real GPTs have many)</li>
              <li>• All numbers stay in 16 dimensions except MLP (expands to 64 temporarily)</li>
              <li>• The final logits are scores—softmax converts them to probabilities</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
