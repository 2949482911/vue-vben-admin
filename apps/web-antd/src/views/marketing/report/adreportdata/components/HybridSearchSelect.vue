<!-- HybridSearchSelect.vue -->
<template>
  <Select
    :value="innerValue"
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
import { Select } from 'ant-design-vue';

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
  'remoteSearchError'
]);

// ========== 数据状态 ==========
// 关键修复：使用 ref 而不是 computed 来处理 v-model
const innerValue = ref(props.modelValue);
const localData = ref([]);
const searchResults = ref([]);
const isSearching = ref(false);
const isRemoteMode = ref(false);
const loading = ref(false);
const searchLoading = ref(false);
const currentKeyword = ref('');

// 防抖定时器
let searchTimer = null;

// ========== 计算属性 ==========
const displayOptions = computed(() => {
  if (!isSearching.value || !currentKeyword.value) {
    return localData.value;
  }
  
  if (searchResults.value.length > 0) {
    return searchResults.value;
  }
  
  return [];
});

const notFoundContent = computed(() => {
  if (searchLoading.value) {
    return '搜索中...';
  }
  
  if (isSearching.value && currentKeyword.value) {
    if (isRemoteMode.value && searchResults.value.length === 0) {
      return '未找到相关数据';
    }
    if (!isRemoteMode.value && searchResults.value.length === 0) {
      return '未找到匹配数据';
    }
  }
  
  if (localData.value.length === 0 && !searchLoading.value) {
    return '暂无数据';
  }
  
  return '暂无数据';
});

// ========== 工具函数 ==========
const debounce = (fn, delay) => {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

const formatLabel = (item) => {
  if (props.labelFormat && typeof props.labelFormat === 'function') {
    return props.labelFormat(item);
  }
  return item[props.labelField] || '';
};

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

const remoteSearch = async (keyword) => {
  if (!props.remoteApi && !props.initialApi) return;
  
  searchLoading.value = true;
  const api = props.remoteApi || props.initialApi;
  
  try {
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

const localSearch = (keyword) => {
  if (!keyword) return [];
  
  return localData.value.filter(item => {
    const searchText = item.label || '';
    return searchText.toLowerCase().includes(keyword.toLowerCase());
  });
};

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

const doSearch = async (keyword) => {
  currentKeyword.value = keyword;
  
  if (!keyword) {
    resetSearchState();
    return;
  }
  
  isSearching.value = true;
  
  if (keyword.length < props.remoteSearchMinLength) {
    searchResults.value = [];
    isRemoteMode.value = false;
    return;
  }
  
  const localResults = localSearch(keyword);
  
  if (localResults.length > 0) {
    searchResults.value = localResults;
    isRemoteMode.value = false;
  } else {
    searchResults.value = [];
    await remoteSearch(keyword);
  }
  
  emit('search', keyword);
};

const handleSearch = debounce(doSearch, props.searchDebounce);

// ========== 事件处理 ==========
const handleChange = (value) => {
  innerValue.value = value;
  emit('update:modelValue', value);
  emit('change', value);
  
  if (props.clearSearchOnSelect) {
    resetSearchState();
  }
};

const handleFocus = (e) => {
  emit('focus', e);
  
  if (props.clearSearchOnFocus) {
    resetSearchState();
  }
};

const handleBlur = (e) => {
  emit('blur', e);
};

const handleClear = () => {
  resetSearchState();
  emit('clear');
};

// ========== 监听器 ==========
// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== innerValue.value) {
    innerValue.value = newVal;
  }
});

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
    const emptyValue = props.mode === 'multiple' || props.mode === 'tags' ? [] : undefined;
    handleChange(emptyValue);
  },
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
