import { $t } from '@vben/locales';

import { Platform } from './enums';

/**
 * 平台展示枚举（全站报表通用）
 *
 * 报表与账户接口返回的平台字段是英文值（bytedance / tencent / vivo ...），
 * 这里统一给出「中文名 + Tag 颜色」，避免每个报表各写一套映射、也避免页面上直接显示英文字母。
 *
 * 用法：
 *   模板   <Tag :color="getPlatformColor(row.platform)">{{ getPlatformLabel(row.platform) }}</Tag>
 *   vxe 列 { field: 'platform', slots: { default: 'platform' } }
 *          再配 <template #platform="{ row }"> 渲染上面的 Tag
 *          （别用 adapter 里的 CellTag 渲染器，它在 vxe 上不生效）
 *   图表   getPlatformChartColor(row.platform, index)
 *
 * 未收录的平台：标签回退显示原始值、颜色回退中性色，不会渲染成空白。
 * 增补平台时只需在 PLATFORM_TAG_OPTIONS 里加一行，所有报表同时生效；
 * 同时记得补 locales 里的 ocpx.platform.* key，否则切英文会露出 key 文本。
 */
export interface PlatformTagOption {
  /** 展示名 */
  label: string;
  /** 接口返回的平台值，取自 Platform 枚举 */
  value: string;
  /** antd Tag 语义色，同时供 vxe 的 CellTag 使用 */
  color: string;
}

export const PLATFORM_TAG_OPTIONS: PlatformTagOption[] = [
  // 字节系
  { color: 'blue', label: $t('ocpx.platform.bytedance'), value: Platform.BYTEDANCE },
  { color: 'geekblue', label: $t('ocpx.platform.bytedance_std'), value: Platform.BYTEDANCE_STD },
  { color: 'blue', label: $t('ocpx.platform.douyin'), value: Platform.DOUYIN },
  { color: 'geekblue', label: $t('ocpx.platform.nj_bytedance'), value: Platform.NJ_BYTEDANCE },
  { color: 'cyan', label: $t('ocpx.platform.dy_duliduan'), value: Platform.DY_DULIDUAN },
  { color: 'geekblue', label: $t('ocpx.platform.dotsdance'), value: Platform.DOTSDANCE },

  // 腾讯系
  { color: 'cyan', label: $t('ocpx.platform.tencent'), value: Platform.TENCENT },
  { color: 'geekblue', label: $t('ocpx.platform.tencent_mini_app'), value: Platform.TENCENT_MINI_APP },

  // 手机厂商
  { color: 'purple', label: $t('ocpx.platform.vivo'), value: Platform.VIVO },
  // vivo2.0 的枚举值带小数点，i18n key 不能用点号，所以 locale key 取名 vivo_new
  { color: 'magenta', label: $t('ocpx.platform.vivo_new'), value: Platform.VIVO_NEW },
  { color: 'green', label: $t('ocpx.platform.oppo'), value: Platform.OPPO },
  { color: 'lime', label: $t('ocpx.platform.oppo_push'), value: Platform.OPPO_PUSH },
  { color: 'red', label: $t('ocpx.platform.huawei'), value: Platform.HUAWEI },
  { color: 'volcano', label: $t('ocpx.platform.huawei_store'), value: Platform.HUAWEI_STORE },
  { color: 'orange', label: $t('ocpx.platform.honor'), value: Platform.HONOR },
  { color: 'gold', label: $t('ocpx.platform.xiaomi'), value: Platform.XIAOMI },
  { color: 'volcano', label: $t('ocpx.platform.nubia'), value: Platform.NBY },
  { color: 'red', label: $t('ocpx.platform.gyx_huawei'), value: Platform.GYXHW },
  { color: 'green', label: $t('ocpx.platform.gyx_oppo'), value: Platform.GYXOPPO },

  // 搜索与信息流
  { color: 'gold', label: $t('ocpx.platform.baidu'), value: Platform.BAIDU },
  { color: 'gold', label: $t('ocpx.platform.baidu_pack'), value: Platform.BAIDU_PACK },
  { color: 'gold', label: $t('ocpx.platform.baidu_box'), value: Platform.BAIDU_BOX },
  { color: 'orange', label: $t('ocpx.platform.kuaishou'), value: Platform.KUAISHOU },
  { color: 'volcano', label: $t('ocpx.platform.qutoutiao'), value: Platform.QUTOUTIAO },
  { color: 'gold', label: $t('ocpx.platform.kuake'), value: Platform.KUAKE },
  { color: 'gold', label: $t('ocpx.platform.kuaizuanke'), value: Platform.KUAIZUANKE },

  // 内容与社区
  { color: 'red', label: $t('ocpx.platform.rednote'), value: Platform.REDNOTE },
  { color: 'red', label: $t('ocpx.platform.netease'), value: Platform.NETEASE },
  { color: 'purple', label: $t('ocpx.platform.soul'), value: Platform.SOUL },
  { color: 'purple', label: $t('ocpx.platform.soul_dsp'), value: Platform.SOUL_DSP },
  { color: 'blue', label: $t('ocpx.platform.youku'), value: Platform.YOUKU },
  { color: 'purple', label: $t('ocpx.platform.taqu'), value: Platform.TAQU },
  { color: 'orange', label: $t('ocpx.platform.xmly'), value: Platform.XMLY },

  // 电商
  { color: 'red', label: $t('ocpx.platform.jd'), value: Platform.JD },
  { color: 'red', label: $t('ocpx.platform.jdkj'), value: Platform.JDKJ },
  { color: 'volcano', label: $t('ocpx.platform.jdgyx'), value: Platform.JD_GYX },
  { color: 'orange', label: $t('ocpx.platform.tb'), value: Platform.TB },
  { color: 'orange', label: $t('ocpx.platform.tb_union'), value: Platform.TB_UNION },
  { color: 'orange', label: $t('ocpx.platform.tb_shangou'), value: Platform.TBSG },
  { color: 'orange', label: $t('ocpx.platform.tb_shangou_et'), value: Platform.TB_SHANGOU_ET },
  { color: 'gold', label: $t('ocpx.platform.xianyu'), value: Platform.XIANYU },
  { color: 'gold', label: $t('ocpx.platform.xianyu_dhh'), value: Platform.XIANYU_DHH },
  { color: 'gold', label: $t('ocpx.platform.meituan'), value: Platform.MEITUAN },
  { color: 'cyan', label: $t('ocpx.platform.cainiao'), value: Platform.CAINIAO },

  // 其他
  { color: 'blue', label: $t('ocpx.platform.alipay'), value: Platform.ALIPAY },
  { color: 'purple', label: $t('ocpx.platform.qwen'), value: Platform.QWEN },
  { color: 'volcano', label: $t('ocpx.platform.huichuan'), value: Platform.HUICHUAN },
  { color: 'cyan', label: $t('ocpx.platform.inteyun'), value: Platform.INTEYUN },
  { color: 'cyan', label: $t('ocpx.platform.aps'), value: Platform.APS },
  { color: 'geekblue', label: $t('ocpx.platform.csjp'), value: Platform.CSJP },
  { color: 'purple', label: $t('ocpx.platform.ubi'), value: Platform.UBI },
  { color: 'geekblue', label: $t('ocpx.platform.vph'), value: Platform.VPH },
  { color: 'cyan', label: $t('ocpx.platform.uu_union'), value: Platform.UU },
];

