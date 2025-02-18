<script lang="ts" setup name="KuaiShouAccountManager">
import type {VxeGridProps} from '#/adapter/vxe-table';
import {useVbenVxeGrid} from '#/adapter/vxe-table';

import {Page, type VbenFormProps} from '@vben/common-ui';
import {$t} from '@vben/locales';
import {operatorApi} from '#/api';
import {TABLE_COMMON_COLUMNS} from '#/constants/locales';

const formOptions: VbenFormProps = {
  // 默认展开
  schema: [
    {
      component: 'Input',
      fieldName: 'url',
      label: `${$t('system.operator.columns.url')}`,
    }
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<RowType> = {
  border: true,
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    {title: '序号', type: 'seq', width: 50, type: 'checkbox', width: 100},
    ...TABLE_COMMON_COLUMNS,
    {field: 'url', title: `${$t('system.operator.columns.url')}`},
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        return await operatorApi.fetchNoticeList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...args
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({formOptions, gridOptions});

function pageReload() {
  gridApi.reload();
}
</script>

<template>
  <div>
    <Page auto-content-height>
      <Grid>
        <template #action="{ row }">
          <Button type="link"> {{ $t('common.edit') }}</Button>
          <Button type="link">{{ $t('common.delete') }}</Button>
        </template>
      </Grid>
    </Page>
  </div>
</template>
