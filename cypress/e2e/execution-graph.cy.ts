describe('Agent Execution Graph E2E', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should render the execution engine dashboard', () => {
    cy.get('h1').should('contain', 'Multi-Agent Execution Engine');
    cy.get('p').should('contain', 'Real-time execution tree visualization');
  });

  it('should display the execution graph nodes as they are streamed', () => {
    // Wait for the first node to appear
    cy.contains('Initialize Research', { timeout: 10000 }).should('be.visible');
    
    // Check for another node that should appear eventually
    cy.contains('Gather Data Sources', { timeout: 10000 }).should('be.visible');
  });

  it('should handle human-in-the-loop approval flow', () => {
    // Wait for the approval node to appear and be locked
    cy.contains('Review Search Query', { timeout: 15000 }).should('be.visible');
    
    // Verify approval fence overlay
    cy.contains('Human Approval Required').should('be.visible');
    
    // Click Approve
    cy.contains('button', 'Approve').click();
    
    // Verify fence is gone
    cy.contains('Human Approval Required').should('not.exist');
  });

  it('should show success icons for completed tasks', () => {
    cy.contains('Initialize Research', { timeout: 10000 })
      .parents('[style*="opacity: 1"]')
      .find('svg')
      .should('have.class', 'text-emerald-500');
  });
});
