import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExecutionNodeCard } from './ExecutionNodeCard';
import { MOCK_NODES, MOCK_NODE_ID_1 } from '../__mocks__/data';

describe('ExecutionNodeCard', () => {
  const mockLayout = {
    id: MOCK_NODE_ID_1,
    x: 100,
    y: 100,
    width: 250,
    height: 100
  };

  it('renders node name and type', () => {
    const node = MOCK_NODES[MOCK_NODE_ID_1];
    render(<ExecutionNodeCard node={node} layout={mockLayout} isBlocked={false} />);
    
    expect(screen.getByText(node.name)).toBeInTheDocument();
    expect(screen.getByText(node.type)).toBeInTheDocument();
  });

  it('applies lower opacity when blocked', () => {
    const node = MOCK_NODES[MOCK_NODE_ID_1];
    const { container } = render(
      <ExecutionNodeCard node={node} layout={mockLayout} isBlocked={true} />
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card.style.opacity).toBe('0.6');
  });

  it('renders ApprovalFence when status is LOCKED', () => {
    const node = { ...MOCK_NODES[MOCK_NODE_ID_1], status: 'LOCKED' as const };
    render(<ExecutionNodeCard node={node} layout={mockLayout} isBlocked={false} />);
    
    expect(screen.getByText(/Human Approval Required/i)).toBeInTheDocument();
  });
});
