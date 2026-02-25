

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';

const days = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];

// 初始化 7天 x 48格 (半小时一格)
const schedule = reactive<boolean[][]>(
  Array.from({ length: 7 }, () => Array(48).fill(false))
);
const isDragging = ref(false);
const selectionMode = ref(true);

// --- 新增：记录鼠标操作的起始位置 ---
const startPos = reactive({ r: -1, c: -1 });

// --- 核心数据转换：生成 336 位 01 字符串 ---
const schedule_time = computed(() => {
  return schedule.map(row => row.map(cell => (cell ? '1' : '0')).join('')).join('');
});

const isEmpty = computed(() => schedule.every(row => row.every(cell => !cell)));

// 修改：按下鼠标时记录起始点
const handleCellMouseDown = (r: number, c: number) => {
  isDragging.value = true;
  
  // 方式 1：使用非空断言 ! 告诉 TS 这一行肯定存在
  // selectionMode.value = !schedule[r]![c]; 

  // 方式 2：更安全的写法，先提取行（推荐）
  const row = schedule[r];
  if (row) {
    selectionMode.value = !row[c]; // 确定本次是“勾选”还是“取消”
    row[c] = selectionMode.value;
  }
  
  startPos.r = r;
  startPos.c = c;
};
// 修改：滑入格子时，计算起始点到当前点的“矩形”并填充
const handleMouseEnter = (r: number, c: number) => {
  if (isDragging.value) {
    const minR = Math.min(startPos.r, r);
    const maxR = Math.max(startPos.r, r);
    const minC = Math.min(startPos.c, c);
    const maxC = Math.max(startPos.c, c);

    for (let i = minR; i <= maxR; i++) {
      // 1. 先提取行对象
      const row = schedule[i];
      // 2. 只有行对象存在时才进行内部循环
      if (row) {
        for (let j = minC; j <= maxC; j++) {
          // 此时 TS 已经知道 row 是 boolean[]，所以赋值 row[j] 是安全的
          row[j] = selectionMode.value;
        }
      }
    }
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
  startPos.r = -1;
  startPos.c = -1;
};

const clearAll = () => {
  schedule.forEach(row => row.fill(false));
};

// --- 时间格式化逻辑保持不变 ---
const getFormattedRange = (row: boolean[]) => {
  let segments = [];
  let start = null;
  for (let i = 0; i <= 48; i++) {
    if (row[i] && start === null) {
      start = i;
    } else if (!row[i] && start !== null) {
      segments.push(`${formatPoint(start)}-${formatPoint(i)}`);
      start = null;
    }
  }
  return segments.join('、');
};

const formatPoint = (index: number) => {
  const hour = Math.floor(index / 2);
  const minute = index % 2 === 0 ? '00' : '30';
  return `${String(hour).padStart(2, '0')}:${minute}`;
};
</script>

<template>
  <div class="schedule-container">
    <div class="table-wrapper">
      <div class="table-top-bar">
        <div class="legend">
          <span class="dot active"></span> 已选
          <span class="dot inactive"></span> 未选
        </div>
      </div>

      <table 
        class="schedule-table" 
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
      >
        <thead>
          <tr>
            <th rowspan="2" class="axis-label">周/时</th>
            <th colspan="24" class="period-header">00:00 - 12:00</th>
            <th colspan="24" class="period-header">12:00 - 24:00</th>
          </tr>
          <tr>
            <th v-for="h in 24" :key="h-1" colspan="2" class="hour-label">{{ h - 1 }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(day, rIndex) in days" :key="day">
            <td class="day-label">{{ day }}</td>
            <td
              v-for="cIndex in 48"
              :key="cIndex - 1"
              :class="['time-cell', { active: schedule[rIndex]?.[cIndex - 1] }]"
              @mousedown.stop="handleCellMouseDown(rIndex, cIndex - 1)"
              @mouseenter="handleMouseEnter(rIndex, cIndex - 1)"
            ></td>
          </tr>
        </tbody>
      </table>

      <div class="result-section">
        <div class="result-header">
          <span>已选择时间段</span>
          <span class="clear-btn" @click="clearAll">清空</span>
        </div>
        <!-- <div class="data-string">数据参数: {{ schedule_time }}</div> -->
        
        <div class="result-content">
          <div v-for="(day, rIndex) in days" :key="rIndex" class="result-line">
            <template v-if="getFormattedRange(schedule[rIndex] || [])">
              <span class="result-day">{{ day }}</span>
              <span class="result-time">{{ getFormattedRange(schedule[rIndex] || []) }}</span>
            </template>
          </div>
          <div v-if="isEmpty" class="empty-tip">可拖动鼠标选择时间段</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule-container { 
  /* padding: 20px;  */
  background-color: #fff; 
}

.table-wrapper { 
  display: inline-block;
   border: 1px solid #ebeef5; 
   border-radius: 4px; 
  }

.table-top-bar { 
  padding: 10px; 
  border-bottom: 1px solid #ebeef5; 
}

.legend { 
  display: flex; 
  gap: 15px; 
  font-size: 12px; 
}

.dot { 
  display: inline-block; 
  width: 12px; 
  height: 12px; 
  border-radius: 2px; 
}

.dot.active { 
  background-color: #2fb477; 
}

.dot.inactive { 
  border: 1px solid #ddd; 
}

.schedule-table { 
  cursor: crosshair; /* 鼠标变为十字准星，操作感更好 */ 
  user-select: none;
  table-layout: fixed; 
  border-collapse: collapse;
}

.schedule-table th, .schedule-table td { 
  text-align: center; 
  border: 1px solid #ebeef5; 
}

.axis-label { 
  width: 70px; 
  font-size: 12px; 
}

.period-header { 
  height: 28px; 
  font-size: 12px; 
  background: #fafafa; 
}

.hour-label { 
  width: 24px; 
  font-size: 11px; 
  background: #fafafa; 
}

.day-label { 
  width: 70px; 
  height: 32px; 
  font-size: 12px; 
  background: #fafafa; 
}

.time-cell {
  width: 12px;
  height: 30px;
  cursor: pointer;
  background-color: #fff;
  transition: background-color 0.05s; /* 极短的过渡让视觉更柔和 */
}

.time-cell.active { 
  background-color: #2fb477; 
}

.time-cell:hover { 
  background-color: #e8f7f0; 
}

.result-section { 
  max-width: 700px; 
  padding: 15px; 
  border-top: 1px solid #ebeef5; 
}

.result-header { 
  display: flex; 
  justify-content: space-between; 
  margin-bottom: 8px;
  font-size: 14px; 
  font-weight: bold;
}

.clear-btn { 
  font-weight: normal; 
  color: #2fb477; 
  cursor: pointer; 
}

.data-string { 
  padding: 8px; 
  margin-bottom: 10px; 
  font-family: monospace; 
  font-size: 10px;
  color: #909399; 
  word-break: break-all; 
  background: #f4f4f5;
}

.result-content { 
  font-size: 12px; 
  color: #606266; 
}

.result-line { 
  margin-bottom: 4px; 
}

.result-day { 
  display: inline-block; 
  width: 50px; 
  margin-right: 15px; 
  font-weight: bold; 
}

.empty-tip { 
  color: #999; 
  text-align: center; 
  }
</style>
