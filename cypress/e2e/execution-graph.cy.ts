const SESSION_ID = 'e2e-test-session';

const mockEvents = [
  {
    type: 'TASK_SPAWNED',
    node: { id: 'node-1', type: 'TASK', status: 'RUNNING', name: 'Analyze Query' },
    dependencies: [],
  },
  {
    type: 'TASK_SPAWNED',
    node: { id: 'node-2', type: 'TASK', status: 'RUNNING', name: 'Search Literature' },
    dependencies: ['node-1'],
  },
  {
    type: 'NODE_STATUS_UPDATED',
    nodeId: 'node-1',
    status: 'COMPLETED',
    result: 'Query analyzed',
  },
  {
    type: 'TASK_SPAWNED',
    node: { id: 'node-3', type: 'APPROVAL', status: 'LOCKED', name: 'Review Plan' },
    dependencies: ['node-1'],
  },
  {
    type: 'APPROVAL_REQUESTED',
    nodeId: 'node-3',
    payload: { question: 'Approve the research plan?' },
  },
];

const sseBody = mockEvents.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('');

describe('Agent Execution Graph E2E', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/research', { body: { sessionId: SESSION_ID } }).as('startResearch');

    cy.intercept('GET', `/api/events?sessionId=${SESSION_ID}`, (req) => {
      req.reply({
        statusCode: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        body: sseBody,
      });
    }).as('getEvents');

    cy.intercept('POST', '/api/approve', { body: { ok: true } }).as('approve');

    cy.visit('/');
  });

  it('renders the research form on load', () => {
    cy.get('h1').should('contain', 'Multi-Agent Research Assistant');
    cy.get('input[placeholder*="research"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Research').and('be.disabled');
  });

  it('enables the submit button only when query is non-empty', () => {
    cy.get('button[type="submit"]').should('be.disabled');
    cy.get('input[placeholder*="research"]').type('AI trends');
    cy.get('button[type="submit"]').should('not.be.disabled');
    cy.get('input[placeholder*="research"]').clear();
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('starts a research session and streams graph nodes', () => {
    cy.get('input[placeholder*="research"]').type('Impact of LLMs on software development');
    cy.get('button[type="submit"]').click();

    cy.wait('@startResearch');

    cy.contains('Analyze Query', { timeout: 10000 }).should('be.visible');
    cy.contains('Search Literature', { timeout: 5000 }).should('be.visible');
  });

  it('handles human-in-the-loop approval flow', () => {
    cy.get('input[placeholder*="research"]').type('Impact of LLMs on software development');
    cy.get('button[type="submit"]').click();

    cy.wait('@startResearch');

    cy.contains('Human Approval Required', { timeout: 10000 }).should('be.visible');
    cy.contains('Approve the research plan?').should('be.visible');

    cy.contains('button', 'Approve').click();
    cy.wait('@approve');

    cy.contains('Human Approval Required').should('not.exist');
  });

  it('shows a "New Research" button after session starts', () => {
    cy.get('input[placeholder*="research"]').type('Test query');
    cy.get('button[type="submit"]').click();

    cy.wait('@startResearch');

    cy.contains('button', 'New Research').should('be.visible');
  });

  it('resets the graph when "New Research" is clicked', () => {
    cy.get('input[placeholder*="research"]').type('Test query');
    cy.get('button[type="submit"]').click();

    cy.wait('@startResearch');
    cy.contains('Analyze Query', { timeout: 10000 }).should('be.visible');

    cy.contains('button', 'New Research').click();

    cy.get('input[placeholder*="research"]').should('be.visible');
    cy.contains('Analyze Query').should('not.exist');
  });
});
