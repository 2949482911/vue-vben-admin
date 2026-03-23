<script setup lang="ts">
import {computed, ref} from 'vue';
import {Button, Input} from 'ant-design-vue';
import {useVbenModal} from '@vben/common-ui';

const emit = defineEmits(['update:ruleInfo']);

const {ruleInfo} = defineProps({
  ruleInfo: {
    type: Object,
    default: () => {
      return {
        projectRuleKey: "",
        projectCount: 1,
        adRuleKey: "",
        adCount: 1,
      }
    }
  }
});

// 1. 定义规则选项数据
const projectRules = [
  {title: '根据定向包生成', desc: '项目数量与定向包数量相等', key: 'targeting'},
  {
    title: '根据创意组生成',
    desc: '项目数量与创意组数量相等，项目中的广告都使用相同的素材',
    key: 'creative'
  },
  {
    title: '根据标题包生成',
    desc: '项目数量与标题包数量相等，项目中的广告都使用相同的标题包',
    key: 'title'
  },
  {title: '指定数量', desc: '手动指定每个账户的项目数量', key: 'custom'},
];

const adRules = [
  {
    title: '按创意组数',
    desc: '按创意组数生成广告，自动匹配标题包，标题包不足时循环使用',
    key: 'creative'
  },
  {
    title: '按标题包数',
    desc: '按标题包数生成广告，自动匹配创意数，创意数不足时循环使用',
    key: 'title'
  },
  // {title: '按创意组*标题包', desc: '基于创意组*标题包自动生成广告', key: 'mix'},
  {title: '指定数量', desc: '先指定广告数量，自动循环使用素材和标题，多退少补', key: 'custom'},
];

const selectedProjectRule = ref('targeting');
const selectedAdRule = ref('creative');
const projectCount = ref(1);
const adCount = ref(1);

// 顶部展示文本：依然绑定正式变量
const displayDisplayText = computed(() => {
  let projectText = projectRules.find(r => r.key === ruleInfo.projectRuleKey)?.title || '';
  if (ruleInfo.projectRuleKey === 'custom') projectText = `指定数量 ${ruleInfo.projectCount}`;

  let adText = adRules.find(r => r.key === ruleInfo.adRuleKey)?.title || '';
  if (ruleInfo.adRuleKey === 'custom') adText = `指定数量 ${ruleInfo.adCount}`;

  return {projectText, adText};
});

const [Modal, modalApi] = useVbenModal({
  contentClass: 'rule-modal-content',
  async onConfirm() {
    ruleInfo.projectRuleKey = selectedProjectRule.value
    ruleInfo.adRuleKey = selectedAdRule.value
    ruleInfo.projectCount = projectCount.value
    ruleInfo.adCount = adCount.value

    // 3. 点击确认：将临时变量同步给正式变量，此时顶部文字才会变化
    emit('update:ruleInfo', ruleInfo);
    await modalApi.close();
  }
});

/**
 * 打开弹窗
 */
function ruleConfigurationEvent() {
  // 4. 打开弹窗：将当前正式变量的值回显给临时变量
  selectedProjectRule.value = ruleInfo.projectRuleKey;
  selectedAdRule.value = ruleInfo.adRuleKey;
  projectCount.value = ruleInfo.projectCount;
  adCount.value = ruleInfo.adCount;
  modalApi.open();
}
</script>

<template>
  <div class="p-4">
    <div class="display-header">
      <div class="info-tag">
        <span class="label">项目：</span>
        <span class="value">{{ displayDisplayText.projectText }}</span>
        <span class="label ml-4">广告：</span>
        <span class="value">{{ displayDisplayText.adText }}</span>
      </div>
      <Button type="primary" @click="ruleConfigurationEvent">规则配置</Button>
    </div>

    <Modal class="w-[900px]" title="规则配置">
      <div class="rule-container">
        <div class="rule-section">
          <div class="label">项目生成规则</div>
          <div class="options-grid">
            <div
              v-for="item in projectRules"
              :key="item.key"
              class="option-card"
              :class="{ active: selectedProjectRule === item.key }"
              @click="selectedProjectRule = item.key"
            >
              <div class="option-title">{{ item.title }}</div>
              <div class="option-desc">{{ item.desc }}</div>
            </div>
          </div>
        </div>

        <div v-if="selectedProjectRule === 'custom'" class="input-row">
          <div class="label">每个账户指定项目数</div>
          <Input v-model:value="projectCount" style="width: 200px" placeholder="请输入数量"/>
        </div>

        <div class="rule-section">
          <div class="label">广告生成规则</div>
          <div class="options-grid">
            <div
              v-for="item in adRules"
              :key="item.key"
              class="option-card"
              :class="{ active: selectedAdRule === item.key }"
              @click="selectedAdRule = item.key"
            >
              <div class="option-title">{{ item.title }}</div>
              <div class="option-desc">{{ item.desc }}</div>
            </div>
          </div>
        </div>

        <div v-if="selectedAdRule === 'custom'" class="input-row">
          <div class="label">每个项目指定广告数</div>
          <Input v-model:value="adCount" style="width: 200px" placeholder="请输入数量"/>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped lang="scss">
.display-header {
  display: flex;
  gap: 12px;
  align-items: center;

  .info-tag {
    display: flex;
    align-items: center;
    padding: 4px 12px;
    font-size: 13px;
    border: 1px solid #006be6;
    border-radius: 4px;

    .label {
      color: #666;
    }

    .value {
      font-weight: 500;
      color: #006be6;
    }

    .ml-4 {
      margin-left: 16px;
    }
  }
}

.rule-container {
  padding: 10px;

  .rule-section {
    display: flex;
    margin-bottom: 20px;

    .label {
      flex-shrink: 0;
      width: 100px;
      padding-top: 10px;
      font-size: 14px;
      color: #666;
    }

    .options-grid {
      display: flex;
      flex: 1;
      gap: 12px;
    }
  }

  .option-card {
    flex: 1;
    padding: 12px;
    cursor: pointer;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    transition: all 0.3s;

    &:hover {
      border-color: #006be6;
    }

    &.active {
      // background-color: #f6ffed;
      border-color: #006be6;

      .option-title {
        color: #006be6;
      }
    }

    .option-title {
      margin-bottom: 4px;
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }

    .option-desc {
      font-size: 12px;
      line-height: 1.4;
      color: #999;
    }
  }

  .input-row {
    display: flex;
    align-items: center;
    margin: -10px 0 20px 100px; // 对齐上方的 options-grid

    .label {
      margin-right: 12px;
      font-size: 13px;
    }
  }
}
</style>
