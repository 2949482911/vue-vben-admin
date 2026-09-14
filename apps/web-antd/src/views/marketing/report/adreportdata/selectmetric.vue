<script setup lang="ts" name="SelectMetricModal">
import type { MetricGroupType, MetricItem } from "#/api/models";

import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";

import { useVbenModal } from "@vben/common-ui";
import { $t } from "@vben/locales";

import { ArrowDownOutlined, ArrowUpOutlined, ReloadOutlined } from "@ant-design/icons-vue";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
  InputSearch,
  Radio,
  RadioGroup,
  Space
} from "ant-design-vue";

import { metricApi } from "#/api";
import { metricGroupApi } from "#/api/core";

import CreateMetricModal from "./CreateMetricModal.vue";

// 接收父组件使用模板传回来的指标回显数组
const props = defineProps<{
  selectedMetrics: string[];
  decimalPoint?: number;
  /** 报表类型：ad=广告报表，material=素材报表 */
  reportType?: string;
}>();
const emit = defineEmits(["confirmMetric"]);
const isDataLoading = ref<Boolean>(false);
// 指标类目列表
const metricGropList = ref<MetricGroupType[]>([]);
// 搜索关键字
const indicatorValue = ref("");

// checkbox 状态
const state = reactive({
  indeterminate: true,
  checkAll: false,
  checkedList: [] as string[]
});
// 原始指标列表（不动）
const metricList = ref<MetricItem[]>([]);

const visibleMetricIds = computed(() => {
  const keyword = indicatorValue.value.trim().toLowerCase();
  if (!keyword) {
    return metricList.value.map((item) => item.id);
  }
  return metricList.value
    .filter((item) => item.cname.toLowerCase().includes(keyword))
    .map((item) => item.id);
});

// 实际用于展示的 checkbox options
const checkboxOptionTypeList = ref<{ label: string; value: string }[]>([]);
const decimalPoint = ref<number>(4);

// 新增自定义指标弹窗显隐（弹窗与表单已拆到 CreateMetricModal.vue）
const createMetricOpen = ref(false);

/** 指标选择弹窗：父级 open() 打开的就是它 */
const [Modal, modalApi] = useVbenModal({
  fullscreen: false,
  fullscreenButton: false,
  closeOnPressEscape: false,
  async onCancel() {
    await modalApi.close();
  },
  async onConfirm() {
    emit("confirmMetric", state.checkedList, decimalPoint.value);
    await modalApi.close();
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const res = await metricGroupApi.fetchGetMetricGroupList({
        page: 1,
        pageSize: 1000
      });
      metricGropList.value = res.items;
      nextTick(() => {
        state.checkedList = props.selectedMetrics ? [...props.selectedMetrics] : [];
        decimalPoint.value = props.decimalPoint ?? 4;
      });
    }
  }
});

// 拉取指标
async function getMetricList(metricGroupId?: string) {
  isDataLoading.value = true;
  const dataList: any = await metricApi.fetchMetric({ metricGroupId, reportType: props.reportType ?? "ad" });
  metricList.value = dataList;
  updateCheckboxOptions(dataList);
  isDataLoading.value = false;
}

// 根据列表更新 checkbox options
function updateCheckboxOptions(list: MetricItem[]) {
  // @ts-ignore
  checkboxOptionTypeList.value = list.map((item) => ({
    label: item.cname,
    value: item.id
  })) ;
}

function clearAll() {
  selectdMetricList.value = [];
  state.checkedList = [];
}

// 实时搜索（核心）
watch(indicatorValue, (keyword) => {
  const searchText = keyword.trim().toLowerCase();
  if (!searchText) {
    // 关键字为空，恢复全部
    updateCheckboxOptions(metricList.value);
    return;
  }
  const filteredList = metricList.value.filter((item) =>
    item.cname.toLowerCase().includes(searchText)
  );
  updateCheckboxOptions(filteredList);
});

