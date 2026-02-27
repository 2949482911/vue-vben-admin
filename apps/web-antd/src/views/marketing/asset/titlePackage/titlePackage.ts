/** 标题包配置详情 */
export interface TitlePackConfig {
  pushSubTitle: string[]; // 应用副标题数组
  subTitle: string[];     // 副标题数组
}

/** 营销-资产-标题包数据对象 */
export interface TitlePackItem {
  id: string;               // 唯一标识 ID
  title: string;            // 主标题
  platform: string;         // 平台 (如: vivo)
  projectId: string;        // 项目 ID
  projectName: string;      // 项目名称 (如: 京东)
  status: number;           // 状态 (1: 启用/正常)
  config: TitlePackConfig;
  createTime: string;       
  updateTime: string;
  createdBy: string;
  createUsername: string;   // 格式通常为 "姓名:ID"
  updatedBy: string;
  updateUsername: string;
  _X_ROW_KEY?: string;      
}
