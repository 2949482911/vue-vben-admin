import { $t } from '@vben/locales';

export const TABLE_COMMON_COLUMNS = [
  { align: 'left', field: 'id', title: `${$t('core.columns.id')}`, width: 'auto' },
  { field: 'createUsername', title: `${$t('core.columns.createUsername')}` , width: 'auto'},
  { field: 'updateUsername', title: `${$t('core.columns.updateUsername')}` , width: 'auto'},
  {
    field: 'createTime',
    formatter: 'formatDateTime',
    title: `${$t('core.columns.createTime')}`,
    width: 'auto',
  },
  {
    field: 'updateTime',
    formatter: 'formatDateTime',
    title: `${$t('core.columns.updateTime')}`,
    width: 'auto',
  },
  {
    field: 'status',
    title: `${$t('core.columns.status')}`,
    slots: { default: 'status' },
    width: 'auto',
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

export const SEX_SELECT = [
  {
    label: `${$t('common.boy')}`,
    value: 1,
  },
  {
    label: `${$t('common.girl')}`,
    value: 2,
  },
]


export const DATA_SCOPE = [
  {
    label: `${$t('core.data_range_type.self')}`,
    value: 1,
  },
  {
    label: `${$t('core.data_range_type.user_scope')}`,
    value: 2,
  },
  {
    label: `${$t('core.data_range_type.dept_scope')}`,
    value: 3,
  },
  {
    label: `${$t('core.data_range_type.dept_user_scope')}`,
    value: 4,
  },
  {
    label: `${$t('core.data_range_type.all_scope')}`,
    value: 5,
  },
  {
    label: `${$t('core.data_range_type.belong_dept')}`,
    value: 6,
  },
  {
    label: `${$t('core.data_range_type.belong_dept_sub_dept')}`,
    value: 7,
  },
  {
    label: `${$t('core.data_range_type.main_scope')}`,
    value: 8,
  },
  {
    label: `${$t('core.data_range_type.self_main_scope')}`,
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


export const FLOWABLE_PROCESS_TYPE = [
  {
    label: `${$t('core.role_type.super_admin')}`,
    value: 1,
  },
]


export enum BatchOptionsType {
  DISABLE= "disable",
  Enable = "enable",
  Delete = "delete"
}
