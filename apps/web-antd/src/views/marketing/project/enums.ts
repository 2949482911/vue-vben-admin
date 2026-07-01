import {$t} from '@vben/locales';

/**
 *
 */
export enum ProjectType {
  WECHAT_MINI_GAME = 'wechat_mini_game',
  ANDROID = 'android',
  IOS = 'ios',
  HARMONY = 'harmony',
  DOUYIN_MINI_GAME = 'douyin_mini_game',
  ALIPAY_MINI_GAME = 'alipay_mini_game',
  BILIBILI_MINI_GAME = 'bilibili_mini_game',
  KUAISHOU_MINI_GAME = 'kuaishou_mini_game',
  BAIDU_MINI_GAME = 'baidu_mini_game',
  WECHAT_MINI_PROGRAM = 'wechat_mini_program',
  DOUYIN_MINI_PROGRAM = 'douyin_mini_program',
  ALIPAY_MINI_PROGRAM = 'alipay_mini_program',
  KUAISHOU_MINI_PROGRAM = 'kuaishou_mini_program',
  TAOBAO_MINI_PROGRAM = 'taobao_mini_program',
  QUCK_APP = 'quck_app',
  QUCK_GAME = 'quck_game',
  WEB_H5 = 'web_h5'
}



export const ProjectTypeLabel: Array<{label: string, value: string}> = [
  {
    label: `${$t('marketing.project.projectType.wechat_mini_game')}`,
    value: ProjectType.WECHAT_MINI_GAME
  },
  { 
    label: `${$t('marketing.project.projectType.android')}`,
    value: ProjectType.ANDROID
  },
  {
    label: `${$t('marketing.project.projectType.ios')}`,
    value: ProjectType.IOS
  },
  {
    label: `${$t('marketing.project.projectType.harmony')}`,
    value: ProjectType.HARMONY
  },
  {
    label: `${$t('marketing.project.projectType.douyin_mini_game')}`,
    value: ProjectType.DOUYIN_MINI_GAME
  },
  {
    label: `${$t('marketing.project.projectType.alipay_mini_game')}`,
    value: ProjectType.ALIPAY_MINI_GAME
  },
  {
    label: `${$t('marketing.project.projectType.bilibili_mini_game')}`,
    value: ProjectType.BILIBILI_MINI_GAME
  },
  {
    label: `${$t('marketing.project.projectType.kuaishou_mini_game')}`,
    value: ProjectType.KUAISHOU_MINI_GAME       
  },
  {
    label: `${$t('marketing.project.projectType.baidu_mini_game')}`,
    value: ProjectType.BAIDU_MINI_GAME
  },

  {
    label: `${$t('marketing.project.projectType.wechat_mini_program')}`,
    value: ProjectType.WECHAT_MINI_PROGRAM
  },
  {
    label: `${$t('marketing.project.projectType.douyin_mini_program')}`,
    value: ProjectType.DOUYIN_MINI_PROGRAM
  },
  {
    label: `${$t('marketing.project.projectType.alipay_mini_program')}`,
    value: ProjectType.ALIPAY_MINI_PROGRAM
  },
  {
    label: `${$t('marketing.project.projectType.kuaishou_mini_program')}`,
    value: ProjectType.KUAISHOU_MINI_PROGRAM
  },
  {
    label: `${$t('marketing.project.projectType.taobao_mini_program')}`,
    value: ProjectType.TAOBAO_MINI_PROGRAM
  },
  {
    label: `${$t('marketing.project.projectType.quck_app')}`,
    value: ProjectType.QUCK_APP 
  },
  {
    label: `${$t('marketing.project.projectType.quck_game')}`,
    value: ProjectType.QUCK_GAME 
  },
  {
    label: `${$t('marketing.project.projectType.web_h5')}`,
    value: ProjectType.WEB_H5
  }
]
