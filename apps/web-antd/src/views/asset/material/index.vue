<script lang="ts" setup name="MaterialManager">
import {ColPage, Page, useVbenModal} from "@vben/common-ui";
import {
  Card,
  Breadcrumb,
  BreadcrumbItem,
  List,
  Tree,
  ListItem,
  Image,
  Space,
  Button
} from "ant-design-vue";
import {onMounted, reactive, ref} from "vue";
import {materialAlbumApi, materialApi} from "#/api/asset";
import type {MaterialAlbumItem, MaterialItem, MaterialPageRequestParams} from "#/api/models/asset";
import {$t} from '@vben/locales';
import {BatchOptionsType} from "#/constants/locales";

import UploadMaterialModal from "./uploadmaterial.vue"

const [CreateUploadMaterialModal, createUploadMaterialModalApi] = useVbenModal({
  connectedComponent: UploadMaterialModal,
  centered: true,
  modal: true,
});

function openUploadMaterialModal() {
  createUploadMaterialModalApi.open();
}


const CardMeta = Card.Meta;

const props = reactive({
  leftCollapsedWidth: 5,
  leftCollapsible: true,
  leftMaxWidth: 20,
  leftMinWidth: 10,
  leftWidth: 20,
  resizable: true,
  rightWidth: 70,
  splitHandle: false,
  splitLine: false,
});

const materialParams = ref<MaterialPageRequestParams>(
  {
    page: 1,
    pageSize: 20,
  }
);

const materialAlbumTree = ref<Array<MaterialAlbumItem>>()

async function getMaterialAlbumTree() {
  materialAlbumTree.value = await materialAlbumApi.fetchAlbumTree()
}

const materialData = ref<MaterialItem[]>([]);

async function getMaterialList() {
  materialData.value = [];
  const {items, page, pageSize, totalPage, total} = await materialApi.fetchMaterialList({
    page: paginationProp.value.current,
    pageSize: paginationProp.value.pageSize,
    albumId: materialParams.value.albumId,
    name: materialParams.value.name,
    fileType: materialParams.value.fileType,
    fileMd5: materialParams.value.fileMd5,
  });
  materialData.value = items;
  paginationProp.value.pageSize = pageSize;
  paginationProp.value.current = page;
  paginationProp.value.total = total;
}

//分页相关
const pageSize = ref(20);
const total = ref(0);
const paginationProp = ref({
  showSizeChanger: false,
  showQuickJumper: true,
  pageSize: materialParams.value.pageSize,
  current: materialParams.value.page,
  total,
  showTotal: (total) => `总 ${total} 条`,
  onChange: pageChange,
  onShowSizeChange: pageSizeChange,
});

function pageChange(p, pz) {
  materialParams.value.page = p;
  materialParams.value.pageSize = pz;
  getMaterialList()
}

function pageSizeChange(_current, size) {
  materialParams.value.pageSize = size;
  getMaterialList()
}


async function deleteMaterial(row: MaterialItem) {
  await materialApi.fetchMaterialBatchOptions({
    type: BatchOptionsType.Delete,
    targetIds: [row.id],
    values: new Map<string, any>(),
  })
  await getMaterialList();
}

async function selectAlbumTree(selectedKeys: string[],) {
  console.log(1, selectedKeys)
  materialParams.value.albumId = selectedKeys[0]
  await getMaterialList()
}


onMounted(() => {
  getMaterialAlbumTree()
  getMaterialList()
})

</script>

<template>
  <Page>
    <ColPage
      auto-content-height
      v-bind="props"
    >
      <template #left="{ isCollapsed, expand }">
        <div
          :style="{ minWidth: '200px' }"
          class="border-border bg-card mr-2 rounded-[var(--radius)] border p-2"
        >
          <Tree :tree-data="materialAlbumTree"
                :field-names="{ title: 'name', key: 'id', children: 'children'}"
                @select="selectAlbumTree"
          >

          </Tree>
        </div>
      </template>

      <Card class="ml-2">
        <template #title>
          <Space align="end">
            <Button type="primary" @click="openUploadMaterialModal">{{ $t('action.upload') }}</Button>
            <Button>{{ $t('action.create_folder') }}</Button>
          </Space>
        </template>
        <Space>
          <Breadcrumb>
            <BreadcrumbItem>1</BreadcrumbItem>
            <BreadcrumbItem>1</BreadcrumbItem>
            <BreadcrumbItem>1</BreadcrumbItem>
            <BreadcrumbItem>1</BreadcrumbItem>
          </Breadcrumb>

        </Space>
        <List :grid="{ gutter: 16, column: 5 }" :data-source="materialData"
              :pagination="paginationProp">
          <template #renderItem="{ item }">
            <list-item>
              <Card>
                <template #cover>
                  <Image :src="item.coverImage"></Image>
                </template>
                <CardMeta :title="item.name">
                  <template #description v-show="item.type === 1">{{ $t('action.material') }}
                    {{ item.count }}
                  </template>
                </CardMeta>
                <template #actions>
                  <Button @click="deleteMaterial(item)">{{ $t('common.edit') }}</Button>
                  <Button @click="deleteMaterial(item)">{{ $t('common.delete') }}</Button>
                </template>
              </Card>
            </list-item>
          </template>
        </List>
      </Card>
    </ColPage>
    <CreateUploadMaterialModal/>
  </Page>
</template>
