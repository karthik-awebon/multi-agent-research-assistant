# Multi-Agent Research Assistant Architecture

A high-performance research assistant powered by a multi-agent system, built with React 19 and Next.js 16.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS
- **Validation:** Zod
- **Logging:** Pino
- **Testing:** Vitest + React Testing Library
- **Linting:** ESLint + Prettier
- **Git Hooks:** Husky + lint-staged

## Architecture Principles
This project adheres to the following core principles as defined in the `ARCHITECTURE-BLUEPRINT.md`:
- **Single Responsibility Principle (SRP):** Components, hooks, and utilities are decoupled and modular.
- **Event Sourcing:** State transitions are managed as an append-only event log.
- **Flat Entity Normalization:** Normalizing complex nested data for performance.
- **Human-in-the-Loop (HITL):** Explicit boundaries for human intervention mid-execution.

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Testing
```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

### Linting & Type Checking
```bash
# Linting
npm run lint

# Type checking
npm run type-check
```

## Directory Structure
- `src/app`: Next.js App Router pages and layouts.
- `src/components`: UI components (presentational).
- `src/hooks`: Custom React hooks for business logic.
- `src/utils`: Helper functions and utilities.
- `src/types`: Centralized TypeScript interfaces.
- `src/schemas`: Zod validation schemas.
- `src/constants.ts`: Centralized constants and environment variables.
- `src/__mocks__`: Mock data for testing.
