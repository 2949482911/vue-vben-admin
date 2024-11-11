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

export const STATUS_SELECT = [
  {
    label: `${$t('common.enable')}`,
    value: 1,
  },
  {
    label: `${$t('common.disable')}`,
    value: 9,
  },
]



export const ROLE_TYPE_OPTIONS = [
  {
    label: `${$t('core.role_type.super_admin')}`,
    value: 1,
  },
  {
    label: `${$t('core.role_type.platform_admin')}`,
    value: 2,
  },
  {
    label: `${$t('core.role_type.platform_user')}`,
    value: 3,
  },
  {
    label: `${$t('core.role_type.main_admin')}`,
    value: 4,
  },
  {
    label: `${$t('core.role_type.main_user')}`,
    value: 5,
  },
]
