<script lang="ts" setup>
import { ref, nextTick, watch, onMounted,  onUnmounted } from 'vue';
import { message, Button } from 'ant-design-vue';
import {platformCallbackApi, behavioraPlatformApi} from "#/api/core/ocpx";
import {$t} from '@vben/locales';
import {useVbenForm} from '#/adapter/form';
import type { eventMappingType, BehavioraPlatformItem } from '#/api/models/ocpx';
// 定义数据类型接口
interface EventItem {
  id: string;
  name: string;
}
interface LeftEventItem extends EventItem {
  isSelected: boolean;
}
interface Connection {
  leftId: string;
  rightId: string;
}
interface BehaviorPlatformInfo  {
  label: string;
  platform: string;
}
const props = defineProps<{
  callbackPlatform: string;
  editEventMappingRules: eventMappingType[];
}>();
const behaviorPlatfrom = ref<BehaviorPlatformInfo>({});
const emit = defineEmits(['eventSubmit']);
const mappingList = ref<any[]>([]);
const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'ApiSelect',
      // 对应组件的参数
      componentProps: {
        placeholder: `${$t('common.input')}`,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        api: async () => {
          const  params = {
            page: 1,
            pageSize: 1000,
          }
          return  await behavioraPlatformApi.fetchBehavioraPlatformList(params);
        },
        valueField: 'id',
        labelField: 'name',        // 两个接口返回的数据都有 name 字段，直接固定
        resultField: 'items',
        onSelect: async (value: string, node: any) => {
          behaviorPlatfrom.value = node;
          const res =  await platformCallbackApi.fetchPlatformCallbackBehaviorTypeItem(node.platform);
          leftItems.value = res.map(item => {
            return {
              id: item.value,
              name: item.label,
              isSelected: false,
            }
          });
        },
      },
      // 字段名
      fieldName: 'behaviorPlatform',
      // 界面显示的label
      label: '转化平台',
      rules: 'required',
    }
  ]
})
// 模拟数据
const leftItems = ref<LeftEventItem[]>([]);

const rightItems = ref<EventItem[]>([]);

