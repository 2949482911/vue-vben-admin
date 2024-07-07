import { BasicColumn, FormSchema } from '@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';
import Icon from '@/components/Icon/Icon.vue';
import { useI18n } from '@/hooks/web/useI18n';

const { t } = useI18n();

export const columns: BasicColumn[] = [
  {
    title: `${t('sys.menu.column.name')}`,
    dataIndex: 'name',
    width: 200,
    align: 'left',
  },
  {
    title: `${t('sys.menu.column.title')}`,
    dataIndex: 'title',
    width: 200,
    align: 'left',
  },
  {
    title: `${t('sys.menu.column.type')}`,
    dataIndex: 'type',
    width: 100,
    customRender: ({ record }) => {
      const type = record.type;
      let color = '';
      let text = '';
      if (type === 1) {
        text = '菜单';
        color = 'green';
      } else if (type === 2) {
        text = '接口';
        color = 'red';
      } else if (type === 3) {
        text = '按钮';
        color = 'blue';
      } else {
        text = '未知';
        color = '';
      }
      return h(Tag, { color: color }, () => text);
    },
  },
  {
    title: `${t('sys.menu.column.icon')}`,
    dataIndex: 'icon',
    width: 50,
    customRender: ({ record }) => {
      return h(Icon, { icon: record.icon });
    },
  },
  {
    title: `${t('sys.menu.column.mark')}`,
    dataIndex: 'mark',
    width: 180,
  },
  {
    title: `${t('sys.menu.column.component')}`,
    dataIndex: 'component',
    width: 180,
  },
  {
    title: `${t('sys.menu.column.path')}`,
    dataIndex: 'path',
    width: 180,
  },
  {
    title: `${t('sys.menu.column.sort')}`,
    dataIndex: 'sort',
    width: 50,
  },

  {
    title: `${t('common.status')}`,
    dataIndex: 'status',
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
    width: 180,
  },
];

// const isDir = (type: number) => type === 1;
const isInterface = (type: number) => type === 2;
const isMenu = (type: number) => type === 1;
const isButton = (type: number) => type === 3;

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: `${t('sys.menu.column.name')}`,
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'status',
    label: `${t('common.status')}`,
    component: 'Select',
    componentProps: {
      options: [
        { label: `${t('common.enable')}`, value: 1 },
        { label: `${t('common.disable')}`, value: 9 },
      ],
    },
    colProps: { span: 8 },
  },
];

export const formSchema: FormSchema[] = [
  {
    field: 'id',
    label: 'id',
    component: 'Input',
    ifShow: false,
  },
  {
    field: 'type',
    label: `${t('sys.menu.column.type')}`,
    component: 'RadioButtonGroup',
    defaultValue: 1,
    componentProps: {
      options: [
        { label: '菜单', value: 1 },
        { label: '接口', value: 2 },
        { label: '按钮', value: 3 },
      ],
    },
    colProps: { lg: 24, md: 24 },
  },
  {
    field: 'name',
    label: `${t('sys.menu.column.name')}`,
    component: 'Input',
    required: true,
  },

  {
    field: 'title',
    label: `${t('sys.menu.column.title')}`,
    component: 'Input',
    required: true,
  },

  {
    field: 'parentId',
    label: `${t('sys.menu.column.parentId')}`,
    component: 'TreeSelect',
    componentProps: {
      fieldNames: {
        label: 'title',
        key: 'id',
        value: 'id',
      },
      getPopupContainer: () => document.body,
    },
  },

  {
    field: 'sort',
    label: `${t('sys.menu.column.sort')}`,
    component: 'InputNumber',
    required: true,
  },
  {
    field: 'icon',
    label: `${t('sys.menu.column.icon')}`,
    component: 'IconPicker',
    required: true,
    ifShow: ({ values }) => isMenu(values.type),
  },

  {
    field: 'path',
    label: `${t('sys.menu.column.path')}`,
    component: 'Input',
    required: true,
    ifShow: ({ values }) => isMenu(values.type),
  },

  {
    field: 'redirect',
    label: `${t('sys.menu.column.path')}`,
    component: 'Input',
    ifShow: ({ values }) => isMenu(values.type),
  },

  {
    field: 'component',
    label: `${t('sys.menu.column.component')}`,
    component: 'Input',
    ifShow: ({ values }) => isMenu(values.type),
  },

  {
    field: 'backendUrl',
    label: `${t('sys.menu.column.backendUrl')}`,
    component: 'Input',
    ifShow: ({ values }) => isInterface(values.type),
    required: true,
  },
  {
    field: 'mark',
    label: `${t('sys.menu.column.mark')}`,
    component: 'Input',
    ifShow: ({ values }) => isInterface(values.type),
    required: ({ values }) => isInterface(values.type),
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
  },

  {
    field: 'isInternal',
    label: `${t('sys.menu.column.isInternal')}`,
    component: 'RadioButtonGroup',
    defaultValue: 9,
    ifShow: ({ values }) => isMenu(values.type),
    componentProps: {
      options: [
        { label: `${t('common.enable')}`, value: 1 },
        { label: `${t('common.disable')}`, value: 9 },
      ],
    },
  },

  {
    field: 'show',
    label: `${t('sys.menu.column.show')}`,
    component: 'RadioButtonGroup',
    defaultValue: '0',
    componentProps: {
      options: [
        { label: `${t('common.enable')}`, value: 1 },
        { label: `${t('common.disable')}`, value: 9 },
      ],
    },
    ifShow: ({ values }) => isButton(values.type),
  },

  {
    field: 'hideMenu',
    label: `${t('sys.menu.column.hideMenu')}`,
    component: 'RadioButtonGroup',
    defaultValue: 9,
    componentProps: {
      options: [
        { label: `${t('common.enable')}`, value: 1 },
        { label: `${t('common.disable')}`, value: 9 },
      ],
    },
    ifShow: ({ values }) => isMenu(values.type),
  },
];
