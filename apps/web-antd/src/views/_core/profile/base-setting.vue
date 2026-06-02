<script setup lang="ts">
import type {VbenFormSchema} from '#/adapter/form';

import {computed, onMounted, ref} from 'vue';

import {ProfileBaseSetting} from '@vben/common-ui';

import {authApi} from '#/api';

const profileBaseSettingRef = ref();

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      fieldName: 'nickname',
      component: 'Input',
      label: '姓名',
    },
    {
      fieldName: 'authName',
      component: 'Input',
      label: '用户名',
    },
    {
      fieldName: 'phone',
      component: 'Input',
      label: '电话',
    },
    {
      fieldName: 'email',
      component: 'Input',
      label: 'Email',
    },

    {
      fieldName: 'platformAdmin',
      component: 'Switch',
      label: '平台管理员',
    },

    {
      fieldName: 'mainAdmin',
      component: 'Switch',
      label: '主体管理员',
    },
  ];
});

onMounted(async () => {
  const data = await authApi.getUserInfoApi();
  profileBaseSettingRef.value.getFormApi().setValues(data);
});
</script>
<template>
  <ProfileBaseSetting ref="profileBaseSettingRef" :form-schema="formSchema"/>
</template>
