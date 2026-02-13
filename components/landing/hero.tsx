"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Understand a tiny GPT,{" "}
            <span className="text-primary">step by step</span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            This site shows how a very small GPT model learns from baby names.
            You can type a name, see how the model turns letters into numbers,
            how it learns patterns, and how it makes up new names.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button size="lg" onClick={onGetStarted} className="group">
              Start Exploring
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>

            <Button variant="outline" size="lg" asChild>
              <a
                href="https://github.com/karpathy/microgpt"
                target="_blank"
                rel="noopener noreferrer"
              >
                View microgpt.py
              </a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 text-sm text-muted-foreground"
          >
            No machine learning background needed
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