const connections = ref<Connection[]>([]);
const selectedLeftId = ref();
const selectedRightId = ref();
const selectedLeftList = ref<string[]>([]);
// 检查左侧事件是否已经存在于已确认的对应关系中
function isLeftEventMapped(leftId: string): boolean {
  return mappingList.value.some(group => 
    group.leftItems.some((item: EventItem) => item.value === leftId)
  );
}
function handleLeftClick(item: LeftEventItem) {
  // 如果该左侧事件已经存在于已确认的对应关系中，禁止操作
  if (isLeftEventMapped(item.id)) {
    message.warning('该事件已存在对应关系，不能重复添加');
    return;
  }
  
  selectedLeftId.value = item.id;
  item.isSelected = true;
  if(selectedLeftList.value.includes(item.id)) {
    item.isSelected = false;
    selectedLeftList.value = selectedLeftList.value.filter(id => id !== item.id);
    connections.value = connections.value.filter(conn => conn.leftId !== item.id);
  } else {
    selectedLeftList.value.push(item.id);
  }
  if(selectedRightId.value) {
    addConnection(item.id, selectedRightId.value);
    nextTick(() => {
      connectAll();
    })
  }
}
function handleRightClick(item: EventItem) {
  selectedRightId.value = item.id;
  for(let i = 0; i < selectedLeftList.value.length; i++) {
    const leftId = selectedLeftList.value[i];
    addConnection(leftId, item.id);
  }
  nextTick(() => {
    connectAll();
  })
}
function addConnection(leftId: string, rightId: string) {
  if (connections.value.some(conn => conn.leftId === leftId && conn.rightId === rightId)) {
    message.warning('该关系已存在');
    return false;
  }
  const leftItem = leftItems.value.find(item => item.id === leftId);
  if(leftItem && leftItem.isSelected) {
    connections.value.push({ leftId, rightId });
  }
  
  return true;
}
const isConfirm = ref(false);
const eventMappingRules = ref<eventMappingType[]>([]);
// 确认对应关系
async function confirmMapping() {
  isConfirm.value = true;
  const formValues = await formApi.getValues();
  const params  = {
    behaviorPlatformId: formValues.behaviorPlatform,
    behaviorPlatform: behaviorPlatfrom.value.platform,
    behaviorEventTypes: selectedLeftList.value,
    callbackEventType: selectedRightId.value
  }
  eventMappingRules.value.push(params as eventMappingType);
  await getMappingList();
  connections.value = [];
  selectedLeftList.value = [];
  selectedRightId.value = null;
  selectedLeftId.value = null;
  leftItems.value.forEach(item => {
    item.isSelected = false;
  })
  emit('eventSubmit', eventMappingRules.value);
}
const canvasRef = ref<HTMLCanvasElement | null>(null)
// 绘制所有连线
function connectAll() {
  if (!canvasRef.value) return
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const container = document.querySelector('.connector-container')
  if (!container) return
  
  const containerRect = container.getBoundingClientRect()
  canvas.width = containerRect.width
  canvas.height = containerRect.height
  canvas.style.width = `${containerRect.width}px`
  canvas.style.height = `${containerRect.height}px`
  
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (connections.value.length === 0) return

  ctx.strokeStyle = '#409eff';
  ctx.lineWidth = 2;
  // 箭头配置
  const arrowSize = 6;
  const offset = 4;
  for(let i = 0; i < connections.value.length; i++) {
    const conn = connections.value[i];
    const leftItem = document.querySelector(`.left-item[data-id="${conn.leftId}"]`);
    const rightItem = document.querySelector(`.right-item[data-id="${conn.rightId}"]`);
    const rightColumn = document.querySelector('.right-column');
    const mappingColumn = document.querySelector('.mapping-column');
    if (!leftItem || !rightItem) {
      continue;
    }
    if (!rightColumn || !mappingColumn) {
      continue;
    }
    const leftItemRect = leftItem?.getBoundingClientRect();
    const rightItemRect = rightItem?.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const startX = leftItemRect.right + offset - canvasRect.left;
    const endX = rightItemRect.left - offset - canvasRect.left;
    const startY = leftItemRect.top + leftItemRect.height / 2 - canvasRect.top;
    const endY = rightItemRect.top + rightItemRect.height / 2 - canvasRect.top;
    // 绘制贝塞尔曲线
    ctx.beginPath()
    const cp1x = startX + (endX - startX) * 0.25
    const cp1y = startY
    const cp2x = endX - (endX - startX) * 0.25
    const cp2y = endY
    
    ctx.moveTo(startX, startY)
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY)
    ctx.stroke()
    // 绘制箭头
    const angle = Math.atan2(endY - startY, endX - startX)
    const arrowX = endX
    const arrowY = endY
    ctx.beginPath()
    ctx.fillStyle = '#409eff'
    ctx.moveTo(arrowX, arrowY)
    ctx.lineTo(arrowX - arrowSize * Math.cos(angle - Math.PI / 6), arrowY - arrowSize * Math.sin(angle - Math.PI / 6))
    ctx.lineTo(arrowX - arrowSize * Math.cos(angle + Math.PI / 6), arrowY - arrowSize * Math.sin(angle + Math.PI / 6))
    ctx.fill()
  }
}
function setMappingList(value: eventMappingType[]) {
  value.forEach(item => {
    if(item.callbackEventType.value) {
      mappingList.value.push({
        rightId: item.callbackEventType.value,
        rightName: item.callbackEventType.label,
        leftItems: item.behaviorEventTypes
      })
    }

  })
}
 async function getMappingList() {
  const map = new Map()
  connections.value.forEach(conn => {
    const leftItem = leftItems.value.find(l => l.id === conn.leftId)
    const rightItem = rightItems.value.find(r => r.id === conn.rightId)
    if (!leftItem || !rightItem) return

    if (!map.has(conn.rightId)) {
      map.set(conn.rightId, {
        label: behaviorPlatfrom.value.label,
        rightId: conn.rightId,
        rightName: rightItem.name,
        leftItems: []
      })
    }
    const group = map.get(conn.rightId)
    if (!group.leftItems.some(l => l.value === conn.leftId)) {
      group.leftItems.push({ value: conn.leftId, label: leftItem.name })
    }
  })
  const mappingData = Array.from(map.values())
  mappingList.value = [...mappingData, ...mappingList.value]
}
function deleteConnection(leftId: string, rightId: string) {
  // connections.value = connections.value.filter(
  //   conn => conn.leftId !== leftId || conn.rightId !== rightId
  // );
  // selectedLeftList.value = selectedLeftList.value.filter(id => id !== leftId);
  mappingList.value = mappingList.value.filter(item => {
    item.leftItems = item.leftItems.filter(l => l.label !== leftId);
    return item.leftItems.length > 0;
  });
}
function clearAllConnections() {
  connections.value = [];
  selectedRightId.value = null;
  selectedLeftList.value = [];
  leftItems.value.forEach(item => {
    item.isSelected = false
  });
  mappingList.value = [];
  eventMappingRules.value = [];
  connectAll();
}
let containerResizeObserver = ref<ResizeObserver | null>(null)
// 监听容器大小变化和滚动，重新绘制线条
function bindResizeAndScrollListener() {
  const container = document.querySelector('.connector-container')
  if (!container) return
  
  if (window.ResizeObserver) {
    containerResizeObserver.value = new ResizeObserver(() => {
      connectAll()
    })
    containerResizeObserver.value.observe(container)
  }
  
  window.addEventListener('resize', connectAll)
  const leftList = document.querySelector('.left-column .items-list')
  const rightList = document.querySelector('.right-column .items-list')
  if (leftList) leftList.addEventListener('scroll', connectAll)
  if (rightList) rightList.addEventListener('scroll', connectAll)
}

