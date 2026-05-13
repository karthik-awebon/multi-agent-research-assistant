# Multi-Agent Research Assistant Architecture

A real-time execution engine and visualization dashboard for multi-agent systems. This platform enables monitoring of complex agent task trees, tool executions, and Human-in-the-loop (HITL) interactions.

## Key Features

- **Real-time Visualization**: Dynamic graph rendering of agent execution flows using Dagre and SVG.
- **Topological Dependency Management**: Automatic blocking/unblocking of nodes based on their dependencies.
- **Human-in-the-loop (HITL)**: Specialized "Approval Fences" that pause execution until manual intervention is provided.
- **Event-Driven Architecture**: Real-time state updates powered by Server-Sent Events (SSE).
- **Comprehensive Logging**: Full observability into store transitions, layout computation, and SSE streams.
- **Strict Type Safety**: Centralized TypeScript interfaces inferred from Zod schemas.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **State Management**: Zustand
- **Real-time Data**: Server-Sent Events (SSE)
- **Graph Layout**: Dagre
- **Validation**: Zod
- **Styling**: Tailwind CSS
- **Testing**: Vitest, React Testing Library, Cypress

## Getting Started

### Installation

```bash
npm install
```

### Running Development Server

```bash
npm run dev
```

### Running Tests

- **Unit/Integration Tests**: `npm test`
- **E2E Tests**: `npm run e2e`
- **Type Checking**: `npm run type-check`

## Architecture Overview

- **`src/app`**: Next.js App Router pages and API routes (including the SSE mock stream).
- **`src/components`**: Modular UI components following SRP (ExecutionGraph, NodeCard, Edges, etc.).
- **`src/hooks`**: Specialized hooks for state orchestration, events, and layout.
- **`src/store`**: Centralized Zustand store for execution graph state.
- **`src/types`**: Centralized domain-driven type definitions.
- **`src/utils`**: Utility functions for topological sorting, error handling, and logging.

## Core Concepts

### Approval Fence
When an agent reaches a step requiring human review, the node status moves to `LOCKED`. The UI renders an `ApprovalFence` overlay, which prevents further automated progress until the user explicitly clicks "Approve" or "Reject".

### Dependency Flow
Nodes are automatically calculated as `blocked` or `unblocked` based on the status of their parent nodes. This ensures that agents only execute tasks when all prerequisite data and approvals are ready.

## Development Rules

This project follows strict engineering standards:
- **SRP**: Single Responsibility Principle for all modules.
- **TDD**: Full testing pyramid (Unit, Integration, E2E).
- **Observability**: Structured logging via Pino.
- **Type Safety**: Source-of-truth Zod schemas and centralized types.

For detailed development instructions and AI context, see [GEMINI.md](./GEMINI.md).
