import { ref, reactive } from 'vue';

export function useClientPagination<T>(
  setLoading?: (loading: boolean) => void,
) {
  const allData = ref<T[]>([]);

  const pager = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0,
  });

  /** 设置全量数据（首次 / 搜索） */
  async function setData(data: T[]) {
    try {
      setLoading?.(true);
      allData.value = data;
      pager.total = data.length;
      pager.currentPage = 1;
      await sleep(200);
    } finally {
      setLoading?.(false);
    }
  }

  /** 获取当前页数据 */
  function getPageData() {
    const start = (pager.currentPage - 1) * pager.pageSize;
    const end = pager.currentPage * pager.pageSize;
    return allData.value.slice(start, end);
  }

  /** 分页变化（页码 / pageSize） */
  async function onPageChange(currentPage: number, pageSize: number) {
    try {
      setLoading?.(true);
      pager.currentPage = currentPage;
      pager.pageSize = pageSize;
      await sleep(300); // 模拟 loading，防止闪屏
    } finally {
      setLoading?.(false);
    }
  }

  return {
    allData,
    pager,
    setData,
    getPageData,
    onPageChange,
  };
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
