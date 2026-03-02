<script lang="ts" setup>
import { computed, ref, watch, type PropType } from 'vue';
import { Tree, Input, Card } from 'ant-design-vue';

type Key = string | number;

const props = defineProps({
  // 选中的值 (v-model)
  value: {
    type: Array as PropType<number[]>,
    default: () => []
  },
  // 完整的树形数据源
  treeData: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  // 搜索框提示词
  placeholder: {
    type: String,
    default: '搜索...'
  },
  // 树形结构的字段映射
  fieldNames: {
    type: Object as PropType<{ children: string; title: string; key: string }>,
    default: () => ({ children: 'childBaseTag', title: 'tagName', key: 'tagId' })
  }
});

const emit = defineEmits(['update:value', 'change']);

const checkedKeys = ref<Key[]>([]);
const expandedKeys = ref<Key[]>([]);
const searchValue = ref('');

/**
 * 核心逻辑：处理勾选状态（保留“真全选”逻辑）
 */
const handleCheck = (checked: any) => {
  const { children, key: keyField } = props.fieldNames;
  const currentCheckedKeys = (checked.checked || checked) as number[];

  // 1. 过滤逻辑：判断哪些节点是“真全选”
  const currentFilteredIds = currentCheckedKeys.filter((key: number) => {
    const node = findNodeById(props.treeData, key);
    const parentId = findParentId(props.treeData, key);

    // 如果是叶子节点
    if (!node?.[children] || node[children].length === 0) {
      if (parentId && currentCheckedKeys.includes(parentId)) {
        const parentNode = findNodeById(props.treeData, parentId);
        const isParentRealAllSelected = parentNode?.[children]?.every((child: any) => 
          currentCheckedKeys.includes(child[keyField])
        );
        return !isParentRealAllSelected;
      }
      return true;
    }

    // 如果是父节点，只有全选才保留
    return node[children].every((child: any) => currentCheckedKeys.includes(child[keyField]));
  });

  // 2. 跨搜索结果合并逻辑
  const currentViewVisibleIds: number[] = [];
  const traverse = (data: any[]) => {
    data.forEach(item => {
      currentViewVisibleIds.push(item[keyField]);
      if (item[children]) traverse(item[children]);
    });
  };
  traverse(filteredTreeData.value);

  const outOfViewIds = (props.value || []).filter(id => !currentViewVisibleIds.includes(id));
  const finalIds = Array.from(new Set([...outOfViewIds, ...currentFilteredIds]));

  emit('update:value', finalIds);
  emit('change', finalIds);
};

/**
 * 搜索过滤逻辑
 */
const filteredTreeData = computed(() => {
  const keyword = searchValue.value.trim();
  const { children, title } = props.fieldNames;
  if (!keyword) return props.treeData;

  const filter = (data: any[]): any[] => {
    return data.map((item) => {
      const isSelfMatch = item[title].includes(keyword);
      const childList = item[children] ? filter(item[children]) : [];

      if (isSelfMatch) return { ...item, [children]: item[children] }; 
      if (childList.length > 0) return { ...item, [children]: childList };
      return null;
    }).filter(Boolean) as any[];
  };
  return filter(props.treeData);
});

/**
 * 辅助工具函数
 */
const findNodeById = (data: any[], id: number): any => {
  const { children, key } = props.fieldNames;
  for (const item of data) {
    if (item[key] === id) return item;
    if (item[children]) {
      const res = findNodeById(item[children], id);
      if (res) return res;
    }
  }
};

const findParentId = (data: any[], id: number, pId: number | null = null): number | null => {
  const { children, key } = props.fieldNames;
  for (const item of data) {
    if (item[key] === id) return pId;
    if (item[children]) {
      const found = findParentId(item[children], id, item[key]);
      if (found !== null) return found;
    }
  }
  return null;
};

/**
 * 监听器
 */
watch(searchValue, (val) => {
  if (!val) return;
  const { children, title, key: keyField } = props.fieldNames;
  const keys: Key[] = [];
  const collect = (data: any[]) => {
    data.forEach(item => {
      if (item[title].includes(val) || item[children]?.some((c: any) => c[title].includes(val))) {
        keys.push(item[keyField]);
      }
      if (item[children]) collect(item[children]);
    });
  };
  collect(filteredTreeData.value);
  expandedKeys.value = [...new Set(keys)];
});

watch(() => props.value, (newVal) => {
  checkedKeys.value = newVal ? [...newVal] : [];
}, { immediate: true, deep: true });

</script>

<template>
  <div class="tree-selector-container">
    <Card size="small" :body-style="{ padding: '8px' }" class="border-blue-100 shadow-sm mt-2">
      <Input.Search
        v-model:value="searchValue"
        :placeholder="placeholder"
        class="mb-2"
        allow-clear
      />
      <div class="tree-wrapper">
        <Tree
          v-model:checkedKeys="checkedKeys"
          v-model:expandedKeys="expandedKeys"
          :tree-data="filteredTreeData"
          :field-names="fieldNames"
          :height="300"
          :block-node="true"
          checkable
          :checkStrictly="false"
          @check="handleCheck"
        />
      </div>
    </Card>
  </div>
</template>

<style scoped>
.tree-wrapper {
  overflow-y: auto;
}

:deep(.ant-tree-title) {
  width: 100%;
}
</style>
