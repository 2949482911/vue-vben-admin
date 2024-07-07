import { BasicColumn, FormSchema } from '@/components/Table';
import { h } from 'vue';
import { Switch } from 'ant-design-vue';
import { enableMainBody, disableMainBody } from '@/api/demo/system';
import { useI18n } from '@/hooks/web/useI18n';
import { useMessage } from '@/hooks/web/useMessage';

const { t } = useI18n();
type CheckedType = boolean | string | number;
export const columns: BasicColumn[] = [
  {
    title: `${t('sys.mainBody.column.name')}`,
    dataIndex: 'name',
    width: 200,
    sorter: true,
  },
  {
    title: `${t('sys.mainBody.column.email')}`,
    dataIndex: 'email',
    width: 200,
  },
  {
    title: `${t('sys.mainBody.column.remark')}`,
    dataIndex: 'remark',
  },
  {
    title: `${t('common.create_time')}`,
    dataIndex: 'createTime',
    width: 180,
    sorter: true,
  },
  {
    title: `${t('common.status')}`,
    dataIndex: 'status',
    width: 120,
    sorter: true,
    customRender: ({ record }) => {
      if (!Reflect.has(record, 'pendingStatus')) {
        record.pendingStatus = false;
      }
      return h(Switch, {
        checked: record.status === 1,
        checkedChildren: `${t('common.disable')}`,
        unCheckedChildren: `${t('common.enable')}`,
        loading: record.pendingStatus,
        onChange(checked: CheckedType) {
          record.pendingStatus = true;
          const newStatus = checked ? 1 : 9;
          const { createMessage } = useMessage();
          if (newStatus === 1) {
            enableMainBody(record.id).then(() => {
              record.status = newStatus;
            });
          } else {
            disableMainBody(record.id).then(() => {
              record.status = newStatus;
            });
          }
          createMessage.success(`已成功修改角色状态`);
          record.pendingStatus = false;
        },
      });
    },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: `${t('sys.mainBody.column.name')}`,
    component: 'Input',
    colProps: { span: 8 },
  },

  {
    field: 'email',
    label: `${t('sys.mainBody.column.email')}`,
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
    component: 'Input',
    ifShow: false,
  },
  {
    field: 'name',
    label: `${t('sys.mainBody.column.name')}`,
    required: true,
    component: 'Input',
  },
  {
    field: 'email',
    label: `${t('sys.mainBody.column.email')}`,
    required: true,
    component: 'Input',
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
  {
    label: `${t('sys.mainBody.column.remark')}`,
    field: 'remark',
    component: 'InputTextArea',
  },
];
