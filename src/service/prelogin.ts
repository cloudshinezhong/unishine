// eslint-disable-next-line import/named
import { http, refresh } from '@/utils/http'
import type { UserItem } from './prelogin.d'

export { UserItem }

// 登录账号
export const loginAccount = (mail: string, pass: string) => {
  return http<UserItem>({
    url: `/login`,
    method: 'POST',
    data: {
      mail,
      pass,
    },
  })
}

// 注册账号
export const signAccount = (mail: string, captcha: string, pass: string) => {
  return http<UserItem>({
    url: `/sign`,
    method: 'POST',
    data: {
      mail,
      captcha,
      pass,
    },
  })
}

// 邮件验证码
export const mailCaptcha = (mail: string) => {
  return http<UserItem>({
    url: `/mailCaptcha`,
    method: 'POST',
    data: {
      mail,
    },
  })
}

// 刷新token
export const reToken = () => {
  return refresh<UserItem>({
    url: `/reToken`,
    method: 'POST',
  })
}

// 重置密码
export const resetPass = (mail: string, captcha: string, pass: string) => {
  return http<UserItem>({
    url: `/resetPass`,
    method: 'PUT',
    data: {
      mail,
      captcha,
      pass,
    },
  })
}
