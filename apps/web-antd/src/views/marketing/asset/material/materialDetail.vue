<script setup lang="ts" name="MaterialDetail">
/**
 * 素材详情面板
 *
 * 结构对齐设计稿：页头 → 模块一「素材详情」（预览 + 字段信息 + 标签）
 * → 模块二「投放数据」（筛选 / KPI / 图表分析 / 投放明细）。
 *
 * 数据来源：
 *  1. 素材详情信息来自素材库列表行快照（MaterialItem）；剪辑师、投放状态、首次/最近投放
 *     等字段素材库接口暂未返回，先按 '-' 占位，后端补齐后直接取值即可。
 *  2. 投放数据来自素材报表（POST /report/material_report）。后端正在补充素材侧维度与筛选
 *     （本地素材ID / 剪辑师 / 优化师），接口暂不支持按素材过滤，故 loadReport() 先返回空结果，
 *     页面结构与空态先行落位。维度与筛选清单见 MATERIAL_REPORT_DIMENSION_SPEC.md。
 */
import type { MaterialItem } from '#/api/models/assert';
import type { MetricItem, ReportFilter } from '#/api/models';

import { computed, ref, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  ArrowLeftOutlined,
  CopyOutlined,
  DownloadOutlined,
  FileOutlined,
  SendOutlined,
} from '@ant-design/icons-vue';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Divider,
  message,
  RadioButton,
  RadioGroup,
  RangePicker,
  Select,
  Space,
  Statistic,
  Tag,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  useVbenVxeGrid,
  type VxeTableGridColumns,
} from '#/adapter/vxe-table';
import { metricApi, reportApi } from '#/api';
import {
  dimColumnKey,
  MAX_FROZEN_DIM_COUNT,
  rawDimFieldOf,
} from '#/constants/dimension';
import { ACTIVE_PLATFORM } from '#/constants/locales';
import {
  getPlatformChartColor,
  getPlatformColor,
  getPlatformLabel,
} from '#/constants/platform';
import SelectMetricModal from '#/views/marketing/report/adreportdata/selectmetric.vue';

import DetailChartCard from './detailChartCard.vue';
import { Platform } from "#/constants/enums";

const props = defineProps<{
  /** 素材列表行快照 */
  material: MaterialItem;
  /** 素材所在目录路径文案 */
  folderPath?: string;
  /** 父级每次打开详情自增，用于触发取数 */
  openSeq?: number;
}>();

const emit = defineEmits<{
  /** 关闭详情面板 */
  close: [];
  /** 推送该素材到媒体账户，复用素材库推送流程 */
  push: [material: MaterialItem];
}>();

/* ==================== 一、素材详情信息 ==================== */

/** 素材格式：1 横版 / 2 竖版 */
const FORMAT_TEXT: Record<number, string> = { 1: '横版', 2: '竖版' };

/**
 * 媒体类型按扩展名判断。
 * 列表行的 type 是「1 文件夹 / 2 素材文件」，区分不了图片与视频
 * （素材表自己的 type 才是 1 图片/2 视频/3 音频，DTO 里被覆盖成了 2）。
 */
const MEDIA_BY_EXT: Record<string, 'audio' | 'image' | 'video'> = {
  aac: 'audio',
  avi: 'video',
  flac: 'audio',
  m4a: 'audio',
  m4v: 'video',
  mkv: 'video',
  mov: 'video',
  mp3: 'audio',
  mp4: 'video',
  ogg: 'audio',
  wav: 'audio',
  webm: 'video',
};

const MEDIA_TEXT = { audio: '音频', image: '图片', video: '视频' };

const mediaKind = computed<'audio' | 'image' | 'video'>(() => {
  const ext = (props.material.name || '').split('.').pop()?.toLowerCase() ?? '';
  const byExt = MEDIA_BY_EXT[ext];
  if (byExt) return byExt;
  // 扩展名认不出来时，有时长的一律按视频处理
  return Number(props.material.videoDurationSecond) > 0 ? 'video' : 'image';
});

const isVideo = computed(() => mediaKind.value === 'video');
const typeText = computed(() => MEDIA_TEXT[mediaKind.value]);
const typeTagColor = computed(() => {
  if (mediaKind.value === 'video') return 'blue';
  if (mediaKind.value === 'audio') return 'purple';
  return 'green';
});

/** 横版 / 竖版 */
const formatLabel = computed(() => FORMAT_TEXT[props.material.format] ?? '');

/** 格式标签配色：横版偏冷、竖版偏紫 */
const formatTagColor = computed(() =>
  props.material.format === 2 ? 'purple' : 'geekblue',
);

/** 视频封面：后端会截帧生成视频封面，缺失时退回缩略图 */
const videoPoster = computed(
  () => props.material.videoCoverUrl || props.material.thumbnailUrl || undefined,
);

/** 图片预览地址：文件地址缺失时退回缩略图 */
const imageUrl = computed(
  () => props.material.fileUrl || props.material.thumbnailUrl || '',
);

const formatText = computed(() => {
  const format = FORMAT_TEXT[props.material.format];
  const ratio = props.material.aspectXy || props.material.aspectRatio;
  return [format, ratio].filter(Boolean).join(' · ') || '-';
});

const resolutionText = computed(() => {
  const { aspectRatio, height, width } = props.material;
  if (width > 0 && height > 0) return `${width} × ${height}`;
  return aspectRatio || '-';
});

const durationText = computed(() => {
  const seconds = Number(props.material.videoDurationSecond || 0);
  if (!seconds) return props.material.videoDuration || '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
});

