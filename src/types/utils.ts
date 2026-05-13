import { ExecutionNode } from './execution';

export interface TopologicalInfo {
  unblockedNodes: ExecutionNode[];
  blockedNodes: ExecutionNode[];
}
