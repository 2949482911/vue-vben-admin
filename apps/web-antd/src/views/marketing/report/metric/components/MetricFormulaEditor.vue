<script lang="ts" setup>
import { ref, watch, onMounted, computed } from 'vue';
import { Button, Modal, Input, message } from 'ant-design-vue';
import { metricApi } from '#/api/core';
import type { MetricItem } from '#/api/models';

const props = defineProps<{
  value?: string;
  onConfirm?: (formula: string) => void;
}>();
const metricList = ref<MetricItem[]>([])
const editorRef = ref<HTMLDivElement>();
const selectorVisible = ref(false);
const selectedMetric = ref<MetricItem | null>(null);
const formula = ref<string>('');
// 记录待插入/替换的位置（用于插入指标时）
const pendingInsertPosition = ref<{ node: Node; offset: number } | null>(null);
// 记录鼠标最后一次点击在编辑器内的精确位置（通过 mousedown 事件 + caretRangeFromPoint），用于后续插入操作精准定位。
const lastClickPosition = ref<{ node: Node; offset: number } | null>(null);

// 搜索相关
const searchKeyword = ref<string>('');
const filteredMetricList = computed(() => {
  if (!searchKeyword.value.trim()) {
    return metricList.value;
  }
  const kw = searchKeyword.value.toLowerCase().trim();
  return metricList.value.filter(item => 
    item.cname.toLowerCase().includes(kw) || 
    item.ename.toLowerCase().includes(kw)
  );
});

const operators = ['+', '-', '*', '/', '(', ')'];
const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.'];
// 加载指标列表
const loadMetricList = async () => {
  const data = await metricApi.fetchMetric() as MetricItem[];
  metricList.value = data;
  // 如果已有公式，重新渲染以显示中文名
  if (props.value) {
    renderContent(props.value);
  }
};
// 渲染公式
const renderContent = (formula: string) => {
  if (!editorRef.value) return;
  const html = formula.replace(/\{([^}]+)\}/g, (match, ename) => {
    const metric = metricList.value.find(m => m.ename === ename);
    if (metric) {
      // 存在指标，渲染为输入框（显示中文名）
      return `<input type="text" class="metric-input" readonly data-metric="${ename}" value="${metric.cname}" />`;
    } else {
      // 不存在指标，作为普通文本（去掉花括号）
      return ename;
    }
  });
  editorRef.value.innerHTML = html;
};

watch(() => props.value, (val) => {
  if (val !== undefined && editorRef.value) {
    renderContent(val);
  }
}, { immediate: true });

// 当指标列表变化时，重新渲染（以便显示中文名）
watch(metricList, () => {
  if (props.value) {
    renderContent(props.value);
  }
});
// 将内容转为公式字符串，并触发 onConfirm
const updateFormulaFromContent = () => {
  if (!editorRef.value) return;
  const clone = editorRef.value.cloneNode(true) as HTMLElement;
  const inputs = clone.querySelectorAll('input.metric-input');
  inputs.forEach(input => {
    const ename = input.getAttribute('data-metric') || '';
    input.replaceWith(`{${ename}}`);
  });
  let result = '';
  clone.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'INPUT') {
      const ename = (node as HTMLElement).getAttribute('data-metric') || '';
      result += `{${ename}}`;
    } else {
      result += node.textContent || '';
    }
  });
  formula.value = result;
  // 触发 onConfirm 传递无花括号公式
  const rawFormula = result.replace(/[{}]/g, '');
  props.onConfirm?.(rawFormula);
};

// 鼠标在编辑器内按下时记录精确位置
const handleEditorMouseDown = (e: MouseEvent) => {
  if (!editorRef.value) return;
  const range = document.caretRangeFromPoint(e.clientX, e.clientY);
  if (range && editorRef.value.contains(range.startContainer)) {
    lastClickPosition.value = {
      node: range.startContainer,
      offset: range.startOffset,
    };
  } else {
    lastClickPosition.value = null;
  }
};

// 插入指标按钮
const handleInsertMetric = async () => {
  // 优先使用最后点击位置
  if (lastClickPosition.value) {
    const { node, offset } = lastClickPosition.value;
    if (document.body.contains(node)) {
      pendingInsertPosition.value = { node, offset };
    } else {
      pendingInsertPosition.value = null;
    }
  } else {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      if (editorRef.value && editorRef.value.contains(container) && container !== editorRef.value) {
        pendingInsertPosition.value = {
          node: container,
          offset: range.endOffset,
        };
      } else {
        pendingInsertPosition.value = null;
      }
    } else {
      pendingInsertPosition.value = null;
    }
  }

  const dataList = await metricApi.fetchMetric() as MetricItem[];
  metricList.value = dataList;
  searchKeyword.value = ''; // 清空搜索词
  selectorVisible.value = true;
};