// 监听指标全选框和未全选框的状态
watch(
  () => state.checkedList,
  (val) => {
    const total = checkboxOptionTypeList.value.length;
    if (val.length === 0) {
      state.checkAll = false;
      state.indeterminate = false;
    } else if (val.length === total) {
      state.checkAll = true;
      state.indeterminate = false;
    } else {
      state.checkAll = false;
      state.indeterminate = true;
    }
    selectdMetricList.value = metricList.value
      .filter((item) => val.includes(item.id))
      .map((item) => item);
  },
  { deep: true }
);

// 全选
const onCheckAllChange = (e: any) => {
  const currentOptions = checkboxOptionTypeList.value.map((x) => x.value);

  if (e.target.checked) {
    // ✅ 追加（去重）
    state.checkedList = Array.from(new Set([...state.checkedList, ...currentOptions]));
  } else {
    // ✅ 只取消“当前搜索结果”里的
    state.checkedList = state.checkedList.filter((val) => !currentOptions.includes(val));
  }

  state.indeterminate = false;
};
const selectdMetricList = ref<MetricItem[]>([]);
const handleChange = (e: any) => {
  selectdMetricList.value = metricList.value
    .filter((item) => e.includes(item.id))
    .map((item) => item);
};
const handleInsertMetric = () => {
  createMetricOpen.value = true;
};
const isClickAll = ref<Boolean>(false);
// 当前选中的是「指标分组」，字段为 name（分组没有 ename）
const currentItem = ref<MetricGroupType>();
const handleClick = (row: MetricGroupType) => {
  const list = metricGropList.value;
  const targetId = row.id;
  if (targetId) {
    isClickAll.value = false;
    currentItem.value = row;
    getMetricList(row.id);
    metricGropList.value = list.map((item) => ({
      ...item,
      isChecked: item.id === targetId
    }));
  } else {
    getMetricList();
    isClickAll.value = true;
    metricGropList.value = list.map((item) => ({
      ...item,
      isChecked: false
    }));
  }
};
const dragIndex = ref<number>();
const handleDragStart = (index: number) => {
  dragIndex.value = index;
};


const handleDrop = (dropIndex: number) => {
  const newList: MetricItem[] = [...selectdMetricList.value];
  // @ts-ignore
  const temp = newList[dragIndex.value];
  // @ts-ignore
  newList[dragIndex.value] = newList[dropIndex];
  newList[dropIndex] = temp;
  selectdMetricList.value = newList;
};
onMounted(() => {
  getMetricList();
});
</script>

