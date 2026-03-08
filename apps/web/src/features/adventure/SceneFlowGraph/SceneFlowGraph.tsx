import '@xyflow/react/dist/style.css';

import { useQueryClient } from '@tanstack/react-query';
import {
  Background,
  Controls,
  type Edge,
  Handle,
  MarkerType,
  MiniMap,
  type Node,
  type NodeProps,
  type OnConnect,
  type OnNodeDrag,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import { useCallback, useEffect } from 'react';
import { api } from '../../../lib/api.js';
import { useAuthStore } from '../../../stores/auth.js';
import {
  adventureKeys,
  type Scene,
  type SceneConnection,
  useConnections,
  useScenes,
} from '../hooks/useAdventures.js';
import styles from './SceneFlowGraph.module.css';

type Props = { adventureId: string };

type SceneNodeData = { scene: Scene };

const SCENE_TYPE_COLOURS: Record<Scene['sceneType'], string> = {
  exploration: '#3b82f6',
  social: '#a855f7',
  combat: '#ef4444',
  puzzle: '#f59e0b',
  rest: '#22c55e',
  transition: '#6b7280',
};

function SceneNodeComponent({ data }: NodeProps<Node<SceneNodeData>>) {
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

const nodeTypes = { sceneNode: SceneNodeComponent };

function buildNodes(scenes: Scene[]): Node[] {
  return scenes.map((scene, index) => ({
    id: scene.id,
    type: 'sceneNode',
    position: {
      x: scene.positionX ?? index * 220,
      y: scene.positionY ?? 0,
    },
    data: { scene },
  }));
}

function buildEdges(connections: SceneConnection[]): Edge[] {
  return connections.map((conn) => ({
    id: conn.id,
    source: conn.fromSceneId,
    target: conn.toSceneId,
    label: conn.label ?? undefined,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: 'var(--color-accent)', strokeWidth: 2 },
  }));
}

export function SceneFlowGraph({ adventureId }: Props) {
  const { data: scenes = [] } = useScenes(adventureId);
  const { data: connections = [] } = useConnections(adventureId);
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);

  // Keep nodes and edges in sync with server data — these are the sole
  // source of truth; we never let React Flow manage deletions locally.
  useEffect(() => {
    setNodes(buildNodes(scenes));
  }, [scenes, setNodes]);

  useEffect(() => {
    setEdges(buildEdges(connections));
  }, [connections, setEdges]);

  const handleNodeDragStop: OnNodeDrag = useCallback(
    (_event, node) => {
      void api
        .patch(
          `/adventures/${adventureId}/scenes/${node.id}`,
          { positionX: node.position.x, positionY: node.position.y },
          token ?? undefined,
        )
        .then(() =>
          queryClient.invalidateQueries({
            queryKey: adventureKeys.scenes(adventureId),
          }),
        );
    },
    [adventureId, token, queryClient],
  );

  const handleConnect: OnConnect = useCallback(
    (connection) => {
      // Prevent duplicate A→B connections — the same pair already exists.
      const alreadyExists = connections.some(
        (c) => c.fromSceneId === connection.source && c.toSceneId === connection.target,
      );
      if (alreadyExists) return;

      void api
        .post<SceneConnection>(
          `/adventures/${adventureId}/scenes/${connection.source}/connections`,
          { toSceneId: connection.target },
          token ?? undefined,
        )
        .then(() =>
          queryClient.invalidateQueries({
            queryKey: adventureKeys.connections(adventureId),
          }),
        );
    },
    [adventureId, token, queryClient, connections],
  );

  return (
    <div className={styles.container}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onNodeDragStop={handleNodeDragStop}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
