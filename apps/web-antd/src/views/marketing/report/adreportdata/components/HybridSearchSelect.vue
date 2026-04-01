<!-- HybridSearchSelect.vue -->
<template>
  <Select
    v-model:value="innerValue"
    :mode="mode"
    :placeholder="placeholder"
    :allow-clear="allowClear"
    :disabled="disabled"
    :loading="loading"
    :show-search="true"
    :filter-option="false"
    :not-found-content="notFoundContent"
    :options="displayOptions"
    :class="className"
    :style="style"
    :size="size"
    :max-tag-count="maxTagCount"
    :max-tag-placeholder="maxTagPlaceholder"
    :dropdown-match-select-width="dropdownMatchSelectWidth"
    @search="handleSearch"
    @change="handleChange"
    @focus="handleFocus"
    @blur="handleBlur"
    @clear="handleClear"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Select } from 'ant-design-vue'
const props = defineProps({
  // v-model 值
  modelValue: {
    type: [String, Number, Array],
    default: undefined,
  },
  // 选择模式：'multiple' | 'tags' | undefined
  mode: {
    type: String,
    default: undefined,
  },
  // 占位符
  placeholder: {
    type: String,
    default: '请选择',
  },
  // 是否允许清空
  allowClear: {
    type: Boolean,
    default: true,
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false,
  },
  // 组件大小：'large' | 'default' | 'small'
  size: {
    type: String,
    default: 'default',
  },
  // 自定义类名
  className: {
    type: String,
    default: '',
  },
  // 自定义样式
  style: {
    type: Object,
    default: () => ({}),
  },
  // 最多显示标签数量
  maxTagCount: {
    type: Number,
    default: undefined,
  },
  // 超过最大标签时的占位符
  maxTagPlaceholder: {
    type: [String, Function],
    default: undefined,
  },
  // 下拉菜单是否与选择器同宽
  dropdownMatchSelectWidth: {
    type: Boolean,
    default: true,
  },
  
  // ========== 数据相关 ==========
  // 初始加载的 API（获取所有本地数据）
  initialApi: {
    type: Function,
    required: true,
  },
  // 远程搜索的 API（可选，如果不传则使用 initialApi）
  remoteApi: {
    type: Function,
    default: null,
  },
  // 远程搜索参数配置
  remoteSearchParams: {
    type: Object,
    default: () => ({}),
  },
  // 远程搜索字段名（传给后端的搜索字段）
  remoteSearchField: {
    type: String,
    default: 'keyword',
  },
  // 本地搜索字段（用于前端过滤）
  localSearchField: {
    type: String,
    default: 'label',
  },
  // 选项的 value 字段名
  valueField: {
    type: String,
    default: 'value',
  },
  // 选项的 label 字段名
  labelField: {
    type: String,
    default: 'label',
  },
  // 自定义 label 格式化函数
  labelFormat: {
    type: Function,
    default: null,
  },
  // API 返回的数据字段路径
  resultField: {
    type: String,
    default: '',
  },
  // 是否自动加载初始数据
  autoLoad: {
    type: Boolean,
    default: true,
  },
  // 搜索防抖延迟（毫秒）
  searchDebounce: {
    type: Number,
    default: 300,
  },
  // 远程搜索最小触发长度
  remoteSearchMinLength: {
    type: Number,
    default: 1,
  },
  // 是否在选中后清空搜索状态
  clearSearchOnSelect: {
    type: Boolean,
    default: true,
  },
  // 是否在获得焦点时清空搜索状态
  clearSearchOnFocus: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'update:modelValue',
  'change',
  'search',
  'focus',
  'blur',
  'clear',
  'loadSuccess',
  'loadError',
  'remoteSearchSuccess',
  'remoteSearchError',
]);

// ========== 数据状态 ==========
const innerValue = ref(props.modelValue);
const localData = ref([]);           // 本地完整数据
const searchResults = ref([]);       // 搜索结果（本地过滤或远程）
const isSearching = ref(false);      // 是否正在搜索状态（有搜索关键词）
const isRemoteMode = ref(false);     // 是否处于远程搜索模式
const loading = ref(false);          // 加载状态
const searchLoading = ref(false);    // 搜索加载状态
const currentKeyword = ref('');      // 当前搜索关键词

// 防抖定时器
let searchTimer = null;

// ========== 计算属性 ==========
// 显示的选项
const displayOptions = computed(() => {
  // 如果没有搜索关键词，显示全部本地数据
  if (!isSearching.value || !currentKeyword.value) {
    return localData.value;
  }
  
  // 有搜索关键词
  // 如果是远程搜索模式或本地搜索结果，显示搜索结果
  if (searchResults.value.length > 0) {
    return searchResults.value;
  }
  
  // 有搜索关键词但搜索结果为空，返回空数组（显示 notFoundContent）
  return [];
});

// 空状态提示
const notFoundContent = computed(() => {
  // 搜索加载中
  if (searchLoading.value) {
    return '搜索中...';
  }
  
  // 有搜索关键词且正在搜索状态
  if (isSearching.value && currentKeyword.value) {
    // 如果是远程搜索模式且结果为空
    if (isRemoteMode.value && searchResults.value.length === 0) {
      return '未找到相关数据';
    }
    // 如果是本地搜索且结果为空
    if (!isRemoteMode.value && searchResults.value.length === 0) {
      return '未找到匹配数据';
    }
  }
  
  // 无数据时的默认提示
  if (localData.value.length === 0 && !searchLoading.value) {
    return '暂无数据';
  }
  
  return '暂无数据';
});