<template>
  <div>
    <Modal class="w-[70%] max-w-[70%] mx-auto">
      <div class="metric-content">
        <div class="metric-content-left">
          <div>
            <InputSearch
              v-model:value="indicatorValue"
              placeholder="请输入指标名称搜索"
              allow-clear
              class="metric-search"
            />
            <div class="metric-list">
              <div
                class="metric-list-item"
                @click="handleClick"
                :class="{ itemActive: isClickAll }"
              >
                全部指标
              </div>
              <div
                class="metric-list-item"
                :class="{ itemActive: item.isChecked }"
                v-for="item in metricGropList"
                :key="item.id"
                @click="handleClick(item)"
              >
                {{ item.name }}
              </div>
            </div>
          </div>
        </div>
        <div class="metric-content-center" v-loading="isDataLoading">
          <Checkbox
            v-model:checked="state.checkAll"
            :indeterminate="state.indeterminate"
            @change="onCheckAllChange"
          >
            {{ $t("core.checkAll") }}
          </Checkbox>

          <Divider />
          <div>
            <span style="font-size: 12px" class="mr-5">保留小数位</span>
            <RadioGroup v-model:value="decimalPoint" class="metric-radio-group">
              <Radio :value="4">4位</Radio>
              <Radio :value="5">5位</Radio>
            </RadioGroup>
          </div>
          <Divider />
          <Space size="large">
            <CheckboxGroup v-model:value="state.checkedList" @change="handleChange">
              <div class="metric-checkbox-group">
                <Checkbox
                  v-for="item in metricList"
                  :key="item.id"
                  :value="item.id"
                  v-show="visibleMetricIds.includes(item.id)"
                >
                  {{ item.cname }}
                </Checkbox>
              </div>
            </CheckboxGroup>
          </Space>
          <Button
            type="link"
            class="insertMetric flex items-center mt-1"
            @click="handleInsertMetric"
            v-if="currentItem?.name?.includes('自定义')"
          >
            <template #icon><span class="icon-[mdi--plus] w-5 h-5"></span></template>
            自定义指标
          </Button>
        </div>
        <div class="metric-content-right">
          <div class="header">
            <div class="header-left">已选{{ selectdMetricList.length }}个指标</div>
            <div class="header-right" @click="clearAll">
              <ReloadOutlined :style="{ fontSize: '12px', marginRight: '3px' }" />
              <span>清空</span>
            </div>
          </div>
          <div class="tips" v-if="selectdMetricList.length > 1">拖动可自定义指标顺序</div>
          <div class="rightboxList">
            <div
              class="rightboxList-item"
              v-for="(item, index) in selectdMetricList"
              :key="item.id"
              draggable="true"
              @dragstart="handleDragStart(index)"
              @dragover.prevent
              @drop="handleDrop(index)"
            >
              <ArrowUpOutlined v-if="index == 0" />
              <ArrowDownOutlined v-else />
              {{ item.cname }}
            </div>
          </div>
        </div>
      </div>
    </Modal>
    <!-- 新增自定义指标弹窗（已拆分为独立组件，避免与指标选择弹窗争抢实例） -->
    <CreateMetricModal
      v-model:open="createMetricOpen"
      @success="getMetricList"
    />
  </div>
</template>

<style lang="scss" scoped>
//指标全选按钮分列排序每行三个，一起三列
.metric-content {
  display: flex;
  justify-content: space-around;
  width: 100%;
  height: 100%;

  &-left {
    width: 18%;
    padding: 0 5px;
    text-align: center;
    border: 1px solid rgb(233 228 228);

    .metric-search {
      width: 200px;
      margin-top: 10px;
    }

    .metric-list {
      margin-top: 15px;

      &-item {
        margin: 5px auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
        'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
        'Noto Color Emoji';
        font-size: 14px;
        line-height: 30px;
        cursor: pointer;
        list-style: none;
      }
    }

    .itemActive {
      color: hsl(var(--primary));
      background: hsl(var(--primary) / 15%);
      border-radius: 4px;
    }
  }

  &-center {
    width: 65%;
    height: 650px;
    padding: 5px;
    overflow-y: auto;
    border: 1px solid rgb(233 228 228);

    .metric-checkbox-group {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px 16px;
    }

    .insertMetric {
      font-size: 14px;
      color: hsl(var(--primary));
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: hsl(var(--primary) / 80%);
      }
    }
  }

  &-right {
    width: 15%;
    border: 1px solid rgb(233 228 228);

    .header {
      display: flex;
      align-items: center;
      justify-content: space-around;
      height: 40px;
      line-height: 40px;
      background: hsl(var(--border));

      &-left {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
        'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
        'Noto Color Emoji';
        font-size: 14px;
      }

      &-right {
        font-size: 14px;
        color: hsl(var(--primary));
        text-align: center;
        cursor: pointer;
      }
    }

    .tips {
      margin: 10px 0;
      font-size: 12px;
      color: #a8abb2;
      text-align: center;
    }

    .rightboxList {
      height: 570px;
      margin-top: 10px;
      overflow-y: auto;

      &-item {
        display: flex;
        gap: 4px;
        align-items: center;
        padding: 2px 2px 2px 10px;
        margin-right: 8px;
        margin-bottom: 12px;
        margin-left: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
        'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
        'Noto Color Emoji';
        font-size: 14px;
        line-height: 36px;
        cursor: move;
        user-select: none;
        // background: #f7f7f7;
        border: 1px solid rgb(233 228 228);
        border-radius: 2px;
        transition: all 0.3s;
      }
    }
  }
}
</style>
