export * from './notice';
export * from './role';
export * from './menu';
export * from './pay';
export * from "./main-body"
export * from './users'
export * from "./bpm"
export * from "./dashboard";
export * from "./ocpx"
export * from "./marketing";
// marketing 与 adx 都导出了 CampaignItem，这里显式指定以 marketing 为准消除歧义；
// 需要 adx 的 CampaignItem 请直接从 './adx' 引入。
export type { CampaignItem } from "./marketing";
export * from "./adx";
export * from "./bytedance";
export * from "./ai_hosting";
export * from "./material_analysis";
export * from "./ai_chat";
