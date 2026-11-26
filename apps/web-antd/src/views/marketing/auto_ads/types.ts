export type AutoTaskStatus = 'archived' | 'draft' | 'enabled' | 'paused';

export type AutoTaskTriggerMode = 'manual' | 'scheduled';

export interface AutoTaskItem {
  id: string;
  lastExecuteStatus?: string;
  lastExecuteTime?: string;
  localAsset?: Record<string, any>[];
  mediaAsset?: Record<string, any>[];
  name: string;
  nextExecuteTime?: string;
  platform: string;
  platformMode: string;
  projectId?: number | string;
  projectName?: string;
  remark?: string;
  runSetting?: Record<string, any>;
  scheduleText: string;
  status: AutoTaskStatus;
  tagIds: string[];
  tags: string[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface AutoTaskQuery {
  name?: string;
  page?: number;
  pageSize?: number;
  platform?: string;
  platformMode?: string;
  status?: AutoTaskStatus;
}

export interface AutoTaskStats {
  draftCount: number;
  enabledCount: number;
  pausedCount: number;
  totalCount: number;
}
