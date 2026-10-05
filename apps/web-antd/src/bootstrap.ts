import { createApp, watchEffect } from 'vue';

import { registerAccessDirective } from '@vben/access';
import { registerLoadingDirective } from '@vben/common-ui/es/loading';
import { preferences } from '@vben/preferences';
import { initStores } from '@vben/stores';
import '@vben/styles';
import '@vben/styles/antd';

import { useTitle } from '@vueuse/core';

import { $t, setupI18n } from '#/locales';

import { initComponentAdapter } from './adapter/component';
import { initSetupVbenForm } from './adapter/form';
import App from './app.vue';
import { router } from './router';

async function bootstrap(namespace: string) {
  // 初始化组件适配器
  await initComponentAdapter();

  // 初始化表单组件
  await initSetupVbenForm();

  // // 设置弹窗的默认配置
  // setDefaultModalProps({
  //   fullscreenButton: false,
  // });
  // // 设置抽屉的默认配置
  // setDefaultDrawerProps({
  //   zIndex: 1020,
  // });

  const app = createApp(App);

  /**
   * 过滤 Vue 3.5 的「插槽在渲染函数之外被调用」告警：
   *   Slot "xxx" invoked outside of the render function: ...
   *
   * 触发方是各库自己用 `createVNode(Comp, props, { default: () => ... })` 拼的
   * 「非编译态插槽」（例如 antd Tag 的 Wave、antd InputNumber 的 StepHandler），
   * 模板里编译出来的插槽带 _n 标记不受影响。这类告警属于框架侧误报：
   * 只在 dev 打印、不影响功能，生产构建不会出现。
   * 这里只过滤这一条消息，其余 Vue 警告照常输出；整段注释掉即可全部恢复。
   */
  app.config.warnHandler = (msg, _instance, trace) => {
    if (msg.includes('invoked outside of the render function')) {
      return;
    }
    console.warn(`[Vue warn]: ${msg}${trace ? `\n${trace}` : ''}`);
  };

  // 注册v-loading指令
  registerLoadingDirective(app, {
    loading: 'loading', // 在这里可以自定义指令名称，也可以明确提供false表示不注册这个指令
    spinning: 'spinning',
  });

  // 国际化 i18n 配置
  await setupI18n(app);

  // 配置 pinia-tore
  await initStores(app, { namespace });

  // 安装权限指令
  registerAccessDirective(app);

  // 初始化 tippy
  const { initTippy } = await import('@vben/common-ui/es/tippy');
  initTippy(app);

  // 配置路由及路由守卫
  app.use(router);

  // 配置Motion插件
  const { MotionPlugin } = await import('@vben/plugins/motion');
  app.use(MotionPlugin);

  // 动态更新标题
  watchEffect(() => {
    if (preferences.app.dynamicTitle) {
      const routeTitle = router.currentRoute.value.meta?.title;
      const pageTitle =
        (routeTitle ? `${$t(routeTitle)} - ` : '') + preferences.app.name;
      useTitle(pageTitle);
    }
  });

  app.mount('#app');
}

export { bootstrap };
