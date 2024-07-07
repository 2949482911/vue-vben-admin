import { BasicColumn, FormSchema } from '@/components/Table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';
import { useI18n } from '@/hooks/web/useI18n';

const { t } = useI18n();
export const columns: BasicColumn[] = [
  {
    title: 'id',
    defaultHidden: true,
    dataIndex: 'id',
  },
  {
    title: `${t('sys.notice.column.title')}`,
    dataIndex: 'title',
    sorter: true,
  },
  {
    title: `${t('sys.notice.column.content')}`,
    dataIndex: 'content',
  },
  {
    title: `${t('common.createUserName')}`,
    dataIndex: 'createUserName',
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
    width: 200,
  },
  {
    title: `${t('common.updateUserName')}`,
    dataIndex: 'updateUserName',
  },
  {
    title: `${t('common.updateTime')}`,
    dataIndex: 'updateTime',
    width: 200,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'title',
    label: `${t('sys.notice.column.title')}`,
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
    label: 'id',
    component: 'Input',
    ifShow: false,
  },

  {
    field: 'title',
    label: `${t('sys.notice.column.title')}`,
    component: 'Input',
    required: true,
  },

  {
    title: `${t('sys.notice.column.content')}`,
    label: '内容',
    component: 'InputTextArea',
    required: true,
  },

  {
    field: 'status',
    label: `${t('common.status')}`,
    component: 'Select',
    defaultValue: 1,
    componentProps: {
      options: [
        { label: `${t('common.enable')}`, value: 1 },
        { label: `${t('common.disable')}`, value: 9 },
      ],
    },
    required: true,
  },
];
