import { $t } from "@vben/locales";

export enum AttributionModelEnum {
  LAST_CLICK = "LAST_CLICK",
  FIRST_CLICK = "FIRST_CLICK",
  TIME_DECAY = "TIME_DECAY",
}

export const ATTRIBUTION_MODEL_OPTIONS = [
  { label: `${$t("attribution.attributionConfig.modelOptions.lastClick")}`, value: AttributionModelEnum.LAST_CLICK },
  { label: `${$t("attribution.attributionConfig.modelOptions.firstClick")}`, value: AttributionModelEnum.FIRST_CLICK },
  { label: `${$t("attribution.attributionConfig.modelOptions.timeDecay")}`, value: AttributionModelEnum.TIME_DECAY },
];

export function getAttributionModelLabel(model: string): string {
  const item = ATTRIBUTION_MODEL_OPTIONS.find((opt) => opt.value === model);
  return item?.label || model;
}