// 清理监听器
function unbindResizeAndScrollListener() {
  if (containerResizeObserver.value) {
    containerResizeObserver.value.disconnect()
    containerResizeObserver.value = null
  }
  window.removeEventListener('resize', connectAll)
  const leftList = document.querySelector('.left-column .items-list')
  const rightList = document.querySelector('.right-column .items-list')
  if (leftList) leftList.removeEventListener('scroll', connectAll)
  if (rightList) rightList.removeEventListener('scroll', connectAll)
}

watch((connections),() => {
  nextTick(() => {
    connectAll()
  })
},{deep: true})

watch(() => selectedLeftList.value, (val) => {
  if(val.length === 0) {
    selectedRightId.value = null;
    selectedLeftId.value = null;
    isConfirm.value = false;
  }
},{deep: true})

watch(() => props.callbackPlatform,async (val) => {
  if(val) {
    const res =  await platformCallbackApi.fetchPlatformCallbackBehaviorTypeItem(val);
    rightItems.value = res.map(item => {
      return {
        id: item.value,
        name: item.label
      }
    });
  }
},{deep: true,immediate: true})
watch(() => props.editEventMappingRules,async (val) => { 
  if(val) {
    eventMappingRules.value = val.map(item => {
      return {
        behaviorPlatformId: item.behaviorPlatformId,
        behaviorPlatform: item.behaviorPlatform,
        behaviorEventTypes: item.behaviorEventTypes.map(item => item.value),
        callbackEventType: item.callbackEventType.value
      }
    });
    setMappingList(val);
  }
},{deep: true,immediate: true})
onMounted(() => {
  nextTick(() => {
    connectAll()
    bindResizeAndScrollListener()
  })
})
onUnmounted(() => {
  unbindResizeAndScrollListener()
})
</script>
<template> 
  <div class="connector-container">
    <Form/>
    <div class="columns-wrapper" v-if="leftItems.length > 0 || rightItems.length > 0">
      <div class="column left-column">
        <div class="event-item left-item" :data-id="item.id" :class="{ 'selected': item.isSelected}" v-for="item in leftItems" :key="item.id" @click="handleLeftClick(item)">
          {{ item.name }}
        </div>
      </div>
      <div class="column right-column">
        <div class="event-item right-item" :data-id="item.id" :class="{ 'selected': selectedRightId === item.id }" v-for="item in rightItems" :key="item.id" @click="handleRightClick(item)">
          {{ item.name }}
        </div>
      </div>
      <div class="column mapping-column">
        <h3>对应关系</h3>
        <!-- <div class="platforms-mapping">
          <div class="callback-platform">回传平台</div>
          <div class="behavior-platform">转化平台</div>
        </div> -->
        <div class="mapping-content" v-if="mappingList.length > 0">
          <div v-for="mapping in mappingList" :key="mapping.rightId" class="mapping-group">
            <div class="label-name">{{ mapping.label || '----------' }}</div>
            <div class="mapping-item">
              <div v-for="left  in mapping.leftItems" :key="left.label" class="right-tag">{{ left.label }}
                <span class="delete-btn" @click="deleteConnection(left.label, mapping.rightId)">✕</span>
              </div>
              <div>=></div>
              <div class="left-item">{{ mapping.rightName  }}</div>
            </div>
          </div>
        </div>
        <div v-else  class="empty-mapping">暂无数据</div>
      </div>
    </div>
    <div class="actions">
      <Button @click="confirmMapping" class="btn confirm-btn" type="primary"  v-if="connections.length > 0">确定</Button>
      <Button @click="clearAllConnections" class="btn clear-btn ml-8" v-if="mappingList.length > 0">清除所有连线</Button>
    </div>
    <canvas ref="canvasRef"  class="line-canvas" :style="{ pointerEvents: 'none' }"></canvas>
  </div>
