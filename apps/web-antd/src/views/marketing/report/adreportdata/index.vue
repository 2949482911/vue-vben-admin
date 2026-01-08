<script setup lang="ts" name="AdReportDataManager">
import { ref, reactive, computed, onMounted } from "vue";
import { useVbenVxeGrid, type VxeGridProps } from "#/adapter/vxe-table";
import { Page, useVbenDrawer, useVbenModal, type VbenFormProps } from "@vben/common-ui";
import { ACTIVE_PLATFORM, DIMS } from "#/constants/locales";
import { $t } from "@vben/locales";
import { Button } from "ant-design-vue";
import SelectMetricModal from "./selectmetric.vue";
import type { AdReportRequest, AdvertiserPageRequest, ReportFilter, searchDataFilter } from "#/api/models";
import {advertiserApi, reportApi,projectApi} from "#/api";
import type { ProjectItem } from "../../account/advertiser/advertiser";
import SaveTemplateModal from "./saveTemplate.vue";
import TemplateListDrawer from './templateList.vue';
import dayjs from 'dayjs';

/* ---------------- 模板抽屉 ---------------- */
// 模板列表抽屉弹框
const [TemplateDrawer, drawerApi] = useVbenDrawer({
  // 连接抽离的组件
  connectedComponent: TemplateListDrawer,
});
//模板列表抽屉打开
function openTemplateListModalModal(){
  drawerApi.open();
}

//用来保存使用模板回显的指标数据，传过去指标模板回显
const templateQueryMetric = ref<Record<string, any>>({})

//子传父的数据模板回显事件
async function handleUseTemplate(template: searchDataFilter) {
  templateQueryMetric.value = template
  await gridApi.formApi.resetForm();
  await gridApi.formApi.setValues(template)
  searchData.value = await gridApi.formApi.getValues() as unknown as searchDataFilter;
  await init(searchData.value)

}

/* ---------------- 指标弹窗 ---------------- */
const [SelectMetricModalModal, selectMetricModalApi] = useVbenModal({
  connectedComponent: SelectMetricModal,
});
async function openPlatformMetricMapDetailModal() {
  selectMetricModalApi.open();
}

/* ---------------- 保存模板弹窗 ---------------- */

//搜索的数据传给子组件用来保存模板
const searchData = ref<searchDataFilter>({
  advertiserId: [],
  dims: [],
  platform: [],
  projectId: '',
  queryMetric: [],
  dateTimeRange: ['',''],
})
const [SaveTemplateModalModal, sveTemplateModalApi] = useVbenModal({
  connectedComponent: SaveTemplateModal,
});
async function openSaveTemplateModalModal() {
  searchData.value = await gridApi.formApi.getValues() as unknown as searchDataFilter;
  sveTemplateModalApi.open();
}
//保存模板成功子组件通知父组件重新刷新form表单
async function handleTemplateSaved() {
  await gridApi.formApi.resetForm();
  templateQueryMetric.value.queryMetric = []
}


/* ---------------- 本地分页核心状态 ---------------- */
//第一步：把proxyConfig设置成空，不然proxyConfig每次分页都会请求后台数据，影响前端分页
const allData = ref<any[]>([]); // 接口返回的全部数据
const pager = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

/* ---------------- 初始化：只请求一次 ---------------- */
//第二步：请求数据，拿到全部数据，根据当前页面条数，截取好第一页展示的数据
async function init(args?:any) {
  try {
    gridApi.setLoading(true);

    pager.currentPage = 1;
    const res = await reportApi.fetchAdReport(args) as any
    allData.value = res.items.map((item:any,index:number)=>({...item,seq:index+1}));
    pager.total = res.items.length;
    reloadGrid(res.columns, allData.value.slice(0, pager.pageSize),res.summary[0]);
  } finally {
    //无论成功/失败，一定关闭
    gridApi.setLoading(false);
  }
}

