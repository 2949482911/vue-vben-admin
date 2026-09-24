<script lang="ts" setup name="OcpxLinkConfig">
import { computed, ref } from 'vue';

import {
  ApiOutlined,
  CloseOutlined,
  EyeOutlined,
  PhoneOutlined,
  PlusOutlined,
  RocketOutlined,
  SaveOutlined,
  SendOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Empty,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  Tag,
  Tooltip,
} from 'ant-design-vue';

/**
 * OCPX 链路配置工作台（配置化改造）
 *
 * 设计目标：将「点击 → 请求转化 → 转化回调 → 回传媒体」整条链路从硬编码
 * 改为「配置即 Schema」，所有字段/宏参数/事件映射均从后端配置中心读取，
 * 前端仅用一个通用渲染器按 schema 动态渲染，新增媒体无需改代码、无需发版。
 *
 * 本页为前端原型：数据来自本地 mock（结构对齐未来的配置中心数据模型），
 * 后续替换为 api/core/ocpx 中的配置中心接口即可。
 */

// ===== 类型定义（对齐配置中心数据模型）=====
type NodeType = 'click' | 'behavior' | 'callback' | 'return';

interface MacroDef {
  key: string;
  placeholder: string;
  source: string;
  required: boolean;
}

interface FieldSchema {
  key: string;
  label: string;
  component: 'input' | 'number' | 'password' | 'switch';
  required: boolean;
  value?: string | number | boolean;
  hint?: string;
}

interface EventDef {
  code: string;
  name: string;
  linked?: boolean;
}

interface NodeConfig {
  media: string;
  url?: string;
  method?: string;
  macros?: MacroDef[];
  fields?: FieldSchema[];
  events?: EventDef[];
}

interface LinkTemplate {
  id: string;
  name: string;
  tag: string;
  media: [string, string, string, string];
  nodes: Partial<Record<NodeType, NodeConfig>>;
}

interface NodeMeta {
  id: NodeType;
  stage: string;
  title: string;
  tone: 'click' | 'behavior' | 'callback' | 'return';
}

// ===== 节点元信息 =====
const NODE_META: NodeMeta[] = [
  { id: 'click', stage: 'STEP 01', title: '点击监测', tone: 'click' },
  { id: 'behavior', stage: 'STEP 02', title: '请求转化', tone: 'behavior' },
  { id: 'callback', stage: 'STEP 03', title: '转化回调', tone: 'callback' },
  { id: 'return', stage: 'STEP 04', title: '回传媒体', tone: 'return' },
];

const NODE_ICON: Record<NodeType, any> = {
  click: ThunderboltOutlined,
  behavior: ApiOutlined,
  callback: PhoneOutlined,
  return: SendOutlined,
};

