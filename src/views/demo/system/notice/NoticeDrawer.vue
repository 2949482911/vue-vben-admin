<script lang="ts">
  import { computed, defineComponent, ref, unref } from 'vue';
  import { formSchema } from './notice';
  import { BasicForm, useForm } from '@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '@/components/Drawer';
  import { actionCreateNotice, actionUpdateNotice } from '@/api/demo/system';

  export default defineComponent({
    name: 'NoticeDrawer',
    components: { BasicDrawer, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const isUpdate = ref(true);

      const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
        labelWidth: 100,
        schemas: formSchema,
        showActionButtonGroup: false,
        baseColProps: { lg: 12, md: 24 },
      });

      const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
        resetFields();
        setDrawerProps({ confirmLoading: false });
        isUpdate.value = !!data?.isUpdate;

        if (unref(isUpdate)) {
          setFieldsValue({
            ...data.record,
          });
        }
      });

      const getTitle = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));

      async function handleSubmit() {
        try {
          const values = await validate();
          setDrawerProps({ confirmLoading: true });
          if (values.id) {
            await actionUpdateNotice(values);
          } else {
            await actionCreateNotice(values);
          }
          closeDrawer();
          emit('success');
        } finally {
          setDrawerProps({ confirmLoading: false });
        }
      }

      return {
        registerForm,
        getTitle,
        registerDrawer,
        handleSubmit,
      };
    },
  });
</script>

<template>
  <div>
    <BasicDrawer
      v-bind="$attrs"
      @register="registerDrawer"
      showFooter
      :title="getTitle"
      width="50%"
      @ok="handleSubmit"
    >
      <BasicForm @register="registerForm" />
    </BasicDrawer>
  </div>
</template>

<style scoped lang="less"></style>