/* ---------------- 构建列 + 设置分页数据 ---------------- */
//第三步：创建全新的表头，设置好表格数据total、currentPage、pageSize
function reloadGrid(columns: string[], pageData: any[],footData:any) {
  const newColumns: any[] = [
    { title: "序号", field: "seq", width: "auto" },
  ];
  columns.forEach((key) => {
    newColumns.push({
      field: key,
      title: key,
      width: 'auto',
      sortable: true,
    });
  });
  gridApi.setGridOptions({
    columns: newColumns,
    data: pageData,
    pagerConfig: {
      total: pager.total,
      currentPage: pager.currentPage,
      pageSize: pager.pageSize,
    },
    //表尾数据展示
    footerData:[{
        seq:'合计：',
        ...footData
    }]
  });
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ---------------- 前端分页 slice ---------------- */
//第四步：分页截取的方法
async function updatePageData() {
  gridApi.setLoading(true);
  // 人为制造分页 loading
  await sleep(500);
  const start = (pager.currentPage - 1) * pager.pageSize;
  const end = pager.currentPage * pager.pageSize;
  const pageData = allData.value.slice(start, end);

  gridApi.setGridOptions({
    data: pageData,
    pagerConfig: {
      total: pager.total,
      currentPage: pager.currentPage,
      pageSize: pager.pageSize,
    },
  });
  gridApi.setLoading(false);
}

/* ---------------- Grid 事件：分页 ---------------- */
//第五步：分页事件
const gridEvents = {
  pageChange({ currentPage, pageSize }:{ currentPage:number, pageSize:number }) {
    pager.currentPage = currentPage;
    pager.pageSize = pageSize;
    updatePageData();
  },
};

// 定义接受项目名称数组
const projectOptions = ref<ProjectItem[]>([]);

// 页面加载时请求数据
onMounted(async () => {
  const res = await projectApi.fetchProjectList({
    page: 1,
    size: 1000,
  });
  projectOptions.value = res.items;  
});

//computed是响应式的，如果直接赋值projectOptions已经晚了，schema已经初始化完成了异步数据没有触发表单更新
const projectSelectOptions = computed(() =>
  projectOptions.value.map((item:ProjectItem) => ({
    label: item.name,
    value: item.id,
  }))
);

/* ---------------- 表单配置 ---------------- */
const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: 'RangePicker',
      defaultValue: [
        dayjs().subtract(6, 'day').format('YYYY-MM-DD'), // 7天前（含今天）
        dayjs().format('YYYY-MM-DD'),                    // 今天
      ],
      componentProps: {
        placeholder: [`${$t('common.select')}`, `${$t('common.select')}`],
        format: ['YYYY-MM-DD', 'YYYY-MM-DD'],
        valueFormat: 'YYYY-MM-DD',
        disabledDate: (current: any) => {
          return current && current > dayjs().endOf('day');
        },
      },
      fieldName: 'dateTimeRange',
      label: 'Time',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: ACTIVE_PLATFORM,
        mode: 'multiple',
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'platform',
      label: `${$t('ocpx.platform.title')}`,
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: DIMS,
        mode: 'multiple',
        placeholder: `${$t('common.choice')}`,
      },
      defaultValue: ['day'],
      fieldName: 'dims',
      label: `${$t('marketing.report.dims.title')}`,
    },
    {
      // 媒体配置表单
      component: 'ApiSelect',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.select')}`,
        mode: 'multiple',
        api: async (params: AdvertiserPageRequest) => {
          return await advertiserApi.fetchAdvertiserList(params);
        },
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        params: {
          page: 1,
          pageSize: 1000,
          putStatue: 1,
        },
        valueField: 'advertiserId',
        labelField: 'advertiserName',
        resultField: 'items',
      },
      // 字段名
      fieldName: 'advertiserId',
      // 界面显示的label
      label: `${$t('marketing.advertiser.columns.advertiserName')}`,
    },
    {
      defaultValue: [],
      fieldName: 'queryMetric',
      label: '指标',
      rules: 'required',
      component: 'ApiSelect',
      dependencies: {
        show: false,
        triggerFields: ["*"]
      }
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        showSearch: true,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        options: projectSelectOptions,//options不能直接传ref
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'projectId',
      label: '项目',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  handleSubmit: async (values) => {
  // 1、重置到第一页
  pager.currentPage = 1;
  // 2、参数结构转换
  const params = buildReportParams(values);
  // 3、用新参数请求接口
  await init(params);
},

  // （可选）重置按钮
  handleReset: async () => {
   await gridApi.formApi.resetForm();
  },
};

// 封装搜索传参数据结构调整事件(箭头函数)
const makeFilter = (
  field: string,
  values?: string[],
  operator = 1,
): ReportFilter[] | undefined =>
  values?.length
    ? [{ field, operator, values }]
    : undefined;

// 过滤搜索条件
function buildReportParams(values: any): AdReportRequest {
  const {
    advertiserId,
    dateTimeRange,
    dims,
    platform,
    queryMetric,
    projectId
  } = values;

  // projectid现在拿到的是字符串需要转化成字符串数组，因为现在不是多选，选出来的就是字符串
  const normalizeArray = (val?: string | string[]) =>
    val ? (Array.isArray(val) ? val : [val]) : undefined;

  const filters: ReportFilter[] = [
    ...(makeFilter('platform', platform) ?? []),
    ...(makeFilter('platform_account_id', advertiserId) ?? []),
    ...(makeFilter('projectId', normalizeArray(projectId)) ?? []),
  ];

  return {
    dateTimeRange,
    dims,
    queryMetric,
    filters: filters.length ? filters : undefined,
  };
}


function reloadFromStart(metricIds: string[]) {
  gridApi.formApi.setFieldValue('queryMetric', metricIds)

}
/* ---------------- Grid 配置（关键点） ---------------- */
const gridOptions: VxeGridProps = {
  showFooter: true,//开启表尾
  border: true,
  height: "auto",
  keepSource: true,
  columns: [],
  data: [],
  toolbarConfig: {
    custom: true,
    export: true,
    refresh: true,
    refreshOptions: {
      query:async () => {
       await  gridApi.formApi.submitForm()
      }
    },
    zoom: true,
  },
  exportConfig: {},
  pagerConfig: {
    enabled: true,
    total: pager.total,
    pageSize: pager.pageSize,
    currentPage: pager.currentPage,
  },
  proxyConfig: undefined, // 保持
  footerData: []
};

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents,
});

</script>

<template>
  <div>
    <Page auto-content-height>
      <Grid>
        <template #reset-before>
          <Button type="primary" @click="openSaveTemplateModalModal">
            保存模板
          </Button>
        </template>
        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="openTemplateListModalModal">
            报表模板
          </Button>
          <Button type="primary" @click="openPlatformMetricMapDetailModal" danger>
            {{ $t('core.metric') }}
          </Button>
        </template>
      </Grid>
    </Page>
    <SelectMetricModalModal @confirmMetric="reloadFromStart" :templateQueryMetric="templateQueryMetric"/>
    <SaveTemplateModalModal @success="handleTemplateSaved" :searchData="searchData"/>
    <TemplateDrawer @useTemplate="handleUseTemplate"/>
  </div>
</template>

<style scoped>

</style>
