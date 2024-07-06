import { BasicColumn, FormSchema } from '@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';
import { useI18n } from '@/hooks/web/useI18n';

const { t } = useI18n();
export const columns: BasicColumn[] = [
  {
    title: `${t('sys.dept.column.name')}`,
    dataIndex: 'name',
    width: 160,
    align: 'left',
  },
  {
    title: `${t('sys.dept.column.code')}`,
    dataIndex: 'code',
    width: 50,
  },
  {
    title: `${t('common.status')}`,
    dataIndex: 'status',
    sorter: true,
    width: 80,
    customRender: ({ record }) => {
      const status = record.status;
      const enable = ~~status === 1;
      const color = enable ? 'green' : 'red';
      const text = enable ? `${t('common.enable')}` : `${t('common.disable')}`;
      return h(Tag, { color: color }, () => text);
    },
  },
  {
    title: `${t('common.create_time')}`,
    dataIndex: 'createTime',
    sorter: true,
    width: 180,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: `${t('sys.dept.column.name')}`,
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'status',
    label: `${t('common.status')}`,
    component: 'Select',
    colProps: { span: 8 },
    componentProps: {
      options: [
        { label: `${t('common.enable')}`, value: 1 },
        { label: `${t('common.disable')}`, value: 9 },
      ],
    },
  },
];

export const formSchema: FormSchema[] = [
  {
    field: 'id',
    component: 'Input',
    ifShow: false,
  },
  {
    field: 'name',
    label: `${t('sys.dept.column.name')}`,
    component: 'Input',
    required: true,
  },
  {
    field: 'parentId',
    label: `${t('sys.dept.parent')}`,
    component: 'TreeSelect',
    ifShow({ values }) {
      const { deptName, parentDept } = values;
      // Hide without a parentDept when editing
      return parentDept || (!deptName && !parentDept);
    },
    componentProps: {
      fieldNames: {
        label: 'name',
        key: 'id',
        value: 'id',
      },
      getPopupContainer: () => document.body,
    },
  },
  {
    field: 'status',
    label: `${t('common.status')}`,
    component: 'RadioButtonGroup',
    defaultValue: 1,
    componentProps: {
      options: [
        { label: `${t('common.enable')}`, value: 1 },
        { label: `${t('common.disable')}`, value: 9 },
      ],
    },
    required: true,
  },
  // {
  //   label: '备注',
  //   field: 'remark',
  //   component: 'InputTextArea',
  // },
];
