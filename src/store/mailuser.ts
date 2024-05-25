import { defineStore } from 'pinia'
import { ref } from 'vue'

const initMailUserState = { id: '', mail: '' }

export const useMailUserStore = defineStore(
  'mail-user',
  () => {
    const mailUserInfo = ref<UsersInfo>({ ...initMailUserState })

    const setInfo = (val: UsersInfo) => {
      mailUserInfo.value = val
    }

    const setInfoByKey = (key: keyof UsersInfo, val: any) => {
      mailUserInfo.value[key as any] = val
    }

    const clearInfo = () => {
      mailUserInfo.value = { ...initMailUserState }
    }

    const reset = () => {
      mailUserInfo.value = { ...initMailUserState }
    }
    const isLogin = computed(() => !!mailUserInfo.value.token)

    return {
      mailUserInfo,
      setInfo,
      setInfoByKey,
      clearInfo,
      isLogin,
      reset,
    }
  },
  {
    persist: true,
  },
)
