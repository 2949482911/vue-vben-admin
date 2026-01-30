<script lang="ts" setup>
import { useVbenDrawer } from '@vben/common-ui';
import { useVbenVxeGrid, type VxeGridProps } from '@vben/plugins/vxe-table';
import { Button, message, InputSearch } from 'ant-design-vue';
import { reportTemplateApi } from '#/api';
import { nextTick, ref } from 'vue';
import type { TemplateDto } from "#/api/models";


const [Drawer, drawerApi] = useVbenDrawer({
  onCancel() {
    reportStr.value = ''
    drawerApi.close();
  },
  onConfirm() {
    reportStr.value = ''
    console.info('onConfirm');
  },
  onOpenChange(isOpen) {
    if(isOpen){
      nextTick(() => {
        pageReload('');
      });
    }
  },
  title: '报表模板',
});

function pageReload(val:string) {
  nextTick(() => {
    gridApi.reload({name:val});
  });
}

const gridOptions: VxeGridProps = {
  height: "auto",
  border: true,
  columns: [
    { title: '', type: 'checkbox', width: 50 },
    // { title: '序号', type: 'seq', width: 50 },
    { field: 'name', title: '报表名称' },
    { field: 'remark', title: '备注' },
    { field: 'options', title: '操作', fixed: 'right', slots: {default: 'action'}},
  ],
  checkboxConfig: {
    highlight: true,
  },
  pagerConfig: {
    enabled: true,
    pageSizes: [10, 20, 30],
    pagerCount: 3
  },
  proxyConfig: {
    ajax: {
      query: async ({page}, args) => {
        return await reportTemplateApi.fetchGetTemplateList({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...args
        });
      },
    },
  },
};

const gridEvents = {

};
function openCreateModal(row:TemplateDto){
  // 向父组件发送 template
  emit('useTemplate', row.template);
  drawerApi.close();

}
const emit = defineEmits<{(e:'useTemplate', template: Record<string, any>): void}>();

//模板删除事件
async function del(){
  const checkedRecords = gridApi.grid.getCheckboxRecords();
  const ids = checkedRecords.map((item)=>item.id)
  if(!checkedRecords.length) return message.error('请选择需要删除的数据');
  try{
    await reportTemplateApi.fetchDelTemplate({targetIds: ids, type:'delete',values:{}})
    await pageReload('')
    reportStr.value = ''
    message.success('删除成功');
  } catch (err) {
    console.error(err,'删除失败');
  }
}

const reportStr = ref<string>('')
function onSearch(){
  pageReload(reportStr.value);
}

const [Grid, gridApi] = useVbenVxeGrid({ gridEvents, gridOptions});

</script>
<template>
  <Drawer>
    <div class="drawer flex-col-center">
      <Grid class="w-[100%]">
        <template #toolbar-actions>
          <span>报表名称：</span>
          <InputSearch
            v-model:value="reportStr"
            placeholder="请输入报表名称"
            style="width: 200px"
            @search="onSearch"
          />
        </template>
        <template #toolbar-tools>
          <Button class="mr-2" type="primary" @click="del()" danger>
            删除
          </Button>
        </template>
        <template #action="{ row }">
          <Button type="link" @click="openCreateModal(row)">
            使用模板
          </Button>
        </template>
      </Grid>
    </div>
  </Drawer>
</template>

<style scoped lang="scss">
.drawer{
  height:100%
}
</style>
