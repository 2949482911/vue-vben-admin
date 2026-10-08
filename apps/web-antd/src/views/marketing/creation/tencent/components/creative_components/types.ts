/**
 * 创意组件的通用数据契约
 *
 * 腾讯 dynamic_creatives/add 的 creative_components 里，每个组件类型（brand / action_button /
 * label …）都是一组「同结构数组」。这里给每个组件的配置定一份统一形状，方便：
 * 1. 三个组件复用同一个面板外壳（开关 + 分配方式 + 账户切换）；
 * 2. 生成预览时按账户取到当前这一份配置（见 tencent.ts 的 buildCreativeComponents）。
 *
 * 分配方式沿用商品 / 定向包的约定：全部相同挂在 "0" 键下，分账户匹配按账户 id 取。
 */

/** 「全部相同」时的数据键 */
export const ALL_ACCOUNT_KEY = "0";

/**
 * 已选素材图片
 * 媒体侧的 *_image_id 由后端按本地素材 id 上传后回填，所以这里只需要存本地 id，
 * name / url 只是为了在表单里回显缩略图，不提交
 */
export interface CreativeMaterialImage {
  id: string;
  name: string;
  url: string;
}

/**
 * 单个创意组件的配置
 * @template T 组件内的配置内容，如 { brand_name, materialIdsList }
 */
export interface CreativeComponentState<T> {
  /** 组件开关，关闭时不提交该组件 */
  enabled: boolean;
  /** 分配方式：RuleMethod.ALL（全部相同）/ RuleMethod.ACCOUNT（分账户匹配） */
  method: string;
  /** 按位置存配置：全部相同存 "0"，分账户匹配存账户 id */
  data: Record<string, T>;
}
