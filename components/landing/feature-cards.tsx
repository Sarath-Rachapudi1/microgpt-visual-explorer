"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { SectionKey } from "@/types";
import { SECTION_INFO } from "@/lib/constants";

interface FeatureCardsProps {
  onSectionClick: (section: SectionKey) => void;
}

const features: Array<{
  key: SectionKey;
  title: string;
  description: string;
}> = [
  {
    key: "tokenizer",
    title: "Tokenizer",
    description:
      "The model cannot read letters. It only understands numbers. The tokenizer turns each letter into a number and adds a special BOS token to mark the start and end of a name.",
  },
  {
    key: "embeddings",
    title: "Embeddings",
    description:
      "After turning letters into IDs, the model changes each ID into a small list of numbers called an embedding. This way it knows both what the letter is and where it appears in the name.",
  },
  {
    key: "forward-pass",
    title: "Forward Pass",
    description:
      "Here we show what happens to one position as it passes through the tiny GPT. The model normalizes the numbers, looks at other positions to decide what matters, then refines the information.",
  },
  {
    key: "training",
    title: "Training",
    description:
      "During training, the model goes through many names and tries to guess the next letter at each position. It measures how bad its guesses are and improves over time.",
  },
  {
    key: "inference",
    title: "Inference",
    description:
      "After training, the model can make up new names. It starts with BOS and repeatedly guesses the next letter, one at a time, until it decides to stop.",
  },
];

export function FeatureCards({ onSectionClick }: FeatureCardsProps) {
  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What You Will Learn
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore five key concepts that make GPT models work, explained in
            simple terms
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="h-full"
            >
              <Card className="h-full flex flex-col transition-shadow hover:shadow-lg">
                <CardHeader className="flex-1">
                  <CardTitle className="text-xl mb-3">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>

                <div className="px-6 pb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSectionClick(feature.key)}
                    className="group w-full"
                  >
                    Explore
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
