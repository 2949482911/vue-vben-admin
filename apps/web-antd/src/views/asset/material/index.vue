<script lang="ts" setup name="MaterialManager">
import {ColPage, Page, useVbenModal} from "@vben/common-ui";
import {Button, Card, DirectoryTree, Image, List, ListItem, Space} from "ant-design-vue";
import {onMounted, reactive, ref} from "vue";
import {materialAlbumApi, materialApi} from "#/api/asset";
import type {MaterialAlbumItem, MaterialItem, MaterialPageRequestParams} from "#/api/models/asset";
import {$t} from '@vben/locales';
import {BatchOptionsType} from "#/constants/locales";

import UploadMaterialModal from "./uploadmaterial.vue";
import CreateFolder from "./createfolder.vue";
import {ConstantTypeEnum} from "@vben/constants";

// create folder
const [CreateFolderModal, createFolderModalApi] = useVbenModal({
  connectedComponent: CreateFolder,
  centered: true,
  modal: true,
});

function openCreateFolderModal() {
  createFolderModalApi.open();
}

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

/**
 * delete album
 * @param row
 */
async function deleteAlbum(row: MaterialItem) {
  await materialAlbumApi.fetchAlbumBatchOptions({
    type: BatchOptionsType.Delete,
    targetIds: [row.id],
    values: new Map<string, any>(),
  })
  pageReload()
}

async function selectAlbumTree(selectedKeys: string[],) {
  console.log(1, selectedKeys)
  materialParams.value.albumId = selectedKeys[0]
  await getMaterialList()
}

function pageReload() {
  getMaterialList();
  getMaterialAlbumTree();
}


onMounted(() => {
  getMaterialAlbumTree();
  getMaterialList();
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
          <DirectoryTree :tree-data="materialAlbumTree"
                :field-names="{ title: 'name', key: 'id', children: 'children'}"
                @select="selectAlbumTree">

          </DirectoryTree>
        </div>
      </template>

      <Card class="ml-2">
        <template #title>
          <Space align="end">
            <Button type="primary" @click="openUploadMaterialModal">{{
                $t('action.upload')
              }}
            </Button>
            <Button @click="openCreateFolderModal">{{ $t('action.create_folder') }}</Button>
          </Space>
        </template>
        <List :grid="{ gutter: 16, column: 5 }" :data-source="materialData"
              :pagination="paginationProp">
          <template #renderItem="{ item }">
            <list-item>
              <Card>
                <template #cover>
                  <Image :src="item.coverImage" :height="120"
                         fallback="data:image/png;base64,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"></Image>
                </template>
                <CardMeta :title="item.name">
                  <template #description >
                    <div v-show="item.type === ConstantTypeEnum.COMMON_ONE">
                      {{ $t('action.material') }}
                      {{ item.count }}
                    </div>
                  </template>
                </CardMeta>
                <template #actions>
                  <div v-if="item.type === ConstantTypeEnum.COMMON_ONE">
                    <Button>{{ $t('common.edit') }}</Button>
                    <Button @click="deleteAlbum(item)">{{ $t('common.delete') }}</Button>
                  </div>
                  <div v-else>
                    <Button @click="deleteMaterial(item)">{{ $t('common.edit') }}</Button>
                    <Button @click="deleteMaterial(item)">{{ $t('common.delete') }}</Button>
                  </div>

                </template>
              </Card>
            </list-item>
          </template>
        </List>
      </Card>
    </ColPage>
    <CreateUploadMaterialModal/>
    <CreateFolderModal @pageReload="pageReload"/>
  </Page>
</template>
