<script setup lang="ts" name="SelectMetricModal">
import { Page, useVbenModal } from '@vben/common-ui';
import { onMounted, ref, reactive, watch, nextTick, computed } from 'vue';
import { metricApi } from '#/api';
import type { MetricItem,CreateSystemMetric, MetricGroupType} from '#/api/models';
import { Checkbox, Divider, CheckboxGroup, Space, InputSearch, Button, message, Tabs, TabPane } from 'ant-design-vue';
import { ReloadOutlined, ArrowDownOutlined, ArrowUpOutlined  } from '@ant-design/icons-vue';
import { $t } from '@vben/locales';
import { useVbenForm } from '#/adapter/form';
import { trimObject } from '#/utils/trim';
import { metricGroupApi } from '#/api/core'
const emit = defineEmits(['confirmMetric']);
const isDataLoading = ref<Boolean>(false)
// 指标类目列表
const metricGropList = ref<MetricGroupType[]>([])
//接收父组件使用模板传回来的指标回显数组
const props = defineProps<{
  selectedMetrics: string[]
}>()

// 搜索关键字
const indicatorValue = ref('');

// checkbox 状态
const state = reactive({
  indeterminate: true,
  checkAll: false,
  checkedList: [] as string[],
});
// 原始指标列表（不动）
const metricList = ref<MetricItem[]>([]);

const visibleMetricIds = computed(() => {
  const keyword = indicatorValue.value.trim().toLowerCase();
  if (!keyword) {
    return metricList.value.map(item => item.id);
  }
  return metricList.value
    .filter(item => item.cname.toLowerCase().includes(keyword))
    .map(item => item.id);
});


// 实际用于展示的 checkbox options
const checkboxOptionTypeList = ref<{ label: string; value: string }[]>([]);

// Modal
function validateFormula(formula: string): boolean {
  if (!formula) {
    message.warning('公式不能为空');
    return false;
  }

  // 1. 括号匹配检查
  let stack = 0;
  for (let i = 0; i < formula.length; i++) {
    if (formula[i] === '(') stack++;
    if (formula[i] === ')') stack--;
    if (stack < 0) {
      message.error('括号不匹配');
      return false;
    }
  }
  if (stack !== 0) {
    message.error('括号不匹配');
    return false;
  }

  // 2. 检查是否包含非法字符（只允许字母数字下划线、运算符、括号、小数点、空格）
  const validCharsRegex = /^[a-zA-Z0-9_+\-*/()\s.]+$/;
  if (!validCharsRegex.test(formula)) {
    message.error('公式包含非法字符');
    return false;
  }

  // 3. 检查连续运算符（如 ++、-- 等）
  if (/[+\-*/]{2,}/.test(formula)) {
    message.error('公式不能包含连续的运算符');
    return false;
  }

  // 4. 检查运算符位置（不能开头结尾）
  if (/^[+\-*/]/.test(formula) || /[+\-*/]$/.test(formula)) {
    message.error('公式不能以运算符开头或结尾');
    return false;
  }

  // 5. 检查是否至少包含一个运算符（派生指标必须由多个指标运算组成）
  if (!/[+\-*/]/.test(formula)) {
    message.error('公式必须包含至少一个运算符');
    return false;
  }

  return true;
}

