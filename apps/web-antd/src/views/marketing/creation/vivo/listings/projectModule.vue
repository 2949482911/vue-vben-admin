<script setup lang="ts">
import { Card, Divider, Button } from 'ant-design-vue';
import { useVbenDrawer } from '@vben/common-ui';
import ProjectDrawer from './projectDrawer.vue';
import { onMounted, ref } from 'vue';
import { ADTYPE_SELECT, CONVERSION_SELECT, MEDIA_SELECT, NOTIFICATIONTYPE_SELECT, NOTIFORMAT_SELECT, PROJRCT_SELECT, PROMOTION_SELECT } from '../projectEnum';

const [ProjectDrawerModule, drawerApi] = useVbenDrawer({
  connectedComponent: ProjectDrawer,
  onClosed() {
    loadProjectInfo();
  }
});

function selectProject(){
  drawerApi.open();
}

const projectData = ref<any>(null);

// 初始化和更新数据的函数
const loadProjectInfo = () => {
  const info = sessionStorage.getItem('projectInfo');
  if (info) {
    projectData.value = JSON.parse(info);
  }
};

onMounted(() => {
  loadProjectInfo();
});

// 辅助函数：由于你的字段是 key，这里定义中文 Label 映射
const labelMap: Record<string, string> = {
  name: '项目名称',
  adType: '推广目标',
  mediaType: '媒体类型',
  dailyBudget: '计划日限额',
  campaignType: '广告类型',
  pushForm: '通知形式',
  pushType: '通知类型',
  promotionType: '推广模式',
  conversionMonitorType: '转化监测'
};

// 建立字段与枚举数组的映射关系
const enumMap: Record<string, any[]> = {
  adType: PROJRCT_SELECT,
  mediaType: MEDIA_SELECT,
  campaignType: ADTYPE_SELECT,
  pushForm: NOTIFORMAT_SELECT,
  pushType: NOTIFICATIONTYPE_SELECT,
  promotionType: PROMOTION_SELECT,
  conversionMonitorType: CONVERSION_SELECT,
};

// 格式化展示内容的函数
const formatDisplayValue = (key: string, value: any) => {
  if (value === null || value === undefined || value === '') return '-';
  
  // 1. 针对计划日限额特殊处理：添加“毫分”单位
  if (key === 'dailyBudget') {
    return `${value} 毫分`;
  }

  // 2. 针对枚举类型进行转换
  const options = enumMap[key];
  if (options) {
    const target = options.find(item => item.value === value);
    return target ? target.label : value;
  }

  // 3. 其他字段（如项目名称）原样返回
  return value;
};
</script>

<template>
  <div>
    <Card class="projectCard">
      <div class="title">项目</div>
      <Divider type="horizontal" />
      <div class="infoTop">
        <div class="title">基本信息：</div>
        <Button type="link" size="small" @click="selectProject" class="edit-btn">
          <span class="edit-icon">✎</span> 编辑
        </Button>
      </div>
      <Card class="infoBody">
        <div v-if="projectData" class="data-list">
          <div v-for="(label, key) in labelMap" :key="key" class="data-item">
            <span class="item-label">{{ label }}：</span>
            <span class="item-value">{{ formatDisplayValue(key, projectData[key]) }}</span>
          </div>
        </div>
        <div v-else class="empty-status">
          暂无数据，请点击下方按钮添加项目
        </div>
      </Card>
      <Divider type="horizontal" />
      <div class="btnCla">
        <Button type="text" @click="selectProject()">添加项目</Button>
      </div>
    </Card>
    <ProjectDrawerModule/>
  </div>
</template>

<style scoped lang="scss">
.projectCard{
  .title{
    font-size: 14px;
    font-weight: 600;
  }

  .infoTop{
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
    height: 500px;
    margin: 10px 0 0;
    background-color: #fff;
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
          background-color: #f5f5f5; // 浅灰色背景，你也可以换成 #e6f7ff (antd风格蓝)
        }

        .item-label {
          flex-shrink: 0;
          width: 90px; // 固定标签宽度，使冒号对齐
          color: #666;
        }

        .item-value {
          flex: 1;          // 占据剩余全部空间
          padding-right: 10px;      // 留点右边距
          overflow: hidden;         // 超出部分隐藏
          text-overflow: ellipsis;  // 显示省略号
          color: #333;
          white-space: nowrap;      // 强制不换行
          cursor: pointer;          // 鼠标移上去显示手型，暗示可交互
        }
      }
    }
    
    .empty-status {
      padding: 40px 0;
      color: #999;
      text-align: center;
    }
  }

  .btnCla{
    display: flex;
    justify-content: center;
    // align-items: center;
    width: 100%;
  }
}
</style>
