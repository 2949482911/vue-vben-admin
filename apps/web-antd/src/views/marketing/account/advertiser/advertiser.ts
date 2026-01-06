export interface ProjectItem{
  id: string;
  name: string;
  packageName: string;
  /** 项目类型 */
  projectType: number;
  status: number;
  /** 逻辑删除标识 */
  del: number;
  /** 主项目 ID */
  mainId: string;
  /** 组织相关 */
  orgId: string;
  orgCode: string;
  /** 图标 / 描述 */
  icon: string | null;
  description: string | null;
  /** 创建信息 */
  createdBy: string;
  createUsername: string;
  createTime: string;
  /** 更新信息 */
  updatedBy: string;
  updateUsername: string;
  updateTime: string;
}
