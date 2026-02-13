"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Tokenizer", href: "/tokenizer" },
  { name: "Embeddings", href: "/embeddings" },
  { name: "Forward Pass", href: "/forward-pass" },
  { name: "Training", href: "/training" },
  { name: "Inference", href: "/inference" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            MicroGPT
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground",
                  pathname === item.href
                    ? "text-foreground border-b-2 border-foreground pb-[2px]"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/karpathy/microgpt"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Source
            </Link>
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground px-2 py-2",
                    pathname === item.href
                      ? "text-foreground border-l-2 border-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="https://github.com/karpathy/microgpt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
              >
                Source →
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
