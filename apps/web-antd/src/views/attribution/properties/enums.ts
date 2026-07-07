import { $t } from "@vben/locales";

export enum AttributeTypeEnum {
  STRING = "STRING",
  NUMBER = "NUMBER",
  BOOLEAN = "BOOLEAN",
  DATE = "DATE",
  JSON = "JSON",
  MONEY = "MONEY",
}

export const ATTRIBUTE_TYPE_OPTIONS = [
  { label: `${$t("attribution.properties.typeOptions.string")}`, value: AttributeTypeEnum.STRING },
  { label: `${$t("attribution.properties.typeOptions.number")}`, value: AttributeTypeEnum.NUMBER },
  { label: `${$t("attribution.properties.typeOptions.boolean")}`, value: AttributeTypeEnum.BOOLEAN },
  { label: `${$t("attribution.properties.typeOptions.date")}`, value: AttributeTypeEnum.DATE },
  { label: `${$t("attribution.properties.typeOptions.json")}`, value: AttributeTypeEnum.JSON },
  { label: `${$t("attribution.properties.typeOptions.money")}`, value: AttributeTypeEnum.MONEY },
];

export function getAttributeTypeLabel(type: string): string {
  const item = ATTRIBUTE_TYPE_OPTIONS.find((opt) => opt.value === type);
  return item?.label || type;
}

export enum AttributeCategoryEnum {
  DEVICE = "DEVICE",
  USER = "USER",
  EVENT = "EVENT",
  CUSTOM = "CUSTOM",
}

export const ATTRIBUTE_CATEGORY_OPTIONS = [
  { label: `${$t("attribution.properties.categoryOptions.device")}`, value: AttributeCategoryEnum.DEVICE },
  { label: `${$t("attribution.properties.categoryOptions.user")}`, value: AttributeCategoryEnum.USER },
  { label: `${$t("attribution.properties.categoryOptions.event")}`, value: AttributeCategoryEnum.EVENT },
  { label: `${$t("attribution.properties.categoryOptions.custom")}`, value: AttributeCategoryEnum.CUSTOM },
];

export function getAttributeCategoryLabel(category: string): string {
  const item = ATTRIBUTE_CATEGORY_OPTIONS.find((opt) => opt.value === category);
  return item?.label || category;
}