// ===== Mock 链路模板（未来从配置中心读取）=====
const LINKS: LinkTemplate[] = [
  {
    id: '#LK-2409-01',
    name: '京东 → 巨量引擎',
    tag: 'APP_DOWNLOAD',
    media: ['京东', '巨量引擎', '巨量引擎', '巨量引擎'],
    nodes: {
      click: {
        media: '京东 · 京东点击监测',
        url: 'https://track.starfiread.com/c?click_id=__CLICK_ID__&account_id=__ACCOUNT_ID__&adgroup_id=__ADGROUP_ID__',
        macros: [
          { key: 'click_id', placeholder: '__CLICK_ID__', source: '点击宏 · 京东', required: true },
          { key: 'account_id', placeholder: '__ACCOUNT_ID__', source: '账户映射', required: true },
          { key: 'adgroup_id', placeholder: '__ADGROUP_ID__', source: '计划映射', required: true },
          { key: 'campaign_id', placeholder: '__CAMPAIGN_ID__', source: '计划组映射', required: false },
        ],
      },
      behavior: {
        media: '巨量引擎',
        url: 'https://api.oceanengine.com/open_api/2/tools/conversion/create/',
        method: 'POST',
        macros: [
          { key: 'app_id', placeholder: '{{app_id}}', source: '配置参数', required: true },
          { key: 'advertiser_id', placeholder: '{{advertiser_id}}', source: '配置参数', required: true },
          { key: 'click_id', placeholder: '{{click_id}}', source: '点击宏透传', required: true },
          { key: 'event_type', placeholder: '{{event_type}}', source: '事件映射', required: true },
          { key: 'timestamp', placeholder: '{{timestamp}}', source: '系统生成', required: false },
          { key: 'sign', placeholder: '{{sign}}', source: '签名计算', required: false },
        ],
        fields: [
          { key: 'app_id', label: '应用 ID', component: 'input', required: true, value: '1900382', hint: '巨量应用唯一标识' },
          { key: 'secret_key', label: 'Secret Key', component: 'password', required: true, value: '••••••••', hint: '仅后端存储' },
          { key: 'debug', label: '调试模式', component: 'switch', required: false, value: true },
          { key: 'dedup', label: '去重窗口（秒）', component: 'number', required: false, value: 3600 },
        ],
      },
      callback: {
        media: '巨量引擎',
        events: [
          { code: 'activate', name: '激活', linked: true },
          { code: 'register', name: '注册', linked: true },
          { code: 'pay', name: '付费', linked: true },
          { code: 'retain_1d', name: '次留', linked: false },
        ],
      },
      return: {
        media: '巨量引擎',
        url: 'https://tracking.oceanengine.com/callback?',
        events: [
          { code: 'activate', name: '激活' },
          { code: 'retention', name: '次留' },
          { code: 'purchase', name: '付费' },
        ],
        macros: [
          { key: 'event_type', placeholder: '__EVENT_TYPE__', source: '事件映射', required: true },
          { key: 'click_id', placeholder: '__CLICK_ID__', source: '点击宏透传', required: true },
        ],
      },
    },
  },
  { id: '#LK-2409-02', name: '淘宝 → 腾讯广告', tag: 'PURCHASE', media: ['淘宝', '腾讯广告', '腾讯广告', '腾讯广告'], nodes: {} },
  { id: '#LK-2409-03', name: '快手 → 快手磁力', tag: 'FORM_LEAD', media: ['快手', '快手磁力', '快手磁力', '快手磁力'], nodes: {} },
  { id: '#LK-2409-04', name: '穿山甲 → OPPO', tag: 'ACTIVATE', media: ['穿山甲', 'OPPO', 'OPPO', 'OPPO'], nodes: {} },
];

const MEDIA_OPTIONS = ['巨量引擎', '腾讯广告', '快手磁力', 'OPPO', '京东', '淘宝', '穿山甲'];

// ===== 交互状态 =====
const selectedLinkId = ref(LINKS[0].id);
const selectedNodeId = ref<NodeType | null>(null);
const jsonModalOpen = ref(false);
const jsonText = ref('');

const currentLink = computed(() => LINKS.find((l) => l.id === selectedLinkId.value) ?? LINKS[0]);
const currentNode = computed(() => currentLink.value.nodes[selectedNodeId.value as NodeType]);
const linkedCount = computed(() => currentLink.value.nodes.callback?.events?.filter((e) => e.linked).length ?? 0);

// ===== 渲染辅助 =====
function nodeCount(node: NodeConfig | undefined, type: NodeType): string {
  if (!node) return '—';
  if (type === 'callback' || type === 'return') return `${node.events?.length ?? 0} 事件`;
  return `${node.macros?.length ?? 0} 宏`;
}

function nodeBadge(node: NodeConfig | undefined): '已配置' | '待配置' {
  return node ? '已配置' : '待配置';
}

function selectLink(id: string) {
  selectedLinkId.value = id;
  selectedNodeId.value = null;
}

function selectNode(id: NodeType) {
  selectedNodeId.value = selectedNodeId.value === id ? null : id;
}

function previewJson() {
  const payload = {
    linkId: currentLink.value.id,
    name: currentLink.value.name,
    clickMedia: currentLink.value.nodes.click,
    behaviorMedia: currentLink.value.nodes.behavior,
    callbackMedia: currentLink.value.nodes.callback,
    returnMedia: currentLink.value.nodes.return,
    eventMappings: currentLink.value.nodes.callback?.events
      ?.filter((e) => e.linked)
      .map((e) => ({ behaviorEvent: e.code, callbackEvent: e.code })),
  };
  jsonText.value = JSON.stringify(payload, null, 2);
  jsonModalOpen.value = true;
}
</script>