/** 字段信息条目 */
interface InfoItem {
  label: string;
  value: string;
  /** 用等宽字体展示（素材ID、文件MD5 等） */
  mono?: boolean;
  /** 有值时用 Tag 呈现，取值为 Tag 颜色 */
  tagColor?: string;
}

const basicInfo = computed<InfoItem[]>(() => [
  { label: '素材名称', value: props.material.name || '-' },
  { label: '素材ID', value: props.material.id || '-', mono: true },
  { label: '素材类型', value: typeText.value, tagColor: typeTagColor.value },
  { label: '素材格式', value: formatText.value, tagColor: formatTagColor.value },
  { label: '文件大小', value: props.material.fileSizeStr || '-' },
  { label: '分辨率', value: resolutionText.value },
  { label: '宽高比', value: props.material.aspectXy || props.material.aspectRatio || '-' },
  { label: '视频时长', value: durationText.value || '-' },
  { label: '文件MD5', value: props.material.fileMd5 || '-', mono: true },
]);

/** 剪辑师已由素材库返回；投放相关字段（首次/最近投放、投放平台、关联创意数）素材库仍未返回，先占位 */
const createInfo = computed<InfoItem[]>(() => [
  { label: '剪辑师', value: props.material.editorName || '-' },
  { label: '上传人', value: props.material.createUsername || '-' },
  { label: '上传时间', value: props.material.createTime || '-' },
  { label: '更新人', value: props.material.updateUsername || '-' },
  { label: '更新时间', value: props.material.updateTime || '-' },
  { label: '备注', value: props.material.remark || '-' },
  { label: '首次投放', value: '-' },
  { label: '最近投放', value: '-' },
  { label: '投放平台', value: '-' },
  { label: '关联创意数', value: '-' },
  { label: '所属目录', value: props.folderPath || '-' },
]);

async function copyMaterialId() {
  if (!props.material.id) return;
  try {
    await navigator.clipboard.writeText(props.material.id);
    await message.success('已复制素材ID');
  } catch {
    await message.error('复制失败');
  }
}

function downloadMaterial() {
  if (!props.material.fileUrl) {
    message.warning('该素材暂无可下载的文件地址');
    return;
  }
  window.open(props.material.fileUrl, '_blank');
}

/* ==================== 二、投放数据 ==================== */

/** 图表配色，与设计稿一致 */
const CHART_COLOR = {
  blue: '#006be6',
  cyan: '#0fc6c2',
  orange: '#ff7d00',
  purple: '#722ed1',
};
const AXIS_LABEL = { color: '#8f959e', fontSize: 11 };
const SPLIT_LINE = { lineStyle: { color: '#f0f1f2' } };

/** 操作符取值，对齐后端 OperatorEnum */
const OP_IN = 1;

