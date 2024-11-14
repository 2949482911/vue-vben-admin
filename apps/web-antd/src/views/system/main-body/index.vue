<script lang="ts" setup name="MainBodyManager">
import type {VxeGridProps} from '#/adapter/vxe-table';
import {useVbenVxeGrid} from '#/adapter/vxe-table';
import {onMounted, ref} from 'vue'
import type {CreateMenuRequest, MenuItem, UpdateMenuRequest,} from '#/api/models/menu';

import {Page, useVbenModal, type VbenFormProps} from '@vben/common-ui';
import {$t} from '@vben/locales';
import {SEX_SELECT} from "#/constants/locales";
import {Button, Switch, Tag} from 'ant-design-vue';
import {userApi, orgApi, mainBodyApi} from '#/api';

import Create from './create.vue';
import {STATUS_SELECT, TABLE_COMMON_COLUMNS} from "#/constants/locales";
import type {OrgItem} from "#/api/models/users";


const [CreateModal, createModalApi] = useVbenModal({
  connectedComponent: Create,
  centered: true,
  modal: true,
});

const orgTreeData = ref<OrgItem[]>([])

function openBaseDrawer(row?: CreateMenuRequest | UpdateMenuRequest) {
  if (row) {
    createModalApi.setData(row);
  }else {
    createModalApi.setData({})
  }
  createModalApi.open();
}

function handlerDisable(id: string) {
  userApi.fetchDisableUser(id).then(() => {
    pageReload();
  })
}

function handlerEnable(id: string) {
  userApi.fetchEnableUser(id).then(() => {
    pageReload();
  })
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


const gridOptions: VxeGridProps<MenuItem> = {
  columns: [
    ...TABLE_COMMON_COLUMNS,
    {
      field: 'name',
      title: `${$t('system.mainbody.columns.name')}`,
    },
    {
      field: 'email',
      title: `${$t('system.mainbody.columns.email')}`,
    },
    {
      field: 'remark',
      title: `${$t('system.mainbody.columns.remark')}`,
    },
  ],
  proxyConfig: {
    autoLoad: true,
    ajax: {
      query: async ({page}, args) => {
        return await mainBodyApi.fetchMainList(
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

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

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
        <Switch :checked="row.status == 1" />
      </template>

      <template #sex="{ row }">
        <Tag v-if="row.sex == 1">{{$t('common.boy')}}</Tag>
        <Tag v-else>{{$t('common.girl')}}</Tag>
      </template>

      <template #action="{ row }">
        <Button type="link" @click="openBaseDrawer(row)">
          {{$t('common.edit')}}
        </Button>
      </template>

      <template #toolbar-tools>
        <Button class="mr-2" type="primary" @click="openBaseDrawer(null)">
          {{$t('common.create')}}
        </Button>
      </template>
    </Grid>
  </Page>
  <CreateModal @page-reload="pageReload" />
</div>
</template>
