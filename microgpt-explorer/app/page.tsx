import Link from "next/link";
import { ArrowRight } from "lucide-react";

const sections = [
  {
    number: "01",
    title: "Tokenizer",
    description: "The model cannot read letters—it only understands numbers. Learn how text becomes tokens.",
    href: "/tokenizer",
  },
  {
    number: "02",
    title: "Embeddings",
    description: "Each token becomes a list of numbers. See how the model represents both letters and positions.",
    href: "/embeddings",
  },
  {
    number: "03",
    title: "Forward Pass",
    description: "Follow one token through the model. Watch attention, normalization, and prediction unfold.",
    href: "/forward-pass",
  },
  {
    number: "04",
    title: "Training",
    description: "The model learns from examples. See loss decrease as predictions improve over time.",
    href: "/training",
  },
  {
    number: "05",
    title: "Inference",
    description: "A trained model generates new names. Control creativity with temperature sampling.",
    href: "/inference",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Understanding GPT
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            A visual guide to how language models work
          </p>
          <p className="text-muted-foreground mb-16">
            This site explains a tiny GPT model trained on baby names. No machine learning background needed.
          </p>

          <div className="space-y-1">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="block group"
              >
                <div className="border-t py-6 transition-colors hover:bg-muted/50">
                  <div className="flex items-start gap-6">
                    <span className="text-sm font-mono text-muted-foreground mt-1">
                      {section.number}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-2xl font-bold">{section.title}</h2>
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </div>
                      <p className="text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="border-t pt-12 mt-12">
            <p className="text-sm text-muted-foreground">
              Based on{" "}
              <a
                href="https://github.com/karpathy/microgpt"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                microgpt.py
              </a>{" "}
              by Andrej Karpathy
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
