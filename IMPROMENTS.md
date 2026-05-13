1.  Real-Time Streaming (SSE or WebSockets)
    Currently, the events are mocked in a useEffect. In production, agent tokens and tool calls are streamed.

- Action: Implement Server-Sent Events (SSE) or WebSockets (Socket.io/Ably). SSE is often preferred for LLM streaming
  because it is lighter and handles unidirectional updates better.
- Why: You need to handle reconnection logic, stream buffering, and out-of-order event packets (Event Sourcing
  sequencing).

2. State Persistence & Resilience
   If the user refreshes the page, the execution graph currently disappears.

- Action:
  - Backend Store: Persist the normalized DAG in a database (Postgres with JSONB or Redis).
  - Hydration: On page load, the frontend should "hydrate" the Zustand store from a GET /execution/:id endpoint.
  - Checkpointing: Use a backend Task Queue (like Temporal or BullMQ) to ensure that if a sub-agent crashes, it can
    resume from its last completed node.

3. Advanced Visualization (Pan, Zoom, & Virtualization)
   Research graphs can grow to hundreds of nodes. The current SVG/HTML hybrid will jitter or overflow the screen.

- Action:
  - Pan & Zoom: Integrate a library like React Flow (which uses a similar normalized state model) or add d3-zoom logic
    to your current engine.
  - Node Virtualization: Only render the nodes currently in the viewport.
  - Minimap: Add a small navigational minimap to track where the execution is happening in a large tree.

4. Robust Human-in-the-Loop (HITL) Logic
   The current "Approve/Reject" buttons are too simple for production.

- Action:
  - Contextual Diffs: Show exactly what the agent wants to do (e.g., a "before and after" of a file change or a JSON
    payload).
  - Modification: Allow the human to edit the tool arguments before approving, not just binary yes/no.
  - Permissions: Add RBAC (Role-Based Access Control) to ensure only authorized users can approve high-risk tool calls
    (e.g., delete_database).

5. Detailed Node Inspection & Audit Trail

- Action:
  - Side Panels: Clicking a node should open a sliding panel containing the full "Reasoning Chain" (the raw LLM logs),
    input/output payloads, and execution timing.
  - Global Audit Log: A searchable table of all events dispatched during the session for compliance and debugging.

6. Observability & Telemetry

- Action:
  - Tracing: Use OpenTelemetry or LangSmith to trace the latency between nodes.
  - Error Boundaries: Wrap the graph in a React Error Boundary so a single layout computation error doesn't crash the
    entire dashboard.
  - Logging: Connect the current pino logger to a service like Datadog or Sentry.

7. Performance Optimization (Web Workers)

- Action: Move the dagre layout computation into a Web Worker.
- Why: When 10 agents are spawning nodes simultaneously, recalculating layout coordinates on the main thread every 100ms
  will cause UI "jank." Offloading to a worker keeps the UI at 60fps.

Summary Checklist for Next Steps:

1.  [x] Replace mock useEffect with a real EventSource (SSE) listener.
2.  [ ] Add a persistence layer (Redis/Postgres) to save execution history.
3.  [ ] Implement a "Details Panel" for nodes using a Slide-over UI.
4.  [ ] Add Pan/Zoom capabilities to the <ExecutionGraph />.
5.  [ ] Add Authentication (NextAuth.js) to protect the approval flow.
