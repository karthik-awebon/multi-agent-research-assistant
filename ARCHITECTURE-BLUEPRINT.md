1. The State Store: Event Sourcing a DAG
   In a multi-agent system, state transitions are not linear; they form a Directed Acyclic Graph (DAG). Directly mutating a deeply nested JSON tree in React every time a sub-agent emits a tool-call token will trigger massive, cascading re-renders.

Flat Entity Normalization: Store your execution graph exactly like a relational database. Maintain a normalized state store containing a flat map of nodes (individual tasks/tool calls) and a flat map of edges (dependency links).

Immutable Event Sourcing: Treat incoming agent streams as an append-only event log. When the backend streams an update (e.g., TASK_SPAWNED, TOOL_CALL_STARTED, APPROVAL_REQUESTED), dispatch these packets to a centralized state machine (like XState or a custom useReducer store) that computes the next state of the specific node without mutating its parent or sibling contexts.

Topological Execution Queue: Use topological sorting algorithms on the client side to derive which nodes are unblocked and actively running versus which are pending upstream resolution.

2. High-Performance Execution Tree Visualization
   Rendering a live, branching execution tree that updates multiple times per second requires decoupling the layout computation from the DOM rendering engine.

Headless Layout Engines: Do not rely on CSS flexbox or grid to compute complex branching trees. Implement a headless graph layout engine (such as Dagre) inside a custom useMemo hook or a background Web Worker. The engine consumes your normalized nodes and edges, calculates absolute (x, y) positioning coordinates, and feeds them back to the UI.

Virtualization or Canvas Rendering: If a deep research task generates hundreds of parallel sub-nodes, rendering standard DOM nodes for every link will drop frame rates. Render the dependency lines using highly optimized SVG paths, and use windowing/virtualization techniques to ensure only the execution nodes currently visible in the viewport are mounted to the DOM.

3. The Human-in-the-Loop (HITL) Fence
   Designing components that seamlessly accept human intervention mid-execution requires building explicit operational boundaries.

Sub-Tree Freezing: When a node enters an Approval state, the UI must intercept the flow. Sibling agents handling unrelated branches must continue updating visually, while the target node and all its downstream topological dependents visually enter a locked, pending state.

Contextual Payloads: The approval UI must render actionable visual affordances (diffs, source arguments, reasoning logs) explicitly bound to the paused node's internal state. Once the developer approves or modifies the payload, the client emits an unblocking event back to the server orchestration layer, and the graph layout smoothly updates its visual path to resolution.