// 点击已插入的指标输入框：修改该指标
const handleMetricClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (target.classList.contains('metric-input')) {
    pendingInsertPosition.value = { node: target, offset: 0 };
    setTimeout(() => {
      metricApi.fetchMetric().then((res: MetricItem[]) => {
        metricList.value = res;
        searchKeyword.value = ''; // 清空搜索词
        const current = metricList.value.find(
          (m: any) => m.ename === target.getAttribute('data-metric')
        );
        selectedMetric.value = current || null;
        selectorVisible.value = true;
      });
    }, 10);
  }
};

// 弹窗确认选择指标
const handleSelectMetric = () => {
  if (!selectedMetric.value) {
    message.warning('请选择一个指标');
    return;
  }

  if (pendingInsertPosition.value && pendingInsertPosition.value.node === editorRef.value) {
    pendingInsertPosition.value = null;
  }

  const ename = selectedMetric.value.ename;
  const cname = selectedMetric.value.cname;
  if (pendingInsertPosition.value) {
    const { node, offset } = pendingInsertPosition.value;
    const range = document.createRange();
    const sel = window.getSelection();

    if (node.nodeType === Node.TEXT_NODE && offset !== undefined) {
      const textNode = node as Text;
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'metric-input';
      input.readOnly = true;
      input.setAttribute('data-metric', ename);
      input.value = cname;

      range.setStart(textNode, offset);
      range.setEnd(textNode, offset);
      range.deleteContents();
      range.insertNode(input);
      range.setStartAfter(input);
      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const oldInput = node as HTMLElement;
      if (!oldInput.classList.contains('metric-input')) {
        console.warn('Unexpected element to replace, fallback to append');
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'metric-input';
        input.readOnly = true;
        input.setAttribute('data-metric', ename);
        input.value = cname;
        editorRef.value?.appendChild(input);
        editorRef.value?.appendChild(document.createTextNode(' '));
        selectorVisible.value = false;
        selectedMetric.value = null;
        pendingInsertPosition.value = null;
        updateFormulaFromContent();
        return;
      }

      const newInput = document.createElement('input');
      newInput.type = 'text';
      newInput.className = 'metric-input';
      newInput.readOnly = true;
      newInput.setAttribute('data-metric', ename);
      newInput.value = cname;

      oldInput.parentNode?.replaceChild(newInput, oldInput);
      range.setStartAfter(newInput);
      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  } else {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'metric-input';
    input.readOnly = true;
    input.setAttribute('data-metric', ename);
    input.value = cname;
    editorRef.value?.appendChild(input);
    editorRef.value?.appendChild(document.createTextNode(' '));
  }

  selectorVisible.value = false;
  selectedMetric.value = null;
  pendingInsertPosition.value = null;
  updateFormulaFromContent();
};

// 失去焦点时更新
const handleBlur = () => {
  updateFormulaFromContent();
};

// 插入运算符或数字
const insertOperator = (operator: string) => {
  if (!editorRef.value) return;

  let range: Range | null = null;
  let selection = window.getSelection();

  if (lastClickPosition.value) {
    const { node, offset } = lastClickPosition.value;
    if (document.body.contains(node)) {
      range = document.createRange();
      range.setStart(node, offset);
      range.collapse(true);
    }
  }

  if (!range) {
    if (selection && selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
      if (!editorRef.value.contains(range.commonAncestorContainer)) {
        range = null;
      }
    }
  }

  if (!range) {
    const textNode = document.createTextNode(operator);
    editorRef.value.appendChild(textNode);
    const newRange = document.createRange();
    newRange.setStartAfter(textNode);
    newRange.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(newRange);
    updateFormulaFromContent();
    return;
  }

  range.deleteContents();
  const textNode = document.createTextNode(operator);
  range.insertNode(textNode);
  range.setStartAfter(textNode);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  lastClickPosition.value = null;
  updateFormulaFromContent();
};

const clearFormula = () => {
  if (editorRef.value) {
    editorRef.value.innerHTML = '';
    updateFormulaFromContent();
  }
};

onMounted(() => {
  loadMetricList()
  editorRef.value?.addEventListener('click', handleMetricClick);
  editorRef.value?.addEventListener('mousedown', handleEditorMouseDown);
});
</script>

<template>
  <div class="metric-formula-editor">
    <div
      ref="editorRef"
      class="editor-content"
      contenteditable="true"
      @blur="handleBlur"
      @focus="handleFocus"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    ></div>
    <div class="editor-toolbar" ref="editorToolbarRef">
      <div class="editor-toolbar-left">
        <div
          class="editor-toolbar-left-item"
          v-for="digit in digits"
          :key="digit"
          @click="insertOperator(digit)"
        >
          {{ digit }}
        </div>
      </div>
      <div class="editor-toolbar-center">
        <div
          class="editor-toolbar-center-item"
          v-for="op in operators"
          :key="op"
          @click="insertOperator(op)"
        >
          {{ op }}
        </div>
      </div>
      <div class="editor-toolbar-right">
        <Button type="link" class="insertMetric flex items-center" @click="handleInsertMetric">
          <template #icon><span class="icon-[mdi--plus] w-5 h-5"></span></template>
          插入指标
        </Button>
        <Button type="link" class="clearMetric flex items-center" @click="clearFormula">
          <template #icon><span class="icon-[mdi--trash-can-outline] w-5 h-5"></span></template>
          清空
        </Button>
      </div>
    </div>

    <!-- 指标选择弹窗（含搜索功能） -->
    <Modal
      v-model:visible="selectorVisible"
      title="选择指标"
      @ok="handleSelectMetric"
      @cancel="selectorVisible = false; selectedMetric = null; pendingInsertPosition = null"
    >
      <Input.Search
        v-model:value="searchKeyword"
        placeholder="搜索指标"
        style="margin-bottom: 16px;"
        allowClear
      />
      <div style="max-height: 400px; overflow-y: auto;">
        <div
          v-for="item in filteredMetricList"
          :key="item.ename"
          class="metric-item"
          :class="{ active: selectedMetric?.ename === item.ename }"
          @click="selectedMetric = item"
        >
          {{ item.cname }} ({{ item.ename }})
        </div>
      </div>
    </Modal>
  </div>
</template>

<style lang="scss">
/* 全局样式，确保动态插入的指标输入框样式始终生效 */
.metric-input {
  padding: 0 6px;
  font-size: 14px;
  display: inline-block;
  min-width: 40px;
  height: 28px;
  line-height: 26px;
  white-space: nowrap;
  vertical-align: top;
  background-color: #f0f2f5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.5s;
  color: #42546d;
  text-align: center;
  border: 1px solid transparent;
}

.metric-input:hover,
.metric-input:focus,
.metric-input:active {
  background-color: #e6f7ff;
  border: 1px solid hsl(var(--primary));
  height: 28px;
  line-height: 26px;
}
</style>

<style lang="scss" scoped>
.metric-formula-editor {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 4px;
  position: relative;

  .editor-toolbar {
    display: flex;
    justify-content: space-around;
    border: 1px solid #d9d9d9;
    border-top: none;
    border-radius: 0 0 4px 4px;
    padding: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    width: 100%;

    &-left,
    &-center {
      display: grid;
      grid-template-columns: repeat(3, 35px);
      column-gap: 10px;
      row-gap: 10px;
      &-item {
        width: 28px;
        height: 28px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        cursor: pointer;
        border-radius: 2px;
        transition: background-color 0.2s;

        &:hover {
          background-color: #ddd;
        }
      }
    }

    &-center {
      display: grid;
      grid-template-columns: repeat(2, 35px);
    }

    &-right {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      gap: 10px;
      
      .insertMetric {
        color: hsl(var(--primary));
        cursor: pointer;
        transition: color 0.2s;
        font-size: 14px;
        &:hover {
          color: hsl(var(--primary) / 0.8);
        }
      }

      .clearMetric {
        color: red;
        cursor: pointer;
        transition: color 0.2s;
        font-size: 14px;
        &:hover {
          color: rgba(255, 0, 0, 0.8);
        }
      }
    }
  }

  .editor-content {
    min-height: 100px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    padding: 4px 8px;
    outline: none;
    cursor: text;
    white-space: pre-wrap;
  }
}

.metric-item {
  padding: 8px 12px;
  cursor: pointer;

  &:hover {
    background-color: hsl(var(--primary)/15%);
    border: 1px solid hsl(var(--primary)/15%);
  }

  &.active {
    background-color: hsl(var(--primary)/15%);
    border: 1px solid hsl(var(--primary)/15%);
  }
}
</style>
