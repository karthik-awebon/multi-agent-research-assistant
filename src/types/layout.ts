/**
 * Position and dimensions of a node in the visual graph.
 */
export interface LayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Visual representation of an edge, including its routing points.
 */
export interface LayoutEdge {
  id: string;
  source: string;
  target: string;
  points: { x: number; y: number }[];
}

/**
 * The computed layout information for the entire graph.
 */
export interface GraphLayout {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
}
