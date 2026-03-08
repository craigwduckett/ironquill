import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';
import type { Scene } from '../hooks/useAdventures.js';
import styles from './SceneFlowGraph.module.css';

export type SceneNodeData = { scene: Scene };

const SCENE_TYPE_COLOURS: Record<Scene['sceneType'], string> = {
  exploration: '#3b82f6',
  social: '#a855f7',
  combat: '#ef4444',
  puzzle: '#f59e0b',
  rest: '#22c55e',
  transition: '#6b7280',
};

export function SceneNodeComponent({ data }: NodeProps<Node<SceneNodeData>>) {
  const colour = SCENE_TYPE_COLOURS[data.scene.sceneType];
  return (
    <div className={styles.sceneNode}>
      <Handle type="target" position={Position.Top} />
      <div className={styles.sceneNodeHeader}>
        <span className={styles.sceneNodeOrder}>{data.scene.orderIndex + 1}</span>
        <span className={styles.sceneNodeBadge} style={{ backgroundColor: colour }}>
          {data.scene.sceneType}
        </span>
      </div>
      <p className={styles.sceneNodeTitle}>{data.scene.title}</p>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// Module-level constant — stable across HMR re-evaluations of SceneFlowGraph
// because this module is only re-evaluated when SceneNode.tsx itself changes.
export const NODE_TYPES = { sceneNode: SceneNodeComponent } as const;
