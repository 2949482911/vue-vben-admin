import { BasicColumn, FormSchema } from '@/components/Table';

export const columns: BasicColumn[] = [
  {
    title: 'URL',
    dataIndex: 'url',
    width: 200,
  },
  {
    title: '操作时间',
    dataIndex: 'createTime',
    width: 200,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'URL',
    label: '请求URL',
    component: 'Input',
    colProps: { span: 8 },
  },
];
