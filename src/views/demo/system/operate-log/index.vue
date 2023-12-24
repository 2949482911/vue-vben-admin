<template>
  <div>
    <BasicTable @register="registerTable" />
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';

  import { BasicTable, useTable } from '/@/components/Table';
  import { getOperateLogList } from '/@/api/demo/system';

  import { useDrawer } from '/@/components/Drawer';

  import { columns, searchFormSchema } from './operate-log-data';

  export default defineComponent({
    name: 'OperateLogManagement',
    components: { BasicTable },
    setup() {
      const [registerDrawer] = useDrawer();
      const [registerTable, { reload }] = useTable({
        title: '操作日志',
        api: getOperateLogList,
        columns,
        formConfig: {
          labelWidth: 120,
          schemas: searchFormSchema,
        },
        useSearchForm: true,
        showTableSetting: true,
        bordered: true,
        showIndexColumn: false,
      });

      function handleSuccess() {
        reload();
      }

      return {
        registerTable,
        registerDrawer,
        handleSuccess,
      };
    },
  });
</script>
