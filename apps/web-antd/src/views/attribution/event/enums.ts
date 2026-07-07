import { $t } from '@vben/locales';

export enum EVENT_TYPE_OPTIONS_ENUMS {
  BEHAVIOR = 'behavior',
  PROPERTY = 'property',
}

export const EVENT_TYPE_OPTIONS = [
  {
    label: `${$t('attribution.eventConfig.eventTypeOptions.behavior')}`,
    value: EVENT_TYPE_OPTIONS_ENUMS.BEHAVIOR,
  },
  {
    label: `${$t('attribution.eventConfig.eventTypeOptions.property')}`,
    value: EVENT_TYPE_OPTIONS_ENUMS.PROPERTY,
  },
];

export function getEventTypeLabel(eventType: string): string {
  const item = EVENT_TYPE_OPTIONS.find((opt) => opt.value === eventType);
  return item?.label || eventType;
}

export enum EVENT_CATEGORY_OPTIONS_ENUM {
  STANDARD = 'STANDARD',
  CUSTOM = 'CUSTOM',
}

export const EVENT_CATEGORY_OPTIONS = [
  {
    label: `${$t('attribution.eventConfig.eventCategoryOptions.standard')}`,
    value: EVENT_CATEGORY_OPTIONS_ENUM.STANDARD,
  },
  {
    label: `${$t('attribution.eventConfig.eventCategoryOptions.custom')}`,
    value: EVENT_CATEGORY_OPTIONS_ENUM.CUSTOM,
  },
];

export function getEventCategoryLabel(category: string): string {
  const item = EVENT_CATEGORY_OPTIONS.find((opt) => opt.value === category);
  return item?.label || category;
}
