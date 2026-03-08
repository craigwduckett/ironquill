import '@xyflow/react/dist/style.css';

import { useQueryClient } from '@tanstack/react-query';
import {
  applyNodeChanges,
  Background,
  Controls,
  type Edge,
  type EdgeChange,
  MarkerType,
  MiniMap,
  type Node,
  type NodeChange,
  type OnConnect,
  ReactFlow,
} from '@xyflow/react';
import { useCallback, useRef, useState } from 'react';
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
import { NODE_TYPES } from './SceneNode.js';

type Props = { adventureId: string };

function buildNodes(scenes: Scene[]): Node[] {
  return scenes.map((scene, index) => ({
    id: scene.id,
    type: 'sceneNode',
    position: { x: scene.positionX ?? 0, y: scene.positionY ?? index * 200 },
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
    style: { stroke: '#c8a96e', strokeWidth: 2 },
  }));
}

export function SceneFlowGraph({ adventureId }: Props) {
  const { data: scenes = [] } = useScenes(adventureId);
  const { data: connections = [] } = useConnections(adventureId);
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);

  // Nodes: local state so drag positions are preserved between renders.
  // Resets when scene IDs change (scene added/deleted).
  const [nodes, setNodes] = useState<Node[]>(() => buildNodes(scenes));
  const prevSceneKeyRef = useRef(scenes.map((s) => s.id).join(','));
  const currentSceneKey = scenes.map((s) => s.id).join(',');
  if (currentSceneKey !== prevSceneKeyRef.current) {
    prevSceneKeyRef.current = currentSceneKey;
    setNodes(buildNodes(scenes));
  }

  // Edges are derived directly from server data on every render — no local
  // state or useEffect needed. React Flow receives up-to-date edges each render.
  const edges: Edge[] = buildEdges(connections);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  // Required by React Flow v12's controlled-component contract.
  // Edges are server-derived so local changes (selection etc.) are dropped.
  const onEdgesChange = useCallback((_changes: EdgeChange[]) => {}, []);

  const handleNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
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
      if (!connection.source || !connection.target) return;
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
        colorMode="dark"
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={NODE_TYPES}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
