/** 营销-资产-标题包数据对象 */
export interface TitlePackItem {
  id: string;               // 唯一标识 ID
  title: string;            // 标题（仅作标题名）
  platform: string;         // 平台 (如: vivo)
  projectId: string;        // 项目 ID
  projectName: string;      // 项目名称 (如: 京东)
  status: number;           // 状态 (1: 启用/正常)
  titles: string[];         // 所有使用到的标题
  createTime: string;
  updateTime: string;
  createdBy: string;
  createUsername: string;   // 格式通常为 "姓名:ID"
  updatedBy: string;
  updateUsername: string;
  _X_ROW_KEY?: string;
}