/** 素材报表支持的聚合维度，对齐后端 Dimension.MATERIAL_REPORT_DIMENSION */
const DIM_OPTIONS = [
  { label: '日期', value: 'day' },
  { label: '小时', value: 'hour' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
  { label: '年', value: 'year' },
  { label: '平台', value: 'platform' },
  { label: '广告主', value: 'platform_account_id' },
  { label: '计划', value: 'campaign_id' },
  { label: '广告组', value: 'adgroup_id' },
  { label: '广告', value: 'promotion_id' },
  { label: '创意', value: 'creative_id' },
  { label: '本地素材ID', value: 'material_id' },
  { label: '剪辑师', value: 'editor_id' },
  { label: '优化师', value: 'createdBy' },
  { label: '部门', value: 'org_id' },
];

/**
 * 维度命中的伴随名称列。
 * 后端会按 Dimension.STATIC_METRIC_LIST 在维度命中时一并返回名称字段，这些列排在表格左侧。
 */
const DIM_NAME_FIELDS = [
  'advertiserName',
  'adgroupName',
  'campaignName',
  'createUsername',
  'creativeName',
  'editorName',
  'materialName',
  'orgName',
  'projectName',
  'promotionName',
  'saleName',
  'tagName',
];

/** 时间轴可用的维度，用于趋势图取横轴 */
const DATE_DIM_KEYS = ['day', 'hour', 'week', 'month', 'year'];

const DEFAULT_DIMS = ['day', 'platform'];

const RANGE_PRESETS = [
  { label: '近 7 天', value: 7 },
  { label: '近 14 天', value: 14 },
  { label: '近 30 天', value: 30 },
  { label: '自定义', value: 0 },
];

const activeRange = ref(7);
const dateRange = ref<[string, string]>([
  dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
  dayjs().format('YYYY-MM-DD'),
]);
const selectedPlatforms = ref<string[]>([Platform.OPPO]);
const selectedDims = ref<string[]>([...DEFAULT_DIMS]);
/** 已选指标：素材报表的 queryMetric 传的是指标ID，不是字段名 */
const selectedMetrics = ref<string[]>([]);
const metricOptions = ref<Array<{ label: string; value: string }>>([]);
/** 指标保留小数位，与素材报表一致，由指标选择弹窗返回 */
const decimalPoint = ref(4);

/** 指标选择弹窗：直接复用素材报表的指标选择组件 */
const [SelectMetricModalView, selectMetricModalApi] = useVbenModal({
  connectedComponent: SelectMetricModal,
});

function openMetricModal() {
  selectMetricModalApi.open();
}

const loading = ref(false);
const reportItems = ref<Record<string, any>[]>([]);
const reportColumns = ref<string[]>([]);
const reportCname = ref<Record<string, string>>({});
const reportSummary = ref<null | Record<string, any>>(null);
const hasReportData = computed(() => reportItems.value.length > 0);

/**
 * 后端 needCname 默认开启，响应里的 columns / items 的 key 是翻译后的中文名（如「平台」），
 * 维度反查用 constants/dimension 里的镜像表；它返回的 cname 只含指标映射，维度反查不回来。
 */
function rawFieldOf(key: string): string {
  return rawDimFieldOf(key);
}

/** 维度在行数据里的实际 key：中文列名优先（needCname 的返回），否则用英文字段名 */
function dimRowKey(field: string): string {
  return dimColumnKey(field, reportColumns.value);
}

/** 默认选中的常用指标，按中文名匹配 */
const DEFAULT_METRIC_KEYWORDS = [
  '消耗',
  '曝光',
  '点击',
  '点击率',
  '转化率',
  '转化数',
  'ROI',
  'CPA',
];

/** 指标列表来自素材报表的指标目录，只在首次打开时拉一次 */
async function loadMetricOptions() {
  if (metricOptions.value.length > 0) return;
  try {
    const list = (await metricApi.fetchMetric({
      reportType: 'material',
    })) as unknown as MetricItem[];
    metricOptions.value = list
      .filter((item) => item.id)
      .map((item) => ({ label: item.cname, value: String(item.id) }));

    if (selectedMetrics.value.length > 0) return;
    const picked = DEFAULT_METRIC_KEYWORDS.map((word) =>
      list.find((item) => item.cname?.includes(word)),
    )
      .filter((item): item is MetricItem => Boolean(item?.id))
      .map((item) => String(item.id));
    selectedMetrics.value =
      picked.length > 0
        ? [...new Set(picked)]
        : metricOptions.value.slice(0, 8).map((option) => option.value);
  } catch (error) {
    metricOptions.value = [];
    console.error('指标列表加载失败:', error);
  }
}

/**
 * 筛选条件：
 *  - material_id 按本地素材ID圈定当前素材，属于关联筛选，后端在关联维度补齐后过滤
 *  - platform 为可选的收窄条件，走事实表筛选
 */
function buildFilters(): ReportFilter[] {
  const filters: ReportFilter[] = [];
  if (props.material.id) {
    filters.push({
      field: 'material_id',
      operator: OP_IN,
      values: [props.material.id],
    });
  }
  if (selectedPlatforms.value.length > 0) {
    filters.push({
      field: 'platform',
      operator: OP_IN,
      values: [...selectedPlatforms.value],
    });
  }
  return filters;
}

function clearReport() {
  reportItems.value = [];
  reportColumns.value = [];
  reportCname.value = {};
  reportSummary.value = null;
}

/** 投放数据取数：素材报表 POST /report/material_report */
async function loadReport() {
  if (!props.material.id) {
    clearReport();
    return;
  }
  // 指标是接口必填项，取不到就查不了，这里给出明确提示而不是静默空白
  if (selectedMetrics.value.length === 0) {
    clearReport();
    await message.warning('未取到指标目录，暂时无法查询投放数据');
    return;
  }
  loading.value = true;
  try {
    const res = await reportApi.fetchMaterialReport({
      dateTimeRange: [...dateRange.value],
      dims: [...selectedDims.value],
      queryMetric: [...selectedMetrics.value],
      decimalPoint: decimalPoint.value,
      filters: buildFilters(),
    });
    reportItems.value = res.items ?? [];
    reportColumns.value = res.columns ?? [];
    reportCname.value = res.cname ?? {};
    reportSummary.value = res.summary?.[0] ?? null;
  } catch (error) {
    clearReport();
    console.error('素材报表查询失败:', error);
  } finally {
    loading.value = false;
  }
}

/** 切换时间预设，自定义选项只更新选中态，不覆盖用户已选区间 */
function handlePresetChange() {
  const preset = activeRange.value;
  if (preset > 0) {
    dateRange.value = [
      dayjs().subtract(preset - 1, 'day').format('YYYY-MM-DD'),
      dayjs().format('YYYY-MM-DD'),
    ];
  }
  void loadReport();
}

function handleDateRangeChange() {
  activeRange.value = 0;
  void loadReport();
}

/** 维度 / 平台 / 指标变化后重新取数 */
function handleFilterChange() {
  void loadReport();
}

/** 指标弹窗确认后按新指标重查 */
function handleConfirmMetric(metricIds: string[], newDecimalPoint: number) {
  selectedMetrics.value = metricIds ?? [];
  decimalPoint.value = newDecimalPoint ?? 4;
  void loadReport();
}

async function handleQuery() {
  await loadReport();
}

function handleReset() {
  activeRange.value = 7;
  dateRange.value = [
    dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
    dayjs().format('YYYY-MM-DD'),
  ];
  selectedPlatforms.value = [];
  selectedDims.value = [...DEFAULT_DIMS];
  selectedMetrics.value = metricOptions.value.slice(0, 8).map((o) => o.value);
  void loadReport();
}

/**
 * 打开详情时取数。
 *
 * 这里不用 onMounted：抽屉关闭后内容实例不一定会被销毁，第二次打开时 onMounted 不再触发，
 * 表现为「loading 不亮、也不再查询」。改由父级传入的 openSeq 驱动，
 * 无论是重开同一个素材还是换一个素材，都会重新取数。
 */
watch(
  () => props.openSeq,
  async () => {
    await loadMetricOptions();
    await loadReport();
  },
  { immediate: true },
);

/* ---------------- KPI ---------------- */

/** KPI 口径：先按字段名/中文名做包含匹配，命中第一个可用列 */
const KPI_DEFS: Array<{ exclude?: string[]; keywords: string[]; label: string }> = [
  { exclude: ['率'], keywords: ['消耗', 'cost', 'spend'], label: '消耗' },
  { exclude: ['率'], keywords: ['曝光', '展现', 'show', 'impression'], label: '曝光' },
  { exclude: ['率'], keywords: ['点击', 'click'], label: '点击' },
  { keywords: ['ctr', '点击率'], label: 'CTR' },
  { keywords: ['cvr', '转化率'], label: 'CVR' },
  { exclude: ['率'], keywords: ['转化数', 'convert'], label: '转化数' },
  { keywords: ['cpa'], label: 'CPA' },
  { keywords: ['roi'], label: 'ROI' },
];

function resolveSummaryEntry(def: { exclude?: string[]; keywords: string[] }) {
  const summary = reportSummary.value;
  if (!summary) return undefined;
  for (const [key, value] of Object.entries(summary)) {
    const names = [key.toLowerCase(), (reportCname.value[key] ?? '').toLowerCase()];
    if (def.exclude?.some((word) => names.some((name) => name.includes(word)))) continue;
    if (def.keywords.some((word) => names.some((name) => name.includes(word)))) {
      return { key, value };
    }
  }
  return undefined;
}

const kpiList = computed(() =>
  KPI_DEFS.map((def) => {
    const value = resolveSummaryEntry(def)?.value;
    const isEmpty = value === undefined || value === null || value === '';
    return {
      label: def.label,
      value: isEmpty ? '-' : String(value),
      delta: '-',
    };
  }),
);

/* ---------------- 图表 ---------------- */

/** 在响应列里按字段名 / 中文名定位一列，避免写死指标编码 */
function findColumn(keywords: string[], exclude: string[] = []): string | undefined {
  for (const key of reportColumns.value) {
    // 同时按列 key、英文字段名、中文标题匹配，兼容 needCname 前后的两种返回
    const names = [
      key.toLowerCase(),
      rawFieldOf(key).toLowerCase(),
      (reportCname.value[key] ?? '').toLowerCase(),
    ];
    if (exclude.some((word) => names.some((name) => name.includes(word)))) continue;
    if (keywords.some((word) => names.some((name) => name.includes(word)))) return key;
  }
  return undefined;
}

function toNumber(value: unknown): number {
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
}

/** 时间轴维度：取所选维度里第一个时间维度（行数据里是中文列名） */
const dateDimKey = computed(() => {
  const dim = selectedDims.value.find((item) => DATE_DIM_KEYS.includes(item));
  return dim ? dimRowKey(dim) : undefined;
});

/** 明细按时间轴排序，供趋势类图表使用 */
const sortedItems = computed(() => {
  const key = dateDimKey.value;
  if (!key) return [];
  return [...reportItems.value].sort((a, b) =>
    String(a[key]).localeCompare(String(b[key])),
  );
});

/** 指标列定位 */
const costKey = computed(() => findColumn(['消耗', 'cost', 'spend'], ['率']));
const showKey = computed(() =>
  findColumn(['曝光', '展现', 'impression', 'show'], ['率']),
);
const ctrKey = computed(() => findColumn(['ctr', '点击率']));
const cvrKey = computed(() => findColumn(['cvr', '转化率']));
const roiKey = computed(() => findColumn(['roi']));

const chartCategories = computed(() => {
  const key = dateDimKey.value;
  if (!key) return [];
  return sortedItems.value.map((row) => String(row[key] ?? ''));
});

const categoryAxis = computed(() => ({
  axisLabel: AXIS_LABEL,
  axisLine: { lineStyle: { color: '#e5e6eb' } },
  axisTick: { show: false },
  boundaryGap: false,
  data: chartCategories.value,
  type: 'category' as const,
}));

/** 分平台消耗占比 */
const platformRows = computed(() => {
  const dimKey = findColumn(['platform']);
  const valueKey = costKey.value;
  if (!dimKey || !valueKey) return [];
  const map = new Map<string, number>();
  reportItems.value.forEach((row) => {
    const name = String(row[dimKey] ?? '-');
    map.set(name, (map.get(name) ?? 0) + toNumber(row[valueKey]));
  });
  return [...map.entries()]
    .map(([name, value]) => ({ label: getPlatformLabel(name), name, value }))
    .sort((a, b) => b.value - a.value);
});

/** 创意维度对比：取消耗前 5 名的创意 */
const creativeRows = computed(() => {
  const dimKey = findColumn(['creativeName', 'creative_id', '创意']);
  const valueKey = costKey.value;
  if (!dimKey || !valueKey) return [];
  const map = new Map<string, { ctr: number; roi: number; spend: number }>();
  reportItems.value.forEach((row) => {
    const name = String(row[dimKey] ?? '-');
    const item = map.get(name) ?? { ctr: 0, roi: 0, spend: 0 };
    item.ctr = toNumber(row[ctrKey.value ?? '']);
    item.roi = toNumber(row[roiKey.value ?? '']);
    item.spend += toNumber(row[valueKey]);
    map.set(name, item);
  });
  return [...map.entries()]
    .map(([name, value]) => ({ name, ...value }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5);
});

const trendEmpty = computed(
  () => !hasReportData.value || !dateDimKey.value || !costKey.value,
);
const rateEmpty = computed(
  () => !hasReportData.value || !dateDimKey.value || !ctrKey.value,
);
const roiEmpty = computed(
  () => !hasReportData.value || !dateDimKey.value || !roiKey.value,
);
const platformEmpty = computed(
  () => !hasReportData.value || platformRows.value.length === 0,
);
const creativeEmpty = computed(
  () => !hasReportData.value || creativeRows.value.length === 0,
);

const trendOption = computed(() => ({
  grid: { bottom: 24, containLabel: true, left: 8, right: 8, top: 40 },
  legend: {
    data: ['消耗', '曝光'],
    itemHeight: 8,
    itemWidth: 12,
    right: 0,
    textStyle: AXIS_LABEL,
    top: 0,
  },
  series: [
    {
      areaStyle: { color: 'rgba(0, 107, 230, 0.14)' },
      data: sortedItems.value.map((row) => toNumber(row[costKey.value ?? ''])),
      itemStyle: { color: CHART_COLOR.blue },
      name: '消耗',
      showSymbol: false,
      smooth: true,
      type: 'line' as const,
    },
    {
      data: sortedItems.value.map((row) => toNumber(row[showKey.value ?? ''])),
      itemStyle: { color: CHART_COLOR.cyan },
      name: '曝光',
      showSymbol: false,
      smooth: true,
      type: 'line' as const,
      yAxisIndex: 1,
    },
  ],
  tooltip: { trigger: 'axis' as const },
  xAxis: categoryAxis.value,
  yAxis: [
    // 轴名不在这里画：默认渲染在轴顶部，会和右上角图例重叠看起来像多出来的文字，
    // 双轴口径由卡片标题栏的说明承担
    {
      axisLabel: AXIS_LABEL,
      splitLine: SPLIT_LINE,
      type: 'value' as const,
    },
    {
      axisLabel: AXIS_LABEL,
      splitLine: { show: false },
      type: 'value' as const,
    },
  ],
}));

const rateOption = computed(() => ({
  grid: { bottom: 24, containLabel: true, left: 8, right: 16, top: 40 },
  legend: {
    data: ['CTR', 'CVR'],
    itemHeight: 8,
    itemWidth: 12,
    right: 0,
    textStyle: AXIS_LABEL,
    top: 0,
  },
  series: [
    {
      areaStyle: { color: 'rgba(0, 107, 230, 0.14)' },
      data: sortedItems.value.map((row) => toNumber(row[ctrKey.value ?? ''])),
      itemStyle: { color: CHART_COLOR.blue },
      name: 'CTR',
      showSymbol: false,
      smooth: true,
      type: 'line' as const,
    },
    {
      data: sortedItems.value.map((row) => toNumber(row[cvrKey.value ?? ''])),
      itemStyle: { color: CHART_COLOR.orange },
      name: 'CVR',
      showSymbol: false,
      smooth: true,
      type: 'line' as const,
    },
  ],
  tooltip: { trigger: 'axis' as const, valueFormatter: (v: number) => `${v}%` },
  xAxis: categoryAxis.value,
  yAxis: {
    axisLabel: { color: '#8f959e', fontSize: 11, formatter: '{value}%' },
    splitLine: SPLIT_LINE,
    type: 'value' as const,
  },
}));

const roiOption = computed(() => ({
  grid: { bottom: 24, containLabel: true, left: 8, right: 16, top: 40 },
  legend: {
    data: ['ROI'],
    itemHeight: 8,
    itemWidth: 12,
    right: 0,
    textStyle: AXIS_LABEL,
    top: 0,
  },
  series: [
    {
      areaStyle: { color: 'rgba(114, 46, 209, 0.14)' },
      data: sortedItems.value.map((row) => toNumber(row[roiKey.value ?? ''])),
      itemStyle: { color: CHART_COLOR.purple },
      markLine: {
        data: [{ yAxis: 1 }],
        label: { formatter: '盈亏基准 1.0', position: 'insideEndTop' },
        lineStyle: { color: '#f53f3f', type: 'dashed' as const },
        silent: true,
        symbol: 'none',
      },
      name: 'ROI',
      showSymbol: false,
      smooth: true,
      type: 'line' as const,
    },
  ],
  tooltip: { trigger: 'axis' as const },
  xAxis: categoryAxis.value,
  yAxis: {
    axisLabel: AXIS_LABEL,
    min: 0,
    splitLine: SPLIT_LINE,
    type: 'value' as const,
  },
}));

const platformOption = computed(() => ({
  legend: { bottom: 0, textStyle: AXIS_LABEL },
  series: [
    {
      // 每块按通用平台枚举取色，和明细表里的平台标签颜色一致
      data: platformRows.value.map((item, index) => ({
        itemStyle: { color: getPlatformChartColor(item.name, index) },
        name: item.label,
        value: item.value,
      })),
      label: { formatter: '{b} {d}%', show: false },
      name: '平台消耗',
      radius: ['52%', '74%'],
      type: 'pie' as const,
    },
  ],
  tooltip: { trigger: 'item' as const },
}));

const creativeOption = computed(() => ({
  grid: { bottom: 46, containLabel: true, left: 8, right: 16, top: 40 },
  legend: {
    data: ['CTR（%）', 'ROI'],
    itemHeight: 8,
    itemWidth: 12,
    right: 0,
    textStyle: AXIS_LABEL,
    top: 0,
  },
  series: [
    {
      data: creativeRows.value.map((item) => item.ctr),
      itemStyle: { color: CHART_COLOR.blue },
      name: 'CTR（%）',
      type: 'bar' as const,
    },
    {
      data: creativeRows.value.map((item) => item.roi),
      itemStyle: { color: CHART_COLOR.cyan },
      name: 'ROI',
      type: 'bar' as const,
    },
  ],
  tooltip: { trigger: 'axis' as const },
  xAxis: {
    axisLabel: { ...AXIS_LABEL, interval: 0 },
    data: creativeRows.value.map((item) => item.name),
    type: 'category' as const,
  },
  yAxis: { axisLabel: AXIS_LABEL, splitLine: SPLIT_LINE, type: 'value' as const },
}));

/* ---------------- 明细表（vxe Grid） ---------------- */

/** 指标数值展示：空值统一为 —，数字加千分位并保留原有小数位（与素材报表一致） */
function formatMetricValue(value: any) {
  if (value === undefined || value === null || value === '') return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  const decimals = String(value).split('.')[1]?.length ?? 0;
  return num.toLocaleString('zh-CN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
}

/** 指标列：右对齐 + 千分位数字排印，与素材报表的指标列一致 */
function buildMetricColumn(field: string, title: string) {
  return {
    align: 'right' as const,
    className: 'tabular-nums',
    field,
    footerClassName: 'tabular-nums',
    formatter: ({ cellValue }: any) => formatMetricValue(cellValue),
    headerAlign: 'right' as const,
    headerClassName: 'tabular-nums',
    minWidth: 120,
    showOverflow: true,
    title,
  };
}

/**
 * 维度列：平台列用通用平台枚举渲染成中文带色标签。
 * 这里走列的 slots + 模板插槽（和 system/menu 的做法一致），
 * adapter 里注册的 CellTag 渲染器在本项目内实际不生效。
 */
function buildDimColumn(field: string, title: string) {
  const baseColumn = {
    field,
    minWidth: 120,
    showOverflow: true,
    title,
  };
  return rawFieldOf(field) === 'platform'
    ? { ...baseColumn, width: 120, slots: { default: 'platform' } }
    : baseColumn;
}

const gridColumns = computed<VxeTableGridColumns>(() => {
  const dimSet = new Set([...selectedDims.value, ...DIM_NAME_FIELDS]);
  const dims: any[] = [];
  const metrics: any[] = [];

  reportColumns.value.forEach((key) => {
    const title = reportCname.value[key] ?? key;
    // 按反查回英文的字段名判断维度/指标，兼容列名为中文的情况
    if (dimSet.has(rawFieldOf(key))) {
      dims.push(buildDimColumn(key, title));
    } else {
      metrics.push(buildMetricColumn(key, title));
    }
  });

  // 接口未返回列时（首次进入或查询失败）按当前选择占位，保证表头可见
  if (dims.length === 0 && metrics.length === 0) {
    selectedDims.value.forEach((key) => {
      dims.push(
        buildDimColumn(
          key,
          DIM_OPTIONS.find((option) => option.value === key)?.label ?? key,
        ),
      );
    });
    selectedMetrics.value.forEach((id) => {
      const title =
        metricOptions.value.find((option) => option.value === id)?.label ?? id;
      metrics.push(buildMetricColumn(id, title));
    });
  }

  const seqColumn = {
    align: 'center' as const,
    field: 'seq',
    fixed: 'left' as const,
    title: '序号',
    width: 64,
  };

  // 与素材报表一致：两层表头区分维度与指标；维度列始终排在指标之前，前 N 个冻结在左侧
  // （vxe 分组表头的 fixed 会继承给全部子列，所以冻结/非冻结维度必须拆成两组）
  const frozenDims = dims
    .slice(0, MAX_FROZEN_DIM_COUNT)
    .map((column) => ({ ...column, fixed: 'left' as const }));
  const scrollDims = dims.slice(MAX_FROZEN_DIM_COUNT);

  return [
    seqColumn,
    ...(frozenDims.length > 0
      ? [{ children: frozenDims, fixed: 'left' as const, title: '维度' }]
      : []),
    ...(scrollDims.length > 0 ? [{ children: scrollDims, title: '维度' }] : []),
    ...(metrics.length > 0 ? [{ children: metrics, title: '指标' }] : []),
  ];
});

/** 明细行数据：补上序号列的值 */
const gridData = computed<Record<string, any>[]>(() =>
  reportItems.value.map((row, index) => ({ ...row, seq: index + 1 })),
);

/** 表尾合计行：序号列放「合计」，其余列取接口 summary 的同名字段 */
const footerData = computed(() => ({
  seq: '合计',
  ...(reportSummary.value ?? {}),
}));

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    border: true,
    columns: gridColumns.value,
    data: gridData.value,
    emptyText: '暂无投放明细',
    footerData: [footerData.value],
    maxHeight: 460,
    pagerConfig: { enabled: false },
    rowConfig: { isHover: true },
    scrollX: { enabled: true, gt: 6 },
    showFooter: true,
    toolbarConfig: { enabled: false },
  },
});

