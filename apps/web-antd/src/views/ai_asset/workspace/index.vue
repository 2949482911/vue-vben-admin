<script lang="ts" setup name="AiAssetWorkspace">
/**
 * AI 资产 · 工作区（B 方案：工作区是一级入口）
 *
 * 工作区 = 租户（main_id）下的二级数据隔离域；进入后左侧换成工作区内部菜单
 * （/ai_asset/workspace/:wsId/**，见 workspace/menu.ts 与 router/routes/ai-asset-workspace.ts）。
 * 接口：workspace/list（分页，域外不带 X-Workspace-Id）、workspace/create。
 */
import type { WorkspaceItem } from "#/api/models/ai_asset";

import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { Page, useVbenModal, VbenLoading } from "@vben/common-ui";

import {
  Button,
  Card,
  CardMeta,
  Col,
  Empty,
  Pagination,
  Row,
  Tag,
} from "ant-design-vue";

import { aiAssetApi } from "#/api";
import { useWorkspaceStore } from "#/store";

import Create from "./create.vue";
import { workspacePagePath } from "./menu";

const router = useRouter();
const workspaceStore = useWorkspaceStore();

const [CreateModal, createModalApi] = useVbenModal({
  connectedComponent: Create
});

const COVERS = [
  "linear-gradient(135deg, #2468f2, #7b61ff)",
  "linear-gradient(135deg, #00b42a, #00d6a0)",
  "linear-gradient(135deg, #ff7d00, #ffb020)",
  "linear-gradient(135deg, #f53f3f, #ff9a9a)"
];

const loading = ref(false);
const workspaces = ref<WorkspaceItem[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(12);

async function load() {
  loading.value = true;
  try {
    const res = await aiAssetApi.fetchWorkspaces({
      page: page.value,
      pageSize: pageSize.value
    });
    workspaces.value = res?.items ?? [];
    total.value = res?.total ?? workspaces.value.length;
  } finally {
    loading.value = false;
  }
}

function handlePageChange(current: number, size: number) {
  page.value = current;
  pageSize.value = size;
  void load();
}

function openCreate() {
  createModalApi.setData({});
  createModalApi.open();
}

/** 进入工作区：先写工作区上下文（内部菜单 + 请求头），再跳域内首页 */
function enterWorkspace(ws: WorkspaceItem) {
  workspaceStore.enter(ws.id, ws.name);
  void router.push(workspacePagePath(ws.id, "studio"));
}

function roleLabel(role?: string) {
  if (role === "owner") {
    return "拥有者";
  }
  if (role === "viewer") {
    return "查看者";
  }
  return role ? "成员" : "";
}

onMounted(load);
</script>

<template>
  <Page
    auto-content-height
  >
    <!--    <template #extra>-->
    <!--      <Button type="primary" @click="openCreate">-->
    <!--        <template #icon><PlusOutlined /></template>-->
    <!--        新建工作区-->
    <!--      </Button>-->
    <!--    </template>-->

    <div>
      <Empty
        v-if="!loading && workspaces.length === 0"
        class="panel-empty"
        description="暂无工作区，点击右上角「新建工作区」创建"
      />
      <Row v-else :gutter="[14, 14]">
        <Col
          v-for="(ws, index) in workspaces"
          :key="ws.id"
          :lg="6"
          :md="8"
          :sm="12"
          :xs="24"
        >
          <Card class="ws-card" hoverable @click="enterWorkspace(ws)">
            <template #cover>
              <div
                class="ws-card__cover"
                :style="{ background: COVERS[index % COVERS.length] }"
              >
                {{ ws.name || `工作区 #${ws.id}` }}
              </div>
            </template>

            <CardMeta>
              <template #title>
                <div class="ws-card__hd">
                  <span class="ws-card__name">
                    {{ ws.name || `工作区 #${ws.id}` }}
                  </span>
                  <Tag v-if="roleLabel(ws.role)" :bordered="false">
                    {{ roleLabel(ws.role) }}
                  </Tag>
                </div>
              </template>
              <template #description>
                <span class="ws-card__meta">
                  工作区 ID：{{ ws.id }} · 创建于 {{ ws.createTime || "-" }}
                </span>
              </template>
            </CardMeta>

            <div class="ws-card__stats">
              <span>素材 <b>{{ ws.materialCount ?? "-" }}</b></span>
              <span>资产 <b>{{ ws.assetCount ?? "-" }}</b></span>
              <span>成员 <b>{{ ws.memberCount ?? "-" }}</b></span>
            </div>

            <Button class="ws-card__enter" size="small" type="primary">
              进入工作区 →
            </Button>
          </Card>
        </Col>

        <Col :lg="6" :md="8" :sm="12" :xs="24">
          <Card class="ws-card ws-card--new" hoverable @click="openCreate">
            <span class="ws-card__plus">＋</span>
            <span>新建工作区</span>
          </Card>
        </Col>
      </Row>

      <div v-if="total > pageSize" class="pager">
        <Pagination
          :current="page"
          :page-size="pageSize"
          show-size-changer
          :show-total="(t: number) => `共 ${t} 个工作区`"
          :total="total"
          @change="handlePageChange"
        />
      </div>

      <VbenLoading :spinning="loading" />
    </div>

    <CreateModal @success="load" />
  </Page>
</template>

<style scoped lang="scss">
.library-body {
  position: relative;
  min-height: 200px;
}

/* 卡片外壳用 antd Card（cover / Meta / 悬浮效果），这里只做内容排版微调 */
.ws-card {
  height: 100%;
  overflow: hidden;
  cursor: pointer;

  :deep(.ant-card-body) {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}

.ws-card__cover {
  display: flex;
  align-items: flex-end;
  height: 72px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.ws-card__hd {
  display: flex;
  gap: 8px;
  align-items: center;
}

.ws-card__name {
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ws-card__meta {
  font-size: 12px;
}

.ws-card__stats {
  display: flex;
  gap: 14px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));

  b {
    color: hsl(var(--foreground));
  }
}

.ws-card__enter {
  align-self: flex-start;
  margin-top: 2px;
}

.ws-card--new {
  display: flex;
  flex-direction: column;
  color: hsl(var(--muted-foreground));
  background: transparent;
  border-style: dashed;

  /* body 填满整卡高度，＋ 与文案才会真正居中（同行的其它卡更高） */
  :deep(.ant-card-body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    align-items: center;
    justify-content: center;
    min-height: 170px;
    text-align: center;
  }
}

.ws-card__plus {
  font-size: 20px;
  color: hsl(var(--primary));
}

.panel-empty {
  padding: 56px 0;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
