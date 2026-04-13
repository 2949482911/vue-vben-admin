<script setup lang="ts">
import { 
  useVbenDrawer } from '@vben/common-ui';
import { ref, onMounted } from 'vue'
import { Tabs , TabPane, RangePicker } from 'ant-design-vue'
import type { EchartsUIType } from '@vben/plugins/echarts';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import type {OcpxDataStatisticsRequest, OcpxTaskItem, dayDataItem} from '#/api/models'
import dayjs, { Dayjs } from 'dayjs';
import { ocpxTaskApi } from '#/api/core';
import type { EChartsOption } from 'echarts';
type RangeValue = [Dayjs, Dayjs] | null;
const dateFormat = 'YYYY-MM-DD';
const requestParams = ref<OcpxDataStatisticsRequest>();
const timeList = ref<RangeValue>();
// const weekList = ref<RangeValue>();
// const monthList = ref<RangeValue>();
// const yearList = ref<RangeValue>();
const chartRefDay = ref<EchartsUIType>();
// const chartRefWeek = ref<EchartsUIType>();
// const chartRefMonth = ref<EchartsUIType>(); 
// const chartRefYear = ref<EchartsUIType>();
  const { renderEcharts: renderEchartsDay } = useEcharts(chartRefDay);
// const { renderEcharts: renderEchartsWeek } = useEcharts(chartRefWeek);
// const { renderEcharts: renderEchartsMonth } = useEcharts(chartRefMonth);
// const { renderEcharts: renderEchartsYear } = useEcharts(chartRefYear);

const activeKey = ref<string>('day')
const dayOptions = ref<EChartsOption>(
  {
    // ... 日统计的图表配置
    grid: {
      bottom: 0,
      containLabel: true,
      left: '1%',
      right: '1%',
      top: '2 %',
    },
    series: [],
    tooltip: {
      axisPointer: {
        lineStyle: {
          color: '#019680',
          width: 1,
        },
      },
      trigger: 'axis',
    },
    xAxis: {
      axisTick: {
        show: false,
      },
      boundaryGap: false,
      data:[],
       // X轴：指定日期
      splitLine: {
        lineStyle: {
          type: 'solid',
          width: 1,
        },
        show: true,
      },
      type: 'category',
    },
    yAxis: [
      {
        axisTick: {
          show: false,
        },
        splitArea: {
          show: true,
        },
        splitNumber: 4,
        type: 'value',
      },
    ],
  }
)
const [Drawer, drawerApi] = useVbenDrawer({
 async onOpenChange(isOpen: Boolean) {
    if(isOpen) {
      const data = await drawerApi.getData<OcpxTaskItem>()
      requestParams.value = {
        taskId: data.id,
        behaviorPlatformId: data.behavioraPlatformIds.join(','),
        platformCallbackId: data.platformCallbackIds.join(','),
        dims:[activeKey.value],
        timeList: []
      }
    } else {
      if(timeList.value) {
        timeList.value = null
        renderEchartsDay({},true)
      }
    }
  }
});
function handleChange(key) {
  
}

async function handleDayChange(day:RangeValue) {
  if (!day) return;
  const timeVal = [
    dayjs(day[0]).format(dateFormat),
    dayjs(day[1]).format(dateFormat)
  ];
  const params = {
    ...requestParams.value,
    timeList: timeVal
  }
  const res =  await ocpxTaskApi.fetchOcpxDataStatistics(params as OcpxDataStatisticsRequest);
  const dataList = res.items;
  const xData = dataList.map((item: dayDataItem) => item.day);
  const clickData = dataList.map((item: dayDataItem) => Number(item.click_count));
  const callbackData = dataList.map((item: dayDataItem) => Number(item.callback_count));
  dayOptions.value.series.push(
    {
      areaStyle: {},
      name: '点击数',
      type: 'line',
      data: clickData, 
      smooth: true,
      lineStyle: { width: 2 },
      itemStyle: {
        color: '#5ab1ef',
      },
    },
    {
      areaStyle: {},
      name: '回传数',
      type: 'line',
      data: callbackData,
      smooth: true,
      lineStyle: { width: 2 },
      itemStyle: {
        color: '#019680',
      },
    }
  );
  dayOptions.value.xAxis.data = xData;
  renderEchartsDay(dayOptions.value)
}
</script>
<template>
  <Drawer class="w-[40%]" title="数据统计">
    <Tabs v-model="activeKey" @change="handleChange">
      <TabPane key="day" tab="按日统计">
        <RangePicker v-model="timeList" @change="handleDayChange" :format="dateFormat"></RangePicker>
        <EchartsUI ref="chartRefDay" />
      </TabPane>
      <!-- <TabPane key="week" tab="按周统计">
        <RangePicker v-model:value="weekList" @change="handleDayChange" :format="dateFormat" picker="week"></RangePicker>
        <EchartsUI ref="chartRefWeek" />
      </TabPane>
      <TabPane key="month" tab="按月统计">
        <RangePicker v-model:value="monthList" @change="handleDayChange" :format="dateFormat" picker="month"></RangePicker>
        <EchartsUI ref="chartRefMonth" />
      </TabPane>
      <TabPane key="year" tab="按年统计">
        <RangePicker v-model:value="yearList" @change="handleDayChange" :format="dateFormat" picker="year"></RangePicker>
        <EchartsUI ref="chartRefYear" />
      </TabPane> -->
    </Tabs>

  </Drawer>
</template>
<style lang="scss" scoped>
:deep(.ant-tabs-nav-list) {
  background: #f1f5f9;
  padding: 5px;
  border-radius: 6px;
  color: #64748b;
}
:deep(.ant-tabs-nav) {
  &::before{
    border-bottom: none;
  }
}
:deep(.ant-tabs-tab) {
    width: 80px;
    // border: 1px solid #ccc;
    text-align: center;
    border-radius: 6px;
    display: block;
    margin: 0 !important;
}
:deep(.ant-tabs-tab-active) {
  background: #fff;
  color: #000;
  // border: 1px solid #ccc
}
</style>