</template>
<style lang="scss" scoped>
.connector-container { 
  position: relative;
  .columns-wrapper {
    display: flex;
    justify-content: space-around;
    align-items: center;
    .column {
      font-size: 14px;
      border: 1px solid #e4e4e4;
      border-radius: 8px;
      padding: 10px;
      width: 20%;
      min-height: 365px;
      max-height: 365px;
      overflow-y: auto;
      .event-item {
        margin: 5px 0;
        background: #f0f5ff;
        border-radius: 6px;
        color: #2c3e50;
        padding: 10px;
        cursor: pointer;
        &.selected, &:hover {
          background: hsl(var(--primary));
          color: white;
          border-color: hsl(var(--primary));
        }
      }
    }
    .left-column {
      .event-item {

      }
    }
    .right-column {
      
    }
    .mapping-column {
      width: 30%;
      background: #f0f5ff;
      h3 {
        color: hsl(var(--primary));
        margin-bottom: 20px;
        text-align: center;
      }
      .platforms-mapping {
        display: flex;
        justify-content: flex-start;
        gap: 60px;
        margin-bottom: 10px;
        .callback-platform {
          color: hsl(var(--primary));
          font-weight: bold;
        }
        .behavior-platform {
          color: hsl(var(--primary));
          font-weight: bold;
        }
      }
      .mapping-content {
        .mapping-group {
        .label-name {
          border: 1px solid hsl(var(--primary));
          border-radius: 10px;
          padding: 5px 10px;
          margin-bottom: 10px;
          width: fit-content;
          background-color: hsl(var(--primary));
          color: #fff;
        }
          .mapping-item {
            display: flex;
            gap:12px;
            align-items: center;
            margin-bottom: 10px;
            color: hsl(var(--primary));
            flex-wrap: wrap;
            .left-item {
              border: 1px solid hsl(var(--primary));
              border-radius: 10px;
              padding: 5px 10px;
            }
            .right-tag {
              border: 1px solid hsl(var(--primary));
              padding: 5px 10px;
              border-radius: 10px;
              cursor: pointer;
              .delete-btn {
                font-size: 12px;
              }
              &:hover {
                background: hsl(var(--primary));
                color: #fff;
              }
            }
          }
        }
      }
      .empty-mapping {
        color: #b8b3b3;
        text-align: center;
      }
    }
  }
  .actions {
    margin-top: 20px;
    text-align: center;
  }
  .line-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
  }
}
</style>
