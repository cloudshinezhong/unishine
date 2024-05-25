import { http } from '@/utils/http'
import type { UsersInfo } from './prelogin.d'

export { UsersInfo }

export const getUserInfo = (uid: string) => {
  return http<UsersInfo>({
    url: `/user/userInfo`,
    method: 'GET',
    query: {},
  })
}

export const setUserInfo = (uid: string) => {
  return http<UsersInfo>({
    url: `/user/userInfo`,
    method: 'PUT',
    data: {},
  })
}

export const setUserInfos = (uid: string) => {
  return http<UsersInfo>({
    url: `/user/userInfos`,
    method: 'PUT',
    data: {},
  })
}

export const userLogout = (uid: string) => {
  return http<UsersInfo>({
    url: `/user/logout`,
    method: 'POST',
    data: { uid },
  })
}
