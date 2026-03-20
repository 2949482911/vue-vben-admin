<template>
  <Select
    ref="selectRef"
    v-model:value="innerValue"
    :options="options"
    :loading="loading"
    show-search
    :filter-option="false"
    @search="handleSearch"
    @change="handleChange"
    @popupScroll="handlePopupScroll"
  >
    <template #dropdownRender="{ menuNode }">
      <div>
        <!-- 渲染默认的选项列表 -->
        <component :is="menuNode" />
        <!-- 加载更多时显示的 Spin -->
        <div v-if="loadingMore" class="load-more-spin" style="text-align: center; padding: 8px">
          <Spin size="small" :indicator="indicator"/>
        </div>
      </div>
    </template>
  </Select>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { Select, Spin } from 'ant-design-vue';
import { advertiserApi } from '#/api';    // 请根据实际路径修改
import {Platform} from '#/constants/enums';               // 请根据实际枚举修改
import { LoadingOutlined } from '@ant-design/icons-vue';
import { h } from 'vue';
const indicator = h(LoadingOutlined, {
  style: {
    fontSize: '24px',
  },
  spin: true,
});
// 手动防抖函数
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
  }) as T;
}

const props = defineProps<{
  value?: string;
  placeholder?: string;
  onSelect?: (value: string, option: any) => void;
}>();

const emit = defineEmits<{
  (e: 'update:value', val: string): void;
}>();

// 表单值
const innerValue = ref(props.value);
// 选项列表
const options = ref<any[]>([]);
// 加载状态（用于初始加载和搜索）
const loading = ref(false);
// 加载更多状态（用于分页加载时的 Spin）
const loadingMore = ref(false);
// 分页状态
const page = ref(1);
const pageSize = 20;
const hasMore = ref(true);
const keyword = ref('');

// 实际请求数据的函数（不控制 loading 状态）
const requestData = async (pageNum: number, keywordVal: string) => {
  const params = {
    page: pageNum,
    pageSize,
    platform: Platform.VIVO,
    keyword: keywordVal,
  };
  const res = await advertiserApi.fetchAdvertiserList(params);
  return res.items || [];
};

// 重置加载（首次或搜索时调用）
const loadDataReset = async () => {
  loading.value = true;
  try {
    const newItems = await requestData(1, keyword.value);
    options.value = newItems.map((item: any) => ({
      label: item.advertiserName,
      value: item.advertiserName,
      advertiserId: item.advertiserId,
    }));
    page.value = 1;
    hasMore.value = newItems.length === pageSize;
  } finally {
    loading.value = false;
  }
};

// 加载更多（滚动到底部时调用）
const loadMore = async () => {
  if (!hasMore.value || loading.value || loadingMore.value) return;
  loadingMore.value = true;
  try {
    const nextPage = page.value + 1;
    const newItems = await requestData(nextPage, keyword.value);
    if (newItems.length) {
      const newOptions = newItems.map((item: any) => ({
        label: item.advertiserName,
        value: item.advertiserName,
        advertiserId: item.advertiserId,
      }));
      options.value = [...options.value, ...newOptions];
      page.value = nextPage;
    }
    hasMore.value = newItems.length === pageSize;
  } finally {
    loadingMore.value = false;
  }
};

// 滚动加载（带防抖）
const handlePopupScroll = debounce((e: Event) => {
  const target = e.target as HTMLElement;
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 10) {
    loadMore();
  }
}, 200);

// 搜索处理
const handleSearch = (searchKeyword: string) => {
  keyword.value = searchKeyword;
  options.value = [];
  loadDataReset(); // 重置加载第一页
};

// 选中值变化
const handleChange = (val: string, option: any) => {
  innerValue.value = val;
  emit('update:value', val);
  if (props.onSelect) {
    props.onSelect(val, option);
  }
};

// 监听外部 value 变化
watch(() => props.value, (val) => {
  innerValue.value = val;
});

// 初始加载
onMounted(() => {
  loadDataReset();
});
</script>

<style scoped>
.load-more-spin {
  text-align: center;
  padding: 8px;
}
</style>
