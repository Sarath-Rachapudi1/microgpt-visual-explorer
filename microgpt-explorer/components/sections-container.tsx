"use client";

import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionKey } from "@/types";

interface SectionsContainerProps {
  activeSection: SectionKey;
  onSectionChange: (section: SectionKey) => void;
}

export function SectionsContainer({
  activeSection,
  onSectionChange,
}: SectionsContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section ref={containerRef} id="explorer" className="py-16">
      <div className="container mx-auto px-4">
        <Tabs
          value={activeSection}
          onValueChange={(value) => onSectionChange(value as SectionKey)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-8">
            <TabsTrigger value="tokenizer">Tokenizer</TabsTrigger>
            <TabsTrigger value="embeddings">Embeddings</TabsTrigger>
            <TabsTrigger value="forward-pass">Forward Pass</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="inference">Inference</TabsTrigger>
          </TabsList>

          <TabsContent value="tokenizer" className="space-y-4">
            <div className="rounded-lg border bg-card p-8">
              <h2 className="text-2xl font-bold mb-4">Tokenizer Section</h2>
              <p className="text-muted-foreground">
                Coming soon: Interactive tokenizer visualization
              </p>
            </div>
          </TabsContent>

          <TabsContent value="embeddings" className="space-y-4">
            <div className="rounded-lg border bg-card p-8">
              <h2 className="text-2xl font-bold mb-4">Embeddings Section</h2>
              <p className="text-muted-foreground">
                Coming soon: Embedding visualization
              </p>
            </div>
          </TabsContent>

          <TabsContent value="forward-pass" className="space-y-4">
            <div className="rounded-lg border bg-card p-8">
              <h2 className="text-2xl font-bold mb-4">Forward Pass Section</h2>
              <p className="text-muted-foreground">
                Coming soon: Forward pass visualization
              </p>
            </div>
          </TabsContent>

          <TabsContent value="training" className="space-y-4">
            <div className="rounded-lg border bg-card p-8">
              <h2 className="text-2xl font-bold mb-4">Training Section</h2>
              <p className="text-muted-foreground">
                Coming soon: Training visualization
              </p>
            </div>
          </TabsContent>

          <TabsContent value="inference" className="space-y-4">
            <div className="rounded-lg border bg-card p-8">
              <h2 className="text-2xl font-bold mb-4">Inference Section</h2>
              <p className="text-muted-foreground">
                Coming soon: Name generation interface
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
