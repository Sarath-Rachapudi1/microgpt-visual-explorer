# MicroGPT Visual Explorer - Improved Specification

## Overview
Build an educational web app that explains GPT architecture to non-technical users through interactive visualizations.

## Technology Stack
- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS v3+
- **Components**: Shadcn UI
- **Animations**: Framer Motion
- **Charts**: Recharts (for training visualization)
- **Icons**: Lucide React

## Key Improvements from Original Spec

### 1. **Implementation Strategy**
- Use **simulated/mocked data** (don't reimplement the Python training logic)
- Pre-compute example states for each visualization
- Focus on educational clarity over technical accuracy
- All computations are for demonstration purposes

### 2. **Design System**
- **Colors**: Use semantic Shadcn theme colors
- **Typography**: Clear hierarchy with system fonts
- **Spacing**: Consistent 4px grid system
- **Breakpoints**: Mobile-first (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- **Dark Mode**: Full support with system preference detection

### 3. **Accessibility Requirements**
- WCAG 2.1 AA compliance
- Keyboard navigation for all interactive elements
- ARIA labels for complex visualizations
- Reduced motion support (respect prefers-reduced-motion)
- Focus indicators on all interactive elements

### 4. **Data Structure**
```typescript
// Core types for the app
interface Token {
  char: string;
  id: number;
}

interface Embedding {
  tokenId: number;
  position: number;
  values: number[]; // length = n_embd (16)
}

interface TrainingStep {
  step: number;
  loss: number;
  learningRate: number;
}

interface GeneratedName {
  name: string;
  tokens: Token[];
  temperature: number;
}
```

### 5. **Link Clarifications**
Replace placeholder links with:
- Official Guide: "https://github.com/karpathy/microgpt" (or actual link)
- View Code: Link to the microgpt.py in your repo

---

## Detailed Sections (Enhanced)

### Section 1: Tokenizer

**Learning Objectives:**
- Understand that models work with numbers, not text
- Learn about the BOS (Beginning of Sequence) token
- Understand next-token prediction

**Interactive Elements:**
1. **Name Input** (Shadcn Input)
   - Default: "emma"
   - Max length: 16 chars
   - Filter: only a-z (lowercase, auto-convert)
   - Debounced updates (300ms)

2. **Token Visualization** (Custom Card Grid)
   - Horizontal scrollable container
   - Each token shown as a Card with:
     - Large character display
     - Token ID badge
     - Subtle animation on hover
   - Arrow indicators between tokens showing flow
   - Highlight on hover with tooltip

3. **Prediction Pairs Visualization**
   - Below token sequence
   - Show "current → next" pairs
   - Use different colors for current vs. next
   - Explain: "The model learns these patterns"

**Copy Template:**
```
# The Tokenizer: From Letters to Numbers

The model cannot read letters—it only understands numbers.

Here's how it works:
• Each letter (a-z) gets a unique number (0-25)
• We add a special BOS token (id: 26) to mark the start and end
• The model sees these numbers, not the letters you type

Try it: Type a name and watch it transform into numbers.
```

### Section 2: Embeddings

**Learning Objectives:**
- Understand embeddings as "internal representations"
- Learn about token vs. position embeddings
- See how they combine

**Interactive Elements:**
1. **Token Selector** (Shadcn Select)
   - Options: BOS, a-z
   - Default: 'e'

2. **Position Slider** (Shadcn Slider)
   - Range: 0-15
   - Default: 2
   - Show position label

3. **Embedding Visualizations** (3 Cards)
   - **Token Embedding Card**
     - 16 colored bars (gradient based on value)
     - Height represents magnitude
     - Tooltip shows actual value on hover
   - **Position Embedding Card**
     - Same visualization
   - **Combined Embedding Card**
     - Visual "addition" effect
     - Different color to show it's combined
     - Small "+" icon between token and position cards

**Enhancement:** Add a "Why 16?" info tooltip explaining embedding dimension

### Section 3: Forward Pass

**Learning Objectives:**
- Understand the flow through the model
- Learn about attention (simplified)
- See how outputs become predictions

**Interactive Elements:**
1. **Position Selector** (Slider or Tabs)
   - Choose which position (0-4) to trace through
   - Default: position 1

2. **Architecture Accordion** (Shadcn Accordion)
   Each section shows:
   - Step name and simple description
   - Visual diagram using connected boxes
   - Example numbers (mocked)

   Sections:
   - **Input Embeddings** → combined token + position
   - **RMSNorm** → "balancing the numbers"
   - **Multi-Head Attention** → "looking back at previous letters"
   - **Attention Output + Residual** → "keeping original info"
   - **MLP** → "refining the information"
   - **Output Logits** → "scores for next token"

3. **Flow Diagram** (Custom SVG/Div)
   - Vertical flow with arrows
   - Highlight active section based on accordion
   - Smooth transitions

**Enhancement:** Add a "See it in action" button that auto-plays through the accordion with 2s delays

### Section 4: Training

**Learning Objectives:**
- Understand training as iterative improvement
- Learn what "loss" means
- See gradient descent in simple terms

**Interactive Elements:**
1. **Step Controller**
   - Slider: 0-100 steps
   - Play/Pause button
   - Speed control (1x, 2x, 4x)
   - Auto-advance when playing

2. **Loss Chart** (Recharts Line Chart)
   - X-axis: Steps (0-100)
   - Y-axis: Loss (auto-scale)
   - Simulated loss curve (starts ~3.3, ends ~2.2)
   - Current step highlighted with vertical line
   - Tooltip shows step and loss value

3. **Training Cycle Cards** (4 Cards in Grid)
   - Each card represents one phase:
     1. **Forward**: "Read a name, make predictions"
     2. **Loss**: "Measure how wrong we are"
     3. **Backward**: "Calculate adjustments"
     4. **Update**: "Improve the model"
   - Active step has accent border
   - Subtle pulse animation on active card

4. **Learning Rate Display**
   - Show current learning rate (decays linearly)
   - Small chart showing LR decay over time

**Copy Enhancement:**
```
Loss is like a report card:
• High loss = lots of wrong guesses
• Low loss = better predictions
• Training makes loss go down over time
```

### Section 5: Inference

**Learning Objectives:**
- Understand autoregressive generation
- Learn about temperature and sampling
- See creativity vs. consistency tradeoff

**Interactive Elements:**
1. **Temperature Slider** (Shadcn Slider)
   - Range: 0.1 - 1.5
   - Default: 0.7
   - Marks at 0.5, 0.7, 1.0, 1.2
   - Real-time label: "Conservative" (< 0.5), "Balanced" (0.5-0.9), "Creative" (> 0.9)

2. **Generation Controls**
   - "Generate Names" button (Shadcn Button)
   - Number of names: Select (1, 3, 5, 10)
   - "Clear Results" button

3. **Generated Names Display**
   - Card grid (responsive)
   - Each card shows:
     - Name in large text
     - Token sequence: BOS → ... → BOS
     - "Copy" button for the name
   - Stagger animation on appearance (Framer Motion)
   - Empty state when no names generated

4. **Sample Process Visualization** (Optional expandable)
   - Show step-by-step for ONE name:
     - Current sequence
     - Model probabilities (top 5 tokens bar chart)
     - Selected token (highlighted)
     - Repeat until BOS

**Enhancement:** Add pre-generated example names that appear on first load

---

## Project Structure

```
microgpt-explorer/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/ (Shadcn components)
│   │   ├── layout/
│   │   │   ├── navbar.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── landing/
│   │   │   ├── hero.tsx
│   │   │   └── feature-cards.tsx
│   │   └── sections/
│   │       ├── tokenizer-section.tsx
│   │       ├── embeddings-section.tsx
│   │       ├── forward-pass-section.tsx
│   │       ├── training-section.tsx
│   │       └── inference-section.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   ├── mock-data.ts
│   │   └── microgpt/
│   │       ├── tokenizer.ts
│   │       ├── embeddings.ts
│   │       ├── model.ts
│   │       └── generator.ts
│   └── types/
│       └── index.ts
├── public/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Animation Guidelines

### Micro-animations (Framer Motion)
1. **Page Load**
   - Hero: fade in + slide up (0.5s, ease-out)
   - Feature cards: stagger fade in (0.1s delay each)

2. **Tab Switches**
   - Content: fade + slide (0.3s)
   - Use AnimatePresence for exit animations

3. **Interactive Elements**
   - Hover: scale(1.02) + shadow increase (0.2s)
   - Click: scale(0.98) momentarily
   - Token boxes: slide in from left (0.4s, spring)

4. **Data Updates**
   - Charts: animate data transitions (0.5s)
   - Numbers: count-up animation for metrics
   - Bars: width transitions (0.3s, ease-out)

### Respect Motion Preferences
```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
// Disable or simplify animations if true
```

## Responsive Design

### Breakpoints
- **Mobile** (< 640px): Single column, stacked sections
- **Tablet** (640px - 1024px): Some side-by-side, mostly stacked
- **Desktop** (> 1024px): Full two-column layout

### Mobile Optimizations
- Horizontal scroll for token sequences
- Accordion-style for all visualizations
- Larger touch targets (min 44x44px)
- Simplified charts on small screens

## Performance Considerations

1. **Code Splitting**
   - Lazy load Recharts
   - Dynamic imports for heavy sections

2. **Memoization**
   - Use React.memo for complex visualizations
   - useMemo for expensive calculations

3. **Bundle Size**
   - Tree-shake unused Shadcn components
   - Optimize Framer Motion imports

## Testing Strategy

1. **Visual Testing**
   - Test all sections in light/dark mode
   - Verify responsive layouts
   - Check animation smoothness

2. **Interaction Testing**
   - Test all inputs with edge cases (empty, max length, special chars)
   - Verify keyboard navigation
   - Test screen reader compatibility

3. **Performance Testing**
   - Lighthouse score > 90
   - No layout shifts (CLS < 0.1)

## README Template

```markdown
# MicroGPT Visual Explorer

An interactive educational tool that explains how GPT models work, using simple language and visualizations.

## What is this?

This site helps you understand a tiny GPT model by:
- Showing how letters become numbers (tokenization)
- Visualizing internal representations (embeddings)
- Walking through the model architecture (forward pass)
- Demonstrating the learning process (training)
- Letting you generate new names (inference)

No machine learning background needed!

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI
- Framer Motion
- Recharts

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## Acknowledgements

Based on [microgpt.py](https://github.com/karpathy/microgpt) by Andrej Karpathy.

## License

MIT
```

---

## Implementation Priorities

### Phase 1: Foundation (MVP)
1. Project setup with Next.js + Shadcn
2. Layout and navigation
3. Landing page with hero
4. Basic tabs structure

### Phase 2: Core Sections
5. Tokenizer section (full implementation)
6. Embeddings section (full implementation)
7. Mock data and utilities

### Phase 3: Advanced Sections
8. Forward pass section
9. Training section with chart
10. Inference section with generation

### Phase 4: Polish
11. Animations and transitions
12. Responsive refinements
13. Dark mode polish
14. Accessibility audit

### Phase 5: Documentation
15. README
16. Code comments
17. Deploy (Vercel)

---

## Key Differences from Original Prompt

1. **Added**: TypeScript types, data structures
2. **Added**: Accessibility requirements
3. **Added**: Responsive design specifics
4. **Added**: Performance considerations
5. **Added**: Testing strategy
6. **Added**: Implementation phases
7. **Clarified**: Use mocked data, not real training
8. **Enhanced**: More specific component descriptions
9. **Enhanced**: Animation guidelines with motion preferences
10. **Added**: Error states and edge case handling

This improved spec provides a complete blueprint for building the MicroGPT Visual Explorer with clear technical requirements and educational goals.
