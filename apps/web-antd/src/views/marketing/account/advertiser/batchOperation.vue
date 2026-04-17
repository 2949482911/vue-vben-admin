<script setup lang="ts" name="CreateAdvertiserModal">
import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { ref, computed, reactive } from 'vue';
import { useVbenForm } from '#/adapter/form';
import type { AdvertiserItem } from '#/api/models';
import { advertiserApi, projectApi, accountLabelApi, userApi, orgApi } from '#/api';
import type { UserItem, OrgItem } from '#/api/models';
import type { FormSchema } from '@vben/components';
const emit = defineEmits(['pageReload']);

//父组件传过来的advertiserId
const selectedRows = ref<AdvertiserItem[]>([]);
const modalType = ref<TitleKey>('edit');
const title = ref<string>('');
const menuData = ref<OrgItem[]>([]);

const salesOption = ref([]);
type TitleKey = 'edit' | 'org' | 'sale' | 'creator' | 'bind' | 'status' | 'hourlyState';

const titleMap: Record<TitleKey, string> = reactive({
  edit: '批量修改项目',
  org: '批量修改部门',
  sale: '批量修改销售',
  creator: '批量修改创建人',
  bind: '批量绑定标签',
  status: '批量修改投放状态',
  hourlyState: '批量修改分时状态',
});
const creatorUerName = ref();
const selectedOrgCode = ref();
async function loadSalesByOrg(orgId: string) {
  if (!orgId) {
    salesOption.value = [];
    return;
  }
  const saleSRes: any = await userApi.fetchUserList({ orgId, page: 1, pageSize: 200 });
  salesOption.value = saleSRes.items.map((item: UserItem) => ({
    label: item.nickname,
    value: item.id,
  }));
}
const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  handleSubmit: async (formVal) => {
    const targetIds = selectedRows.value.map((item) => item.id);
    let type = '';
    let values = {};
    if (modalType.value === 'edit') {
      ((type = 'update_advertiser_project'),
        (values = {
          projectId: formVal.projectId,
        }));
    } else if (modalType.value === 'bind') {
      ((type = 'update_advertiser_tag'),
        (values = {
          tag_id: formVal.tagId,
        }));
    } else if (modalType.value === 'org') {
      ((type = 'update_advertiser_organization'),
        (values = {
          org_id: formVal.orgId,
          org_code: selectedOrgCode.value,
        }));
    } else if (modalType.value === 'creator') {
      ((type = 'update_advertiser_create_user'),
        (values = {
          create_username: creatorUerName.value,
          create_user_id: formVal.creatorId,
        }));
    } else if (modalType.value === 'status') {
      type = formVal.putStatue === 1 ? 'start_put_status' : 'stop_put_status';
    } else if (modalType.value === 'hourlyState') {
      type = 'update_advertiser_hourly';
      values = {
        hourly_state: formVal.hourlyState, // 1 或者9 ，1 为拉取，9为不拉取
      };
    } else if (modalType.value === 'sale') {
      type = 'update_advertiser_sale';
      values = {
        sale_id: formVal.saleId,
      };
    }
    await advertiserApi.fetchBatchOptions({
      targetIds: targetIds,
      type: type,
      values: values,
    });
  },
  schema: [     
    {
      component: 'Input',
      fieldName: 'modalType',
      label: '操作类型',
      dependencies: {
        show: false,
        triggerFields: ['*']
      }
    },
    {
      component: 'ApiSelect',
      componentProps: {
        showSearch: true,
        placeholder: `${$t('common.input')}`,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        params: {
          page: 1,
          size: 1000,
        },
        valueField: 'id',
        labelField: 'name',        // 两个接口返回的数据都有 name 字段，直接固定
        resultField: 'items',
        api: async (params: any) => {
          return await projectApi.fetchProjectList(params);
        },
      },
      dependencies: {
        show: () => {
          return modalType.value === 'edit';
        },
        triggerFields: ['modalType']
      },
      fieldName: 'projectId',
      label: '项目',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        showSearch: true,
        placeholder: `${$t('common.input')}`,
        filterOption: (inputValue: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(inputValue.toLowerCase());
        },
        params: {
          page: 1,
          size: 1000,
        },
        valueField: 'id',
        labelField: 'name',        // 两个接口返回的数据都有 name 字段，直接固定
        resultField: 'items',
        api: async (params: any) => {
          return await accountLabelApi.fetchGetAccountLabelList(params);
          
        },
      },
      dependencies: {
        show: () => {
          return modalType.value === 'bind';
        },
        triggerFields: ['modalType']
      },
      fieldName: 'tagId',
      label: '标签',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          {
            label: '启用',
            value: 1,
          },
          {
            label: '禁止',
            value: 9,
          },
        ],
      },
      dependencies: {
        show: () => {
          return modalType.value === 'status';
        },
        triggerFields: ['modalType']
      },
      fieldName: 'putStatue',
      label: '投放状态',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          {
            label: '拉取',
            value: 1,
          },
          {
            label: '不拉取',
            value: 9,
          },
        ],
      },
      dependencies: {
        show: () => {
          return modalType.value === 'hourlyState';
        },
        triggerFields: ['modalType']
      },
      fieldName: 'hourlyState',
      label: '分时状态',
    },
    {
      component: 'TreeSelect',
      componentProps: {
        allowClear: true,
        placeholder: `${$t('common.choice')}`,
        showSearch: true,
        filterTreeNode: true,
        treeData: menuData,
        fieldNames: {
          label: 'name',
          value: 'id',
          children: 'children',
        },
        onSelect: (selectedKeys, event, node) => {
          if (event && event.code) {
            selectedOrgCode.value = event.code;
          }
        },
      },
      dependencies: {
        show: () => {
          return modalType.value === 'org' || modalType.value === 'creator' || modalType.value === 'sale';
        },
        triggerFields: ['modalType']
      },
      fieldName: 'orgId',
      label: '部门',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: salesOption,
        placeholder: `${$t('common.choice')}`,
        onSelect: (selectedKeys, event, node) => {
          if (modalType.value === 'creator') {
            if (event && event.label) {
              creatorUerName.value = event.label;
            }
          }
        },
      },
      // 字段名
      fieldName: 'creatorId',
      label: '创建人' ,
      dependencies: {
        show: () => { return modalType.value === 'creator' },
        triggerFields: ['orgId'],
        required: (value) => !!value.orgId,
        rules: (value) => {
          if (value.orgId) {
            return 'required';
          }
          return '';
        },
        if: (value, formApi) => {
          if (value.orgId) {
            formApi.setFieldValue('creatorId', null)
            loadSalesByOrg(value.orgId);
          } else {
            salesOption.value = [];
          }
          return true;
        },
      },
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: salesOption,
        placeholder: `${$t('common.choice')}`,
        onSelect: (selectedKeys, event, node) => {
          if (modalType.value === 'creator') {
            if (event && event.label) {
              creatorUerName.value = event.label;
            }
          }
        },
      },
      // 字段名
      fieldName: 'saleId',
      label: '销售',
      dependencies: {
        show: () => { return modalType.value === 'sale' },
        triggerFields: ['orgId'],
        required: (value) => !!value.orgId,
        rules: (value) => {
          if (value.orgId) {
            return 'required';
          }
          return '';
        },
        if: (value, formApi) => {
          if (value.orgId) {
              formApi.setFieldValue('saleId', null);
            loadSalesByOrg(value.orgId);
          } else {
            salesOption.value = [];
          }
          return true;
        },
      },
    },
  ],
});

const [Modal, modalApi] = useVbenModal({
  centered: true,
  fullscreenButton: false,
  closeOnPressEscape: false,
  contentClass: 'modalStyle',
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData();
      selectedRows.value = data.selectedRows;
      modalType.value = data.modalType;
      const orgRes = await orgApi.fetchOrgTree();
      menuData.value = orgRes;
      title.value = titleMap[modalType.value];
    } else {
      await formApi.resetForm();

    }
  },
  async onCancel() {
    await formApi.resetForm();
    await modalApi.close();
    modalType.value = 'edit';
    title.value = '';
  },
  async onConfirm() {
    const result = await formApi.validate();
    if (!result.valid) {
      return;
    }
    await formApi.submitForm();
    emit('pageReload');
    await modalApi.close();
  },
});
</script>

<template>
  <div>
    <Page>
      <Modal class="w-[400px]" :title="title">
        <Form :key="modalType"/>
      </Modal>
    </Page>
  </div>
</template>

<style scoped lang="scss">
:global(.z-popup .modalStyle) {
  min-height: 50px !important;
}
</style>
