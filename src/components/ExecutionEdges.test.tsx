import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ExecutionEdges } from './ExecutionEdges';
import { LayoutEdge } from '../types';

describe('ExecutionEdges', () => {
  it('renders SVG paths for edges', () => {
    const mockEdges: LayoutEdge[] = [
      {
        id: '1->2',
        source: '1',
        target: '2',
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 100 },
        ],
      },
    ];

    const { container } = render(
      <svg>
        <ExecutionEdges edges={mockEdges} />
      </svg>
    );

    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute('d', 'M 0 0 L 100 100');
    expect(path).toHaveAttribute('marker-end', 'url(#arrowhead)');
  });

  it('renders nothing if edges have no points', () => {
    const mockEdges: LayoutEdge[] = [
      {
        id: '1->2',
        source: '1',
        target: '2',
        points: [],
      },
    ];

    const { container } = render(
      <svg>
        <ExecutionEdges edges={mockEdges} />
      </svg>
    );

    const path = container.querySelector('path');
    expect(path).not.toBeInTheDocument();
  });
});
