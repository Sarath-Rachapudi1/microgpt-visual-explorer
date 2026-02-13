# MicroGPT Visual Explorer

An interactive educational tool that explains how GPT models work, using simple language and clean visualizations. Built to help anyone understand the fundamentals of language models—no machine learning background needed.

## About

This site visualizes a tiny GPT model trained on baby names. It breaks down complex concepts into five interactive sections:

1. **Tokenizer** - How text becomes numbers
2. **Embeddings** - How numbers become representations
3. **Forward Pass** - How the model processes information
4. **Training** - How the model learns
5. **Inference** - How the model generates new names

## Features

- 🎨 **Clean, minimal design** - Black and white aesthetic focusing on content
- 🔄 **Interactive visualizations** - Real-time updates as you change inputs
- 📱 **Fully responsive** - Works on desktop, tablet, and mobile
- 🌓 **Dark mode support** - Automatic theme switching
- ♿ **Accessible** - Keyboard navigation and semantic HTML
- 📚 **Educational** - Plain language explanations throughout

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Shadcn UI
- **Charts**: Recharts
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd microgpt-explorer

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
microgpt-explorer/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Homepage
│   ├── tokenizer/           # Tokenizer section
│   ├── embeddings/          # Embeddings section
│   ├── forward-pass/        # Forward pass section
│   ├── training/            # Training section
│   └── inference/           # Inference section
├── components/
│   ├── ui/                  # Shadcn UI components
│   ├── layout/              # Layout components
│   └── sections/            # Section-specific components
├── lib/
│   ├── constants.ts         # Model constants and config
│   ├── mock-data.ts         # Mock data generators
│   ├── tokenizer.ts         # Tokenizer utilities
│   └── utils.ts             # Helper functions
└── types/
    └── index.ts             # TypeScript type definitions
```

## Sections

### 1. Tokenizer (`/tokenizer`)

Learn how the model converts text into numbers:
- Interactive text input
- Token sequence visualization
- Next-token prediction pairs
- BOS (Beginning of Sequence) markers

### 2. Embeddings (`/embeddings`)

See how tokens become meaningful representations:
- Token and position selectors
- Bar chart visualizations
- Visual addition of embeddings
- 16-dimensional vectors explained

### 3. Forward Pass (`/forward-pass`)

Follow information through the model:
- Step-by-step accordion interface
- Architecture flow diagram
- Key concepts explained (Attention, RMSNorm, MLP, Residuals)
- Position-by-position processing

### 4. Training (`/training`)

Watch the model learn:
- Interactive loss curve
- Play/pause animation
- Real-time metrics display
- Training cycle visualization
- 100-step simulated training

### 5. Inference (`/inference`)

Generate new names:
- Temperature control (0.1 - 1.5)
- Adjustable number of outputs
- Token sequence display
- Copy-to-clipboard functionality

## Design Philosophy

This project follows these design principles:

1. **Clarity over complexity** - Simple explanations, minimal jargon
2. **Black and white aesthetic** - No distracting colors, focus on content
3. **Progressive disclosure** - Information revealed step-by-step
4. **Responsive design** - Mobile-first approach
5. **Accessibility** - WCAG 2.1 AA compliance

## Educational Goals

The app aims to teach:

- **What** language models do (predict next tokens)
- **How** they represent information (embeddings)
- **Why** they work (attention, training, patterns)
- **When** to use different settings (temperature)

All without requiring:
- Math background
- Programming experience
- Machine learning knowledge

## Acknowledgements

Based on [microgpt.py](https://github.com/karpathy/microgpt) by Andrej Karpathy - a minimal, educational implementation of GPT in pure Python.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

---

Built with ❤️ for anyone curious about how language models work
