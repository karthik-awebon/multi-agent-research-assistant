# Project Context: Multi-Agent Research Assistant Architecture

## Development Lifecycle & Rules

1. **Single Responsibility Principle (SRP)**: Maintain strict separation between UI components, custom hooks for logic, and global state management.
2. **Type Safety**: Use centralized types in `src/types`. All types should be inferred from Zod schemas in `src/schemas` where applicable to ensure runtime and compile-time consistency.
3. **Constants & Configuration**: All hardcoded values, endpoints, and environment variables must reside in `src/constants.ts`.
4. **Logging**: Use the centralized `logger` from `src/utils/logger.ts` for all debugging and observability. Log levels: `debug` for flow/performance, `info` for connection status/user actions, `error` for failures.
5. **Testing Pyramid**:
   - **Unit**: Test hooks and utilities in isolation.
   - **Integration**: Test component coordination using `vitest` and `@testing-library/react`.
   - **E2E**: Test full user journeys using `cypress`.
6. **Real-time Data**: Handle real-time updates via Server-Sent Events (SSE). Ensure connections are properly cleaned up in hooks.

## Architectural Patterns

- **Execution Store**: Single source of truth for the graph state using Zustand.
- **Topological Sorting**: Nodes are blocked/unblocked dynamically based on their dependency tree status (`COMPLETED`).
- **HITL (Human-in-the-loop)**: Use `APPROVAL` node types and `LOCKED` statuses to pause execution for user review.

## Tech Stack Reminders

- Next.js 16 (App Router)
- React 19 (Strict Mode)
- Tailwind CSS 4
- Lucide React (Icons)
- Dagre (Graph Layout Engine)
- Zod (Runtime Validation)
- Pino (Logging)
- Cypress (E2E)
- Vitest (Unit/Integration)
