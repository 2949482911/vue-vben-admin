import axios from 'axios';
import { useAppConfig } from '@vben/hooks';
import { useAccessStore } from '@vben/stores';
import { preferences } from '@vben/preferences';
const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);
// 创建自定义 axios 实例
export const customRequest = axios.create({
  baseURL: apiURL,
  timeout: 30000,
});

// 请求拦截器：自动添加 token
customRequest.interceptors.request.use(
  (config: { headers: { [x: string]: string; Authorization: string; }; }) => {
    const accessStore = useAccessStore();
    const token = accessStore.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Accept-Language'] = preferences.app.locale;
    return config;
  },
  (error: any) => Promise.reject(error)
);

// 响应拦截器：统一错误处理
customRequest.interceptors.response.use(
  (response: { config: { responseType: string; }; data: any; }) => {
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return response;
    }
    const res = response.data;
    if (res.code === 0) {
      return res.data !== undefined ? res.data : res;
    } else {
      const errorMsg = res.msg || res.message || '请求失败';
      return Promise.reject(new Error(errorMsg));
    }
  },
  (error: any) => {
    return Promise.reject(error);
  }
);
