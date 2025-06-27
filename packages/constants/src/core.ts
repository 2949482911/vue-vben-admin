/**
 * @zh_CN 登录页面 url 地址
 */
export const LOGIN_PATH = '/auth/login';

export interface LanguageOption {
  label: string;
  value: 'en-US' | 'zh-CN';
}

/**
 * Supported languages
 */
export const SUPPORT_LANGUAGES: LanguageOption[] = [
  {
    label: '简体中文',
    value: 'zh-CN',
  },
  {
    label: 'English',
    value: 'en-US',
  },
];

export enum ConstantEnum {
  COMMON_ZERO,
  COMMON_ENABLE,
  COMMON_DISABLE = 9,
}


export enum ConstantTypeEnum {
  COMMON_ZERO,
  COMMON_ONE,
  COMMON_TWO,
  COMMON_THREE,
  COMMON_FOUR,
}
