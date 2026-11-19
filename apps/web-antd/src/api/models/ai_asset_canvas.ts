/**
 * P8 画布节点契约（前端类型，对齐后端 AiAssetCanvasGraphView / blueprints）。
 *
 * 链路位置：短剧工作台 → 画布 → CanvasSurface。
 * 图内引用统一 clientId；数据库 id 只作为后端行标识。
 */

export type CanvasNodeKind =
  | 'audio'
  | 'character'
  | 'codeVideo'
  | 'director3d'
  | 'entity'
  | 'image'
  | 'prompt'
  | 'scene3d'
  | 'shot'
  | 'storyboard'
  | 'subcanvas'
  | 'text'
  | 'timeline'
  | 'video'
  | 'workflow';

export interface CanvasPort {
  id: string;
  label: string;
  valueType: string;
  accepts?: null | string[];
}

export interface CanvasBlueprint {
  kind: CanvasNodeKind;
  label: string;
  width: number;
  height: number;
  inputs: CanvasPort[];
  outputs: CanvasPort[];
  acceptsAsset: boolean;
}

export interface CanvasSummary {
  id: string;
  novelId: string;
  title: string;
  viewportX: number;
  viewportY: number;
  zoom: number;
  revision: string;
}

export interface CanvasGraphNode {
  id: string;
  clientId: string;
  kind: CanvasNodeKind;
  label: string;
  body?: null | string;
  details?: null | Record<string, unknown>;
  assetId?: null | string;
  referenceIds?: Array<number | string> | null;
  x: number;
  y: number;
  width: number;
  height: number;
  groupClientId?: null | string;
  zIndex: number;
  nodeStatus?: null | string;
}

export interface CanvasGraphEdge {
  id: string;
  clientId: string;
  sourceNodeClientId: string;
  sourcePort: string;
  targetNodeClientId: string;
  targetPort: string;
  referenceType?: null | string;
  label?: null | string;
  style?: null | Record<string, unknown>;
}

export interface CanvasGroup {
  id: string;
  clientId: string;
  parentGroupClientId?: null | string;
  title: string;
  color?: null | string;
  collapsed: number;
  sort: number;
}

export interface CanvasGraph {
  canvas: CanvasSummary;
  nodes: CanvasGraphNode[];
  edges: CanvasGraphEdge[];
  groups: CanvasGroup[];
}

export interface CanvasCreateRequest {
  novelId: number | string;
  title?: string;
}

export interface CanvasSaveNode {
  clientId: string;
  kind: CanvasNodeKind;
  label?: string;
  body?: null | string;
  details?: null | Record<string, unknown>;
  assetId?: null | number | string;
  referenceIds?: Array<number | string>;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  groupClientId?: null | string;
  zIndex?: number;
  nodeStatus?: string;
}

export interface CanvasSaveEdge {
  clientId: string;
  sourceNodeClientId: string;
  sourcePort: string;
  targetNodeClientId: string;
  targetPort: string;
  referenceType?: string;
  label?: string;
  style?: Record<string, unknown>;
}

export interface CanvasSaveGroup {
  clientId: string;
  parentGroupClientId?: null | string;
  title?: string;
  color?: string;
  collapsed?: number;
  sort?: number;
}

export interface CanvasSaveRequest {
  baseRevision: string;
  viewport?: {
    x?: number;
    y?: number;
    zoom?: number;
  };
  nodes: CanvasSaveNode[];
  edges: CanvasSaveEdge[];
  groups: CanvasSaveGroup[];
}