/** 列 / 数据 / 合计变化时一起下发，避免分多次重绘 */
watch([gridColumns, gridData, footerData], () => {
  gridApi.setGridOptions({
    columns: gridColumns.value,
    data: gridData.value,
    footerData: [footerData.value],
  });
});

watch(loading, (value) => {
  gridApi.setLoading(value);
});
</script>

<template>
  <div class="material-detail">
    <!-- ==================== 页头 ==================== -->
    <div class="detail-head">
      <Button class="back-btn" type="text" @click="emit('close')">
        <template #icon><ArrowLeftOutlined /></template>
      </Button>

      <div class="head-main">
        <div class="head-title">
          <span class="head-name" :title="material.name">
            {{ material.name || '-' }}
          </span>
          <Tag :color="typeTagColor" :bordered="false">{{ typeText }}</Tag>
          <Tag v-if="formatLabel" :color="formatTagColor" :bordered="false">
            {{ formatLabel }}
          </Tag>
        </div>
        <div class="head-sub">
          <span>
            素材ID：<span class="font-mono">{{ material.id || '-' }}</span>
          </span>
          <Button type="link" size="small" @click="copyMaterialId">
            <template #icon><CopyOutlined /></template>
            复制
          </Button>
          <Divider type="vertical" />
          <span>所属目录：{{ folderPath || '-' }}</span>
          <Divider type="vertical" />
          <span>剪辑师：{{ material.editorName || '-' }}</span>
        </div>
      </div>

      <Space class="head-actions">
        <Button type="primary" @click="emit('push', material)">
          <template #icon><SendOutlined /></template>
          推送素材
        </Button>
        <Button @click="downloadMaterial">
          <template #icon><DownloadOutlined /></template>
          下载
        </Button>
        <Button @click="message.info('素材信息编辑开发中')">编辑</Button>
      </Space>
    </div>

    <!-- ==================== 模块一：素材详情 ==================== -->
    <Card :bordered="false" class="detail-card" size="small" title="素材详情">
      <div class="detail-body">
        <div class="preview">
          <video
            v-if="isVideo && material.fileUrl"
            class="preview-media"
            controls
            preload="metadata"
            :poster="videoPoster"
            :src="material.fileUrl"
          ></video>
          <img
            v-else-if="imageUrl"
            alt="素材预览"
            class="preview-media"
            :src="imageUrl"
          />
          <div v-else class="preview-empty">
            <FileOutlined />
          </div>

          <span v-if="durationText" class="preview-badge preview-badge--left">
            {{ durationText }}
          </span>
          <span class="preview-badge preview-badge--right">
            {{ resolutionText }}
          </span>
        </div>

        <div class="detail-meta">
          <div class="meta-title">基础信息</div>
          <Descriptions :column="3" layout="vertical" size="small">
            <DescriptionsItem
              v-for="item in basicInfo"
              :key="item.label"
              :label="item.label"
            >
              <Tag v-if="item.tagColor" :bordered="false" :color="item.tagColor">
                {{ item.value }}
              </Tag>
              <span v-else :class="{ 'font-mono text-xs': item.mono }">
                {{ item.value }}
              </span>
            </DescriptionsItem>
          </Descriptions>

          <div class="meta-title">创作与归档</div>
          <Descriptions :column="3" layout="vertical" size="small">
            <DescriptionsItem
              v-for="item in createInfo"
              :key="item.label"
              :label="item.label"
            >
              {{ item.value }}
            </DescriptionsItem>
          </Descriptions>

          <div class="meta-title">素材标签</div>
          <div class="tag-list">
            <span class="text-muted-foreground text-xs">
              暂无标签，标签能力由素材分析模块补充
            </span>
          </div>
        </div>
      </div>
    </Card>

    <!-- ==================== 模块二：投放数据 ==================== -->
    <Card :bordered="false" class="detail-card" size="small" title="投放数据">
      <template #extra>
        <span class="card-extra">数据来源：素材报表</span>
      </template>

      <Alert
        class="data-banner"
        show-icon
        type="info"
        message="数据来自素材报表，已按当前素材（本地素材ID）过滤；支持按 时间（时/日/周/月/年）· 平台 · 计划 · 广告组 · 广告 · 创意 · 本地素材ID · 剪辑师 · 优化师 · 部门 聚合查询。"
      />

      <!-- 筛选区 -->
      <div class="data-filter">
        <div class="filter-row">
          <span class="filter-label">时间范围</span>
          <RadioGroup
            v-model:value="activeRange"
            button-style="solid"
            @change="handlePresetChange"
          >
            <RadioButton
              v-for="preset in RANGE_PRESETS"
              :key="preset.value"
              :value="preset.value"
            >
              {{ preset.label }}
            </RadioButton>
          </RadioGroup>
          <RangePicker
            v-model:value="dateRange"
            :allow-clear="false"
            value-format="YYYY-MM-DD"
            @change="handleDateRangeChange"
          />
        </div>

        <div class="filter-row">
          <span class="filter-label">平台</span>
          <Select
            v-model:value="selectedPlatforms"
            :max-tag-count="2"
            :options="ACTIVE_PLATFORM"
            allow-clear
            class="filter-select"
            mode="multiple"
            placeholder="全部平台"
            @change="handleFilterChange"
          />
        </div>

        <div class="filter-row">
          <span class="filter-label">维度</span>
          <Select
            v-model:value="selectedDims"
            :max-tag-count="3"
            :options="DIM_OPTIONS"
            class="filter-select filter-select--wide"
            mode="multiple"
            placeholder="请选择聚合维度"
            @change="handleFilterChange"
          />
        </div>

        <div class="filter-row">
          <span class="filter-label"></span>
          <Space>
            <Button type="primary" @click="handleQuery">查询</Button>
            <Button @click="handleReset">重置</Button>
          </Space>
        </div>
      </div>

      <!-- KPI -->
      <div class="kpi-grid">
        <Card
          v-for="kpi in kpiList"
          :key="kpi.label"
          :bordered="false"
          class="kpi-card"
          :loading="loading"
          size="small"
        >
          <Statistic :title="kpi.label">
            <template #formatter>{{ kpi.value }}</template>
          </Statistic>
          <div class="kpi-delta">较上周期 {{ kpi.delta }}</div>
        </Card>
      </div>

      <!-- 图表分析 -->
      <div class="block-title">
        <span class="block-title-text">图表分析</span>
        <span class="text-muted-foreground text-xs">随筛选条件联动</span>
      </div>
      <div class="chart-grid">
        <div class="chart-full">
          <DetailChartCard
            :empty="trendEmpty"
            height="300px"
            hint="左轴：消耗（元）　右轴：曝光"
            :loading="loading"
            :option="trendOption"
            title="消耗与曝光趋势"
          />
        </div>
        <DetailChartCard
          :empty="rateEmpty"
          hint="单位：%"
          :loading="loading"
          :option="rateOption"
          title="点击率 / 转化率趋势"
        />
        <DetailChartCard
          :empty="roiEmpty"
          hint="虚线为盈亏基准 1.0"
          :loading="loading"
          :option="roiOption"
          title="ROI 趋势"
        />
        <DetailChartCard
          :empty="platformEmpty"
          hint="按媒体拆分"
          :loading="loading"
          :option="platformOption"
          title="分平台消耗占比"
        />
        <DetailChartCard
          :empty="creativeEmpty"
          hint="CTR（%）/ ROI"
          :loading="loading"
          :option="creativeOption"
          title="创意维度对比 TOP5"
        />
      </div>

      <!-- 投放明细 -->
      <div class="block-title">
        <span class="block-title-text">投放明细</span>
        <span class="text-muted-foreground text-xs">
          共 {{ reportItems.length }} 条
        </span>
      </div>

      <div class="table-toolbar">
        <Button @click="message.info('导出能力复用素材报表导出')">导出</Button>
        <Button @click="openMetricModal">
          指标（{{ selectedMetrics.length }}）
        </Button>
      </div>

      <Grid>
        <!-- 平台列：中文名 + 平台色标签。取值走 column.field，兼容列名被翻译成中文的情况 -->
        <template #platform="{ row, column }">
          <Tag
            :bordered="false"
            :color="getPlatformColor(String(row[column.field] ?? ''))"
          >
            {{ getPlatformLabel(String(row[column.field] ?? '')) }}
          </Tag>
        </template>
      </Grid>
    </Card>

    <!-- 指标选择弹窗：与素材报表共用同一组件 -->
    <SelectMetricModalView
      :decimal-point="decimalPoint"
      report-type="material"
      :selected-metrics="selectedMetrics"
      @confirm-metric="handleConfirmMetric"
    />
  </div>
