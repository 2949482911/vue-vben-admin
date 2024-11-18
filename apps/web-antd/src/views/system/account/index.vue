<script lang="ts" setup name="AccountManager">
import type {VxeGridProps} from '#/adapter/vxe-table';
import {useVbenVxeGrid} from '#/adapter/vxe-table';
import {onMounted, ref} from 'vue'
import type {CreateMenuRequest, UpdateMenuRequest,} from '#/api/models/menu';

import {Page, useVbenModal, type VbenFormProps} from '@vben/common-ui';
import {$t} from '@vben/locales';
import {SEX_SELECT, STATUS_SELECT, TABLE_COMMON_COLUMNS} from "#/constants/locales";
import {Button, Switch, Tag} from 'ant-design-vue';
import {orgApi, userApi} from '#/api';

import Create from './create.vue';
import type {OrgItem, UserItem} from "#/api/models/users";

async function handleState(row: UserItem) {
  if (row.status == 1) {
    await userApi.fetchDisableUser(row.id)
  } else {
    await userApi.fetchEnableUser(row.id)
  }
  pageReload();
}
async function handlerDelete(row: UserItem) {
  await userApi.fetchDeleteUser([row.id])
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
    {
      component: 'TreeSelect',
      fieldName: 'orgId',
      label: `${$t('system.user.columns.orgId')}`,
      componentProps: {
        treeData: orgTreeData,
        fieldNames: {
          label: 'name',
          value: 'id',
          children: 'children',
        }
      },
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

onMounted(() => {
  orgApi.fetchOrgTree().then(res => {
    orgTreeData.value = res
  })
})

</script>

<template>
  <div>
    <Page>
      <Grid :table-title="$t('system.user.title')">

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
    <CreateModal @page-reload="pageReload"/>
  </div>
</template>
