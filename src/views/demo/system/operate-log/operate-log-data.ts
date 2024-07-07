import { BasicColumn, FormSchema } from '@/components/Table';
import { useI18n } from '@/hooks/web/useI18n';

const { t } = useI18n();
export const columns: BasicColumn[] = [
  {
    title: `${t('sys.operatorLog.column.url')}`,
    dataIndex: 'url',
    width: 200,
    sorter: true,
  },
  {
    title: `${t('common.create_time')}`,
    dataIndex: 'createTime',
    width: 200,
    sorter: true,
  },

  {
    title: `${t('common.createUsername')}`,
    dataIndex: 'createUsername',
    width: 200,
    sorter: true,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'URL',
    label: `${t('sys.operatorLog.column.url')}`,
    component: 'Input',
    colProps: { span: 8 },
  },
];
