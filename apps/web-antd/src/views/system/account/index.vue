<script lang="ts" setup name="AccountManager">
import type {VxeGridProps} from '#/adapter/vxe-table';
import {useVbenVxeGrid} from '#/adapter/vxe-table';
import {onMounted, reactive, ref} from 'vue'
import type {CreateMenuRequest, UpdateMenuRequest,} from '#/api/models/menu';
import {ColPage, Page, useVbenModal, type VbenFormProps} from '@vben/common-ui';
import {$t} from '@vben/locales';
import {
  BatchOptionsType,
  SEX_SELECT,
  STATUS_SELECT,
  TABLE_COMMON_COLUMNS
} from "#/constants/locales";
import {Button, Card, Switch, Tag, Tree} from 'ant-design-vue';
import {orgApi, userApi} from '#/api';


import Create from './create.vue';
import type {OrgItem, UserItem} from "#/api/models/users";

async function handleState(row: UserItem) {
  if (row.status == 1) {
    await userApi.fetchBatchOptions({
      targetIds: [row.id],
      type: BatchOptionsType.DISABLE
    })
  } else {
    await userApi.fetchBatchOptions({
      targetIds: [row.id],
      type: BatchOptionsType.Enable
    })
  }
  pageReload();
}

async function handlerDelete(row: UserItem) {
  await userApi.fetchBatchOptions({
    targetIds: [row.id],
    type: BatchOptionsType.Delete,
  })
  pageReload();
}

const [CreateModal, createModalApi] = useVbenModal({
  connectedComponent: Create,
  centered: true,
  modal: true,
});

const orgTreeData = ref<OrgItem[]>([])

function openBaseDrawer(row?: CreateMenuRequest | UpdateMenuRequest) {
  if (row) {
    createModalApi.setData(row);
  } else {
    createModalApi.setData({})
  }
  createModalApi.open();
}

const props = reactive({
  leftCollapsedWidth: 5,
  leftCollapsible: true,
  leftMaxWidth: 20,
  leftMinWidth: 20,
  leftWidth: 20,
  resizable: true,
  rightWidth: 80,
  splitHandle: false,
  splitLine: false,
});

const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: 'Input',
      fieldName: 'nickname',
      label: `${$t('system.user.columns.nickname')}`,
    },
    {
      component: 'Input',
      fieldName: 'authName',
      label: `${$t('system.user.columns.authName')}`,
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: STATUS_SELECT,
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'status',
      label: `${$t('core.columns.status')}`,
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: SEX_SELECT,
        placeholder: `${$t('common.choice')}`,
      },
      fieldName: 'sex',
      label: `${$t('system.user.columns.sex')}`,
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};


const gridOptions: VxeGridProps<UserItem> = {
  columns: [
    ...TABLE_COMMON_COLUMNS,
    {
      field: 'avatar',
      title: `${$t('system.user.columns.avatar')}`,
    },
    {
      field: 'nickname',
      title: `${$t('system.user.columns.nickname')}`,
    },
    {
      field: 'authName',
      title: `${$t('system.user.columns.authName')}`,
    },
    {
      field: 'phone',
      title: `${$t('system.user.columns.phone')}`,
    },
    {
      field: 'qq',
      title: `${$t('system.user.columns.qq')}`,
    },
    {
      field: 'email',
      title: `${$t('system.user.columns.email')}`,
    },
    {
      field: 'sex',
      title: `${$t('system.user.columns.sex')}`,
      slots: {default: 'sex'},
    },

    {
      field: 'roleIds',
      title: `${$t('system.user.columns.roleIds')}`,
      slots: {default: 'roleIds'},
    },
  ],
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({page}, args) => {
        return await userApi.fetchUserList(
          {
            page: page.currentPage,
            pageSize: page.pageSize,
            ...args
          }
        );
      },
    },
  },
  pagerConfig: {
    enabled: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions});

const pageReload = () => {
  gridApi.reload();
};

/**
 * org 检索
 * @param selectedKeys 选中的节点ID
 * @param node 当前节点
 */
function handlerOrgPageList(selectedKeys: string[], {node} ) {
  gridApi.reload({orgId: node.id});
}

onMounted(() => {
  orgApi.fetchOrgTree().then(res => {
    orgTreeData.value = res
  })
})

</script>

<template>
  <div>
    <ColPage
      auto-content-height
      v-bind="props"
    >
      <template #left="{ isCollapsed, expand }">
        <div
          :style="{ minWidth: '200px' }"
          class="border-border bg-card mr-2 rounded-[var(--radius)] border p-2"
        >
          <Tree :tree-data="orgTreeData" :field-names="{ title: 'name', key: 'id', children: 'children'}" @select="handlerOrgPageList"></Tree>
        </div>
      </template>
      <Card class="ml-2">
        <Page>
          <Grid :table-title="$t('system.user.title')">
            <template #roleIds="{ row }">
              <Tag v-for="item in row.roleList" v-if="row.roleList.length > 0" :key="item.id">
                {{ item.name }}
              </Tag>
              <div v-else>-</div>
            </template>

            <template #status="{ row }">
              <Switch :checked="row.status == 1" @click="handleState(row)"/>
            </template>

            <template #sex="{ row }">
              <Tag v-if="row.sex == 1">{{ $t('common.boy') }}</Tag>
              <Tag v-else>{{ $t('common.girl') }}</Tag>
            </template>

            <template #action="{ row }">
              <Button type="link" @click="openBaseDrawer(row)">
                {{ $t('common.edit') }}
              </Button>
              <Button type="link" @click="handlerDelete(row)">
                {{ $t('common.delete') }}
              </Button>
            </template>

            <template #toolbar-tools>
              <Button class="mr-2" type="primary" @click="openBaseDrawer(null)">
                {{ $t('common.create') }}
              </Button>
            </template>
          </Grid>
        </Page>
      </Card>
    </ColPage>

    <CreateModal @page-reload="pageReload"/>
  </div>
</template>