const formulaForSubmit = ref<string>(''); // 存储无花括号英文公式用于提交
const [Modal, modalApi] = useVbenModal({
  fullscreen: false,
  fullscreenButton: false,
  closeOnPressEscape: false,
  async onCancel() {
    await modalApi.close();
  },
  async onConfirm() {
    emit('confirmMetric', state.checkedList);
    await modalApi.close();
  },
  async onOpenChange(isOpen){
    if (isOpen) {
      const res = await metricGroupApi.fetchGetMetricGroupList({
        page: 1,
        pageSize: 1000
      })
      metricGropList.value = res.items
      nextTick(() => {
        state.checkedList = props.selectedMetrics
          ? [...props.selectedMetrics]
          : [];
      });
    }
  }
});
const [MetricModal, metricModalApi] = useVbenModal({
  fullscreen: false,
  fullscreenButton: false,
  closeOnPressEscape: false,
  async onCancel() {
    await metricModalApi.close();
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) return;
    try {
      await formApi.submitForm(); // 如果校验失败，这里会抛出错误
      await metricModalApi.close();
      getMetricList()
    } catch (error) {
      // 校验失败或提交失败，弹窗保持打开，错误已通过 message 提示
      console.error('提交失败', error);
    }
  },
  async onOpenChange(isOpen){
    if (isOpen) {
    }
  }
});
const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: { class: 'w-full' },
  },
  layout: 'horizontal',
  handleSubmit: async (formVal: Record<string, any>) => {
  const result = await formApi.validate();
    if (!result.valid) throw new Error('表单验证失败');
    const formValues = { ...formVal };
    let finalFormula = '';
    if (formulaForSubmit.value) {
      finalFormula = formulaForSubmit.value;
    } else if (formValues.formula) {
      finalFormula = formValues.formula.replace(/[{}]/g, '');
    }
    if (!finalFormula) {
      message.warning('请输入公式');
      throw new Error('公式为空');
    }
    if (!validateFormula(finalFormula)) {
      throw new Error('公式不合法');
    }
    formValues.formula = finalFormula;
    const params = trimObject(formValues);
    await metricApi.fetchCreateMetric(params as CreateSystemMetric)
  },
  schema: [
    {
      component: 'Input',
      componentProps: { placeholder: $t('common.input') },
      fieldName: 'id',
      dependencies: { show: false, triggerFields: ['*'] },
    },
    {
      component: 'Input',
      componentProps: { placeholder: $t('common.input') },
      fieldName: 'ename',
      label: $t('marketing.metric.columns.ename'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { placeholder: $t('common.input') },
      fieldName: 'cname',
      label: $t('marketing.metric.columns.cname'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { placeholder: $t('common.input') },
      defaultValue: 2,
      fieldName: 'metricType',
      dependencies: { show: false, triggerFields: ['*'] },
    },
    {
      component: 'Textarea',
      componentProps: { placeholder: $t('common.input') },
      fieldName: 'description',
      label: $t('marketing.metric.columns.description'),
      rules: 'required',
    },
    {
      component: 'MetricFormulaEditor', // 自定义组件
      fieldName: 'formula', // 直接绑定到 formula 字段
      label: $t('marketing.metric.columns.rule'),
      componentProps: {
        onConfirm: handleFormulaConfirm,
      }
    },
  ],
});
function handleFormulaConfirm(val) {
  formulaForSubmit.value = val
}
// 拉取指标
async function getMetricList(metricGroupId: string) {
  isDataLoading.value = true
  const dataList:any = await metricApi.fetchMetric({metricGroupId:metricGroupId});
  metricList.value = dataList;
  updateCheckboxOptions(dataList);
  isDataLoading.value = false
}

// 根据列表更新 checkbox options
function updateCheckboxOptions(list: MetricItem[]) {
  checkboxOptionTypeList.value = list.map(item => ({
    label: item.cname,
    value: item.id,
  }));
}
function clearAll() {
  selectdMetricList.value = []
  state.checkedList = []
}
// 实时搜索（核心）
watch(indicatorValue, (keyword) => {
  const searchText = keyword.trim().toLowerCase();
  if (!searchText) {
    // 关键字为空，恢复全部
    updateCheckboxOptions(metricList.value);
    return;
  }
  const filteredList = metricList.value.filter(item =>
    item.cname.toLowerCase().includes(searchText)
  );
  updateCheckboxOptions(filteredList);
});

//监听指标全选框和未全选框的状态
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
    selectdMetricList.value = metricList.value.filter(item => val.includes(item.id)).map(item => item);
  },
  { deep: true }
);


// 全选
const onCheckAllChange = (e: any) => {
  const currentOptions = checkboxOptionTypeList.value.map(x => x.value);

  if (e.target.checked) {
    // ✅ 追加（去重）
    state.checkedList = Array.from(
      new Set([...state.checkedList, ...currentOptions])
    );
  } else {
    // ✅ 只取消“当前搜索结果”里的
    state.checkedList = state.checkedList.filter(
      val => !currentOptions.includes(val)
    );
  }

  state.indeterminate = false;
};
const selectdMetricList = ref<MetricItem[]>([])
const handleChange = (e:any) => {
  selectdMetricList.value = metricList.value.filter(item => e.includes(item.id)).map(item => item);
}
const handleInsertMetric = () => {
  metricModalApi.open()
}
const currentItem = ref<MetricItem>()
const handleClick = (row: MetricGroupType) => {
  const list = metricGropList.value;
  const targetId = row.id;
  currentItem.value = row
  getMetricList(row.id)
  metricGropList.value = list.map(item => ({
    ...item,
    isChecked: item.id === targetId
  }));
};
const dragIndex = ref<number>()
const handleDragStart = (index: number) => {
  dragIndex.value = index
}

