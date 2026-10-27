<script lang="ts" setup name="PersonaDrawer">
import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import {
  Button,
  Card,
  Input,
  message,
  Select,
  Slider,
  Spin,
  Switch,
} from 'ant-design-vue';

import { aiAssetApi } from '#/api';

const emit = defineEmits<{ success: [] }>();

type FieldType = 'chips' | 'input' | 'select' | 'slider';

interface Field {
  default?: any;
  key: string;
  label: string;
  options?: string[];
  type: FieldType;
}

interface Section {
  fields: Field[];
  key: string;
  title: string;
}

const SECTIONS: Section[] = [
  {
    key: 'emotion',
    title: '情感经历',
    fields: [
      { key: 'emotionState', label: '情感状态', type: 'select', options: ['单身', '恋爱中', '已婚', '离异', '丧偶'] },
      { key: 'emotionRich', label: '情感丰富度', type: 'slider' },
      { key: 'express', label: '情感表达方式', type: 'select', options: ['内敛', '热情', '细腻', '理性'] },
      { key: 'loveView', label: '对爱情的态度', type: 'select', options: ['理想化', '现实化', '悲观', '乐观', '复杂矛盾'] },
    ],
  },
  {
    key: 'stance',
    title: '立场观点',
    fields: [
      { key: 'justice', label: '正义感', type: 'slider' },
      { key: 'empathy', label: '同理心', type: 'slider' },
      { key: 'moral', label: '道德底线', type: 'select', options: ['严格', '灵活', '模糊'] },
      { key: 'humanity', label: '对人性的看法', type: 'select', options: ['性善论', '性恶论', '复杂论'] },
      { key: 'issues', label: '关注议题', type: 'chips', options: ['社会公平', '科技发展', '文化传承', '教育改革', '环境保护'] },
    ],
  },
  {
    key: 'life',
    title: '生活阅历',
    fields: [
      { key: 'ageGroup', label: '年龄段', type: 'select', options: ['青少年', '青年', '中年', '老年'] },
      { key: 'wealth', label: '财富经历', type: 'select', options: ['贫困', '普通', '小康', '富裕', '大起大落'] },
      { key: 'health', label: '健康状况', type: 'select', options: ['健康', '小病不断', '重大疾病'] },
      { key: 'philosophy', label: '人生哲学', type: 'select', options: ['实用主义', '理想主义', '享乐主义', '存在主义'] },
      { key: 'travel', label: '旅行经历', type: 'select', options: ['本地', '国内', '国际', '环球'] },
    ],
  },
  {
    key: 'education',
    title: '学历背景',
    fields: [
      { key: 'degree', label: '最高学历', type: 'select', options: ['高中及以下', '大专', '本科', '硕士', '博士'] },
      { key: 'major', label: '专业领域', type: 'input' },
      { key: 'knowledgeWide', label: '知识广度', type: 'slider' },
      { key: 'knowledgeDeep', label: '知识深度', type: 'slider' },
      { key: 'thinking', label: '思维方式', type: 'chips', options: ['逻辑思维', '创造性思维', '批判性思维', '系统思维', '直觉思维'] },
    ],
  },
  {
    key: 'family',
    title: '成长环境',
    fields: [
      { key: 'birthPlace', label: '出生地类型', type: 'select', options: ['农村', '小城镇', '中小城市', '大城市', '一线城市'] },
      { key: 'familyStructure', label: '家庭结构', type: 'select', options: ['核心家庭', '单亲', '大家庭', '重组家庭', '孤儿'] },
      { key: 'economy', label: '家庭经济', type: 'select', options: ['贫困', '低收入', '中产阶级', '中上阶层', '富裕'] },
      { key: 'parenting', label: '教育方式', type: 'select', options: ['权威型', '专制型', '放任型', '忽视型', '民主型'] },
      { key: 'childhood', label: '童年氛围', type: 'select', options: ['温馨', '压抑', '动荡', '孤独', '自由'] },
    ],
  },
  {
    key: 'social',
    title: '生活圈子',
    fields: [
      { key: 'activity', label: '社交活跃度', type: 'slider' },
      { key: 'familyRel', label: '家人关系', type: 'slider' },
      { key: 'friendRel', label: '朋友关系', type: 'slider' },
      { key: 'colleagueRel', label: '同事关系', type: 'slider' },
    ],
  },
  {
    key: 'writing',
    title: '写作风格',
    fields: [
      { key: 'formality', label: '正式程度', type: 'slider' },
      { key: 'density', label: '情感浓度', type: 'slider' },
      { key: 'complexity', label: '语言复杂度', type: 'slider' },
      { key: 'genres', label: '擅长题材', type: 'chips', options: ['都市', '悬疑', '言情', '科幻', '古装', '校园'] },
      { key: 'taboo', label: '创作禁忌', type: 'chips', options: ['血腥暴力', '失忆梗', '车祸梗', '绝症梗', '圣母', '工具人'] },
    ],
  },
  {
    key: 'habit',
    title: '创作习惯',
    fields: [
      { key: 'bestTime', label: '最佳创作时间', type: 'select', options: ['清晨', '白天', '深夜', '随机'] },
      { key: 'updateFreq', label: '更新频率', type: 'select', options: ['日更', '隔日更', '周更', '不定期'] },
      { key: 'wordsPerTime', label: '单次字数', type: 'select', options: ['1000 以下', '1000-3000', '3000-5000', '5000 以上'] },
      { key: 'outlineHabit', label: '大纲习惯', type: 'select', options: ['无大纲', '简纲', '细纲', '完整大纲'] },
    ],
  },
  {
    key: 'psychology',
    title: '心理特征',
    fields: [
      { key: 'mbti', label: 'MBTI（可选）', type: 'select', options: ['不测试', 'INTJ', 'INTP', 'ENTJ', 'ENFP', 'INFP', 'ISTJ'] },
    ],
  },
];

