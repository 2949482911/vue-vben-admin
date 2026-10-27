import { setDictHandler } from '@vben/stores';

import { dictApi } from '#/api';

/** 把 vben 字典 store 接到后端字典接口 */
export function initDict() {
  setDictHandler({
    getDict: (code) => dictApi.getDict(code),
    getAllDicts: () => dictApi.getAllDicts(),
    getVersion: () => dictApi.getVersion(),
  });
}
