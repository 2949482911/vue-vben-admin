<script setup lang="ts">
import { Button, Card, Divider, message } from 'ant-design-vue';
import { useVbenDrawer } from '@vben/common-ui';
import ProjectDrawer from './projectDrawer.vue';
import {
  ADTYPE_SELECT,
  CONVERSION_SELECT,
  MEDIA_SELECT,
  NOTIFICATIONTYPE_SELECT,
  NOTIFORMAT_SELECT,
  PROMOTION_SELECT,
  EXTENSION_SELECT,
  DAYLIMIT_SELECT,
  DELIVERMODE_SELECT
} from '../../projectEnum';
import type {OppoCampaignData} from '../../creation/oppo/Oppo.types';
import { ref, watch } from 'vue';

let { hasAccount, hasProduct, campaign } = defineProps({
  hasAccount: Boolean,
  hasProduct: Boolean,
  campaign: {
    type: Object,
    default: () => {
      return {
        planName: '',
        extensionType: 0,
        dayLimit: 0,
        dayBudget: -1,
        deliveryMode: 0,
      };
    },
  },
});
const campaignInfo = ref<OppoCampaignData>({})
watch(() => campaign, (newValue) => {
  campaignInfo.value = newValue
  // emit('update:projectConfig', newValue);
},{ immediate: true });
const emit = defineEmits(['update:projectConfig', 'adTypeChanged']);

const [ProjectDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: ProjectDrawer,
  onOpenChange(isOpen) {
    if(!isOpen) {
      const data = drawerApi.getData();
      campaignInfo.value = data;
      emit('update:projectConfig', campaignInfo.value);
    }
  },
});

// 辅助函数：由于你的字段是 key，这里定义中文 Label 映射
const labelMap: Record<string, string> = {
  planName: '计划名称',
  extensionType: '推广目标',
  dayBudget: '日预算',
  dayLimit: '是否限制日预算',
  deliveryMode: '竞价策略',
};

// 建立字段与枚举数组的映射关系
const enumMap: Record<string, any[]> = {
  extensionType: EXTENSION_SELECT,
  dayLimit: DAYLIMIT_SELECT,
  deliveryMode: DELIVERMODE_SELECT
};

// 格式化展示内容的函数
const formatDisplayValue = (key: string, value: any) => {
  if (key === 'dayBudget') {
    return `${value} 元`;
  }
  const options = enumMap[key];
  if (options) {
    const target = options.find((item) => item.value === value);
    return target ? target.label : value;
  }
  return value;
};

const hasValue = (val: any) => {
  if (val === null || val === undefined || val === '') {
    return false;
  }
  // 如果是数组，判断长度
  if (Array.isArray(val) && val.length === 0) {
    return false;
  }
  return true;
};

const handleAction = () => {
  if (!hasProduct) {
    message.warning('请先在配置区选择“项目”');
    return;
  }
  if (!hasAccount) {
    message.warning('请先在配置区选择“媒体账户”');
    return;
  }
  if (campaignInfo.value.planName) {
    drawerApi.setData(campaignInfo.value);
  } else {
    drawerApi.setData(null);
  }
  drawerApi.open();
};
</script>

<template>
  <div>
    <Card class="projectCard">
      <div class="title">项目</div>
      <Divider type="horizontal" />
      <div class="infoTop">
        <div class="title">基本信息：</div>
      </div>
      <Card class="infoBody">
        <div v-if="campaignInfo.planName" class="data-list">
          <div v-for="(label, key) in labelMap" :key="key" class="data-item">
            <div v-if="hasValue(campaignInfo[key])" class="data-item">
              <span class="item-label">{{ label }}：</span>
              <span class="item-value">{{ formatDisplayValue(key, campaignInfo[key]) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-status">暂无数据，请点击下方按钮添加项目</div>
      </Card>
      <Divider type="horizontal" />
      <div class="btnCla">
        <Button type="text" @click="handleAction">
          {{ campaignInfo.planName ? '编辑项目' : '添加项目' }}
        </Button>
      </div>
    </Card>
    <ProjectDrawerModule />
  </div>
</template>

<style scoped lang="scss">
.projectCard {
  .title {
    font-size: 14px;
    font-weight: 600;
  }

  .infoTop {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .edit-btn {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 0;
      color: #006be6; // 对应图中那种偏绿的青色
    }
  }

  .infoBody {
    height: 506px;
    margin: 10px 0 0;
    // 深度作用选择器，修改 antd card 默认 padding
    :deep(.ant-card-body) {
      padding: 10px;
    }

    .data-list {
      display: flex;
      flex-direction: column;

      .data-item {
        display: flex;
        align-items: center; // 确保标签和内容垂直居中
        font-size: 14px;

        &:hover {
          cursor: pointer; // 鼠标移上去显示手型，暗示可交互
        }

        .item-label {
          flex-shrink: 0;
        }

        .item-value {
          flex: 1; // 占据剩余全部空间
          width: 290px;
          overflow: hidden; // 超出部分隐藏
          text-overflow: ellipsis; // 显示省略号
          white-space: nowrap; // 强制不换行
        }
      }
    }

    .empty-status {
      padding: 40px 0;
      color: #999;
      text-align: center;
    }
  }

  .btnCla {
    display: flex;
    justify-content: center;
    // align-items: center;
    width: 100%;
  }
}
</style>