</template>

<style scoped lang="scss">
.material-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ==================== 页头 ==================== */

.detail-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.back-btn {
  flex: none;
}

.head-main {
  flex: 1;
  min-width: 0;
}

.head-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.head-name {
  font-size: 18px;
  font-weight: 600;
  line-height: 32px;
  word-break: break-all;
}

.head-sub {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.head-actions {
  flex: none;
}

/* ==================== 卡片 ==================== */

.detail-card {
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 5%);

  :deep(.ant-card-head) {
    min-height: 48px;
    padding: 0 20px;
  }

  :deep(.ant-card-head-title) {
    font-size: 15px;
    font-weight: 600;
  }

  :deep(.ant-card-body) {
    padding: 16px 20px 20px;
  }
}

.card-extra {
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

/* ==================== 模块一 ==================== */

.detail-body {
  display: flex;
  gap: 24px;
}

.preview {
  position: relative;
  flex: none;
  width: 220px;
  height: 392px;
  overflow: hidden;
  background: #10131a;
  border-radius: 12px;
}

.preview-media {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #6b7280;
  font-size: 32px;
}

.preview-badge {
  position: absolute;
  bottom: 8px;
  padding: 1px 6px;
  color: #fff;
  font-size: 11px;
  background: rgb(0 0 0 / 60%);
  border-radius: 4px;

  &--left {
    left: 8px;
  }

  &--right {
    right: 8px;
  }
}

.detail-meta {
  flex: 1;
  min-width: 0;
}

.meta-title {
  position: relative;
  padding-left: 9px;
  margin: 16px 0 4px;
  font-size: 13px;
  font-weight: 600;

  &:first-child {
    margin-top: 0;
  }

  &::before {
    position: absolute;
    top: 4px;
    left: 0;
    width: 3px;
    height: 12px;
    background: hsl(var(--primary));
    border-radius: 2px;
    content: '';
  }
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* ==================== 模块二 ==================== */

.data-banner {
  margin-bottom: 14px;
}

.data-filter {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 16px;
  background: hsl(var(--accent));
  border-radius: 12px;
}

.filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-label {
  flex: none;
  width: 56px;
  color: hsl(var(--muted-foreground));
  font-size: 13px;
}

.filter-select {
  width: 260px;
}

.filter-select--wide {
  width: 560px;
  max-width: 100%;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.kpi-card {
  border: 1px solid hsl(var(--border));
  border-radius: 12px;

  :deep(.ant-card-body) {
    padding: 12px 16px;
  }

  :deep(.ant-statistic-title) {
    font-size: 12px;
  }

  :deep(.ant-statistic-content) {
    font-size: 22px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
}

.kpi-delta {
  margin-top: 4px;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.block-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 20px 0 12px;
}

.block-title-text {
  font-size: 14px;
  font-weight: 600;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.chart-full {
  grid-column: 1 / -1;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

/* ==================== 响应式 ==================== */

@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .chart-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .chart-full {
    grid-column: auto;
  }
}

@media (max-width: 900px) {
  .detail-body {
    flex-direction: column;
  }

  .preview {
    width: 100%;
    max-width: 220px;
  }

  .filter-select,
  .filter-select--wide {
    width: 100%;
  }
}
</style>
