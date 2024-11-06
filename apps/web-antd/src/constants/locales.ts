import { $t } from '@vben/locales';

export const TABLE_COMMON_COLUMNS = [
  { align: 'left', field: 'id', title: `${$t('core.columns.id')}` },
  { field: 'createUsername', title: `${$t('core.columns.createUsername')}` },
  { field: 'updateUsername', title: `${$t('core.columns.updateUsername')}` },
  {
    field: 'createTime',
    formatter: 'formatDateTime',
    title: `${$t('core.columns.createTime')}`,
  },
  {
    field: 'updateTime',
    formatter: 'formatDateTime',
    title: `${$t('core.columns.updateTime')}`,
  },
  {
    field: 'status',
    title: `${$t('core.columns.status')}`,
    slots: { default: 'status' },
  },
  {
    field: 'options',
    title: `${$t('core.columns.options')}`,
    fixed: 'right',
    slots: { default: 'action' },
    width: 256,
  },
];