<template>
  <div class="ocpx-workbench">
    <!-- 顶部操作栏 -->
    <header class="workbench-topbar">
      <div class="brand">
        <div class="brand-mark">O</div>
        <div class="brand-text">
          <div class="brand-name">OCPX 链路配置</div>
          <div class="brand-sub">Conversion Link Workbench</div>
        </div>
      </div>

      <div class="topbar-divider" />

      <div class="current-link">
        <span class="status-dot" />
        <span class="current-link-name">{{ currentLink.name }}</span>
        <span class="current-link-id">{{ currentLink.id }}</span>
      </div>

      <div class="topbar-actions">
        <Button @click="previewJson">
          <template #icon><EyeOutlined /></template>
          预览 JSON
        </Button>
        <Button>
          <template #icon><SaveOutlined /></template>
          保存草稿
        </Button>
        <Button type="primary">
          <template #icon><RocketOutlined /></template>
          发布上线
        </Button>
      </div>
    </header>

    <div class="workbench-body">
      <!-- 左栏：链路模板列表 -->
      <aside class="link-sidebar">
        <div class="sidebar-head">
          <span class="sidebar-title">链路模板</span>
          <Tooltip title="新建链路">
            <Button size="small" type="text" shape="circle">
              <template #icon><PlusOutlined /></template>
            </Button>
          </Tooltip>
        </div>

        <div class="link-list">
          <div
            v-for="link in LINKS"
            :key="link.id"
            class="link-item"
            :class="{ active: link.id === selectedLinkId }"
            @click="selectLink(link.id)"
          >
            <div class="link-item-top">
              <span class="link-item-name">{{ link.name }}</span>
              <span class="link-item-tag">{{ link.tag }}</span>
            </div>
            <div class="link-item-flow">
              <span>{{ link.media[0] }}</span>
              <span class="flow-arrow">→</span>
              <span>{{ link.media[1] }}</span>
              <span class="flow-arrow">→</span>
              <span>{{ link.media[3] }}</span>
            </div>
          </div>
        </div>

        <div class="sidebar-foot">
          <span class="status-dot" />
          <span>{{ LINKS.length }} 条链路已配置</span>
        </div>
      </aside>

      <!-- 中栏：链路拓扑 + 事件映射 -->
      <main class="workbench-canvas">
        <div class="section-label">链路拓扑 · Link Topology</div>

        <div class="pipeline-panel">
          <div class="pipeline">
            <template v-for="(node, index) in NODE_META" :key="node.id">
              <div
                class="node-card"
                :class="[`tone-${node.tone}`, { active: selectedNodeId === node.id }]"
                @click="selectNode(node.id)"
              >
                <div class="node-icon">
                  <component :is="NODE_ICON[node.id]" />
                </div>
                <div class="node-stage">{{ node.stage }}</div>
                <div class="node-title">{{ node.title }}</div>
                <div class="node-media">
                  {{ currentLink.nodes[node.id]?.media || '点击选择媒体' }}
                </div>
                <div class="node-foot">
                  <span class="node-count">{{ nodeCount(currentLink.nodes[node.id], node.id) }}</span>
                  <Tag :color="nodeBadge(currentLink.nodes[node.id]) === '已配置' ? 'success' : 'default'">
                    {{ nodeBadge(currentLink.nodes[node.id]) }}
                  </Tag>
                </div>
              </div>

              <div v-if="index < NODE_META.length - 1" class="connector">
                <span class="connector-label">{{ ['CLICK', 'REQUEST', 'CALLBACK'][index] }}</span>
                <svg viewBox="0 0 46 20" fill="none">
                  <path d="M2 10 H34" stroke="#cdd5e2" stroke-width="2" />
                  <path d="M34 6 L42 10 L34 14 Z" fill="#cdd5e2" />
                </svg>
              </div>
            </template>
          </div>
        </div>

        <div class="section-label mt-5">事件映射 · Event Mapping</div>

        <div class="mapping-panel">
          <div v-if="!currentLink.nodes.callback?.events || !currentLink.nodes.return?.events" class="mapping-empty">
            <Empty description="请先在节点中配置「转化回调」与「回传媒体」，事件映射将在此可视化连线。" />
          </div>
          <div v-else class="mapping-grid">
            <div class="mapping-col">
              <div class="mapping-col-head">
                <span class="chip chip-callback" />
                转化事件（来源）
              </div>
              <div class="event-list">
                <div
                  v-for="event in currentLink.nodes.callback.events"
                  :key="event.code"
                  class="event-item"
                  :class="{ linked: event.linked }"
                >
                  <span class="event-dot" :class="{ on: event.linked }" />
                  <span>{{ event.name }}</span>
                  <span class="event-code">{{ event.code }}</span>
                </div>
              </div>
            </div>

            <div class="mapping-center">
              <span class="mapping-count">{{ linkedCount }} 条映射</span>
            </div>

            <div class="mapping-col">
              <div class="mapping-col-head">
                <span class="chip chip-return" />
                回传事件（目标）
              </div>
              <div class="event-list">
                <div v-for="event in currentLink.nodes.return.events" :key="event.code" class="event-item">
                  <span class="event-dot on" />
                  <span>{{ event.name }}</span>
                  <span class="event-code">{{ event.code }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- 右栏：节点配置面板 -->
      <aside class="config-inspector">
        <div class="inspector-head">
          <div class="inspector-title">
            <div
              v-if="selectedNodeId"
              class="inspector-icon"
              :class="`tone-${NODE_META.find((n) => n.id === selectedNodeId)?.tone}`"
            >
              <component :is="NODE_ICON[selectedNodeId]" />
            </div>
            <div v-else class="inspector-icon idle">
              <PlusOutlined />
            </div>
            <div>
              <div class="inspector-t1">
                {{ selectedNodeId ? NODE_META.find((n) => n.id === selectedNodeId)?.title : '节点配置' }}
              </div>
              <div class="inspector-t2">
                {{ selectedNodeId ? `${NODE_META.find((n) => n.id === selectedNodeId)?.stage} · ${currentLink.name}` : '点击上方节点进行配置' }}
              </div>
            </div>
          </div>
          <Button v-if="selectedNodeId" size="small" type="text" @click="selectedNodeId = null">
            <template #icon><CloseOutlined /></template>
          </Button>
        </div>

        <div class="inspector-body">
          <Empty v-if="!selectedNodeId" description="选中链路图中的任意节点，即可在此配置媒体、地址、宏参数、字段 schema 与事件。" />
          <Empty v-else-if="!currentNode" description="该节点尚未配置，请先补全媒体、地址与参数。" />

          <!-- 点击媒体 -->
          <template v-else-if="selectedNodeId === 'click'">
            <div class="config-section">
              <div class="config-section-title"><span class="cs-idx">1</span>基础配置</div>
              <div class="field">
                <label>点击媒体<span class="req">*</span></label>
                <Select v-model:value="currentNode!.media" :options="MEDIA_OPTIONS.map((m) => ({ value: m, label: m }))" />
              </div>
              <div class="field">
                <label>监测链接模板<span class="req">*</span><span class="hint">支持宏占位符</span></label>
                <Input.TextArea v-model:value="currentNode!.url" :auto-size="{ minRows: 3, maxRows: 5 }" class="mono-input" />
              </div>
            </div>

            <div class="config-section">
              <div class="config-section-title"><span class="cs-idx">2</span>点击宏参数</div>
              <div class="macro-table">
                <div class="macro-head">
                  <span>宏名</span><span>占位符</span><span>取值来源</span><span>必填</span>
                </div>
                <div v-for="macro in currentNode!.macros" :key="macro.key" class="macro-row">
                  <span class="mono">{{ macro.key }}</span>
                  <span class="placeholder">{{ macro.placeholder }}</span>
                  <span><Tag color="blue">{{ macro.source }}</Tag></span>
                  <span><Tag :color="macro.required ? 'red' : 'default'">{{ macro.required ? '必填' : '可选' }}</Tag></span>
                </div>
              </div>
              <Button type="link" size="small" class="row-add"><PlusOutlined /> 新增宏参数</Button>
            </div>
          </template>

          <!-- 请求转化 -->
          <template v-else-if="selectedNodeId === 'behavior'">
            <div class="config-section">
              <div class="config-section-title"><span class="cs-idx">1</span>基础配置</div>
              <div class="field">
                <label>转化媒体<span class="req">*</span></label>
                <Select v-model:value="currentNode!.media" :options="MEDIA_OPTIONS.map((m) => ({ value: m, label: m }))" />
              </div>
              <div class="field">
                <label>请求地址<span class="req">*</span></label>
                <Input.TextArea v-model:value="currentNode!.url" :auto-size="{ minRows: 3, maxRows: 5 }" class="mono-input" />
              </div>
              <div class="field">
                <label>请求方法</label>
                <Select v-model:value="currentNode!.method" :options="[{ value: 'POST', label: 'POST' }, { value: 'GET', label: 'GET' }]" />
              </div>
            </div>

            <div class="config-section">
              <div class="config-section-title"><span class="cs-idx">2</span>请求宏参数</div>
              <div class="macro-table">
                <div class="macro-head">
                  <span>宏名</span><span>占位符</span><span>取值来源</span><span>必填</span>
                </div>
                <div v-for="macro in currentNode!.macros" :key="macro.key" class="macro-row">
                  <span class="mono">{{ macro.key }}</span>
                  <span class="placeholder">{{ macro.placeholder }}</span>
                  <span><Tag color="blue">{{ macro.source }}</Tag></span>
                  <span><Tag :color="macro.required ? 'red' : 'default'">{{ macro.required ? '必填' : '可选' }}</Tag></span>
                </div>
              </div>
              <Button type="link" size="small" class="row-add"><PlusOutlined /> 新增请求宏</Button>
            </div>

            <div class="config-section">
              <div class="config-section-title"><span class="cs-idx">3</span>配置参数（字段 Schema）</div>
              <div v-for="field in currentNode!.fields" :key="field.key" class="field">
                <label>
                  {{ field.label }}
                  <span v-if="field.required" class="req">*</span>
                  <span class="hint">{{ field.hint }}</span>
                </label>
                <InputNumber v-if="field.component === 'number'" v-model:value="field.value as number" style="width: 100%" />
                <Switch v-else-if="field.component === 'switch'" v-model:checked="field.value as boolean" />
                <Input v-else v-model:value="field.value as string" :type="field.component === 'password' ? 'password' : 'text'" />
              </div>
              <Button type="link" size="small" class="row-add"><PlusOutlined /> 新增字段</Button>
            </div>
          </template>

          <!-- 转化回调 -->
          <template v-else-if="selectedNodeId === 'callback'">
            <div class="config-section">
              <div class="config-section-title"><span class="cs-idx">1</span>回调事件配置</div>
              <div class="macro-table">
                <div class="macro-head"><span>事件编码</span><span>事件名称</span><span>映射状态</span></div>
                <div v-for="event in currentNode!.events" :key="event.code" class="macro-row">
                  <span class="mono">{{ event.code }}</span>
                  <span>{{ event.name }}</span>
                  <span><Tag :color="event.linked ? 'blue' : 'default'">{{ event.linked ? '已映射' : '未映射' }}</Tag></span>
                </div>
              </div>
            </div>

            <div class="config-section">
              <div class="config-section-title"><span class="cs-idx">2</span>事件映射</div>
              <div class="field">
                <label>映射方式<span class="hint">转化事件 ↔ 回传事件</span></label>
                <Select :options="[{ value: 'visual', label: '可视化连线（推荐）' }, { value: 'one2one', label: '一对一' }, { value: 'many2one', label: '多对一' }]" default-value="visual" />
              </div>
              <p class="mapping-hint">点击下方「事件映射」区域即可为每个转化事件连线到对应的回传事件。</p>
            </div>
          </template>

          <!-- 回传媒体 -->
          <template v-else-if="selectedNodeId === 'return'">
            <div class="config-section">
              <div class="config-section-title"><span class="cs-idx">1</span>基础配置</div>
              <div class="field">
                <label>回传媒体<span class="req">*</span></label>
                <Select v-model:value="currentNode!.media" :options="MEDIA_OPTIONS.map((m) => ({ value: m, label: m }))" />
              </div>
              <div class="field">
                <label>回传地址<span class="req">*</span></label>
                <Input.TextArea v-model:value="currentNode!.url" :auto-size="{ minRows: 3, maxRows: 5 }" class="mono-input" />
              </div>
            </div>

            <div class="config-section">
              <div class="config-section-title"><span class="cs-idx">2</span>回传事件</div>
              <div class="macro-table">
                <div class="macro-head"><span>事件编码</span><span>事件名称</span></div>
                <div v-for="event in currentNode!.events" :key="event.code" class="macro-row">
                  <span class="mono">{{ event.code }}</span>
                  <span>{{ event.name }}</span>
                </div>
              </div>
              <Button type="link" size="small" class="row-add"><PlusOutlined /> 新增回传事件</Button>
            </div>

            <div class="config-section">
              <div class="config-section-title"><span class="cs-idx">3</span>回传宏参数</div>
              <div class="macro-table">
                <div class="macro-head"><span>宏名</span><span>占位符</span><span>取值来源</span><span>必填</span></div>
                <div v-for="macro in currentNode!.macros" :key="macro.key" class="macro-row">
                  <span class="mono">{{ macro.key }}</span>
                  <span class="placeholder">{{ macro.placeholder }}</span>
                  <span><Tag color="blue">{{ macro.source }}</Tag></span>
                  <span><Tag :color="macro.required ? 'red' : 'default'">{{ macro.required ? '必填' : '可选' }}</Tag></span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </aside>
    </div>

    <!-- 底部状态栏 -->
    <footer class="workbench-statusbar">
      <span class="status-item">配置驱动：<b>schema</b></span>
      <span class="status-item">点击宏：<b>{{ currentLink.nodes.click?.macros?.length ?? 0 }}</b></span>
      <span class="status-item">请求宏：<b>{{ currentLink.nodes.behavior?.macros?.length ?? 0 }}</b></span>
      <span class="status-item">事件映射：<b>{{ linkedCount }}</b></span>
      <span class="status-item status-right">数据源：<b>database</b> · 无需代码发版</span>
    </footer>

    <!-- JSON 预览弹窗 -->
    <Modal v-model:open="jsonModalOpen" title="链路配置 JSON 预览" :footer="null" width="600px">
      <pre class="json-preview">{{ jsonText }}</pre>
    </Modal>
  </div>
</template>

<style scoped lang="scss">
.ocpx-workbench {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  color: #14213d;
  background-color: #eef1f6;
  background-image:
    linear-gradient(rgb(20 33 61 / 5%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(20 33 61 / 5%) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* ===== 顶部操作栏 ===== */
.workbench-topbar {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 16px;
  height: 60px;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #e2e7f0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-mark {
  display: grid;
  width: 30px;
  height: 30px;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  background: linear-gradient(135deg, #0d9488, #0ea5e9);
  border-radius: 8px;
  place-items: center;
  box-shadow: 0 4px 12px rgb(13 148 136 / 35%);
}

.brand-name {
  font-weight: 600;
  font-size: 15px;
}

.brand-sub {
  margin-top: 1px;
  color: #8a94a8;
  font-size: 11px;
}

.topbar-divider {
  width: 1px;
  height: 26px;
  background: #e2e7f0;
}

.current-link {
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-link-name {
  font-weight: 600;
  font-size: 14px;
}

.current-link-id {
  color: #8a94a8;
  font-size: 12px;
  font-family: 'IBM Plex Mono', monospace;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgb(34 197 94 / 15%);
}

.topbar-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

/* ===== 主体 ===== */
.workbench-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* ===== 左栏 ===== */
.link-sidebar {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  width: 248px;
  background: #fff;
  border-right: 1px solid #e2e7f0;
}

.sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
}

.sidebar-title {
  color: #8a94a8;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.link-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  padding: 4px 10px 12px;
  overflow-y: auto;
}

.link-item {
  padding: 12px;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 10px;
  transition: all 0.15s ease;
}

.link-item:hover {
  background: #f7f9fc;
}

.link-item.active {
  background: #fff;
  border-color: #0d9488;
  box-shadow: 0 1px 2px rgb(20 33 61 / 4%), 0 8px 24px rgb(20 33 61 / 6%);
}

.link-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 7px;
}

.link-item-name {
  font-weight: 600;
  font-size: 13px;
}

.link-item-tag {
  padding: 1px 6px;
  color: #8a94a8;
  font-size: 10px;
  font-family: 'IBM Plex Mono', monospace;
  background: #f7f9fc;
  border: 1px solid #e2e7f0;
  border-radius: 5px;
}

.link-item.active .link-item-tag {
  color: #0d9488;
  background: rgb(13 148 136 / 6%);
  border-color: #0d9488;
}

.link-item-flow {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #8a94a8;
  font-size: 11px;
}

.flow-arrow {
  color: #cdd5e2;
}

.sidebar-foot {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 12px 16px;
  color: #8a94a8;
  font-size: 11px;
  border-top: 1px solid #e2e7f0;
}

/* ===== 中栏 ===== */
.workbench-canvas {
  flex: 1;
  min-width: 0;
  padding: 18px 20px;
  overflow-y: auto;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #8a94a8;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.section-label::after {
  flex: 1;
  height: 1px;
  background: #e2e7f0;
  content: '';
}

.pipeline-panel,
.mapping-panel {
  padding: 24px 20px;
  background: #fff;
  border: 1px solid #e2e7f0;
  border-radius: 14px;
  box-shadow: 0 1px 2px rgb(20 33 61 / 4%), 0 8px 24px rgb(20 33 61 / 6%);
}

.pipeline {
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.node-card {
  width: 150px;
  padding: 16px 14px 14px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e2e7f0;
  border-radius: 12px;
  transition: all 0.18s ease;
}

.node-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 1px 2px rgb(20 33 61 / 4%), 0 8px 24px rgb(20 33 61 / 6%);
}

.node-card.active {
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgb(13 148 136 / 12%), 0 1px 2px rgb(20 33 61 / 4%), 0 8px 24px rgb(20 33 61 / 6%);
}

.node-icon {
  display: grid;
  width: 34px;
  height: 34px;
  margin-bottom: 12px;
  color: #fff;
  font-size: 18px;
  border-radius: 9px;
  place-items: center;
}

.tone-click .node-icon {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.tone-behavior .node-icon {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
}

.tone-callback .node-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.tone-return .node-icon {
  background: linear-gradient(135deg, #f43f5e, #e11d48);
}

.node-stage {
  margin-bottom: 3px;
  color: #8a94a8;
  font-size: 10px;
  font-family: 'IBM Plex Mono', monospace;
  letter-spacing: 0.5px;
}

.node-title {
  margin-bottom: 5px;
  font-weight: 600;
  font-size: 14px;
}

.node-media {
  margin-bottom: 10px;
  overflow: hidden;
  color: #8a94a8;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px dashed #e2e7f0;
}

.node-count {
  color: #33415c;
  font-size: 11px;
}

.connector {
  position: relative;
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 46px;
}

.connector svg {
  width: 46px;
  height: 20px;
}

.connector-label {
  position: absolute;
  top: -16px;
  color: #8a94a8;
  font-size: 9px;
  font-family: 'IBM Plex Mono', monospace;
  white-space: nowrap;
}

/* ===== 事件映射 ===== */
.mapping-empty {
  padding: 20px 0;
}

.mapping-grid {
  display: grid;
  grid-template-columns: 1fr 120px 1fr;
  align-items: start;
}

.mapping-col-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  color: #8a94a8;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.6px;
}

.chip {
  width: 9px;
  height: 9px;
  border-radius: 3px;
}

.chip-callback {
  background: #d97706;
}

.chip-return {
  background: #e11d48;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  font-size: 12px;
  background: #f7f9fc;
  border: 1px solid #e2e7f0;
  border-radius: 8px;
}

.event-item.linked {
  background: rgb(13 148 136 / 5%);
  border-color: #0d9488;
}

.event-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  background: #cbd5e1;
  border-radius: 50%;
}

.event-dot.on {
  background: #0d9488;
}

.event-code {
  margin-left: auto;
  color: #8a94a8;
  font-size: 11px;
  font-family: 'IBM Plex Mono', monospace;
}

.mapping-center {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 8px;
}

.mapping-count {
  padding: 5px 12px;
  color: #0d9488;
  font-size: 12px;
  font-family: 'IBM Plex Mono', monospace;
  background: rgb(13 148 136 / 8%);
  border: 1px dashed #0d9488;
  border-radius: 20px;
  white-space: nowrap;
}

/* ===== 右栏配置面板 ===== */
.config-inspector {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  width: 400px;
  background: #fff;
  border-left: 1px solid #e2e7f0;
}

.inspector-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 14px;
  border-bottom: 1px solid #e2e7f0;
}

.inspector-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.inspector-icon {
  display: grid;
  width: 32px;
  height: 32px;
  color: #fff;
  font-size: 16px;
  border-radius: 8px;
  place-items: center;
}

.inspector-icon.idle {
  color: #fff;
  background: #94a3b8;
}

.inspector-t1 {
  font-weight: 600;
  font-size: 14px;
}

.inspector-t2 {
  margin-top: 1px;
  color: #8a94a8;
  font-size: 11px;
}

.inspector-body {
  flex: 1;
  padding: 16px 18px 20px;
  overflow-y: auto;
}

.config-section {
  margin-bottom: 22px;
}

.config-section-title {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 12px;
  color: #33415c;
  font-weight: 600;
  font-size: 12px;
}

.cs-idx {
  display: grid;
  width: 18px;
  height: 18px;
  color: #0d9488;
  font-size: 10px;
  font-family: 'IBM Plex Mono', monospace;
  background: rgb(13 148 136 / 8%);
  border-radius: 5px;
  place-items: center;
}

.field {
  margin-bottom: 12px;
}

.field label {
  display: block;
  margin-bottom: 5px;
  color: #33415c;
  font-size: 12px;
}

.req {
  margin-left: 2px;
  color: #e11d48;
}

.hint {
  margin-left: 6px;
  color: #8a94a8;
  font-size: 11px;
  font-weight: 400;
}

.mono-input :deep(textarea) {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
}

.macro-table {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.macro-head,
.macro-row {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1.2fr 0.6fr;
  gap: 4px;
  align-items: center;
  padding: 0 4px;
}

.macro-head {
  padding-bottom: 8px;
  color: #8a94a8;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.macro-row {
  padding: 8px 4px;
  font-size: 12px;
  border-top: 1px solid #e2e7f0;
}

.mono {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
}

.placeholder {
  color: #0d9488;
  font-size: 11px;
  font-family: 'IBM Plex Mono', monospace;
}

.row-add {
  padding: 4px 0;
  margin-top: 8px;
}

.mapping-hint {
  padding: 16px 0;
  color: #8a94a8;
  font-size: 12px;
}

/* ===== 底部状态栏 ===== */
.workbench-statusbar {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 18px;
  height: 34px;
  padding: 0 20px;
  color: #8a94a8;
  font-size: 11px;
  background: #fff;
  border-top: 1px solid #e2e7f0;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-item b {
  color: #33415c;
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 500;
}

.status-right {
  margin-left: auto;
}

.json-preview {
  max-height: 60vh;
  padding: 16px;
  margin: 0;
  overflow: auto;
  color: #a5f3fc;
  font-size: 12px;
  line-height: 1.6;
  background: #0f172a;
  border-radius: 8px;
}

.mt-5 {
  margin-top: 20px;
}
</style>
