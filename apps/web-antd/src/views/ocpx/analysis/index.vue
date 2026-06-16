<script setup lang="ts">
import { ocpxTaskApi } from "#/api";
import { computed, onMounted, ref } from "vue";
import type { ReportAnalysisOcpxRequest, ReportAnalysisOcpxResponse } from "#/api/models";
import { Button, Card, Col, RangePicker, Row, Select, Space, Statistic } from "ant-design-vue";
import dayjs from "dayjs";
import { useVbenVxeGrid, type VxeGridProps } from "#/adapter/vxe-table";
import {$t} from '@vben/locales';
import { PLATFORM } from "#/constants/locales";
import { Loading, Page } from '@vben/common-ui';
const allData = ref<any>([]); // 全部数据
const tableColumns = ref<any[]>([]); // 表头
const footerData = ref<any>({}); // 表尾汇总


// 表格配置
const gridOptions: VxeGridProps = {
  border: true,
  showFooter: true,
  toolbarConfig: {
    custom: true,
    export: true,
    refresh: true,
    zoom: true
  },
  columns: [],
  data: [],
  footerData: [],
  height: "auto",
  keepSource: true,
  pagerConfig: {
    enabled: true,
    pageSize: 100,
    pageSizes: [100, 200, 500, 1000]
  },
  exportConfig: {
    filename: '',
    types: ['csv', 'xlsx'],
    modes: ['all'],
    original: true,
  },
  scrollX: { enabled: true, gt: 10 },
  scrollY: { enabled: true, gt: 10 },
  rowConfig: {
    isHover: false,
    useKey: true,
    keyField: 'seq',
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

// 任务类型
const taskType = [
  {
    label: "cps",
    value: "cps"
  },
  {
    label: "cpc",
    value: "cpc"
  },
  {
    label: "cpa",
    value: "cpa"
  }
]

// 时间范围 默认七天内
const dateRange = ref<[string, string]>([
  dayjs().subtract(30, "day").format("YYYY-MM-DD"),
  dayjs().format("YYYY-MM-DD")
]);

// 维度选项
const dimensionOptions = [
  { label: "平台", value: "platform" },
  { label: "推广活动", value: "ocpx_task_id" },
  { label: "日期", value: "day" }
];

// 请求数据
const ocpxAnalysisRequest = ref<ReportAnalysisOcpxRequest>({
  dateList: dateRange.value,
  dimensions: ["platform"],
  platforms: [],
  taskType: []
});

// 响应数据
const ocpxAnalysisResponse = ref<ReportAnalysisOcpxResponse>({
  items: [],
  total: [],
  columns: [],
  totalAmount: 0,
  totalEventCnt: 0,
  assessmentAmount: 0,
  cname: new Map<string, string>(),
});


// 加载状态
const loading = ref(false);

// 计算汇总数据
const summaryData = computed(() => {
  const total = ocpxAnalysisResponse.value.total;
  if (!total || total.length === 0) {
    return {
      totalClickCount: 0,
      totalExposureCount: 0,
      totalAmount: 0,
      totalEventCnt: 0,
      assessmentAmount: 0,
    };
  }

  // total 是一个数组，取第一个元素
  const totalItem = total[0] as any;
  return {
    totalClickCount: totalItem[ocpxAnalysisResponse.value.cname['click_cnt']] || 0,
    totalExposureCount: totalItem[ocpxAnalysisResponse.value.cname['show_cnt']] || 0,
    totalAmount: ocpxAnalysisResponse.value.totalAmount || 0,
    totalEventCnt: ocpxAnalysisResponse.value.totalEventCnt || 0,
    assessmentAmount: ocpxAnalysisResponse.value.assessmentAmount || 0
  };
});

// 计算完成比
const completionRate = computed(() => {
  const { totalAmount, assessmentAmount } = summaryData.value;
  if (!assessmentAmount || assessmentAmount === 0) {
    return '0.00';
  }
  const rate = (totalAmount / assessmentAmount) * 100;
  return rate.toFixed(2);
});


// 时间范围变化
function handleDateRangeChange(dates: any) {
  if (dates && dates.length === 2) {
    dateRange.value = [dates[0].format("YYYY-MM-DD"), dates[1].format("YYYY-MM-DD")];
  }
}

// 更新表格结构
function updateTableStructure(columns: string[], footData: any) {
  const newColumns: any[] = [
    { title: "序号", field: "_seq", width: 80, fixed: "left" }
  ];
  // 按照返回的列顺序生成列配置
  columns.forEach((colName) => {
    let fixed: string = ''
    if (colName == "媒体"
      || colName == "任务"
      || colName == "日期"
      || colName == "推广活动"
    ) {
      fixed = 'left'
    }
    newColumns.push({
      title: colName,
      field: colName,
      width: "auto",
      sortable: true,
      showOverflow: true,
      fixed: fixed
    });
  });

  tableColumns.value = newColumns;

  // 更新表尾
  footerData.value = { _seq: "合计：", ...footData };

  gridApi.setGridOptions({
    columns: newColumns,
    footerData: [footerData.value]
  });
}

// 查询数据
async function handleSearch() {
  loading.value = true;
  try {
    // 构建请求参数
    const params: ReportAnalysisOcpxRequest = {
      dateList: dateRange.value,
      dimensions: ocpxAnalysisRequest.value.dimensions,
      platforms: ocpxAnalysisRequest.value.platforms,
      taskType: ocpxAnalysisRequest.value.taskType
    };
    ocpxAnalysisResponse.value = await ocpxTaskApi.fetchOcpxDataAnalysis(params);

    // 处理数据，添加序号
    const items = (ocpxAnalysisResponse.value.items || []).map((item: any, index: number) => ({
      ...item,
      _seq: index + 1
    }));
    allData.value = items;

    // 更新表格结构
    updateTableStructure(ocpxAnalysisResponse.value.columns || [], ocpxAnalysisResponse.value.total?.[0] || {});

    // 设置表格数据
    gridApi.setGridOptions({
      data: items
    });
  } finally {
    loading.value = false;
  }
}

// 重置筛选条件
function handleReset() {
  dateRange.value = [
    dayjs().subtract(7, "day").format("YYYY-MM-DD"),
    dayjs().format("YYYY-MM-DD")
  ];
  ocpxAnalysisRequest.value = {
    dateList: dateRange.value,
    dimensions: ["platform"],
    platforms: [],
    taskType: []
  };
  handleSearch();
}


onMounted(() => {
  handleSearch();
});
</script>

<template>
  <Page>
    <Loading  :spinning="loading">
      <Space direction="vertical" :size="16" class="w-full">
        <!-- 第一块：筛选条件 -->
        <Card>
          <Space :size="16" wrap>
            <!-- 时间筛选 -->
            <Space align="center">
              <span>{{$t('ocpx.analytics.dateRange')}}：</span>
              <RangePicker
                :value="[dayjs(dateRange[0]), dayjs(dateRange[1])]"
                @change="handleDateRangeChange"
                :placeholder="['开始日期', '结束日期']"
              />
            </Space>

            <!-- 维度多选 -->
            <Space align="center">
              <span>{{$t('ocpx.analytics.dims')}}：</span>
              <Select
                v-model:value="ocpxAnalysisRequest.dimensions"
                mode="multiple"
                :options="dimensionOptions"
                :default-value="['platform']"
                style="min-width: 200px"
                allow-clear
              />
            </Space>

            <!-- 平台筛选 -->
            <Space align="center">
              <span>{{$t('ocpx.platform.title')}}：</span>
              <Select
                v-model:value="ocpxAnalysisRequest.platforms"
                mode="multiple"
                :options="PLATFORM"
                style="min-width: 200px"
                allow-clear
              />
            </Space>


            <Space align="center">
              <span>{{$t('ocpx.ocpx_task.columns.taskType')}}：</span>
              <Select
                v-model:value="ocpxAnalysisRequest.taskType"
                mode="multiple"
                :options="taskType"
                style="min-width: 200px"
                allow-clear
              />
            </Space>

            <!-- 操作按钮 -->
            <Button type="primary" @click="handleSearch" :loading="loading">{{ $t('common.search') }}</Button>
            <Button @click="handleReset">{{ $t('common.reset') }}</Button>
          </Space>
        </Card>

        <!-- 第二块：指标卡片 -->
        <Card>
          <Row :gutter="16">
            <Col :span="6">
              <Card>
                <Statistic
                  :title="$t('ocpx.analytics.totalClick')"
                  :value="summaryData.totalClickCount"
                  :value-style="{ color: '#3f8600' }"
                />
              </Card>
            </Col>
            <Col :span="6">
              <Card>
                <Statistic
                  :title="$t('ocpx.analytics.totalExposureCount')"
                  :value="summaryData.totalExposureCount"
                  :value-style="{ color: '#1890ff' }"
                />
              </Card>
            </Col>
            <Col :span="6">
              <Card>
                <div class="flex justify-between items-center h-full">
                  <div class="flex flex-col gap-2">
                    <Statistic
                      :title="$t('ocpx.analytics.totalAmount')"
                      :value="summaryData.totalAmount"
                      :precision="2"
                      prefix="¥"
                    />
                    <Statistic
                      :title="$t('ocpx.analytics.assessmentAmount')"
                      :value="summaryData.assessmentAmount"
                      :precision="2"
                      prefix="¥"
                    />
                  </div>
                  <div class="text-center">
                    <div class="text-gray-500 text-sm mb-1">完成比</div>
                    <div class="text-3xl font-bold" :style="{ color: completionRate >= 100 ? '#3f8600' : '#cf1322' }">
                      {{ completionRate }}%
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col :span="6">
              <Card>
                <Statistic
                  :title="$t('ocpx.analytics.totalEventCnt')"
                  :value="summaryData.totalEventCnt"
                  :value-style="{ color: '#722ed1' }"
                />
              </Card>
            </Col>
          </Row>
        </Card>

        <!-- 第三块：数据表格 -->
        <Card>
          <Grid></Grid>
        </Card>
      </Space>
    </Loading>
  </Page>
</template>

<style scoped lang="scss">
.w-full {
  width: 100%;
}
</style>