/** 未收录平台的 Tag 颜色 */
export const PLATFORM_TAG_FALLBACK_COLOR = 'default';

const PLATFORM_TAG_MAP = new Map(
  PLATFORM_TAG_OPTIONS.map((item) => [item.value, item]),
);

/** 已提醒过的未收录平台值，避免同一张表里刷屏 */
const warnedPlatformValues = new Set<string>();

/** 平台中文名；未收录时回退原始值，再没有则回退占位符 */
export function getPlatformLabel(value?: string, fallback = '-'): string {
  if (!value) {
    return fallback;
  }
  const hit = PLATFORM_TAG_MAP.get(value);
  if (hit) {
    return hit.label;
  }
  // 报表里出现没收录的平台值时打印一次，方便定位真实的平台值
  if (!warnedPlatformValues.has(value)) {
    warnedPlatformValues.add(value);
    console.warn(
      `[platform] 未收录的平台值「${value}」，请补充到 constants/platform.ts 的 PLATFORM_TAG_OPTIONS`,
    );
  }
  return value;
}

/** 平台 Tag 颜色 */
export function getPlatformColor(value?: string): string {
  return PLATFORM_TAG_MAP.get(value ?? '')?.color ?? PLATFORM_TAG_FALLBACK_COLOR;
}

/** antd 语义色名到具体色值，echarts 不能用语义色名 */
const TAG_COLOR_HEX: Record<string, string> = {
  blue: '#006be6',
  cyan: '#0fc6c2',
  geekblue: '#2f54eb',
  gold: '#faad14',
  green: '#00b42a',
  lime: '#a0d911',
  magenta: '#eb2f96',
  orange: '#ff7d00',
  purple: '#722ed1',
  red: '#f53f3f',
  volcano: '#fa541c',
};

/** 图表兜底调色板（平台未收录时按序取色） */
const CHART_FALLBACK_PALETTE = [
  '#006be6',
  '#0fc6c2',
  '#722ed1',
  '#ff7d00',
  '#eb2f96',
  '#faad14',
  '#2f54eb',
  '#00b42a',
];

/**
 * 平台图表配色。
 * 先按平台取 Tag 色对应的色值，未收录时按索引回退到调色板，
 * 保证饼图、柱图与表格里的平台标签颜色一致。
 */
export function getPlatformChartColor(value?: string, index = 0): string {
  const color = PLATFORM_TAG_MAP.get(value ?? '')?.color;
  const hex = color ? TAG_COLOR_HEX[color] : undefined;
  return (
    hex ??
    CHART_FALLBACK_PALETTE[index % CHART_FALLBACK_PALETTE.length] ??
    '#8f959e'
  );
}