const handleDrop = (dropIndex: number) => {
  const newList:MetricItem[] = [...selectdMetricList.value]
  const temp = newList[dragIndex.value]
  newList[dragIndex.value] = newList[dropIndex]
  newList[dropIndex] = temp
  selectdMetricList.value = newList
}
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
              allowClear
              class="metric-search"
            />
          <div class="metric-list">
            <div class="metric-list-item" :class="{itemActive:item.isChecked}"  v-for="item in metricGropList" :key="item.id" @click="handleClick(item)">{{item.name}}</div>
          </div>
          </div>
        </div>
        <div class="metric-content-center" v-loading="isDataLoading">
          <Checkbox
            v-model:checked="state.checkAll"
            :indeterminate="state.indeterminate"
            @change="onCheckAllChange"
          >
            {{ $t('core.checkAll') }}
          </Checkbox>

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
          <Space>
            <Button type="link" class="insertMetric flex items-center mt-1" @click="handleInsertMetric" v-if="currentItem?.name.includes('自定义')">
              <template #icon><span class="icon-[mdi--plus] w-5 h-5"></span></template>
              自定义指标
            </Button>
          </Space>
        </div>
        <div class="metric-content-right">
          <div class="header">
            <div class="header-left">已选{{selectdMetricList.length}}个指标</div>
            <div class="header-right" @click="clearAll">
              <ReloadOutlined :style="{fontSize: '12px',marginRight: '3px'}" />
              <span>清空</span>
            </div>
          </div>
          <div class="tips" v-if="selectdMetricList.length > 1">拖动可自定义指标顺序</div>
          <div class="rightboxList">
            <div 
              class="rightboxList-item" 
              v-for="(item,index) in selectdMetricList" 
              :key="item.id"
              draggable="true"  
              @dragstart="handleDragStart(index)"  
              @dragover.prevent 
              @drop="handleDrop(index)" 
              >
              <ArrowUpOutlined v-if="index == 0"/>
              <ArrowDownOutlined v-else/>
              {{ item.cname }}
            </div>
          </div>
        </div>
      </div>
    </Modal>
      <!-- 指标选择弹窗（含搜索功能） -->
      <MetricModal title="新增自定义指标">
        <Form/>
      </MetricModal>
  </div>
</template>


<style lang="scss" scoped>
  //指标全选按钮分列排序每行三个，一起三列
  .metric-content {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-around;
    &-left {
      width: 18%;
      border: 1px solid rgb(233, 228, 228);
      padding: 0 5px;
      text-align: center;
      .metric-search {
        width: 200px;
        margin-top:10px;
      }
      .metric-list {
        margin-top: 15px;
        &-item {
          color: rgba(2, 8, 23, 0.88);
          font-size: 14px;
          line-height: 30px;
          margin: 5px auto;
          cursor: pointer;
          list-style: none;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
        }
      }
      .itemActive {
        background: hsl(var(--primary)/15%);
        color: hsl(var(--primary));
        border-radius: 4px;
      }
    }
    &-center {
      width: 65%;
      height: 650px;
      overflow-y: auto;
      border: 1px solid rgb(233, 228, 228);
      padding: 5px;
      .metric-checkbox-group {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px 16px;
        }
      .insertMetric {
        color: hsl(var(--primary));
        cursor: pointer;
        transition: color 0.2s;
        font-size: 14px;
        &:hover {
          color: hsl(var(--primary) / 0.8);
        }
      }
    }
    &-right {
      width: 15%;
      border: 1px solid rgb(233, 228, 228);
      .header {
        display: flex;
        justify-content: space-around;
        align-items: center;
        height: 40px;
        line-height: 40px;
        background: hsl(var(--border));;
        &-left {
          font-size: 14px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';

        }
        &-right {
          font-size: 14px;
          color: hsl(var(--primary));
          text-align: center;
          cursor: pointer;
        }
      }
      .tips {
        font-size: 12px;
        text-align: center;
        color: #a8abb2;
        margin: 10px 0;
      }
      .rightboxList {
        margin-top: 10px;
        height: 570px;
        overflow-y: auto;
        &-item {
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all .3s;
          cursor: move;
          margin-left: 8px;
          border-radius: 2px;
          margin-right: 8px;
          line-height: 36px;
          margin-bottom: 12px;
          background: #f7f7f7;
          padding: 2px 2px 2px 10px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
          font-size: 14px;
          user-select: none;
        }
      }
    }
  }

</style>