const isUpdate = ref(false);
const loading = ref(false);
const saving = ref(false);
const form = ref({
  name: '',
  description: '',
  isDefault: false,
  profile: {} as Record<string, Record<string, any>>,
});

function ensureProfile() {
  SECTIONS.forEach((section) => {
    form.value.profile[section.key] ??= {};
    section.fields.forEach((field) => {
      form.value.profile[section.key]![field.key] ??=
        field.type === 'chips' ? [] : field.type === 'slider' ? 5 : field.default ?? '';
    });
  });
}

function toggleChip(sectionKey: string, fieldKey: string, value: string) {
  const list: string[] = form.value.profile[sectionKey]?.[fieldKey] ?? [];
  const index = list.indexOf(value);
  if (index >= 0) {
    list.splice(index, 1);
  } else {
    list.push(value);
  }
  form.value.profile[sectionKey]![fieldKey] = [...list];
}

const [Drawer, drawerApi] = useVbenDrawer({
  onConfirm: async () => {
    if (!form.value.name.trim()) {
      message.warning('请输入人设名称');
      return;
    }
    saving.value = true;
    try {
      await aiAssetApi.savePersona({
        description: form.value.description || undefined,
        id: (drawerApi.getData() as any)?.id,
        isDefault: form.value.isDefault,
        name: form.value.name.trim(),
        profile: form.value.profile,
      });
      emit('success');
      await drawerApi.close();
      message.success('人设已保存');
    } catch (error: any) {
      message.error(error?.message || '保存失败');
    } finally {
      saving.value = false;
    }
  },
  async onOpenChange(open) {
    if (!open) {
      return;
    }
    const { id } = (drawerApi.getData() as any) ?? {};
    isUpdate.value = Boolean(id);
    loading.value = true;
    form.value = { name: '', description: '', isDefault: false, profile: {} };
    ensureProfile();
    if (id) {
      try {
        const detail = await aiAssetApi.fetchPersonaDetail(id);
        form.value.name = detail.name ?? '';
        form.value.description = detail.description ?? '';
        form.value.isDefault = Boolean(detail.isDefault);
        form.value.profile = {
          ...form.value.profile,
          ...(detail.profile ?? {}),
        };
        ensureProfile();
      } catch (error: any) {
        message.error(error?.message || '加载人设失败');
      }
    }
    loading.value = false;
  },
});
</script>

<template>
  <Drawer :title="isUpdate ? '编辑作者人设' : '新建作者人设'" :loading="saving">
    <Spin :spinning="loading">
      <div class="persona-form">
        <Card size="small" title="基本信息">
          <label class="pf-item">
            <span>人设名称 <em>*</em></span>
            <Input v-model:value="form.name" placeholder="例如：现实主义作家" />
          </label>
          <label class="pf-item">
            <span>人设描述</span>
            <Input v-model:value="form.description" placeholder="一句话描述风格" />
          </label>
          <label class="pf-item pf-item--row">
            <span>设为默认人设</span>
            <Switch v-model:checked="form.isDefault" />
          </label>
        </Card>

        <Card
          v-for="section in SECTIONS"
          :key="section.key"
          size="small"
          :title="section.title"
        >
          <div class="pf-grid">
            <div v-for="field in section.fields" :key="field.key" class="pf-field">
              <span>{{ field.label }}</span>
              <Select
                v-if="field.type === 'select'"
                v-model:value="form.profile[section.key]![field.key]"
                :options="(field.options ?? []).map((item) => ({ label: item, value: item }))"
              />
              <Input
                v-else-if="field.type === 'input'"
                v-model:value="form.profile[section.key]![field.key]"
              />
              <Slider
                v-else-if="field.type === 'slider'"
                v-model:value="form.profile[section.key]![field.key]"
                :max="10"
                :min="1"
              />
              <div v-else class="pf-chips">
                <Button
                  v-for="option in field.options ?? []"
                  :key="option"
                  size="small"
                  :type="
                    (form.profile[section.key]?.[field.key] ?? []).includes(option)
                      ? 'primary'
                      : 'default'
                  "
                  @click="toggleChip(section.key, field.key, option)"
                >
                  {{ option }}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Spin>
  </Drawer>
</template>

<style scoped lang="scss">
.persona-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pf-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 13px;

  em {
    font-style: normal;
    color: hsl(var(--destructive));
  }

  &--row {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0;
  }
}

.pf-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
}

.pf-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.pf-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
