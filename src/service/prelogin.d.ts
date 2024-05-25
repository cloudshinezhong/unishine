export interface UsersInfo {
  // 表默认字段
  coll: object
  ts: object

  id: string
  name?: string | 'undefined'
  gender?: number | 1
  age?: number | 0
  country?: string
  mail: string
  address?: string
  info?: {
    height: number
    weight: number
  }
  // 最新登录时间戳
  login_ts?: number
  // 创建时间戳
  create_ts?: number
  cash?: number | 0
  pass: string
  location?: { lat: number; long: number }
}

export interface UserItem extends UsersInfo {
  token: string
  captcha: string
  refreshToken: string
}
