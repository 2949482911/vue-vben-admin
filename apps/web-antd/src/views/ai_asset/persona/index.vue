<script lang="ts" setup name="AiAssetAuthorPersona">
import type { PersonaItem } from '#/api/models/ai_asset';

import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  StarOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Empty,
  Input,
  message,
  Modal,
  Pagination,
  Tag,
} from 'ant-design-vue';

import { aiAssetApi } from '#/api';

import PersonaDrawer from './components/PersonaDrawer.vue';

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: PersonaDrawer,
});

const loading = ref(false);
const rows = ref<PersonaItem[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(12);
const keyword = ref('');
const search = ref('');

async function load() {
  loading.value = true;
  try {
    const res = await aiAssetApi.fetchPersonas({
      name: search.value || undefined,
      page: page.value,
      pageSize: pageSize.value,
    });
    rows.value = res?.items ?? [];
    total.value = res?.total ?? rows.value.length;
  } catch (error: any) {
    message.error(error?.message || '加载作者人设失败');
  } finally {
    loading.value = false;
  }
}

function doSearch() {
  search.value = keyword.value.trim();
  page.value = 1;
  void load();
}

function openCreate() {
  drawerApi.setData({});
  drawerApi.open();
}

function openEdit(item: PersonaItem) {
  drawerApi.setData({ id: item.id });
  drawerApi.open();
}

async function copy(item: PersonaItem) {
  try {
    await aiAssetApi.copyPersona({ sourceId: item.id });
    await load();
    message.success('已复制人设');
  } catch (error: any) {
    message.error(error?.message || '复制失败');
  }
}

async function setDefault(item: PersonaItem) {
  try {
    await aiAssetApi.setDefaultPersona(item.id);
    await load();
    message.success('已设为默认人设');
  } catch (error: any) {
    message.error(error?.message || '设置失败');
  }
}

function remove(item: PersonaItem) {
  Modal.confirm({
    title: `删除人设「${item.name}」？`,
    content: '已绑定该书的人设不会被删除，但书的绑定会失效。',
    okType: 'danger',
    async onOk() {
      await aiAssetApi.batchPersonaOptions({
        targetIds: [String(item.id)],
        type: 'delete',
        values: {},
      });
      await load();
      message.success('已删除');
    },
  });
}

function profileMeta(item: PersonaItem) {
  const profile = item.profile ?? {};
  const emotion = profile.emotion ?? {};
  const education = profile.education ?? {};
  return [emotion.emotionState, emotion.express, education.mbti]
    .filter(Boolean)
    .join(' · ');
}

onMounted(load);
</script>

<template>
  <Page auto-content-height>
    <div class="persona-shell">
      <Card class="persona-card">
        <div class="persona-body">
          <div class="persona-toolbar">
            <Input
              v-model:value="keyword"
              allow-clear
              placeholder="搜索人设名称"
              style="width: 240px"
              @change="!keyword && doSearch()"
              @press-enter="doSearch"
            >
              <template #prefix><SearchOutlined /></template>
            </Input>
            <span class="muted">共 {{ total }} 个</span>
            <span class="spacer"></span>
            <Button type="primary" @click="openCreate">
              <template #icon><PlusOutlined /></template>
              新建人设
            </Button>
          </div>

          <div class="persona-scroll">
            <Empty
              v-if="!loading && rows.length === 0"
              :image="Empty.PRESENTED_IMAGE_SIMPLE"
              description="还没有作者人设，新建一个让 AI 更懂你的文风"
              class="persona-empty"
            />
            <div v-else class="persona-grid">
              <Card v-for="item in rows" :key="item.id" size="small" class="persona-item">
                <div class="persona-item__hd">
                  <span class="persona-avatar">{{ item.name.slice(0, 1) }}</span>
                  <div class="persona-item__name">
                    <b>{{ item.name }}</b>
                    <span>{{ profileMeta(item) || '未配置维度' }}</span>
                  </div>
                  <Tag v-if="item.isDefault" color="gold" :bordered="false">默认</Tag>
                </div>
                <p class="persona-item__desc">{{ item.description || '暂无描述' }}</p>
                <div class="persona-item__foot">
                  <span>{{ item.updateTime || item.createTime || '' }}</span>
                  <div class="persona-item__actions">
                    <Button type="link" size="small" @click="openEdit(item)">
                      <template #icon><EditOutlined /></template>编辑
                    </Button>
                    <Button type="link" size="small" @click="copy(item)">
                      <template #icon><CopyOutlined /></template>复制
                    </Button>
                    <Button
                      v-if="!item.isDefault"
                      type="link"
                      size="small"
                      @click="setDefault(item)"
                    >
                      <template #icon><StarOutlined /></template>设为默认
                    </Button>
                    <Button type="link" size="small" danger @click="remove(item)">
                      <template #icon><DeleteOutlined /></template>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div v-if="total > pageSize" class="persona-pager">
            <Pagination
              v-model:current="page"
              :page-size="pageSize"
              :total="total"
              show-size-changer
              :show-total="(value: number) => `共 ${value} 个`"
              @change="load"
            />
          </div>
        </div>
      </Card>
    </div>

    <Drawer @success="load" />
  </Page>
</template>

<style scoped lang="scss">
.persona-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.persona-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;

  :deep(.ant-card-body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 14px 16px;
  }
}

.persona-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.persona-toolbar {
  display: flex;
  flex: none;
  gap: 10px;
  align-items: center;
  margin-bottom: 14px;
}

.spacer {
  flex: 1;
}

.muted {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.persona-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.persona-empty {
  padding: 48px 0;
}

.persona-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.persona-item {
  display: flex;
  flex-direction: column;

  &__hd {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 8px;
  }

  &__name {
    flex: 1;
    min-width: 0;

    b {
      display: block;
      font-size: 14px;
    }

    span {
      font-size: 11px;
      color: hsl(var(--muted-foreground));
    }
  }

  &__desc {
    display: -webkit-box;
    margin: 0 0 10px;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.6;
    color: hsl(var(--muted-foreground));
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  &__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    font-size: 11px;
    color: hsl(var(--muted-foreground));
  }

  &__actions {
    display: flex;
    gap: 2px;
  }
}

.persona-avatar {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, hsl(var(--c-violet)), hsl(var(--primary)));
  border-radius: 10px;
}

.persona-pager {
  display: flex;
  flex: none;
  justify-content: flex-end;
  padding-top: 10px;
}

@media (width <= 1280px) {
  .persona-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
