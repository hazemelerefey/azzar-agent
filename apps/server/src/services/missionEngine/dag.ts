import type { MissionDAGDef, MissionNodeDef, NodeStatus } from './types';

export class MissionDAG {
  private readonly _dag: Readonly<MissionDAGDef>;
  private readonly _nodeMap: ReadonlyMap<string, Readonly<MissionNodeDef>>;

  constructor(dag: MissionDAGDef) {
    this.validate(dag);
    // Deep freeze the DAG definition so it cannot be modified at runtime
    const frozenNodes = Object.freeze(
      dag.nodes.map((n) => Object.freeze({ ...n, dependsOn: Object.freeze([...n.dependsOn]) })),
    );
    this._dag = Object.freeze({
      ...dag,
      nodes: frozenNodes as unknown as MissionNodeDef[],
    });

    const map = new Map<string, Readonly<MissionNodeDef>>();
    for (const node of this._dag.nodes) {
      map.set(node.id, node);
    }
    this._nodeMap = map;
  }

  get definition(): Readonly<MissionDAGDef> {
    return this._dag;
  }

  get nodes(): readonly MissionNodeDef[] {
    return this._dag.nodes;
  }

  getNode(id: string): Readonly<MissionNodeDef> | undefined {
    return this._nodeMap.get(id);
  }

  /**
   * Validates DAG integrity:
   * 1. No empty node list
   * 2. No duplicate node IDs
   * 3. All dependsOn IDs refer to declared nodes
   * 4. No cycles
   */
  private validate(dag: MissionDAGDef): void {
    if (!dag.nodes || dag.nodes.length === 0) {
      throw new Error(`Invalid DAG: Mission "${dag.id}" has no nodes`);
    }

    const seenIds = new Set<string>();
    for (const node of dag.nodes) {
      if (seenIds.has(node.id)) {
        throw new Error(`Invalid DAG: Duplicate node id "${node.id}" in mission "${dag.id}"`);
      }
      seenIds.add(node.id);
    }

    // Verify all dependencies exist
    for (const node of dag.nodes) {
      for (const depId of node.dependsOn) {
        if (!seenIds.has(depId)) {
          throw new Error(
            `Invalid DAG: Node "${node.id}" depends on unknown node "${depId}" in mission "${dag.id}"`,
          );
        }
      }
    }

    // Cycle detection using Kahn's algorithm
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    for (const node of dag.nodes) {
      inDegree.set(node.id, node.dependsOn.length);
      for (const dep of node.dependsOn) {
        const list = adj.get(dep) || [];
        list.push(node.id);
        adj.set(dep, list);
      }
    }

    const queue: string[] = [];
    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) queue.push(id);
    }

    let visitedCount = 0;
    while (queue.length > 0) {
      const current = queue.shift()!;
      visitedCount++;

      const neighbors = adj.get(current) || [];
      for (const neighbor of neighbors) {
        const nextDeg = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, nextDeg);
        if (nextDeg === 0) {
          queue.push(neighbor);
        }
      }
    }

    if (visitedCount !== dag.nodes.length) {
      throw new Error(`Invalid DAG: Cycle detected in mission "${dag.id}"`);
    }
  }

  /**
   * Recompute ready nodes:
   * A node is ready if its status is 'pending' and ALL of its upstream dependencies are 'completed'.
   */
  getReadyNodes(nodeStatuses: Record<string, NodeStatus>): string[] {
    const ready: string[] = [];

    for (const node of this._dag.nodes) {
      const status = nodeStatuses[node.id] || 'pending';
      if (status !== 'pending') {
        continue;
      }

      const allDepsMet = node.dependsOn.every((depId) => nodeStatuses[depId] === 'completed');

      if (allDepsMet) {
        ready.push(node.id);
      }
    }

    return ready;
  }

  /**
   * Topological edges representation for the mission receipt.
   */
  getEdges(): Array<{ from: string; to: string }> {
    const edges: Array<{ from: string; to: string }> = [];
    for (const node of this._dag.nodes) {
      for (const dep of node.dependsOn) {
        edges.push({ from: dep, to: node.id });
      }
    }
    return edges;
  }
}