// ========== 工具函数 ==========
// 简单的防抖函数
const debounce = (fn, delay) => {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

// 格式化单个选项的 label
const formatLabel = (item) => {
  if (props.labelFormat && typeof props.labelFormat === 'function') {
    return props.labelFormat(item);
  }
  return item[props.labelField] || '';
};

// 格式化选项数据
const formatOptions = (data) => {
  let items = [];
  
  if (props.resultField) {
    items = data[props.resultField] || [];
  } else {
    items = Array.isArray(data) ? data : [];
  }
  
  return items.map(item => ({
    ...item,
    value: item[props.valueField],
    label: formatLabel(item),
  }));
};

// ========== 数据加载 ==========
// 加载初始本地数据
const loadInitialData = async () => {
  if (!props.initialApi) return;
  
  loading.value = true;
  try {
    const res = await props.initialApi();
    localData.value = formatOptions(res);
    emit('loadSuccess', localData.value);
  } catch (error) {
    console.error('加载初始数据失败:', error);
    localData.value = [];
    emit('loadError', error);
  } finally {
    loading.value = false;
  }
};

// 远程搜索
const remoteSearch = async (keyword) => {
  if (!props.remoteApi && !props.initialApi) return;
  
  searchLoading.value = true;
  const api = props.remoteApi || props.initialApi;
  
  try {
    // 构建搜索参数
    const searchParams = {
      ...props.remoteSearchParams,
      [props.remoteSearchField]: keyword,
    };
    
    const res = await api(searchParams);
    const formattedData = formatOptions(res);
    searchResults.value = formattedData;
    isRemoteMode.value = true;
    
    emit('remoteSearchSuccess', { keyword, data: formattedData });
  } catch (error) {
    console.error('远程搜索失败:', error);
    searchResults.value = [];
    emit('remoteSearchError', error);
  } finally {
    searchLoading.value = false;
  }
};

// 本地搜索（使用格式化后的 label）
const localSearch = (keyword) => {
  if (!keyword) return [];
  
  return localData.value.filter(item => {
    const searchText = item.label || '';
    return searchText.toLowerCase().includes(keyword.toLowerCase());
  });
};

// 重置搜索状态（清空搜索结果，退出搜索模式）
const resetSearchState = () => {
  isSearching.value = false;
  isRemoteMode.value = false;
  searchResults.value = [];
  currentKeyword.value = '';
  searchLoading.value = false;
  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }
};

// 处理搜索（核心逻辑）
const doSearch = async (keyword) => {
  console.log('[HybridSearch] 搜索:', keyword);
  currentKeyword.value = keyword;
  
  // 如果关键词为空，重置搜索状态（显示全部数据）
  if (!keyword) {
    resetSearchState();
    return;
  }
  
  // 进入搜索状态
  isSearching.value = true;
  
  // 检查远程搜索最小触发长度
  if (keyword.length < props.remoteSearchMinLength) {
    // 关键词太短，不进行搜索，但保持搜索状态
    searchResults.value = [];
    isRemoteMode.value = false;
    return;
  }
  
  // 1. 先进行本地搜索
  const localResults = localSearch(keyword);
  console.log('[HybridSearch] 本地搜索结果数量:', localResults.length);
  
  if (localResults.length > 0) {
    // 本地有结果，使用本地搜索结果
    searchResults.value = localResults;
    isRemoteMode.value = false;
    console.log('[HybridSearch] 使用本地搜索结果');
  } else {
    // 本地无结果，触发远程搜索
    console.log('[HybridSearch] 本地无结果，触发远程搜索');
    // 清空本地搜索结果，准备远程搜索
    searchResults.value = [];
    await remoteSearch(keyword);
  }
  
  emit('search', keyword);
};

// 使用防抖包装的搜索函数
const handleSearch = debounce(doSearch, props.searchDebounce);

// ========== 事件处理 ==========
// 处理值变化
const handleChange = (value) => {
  console.log('[HybridSearch] 选中值:', value);
  innerValue.value = value;
  emit('update:modelValue', value);
  emit('change', value);
  
  // 选中后清空搜索状态（显示全部数据）
  if (props.clearSearchOnSelect) {
    resetSearchState();
  }
};

// 处理获得焦点
const handleFocus = (e) => {
  emit('focus', e);
  
  // 获得焦点时清空搜索状态（显示全部数据）
  if (props.clearSearchOnFocus) {
    resetSearchState();
  }
};

// 处理失去焦点
const handleBlur = (e) => {
  emit('blur', e);
};

// 处理清空
const handleClear = () => {
  console.log('[HybridSearch] 清空');
  resetSearchState();
  emit('clear');
};

// ========== 暴露方法 ==========
defineExpose({
  refresh: loadInitialData,
  resetSearch: resetSearchState,
  getLocalData: () => localData.value,
  setLocalData: (data) => {
    localData.value = formatOptions(data);
  },
  search: (keyword) => doSearch(keyword),
  clear: () => {
    innerValue.value = props.mode === 'multiple' ? [] : undefined;
    handleChange(innerValue.value);
  },
});

// ========== 监听器 ==========
watch(() => props.modelValue, (newVal) => {
  if (newVal !== innerValue.value) {
    innerValue.value = newVal;
  }
});

// ========== 生命周期 ==========
onMounted(() => {
  if (props.autoLoad) {
    loadInitialData();
  }
});

onUnmounted(() => {
  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }
});
</script>
