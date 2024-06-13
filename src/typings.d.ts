/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
// 全局要用的类型放到这里

// 定义一个类型选一方法
// OneOf<T, P> 类型表示根据 T 的属性子集 P，选择性地创建新的子类型，其中选定的属性是必需的，而其他属性是可选的。
type OneOf<T, P extends keyof T = keyof T> = {
  [K in P]-?: Required<Pick<T, K>> & Partial<Record<Exclude<P, K>, never>>
}[P]

type IResData<T> = {
  code: number
  msg: string
  data: any
}

// uni.uploadFile文件上传参数
type IUniUploadFileOptions = {
  file?: File
  files?: UniApp.UploadFileOptionFiles[]
  filePath?: string
  name?: string
  formData?: any
}

// 微信用户
type IUserInfo = {
  nickname?: string
  avatar?: string
  /** 微信的 openid，非微信没有这个字段 */
  openid?: string
  token?: string
}

// 邮箱用户
interface UsersInfo {
  // 表默认字段
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

  location?: { lat: number; long: number }

  // 客户端补充属性
  token?: string
  refreshToken?: string
}

type AiInfo = {
  aiModel: string
  aiModels: any[]

  streamSpeed?: number

  aiStream?: boolean
  aiType?: string

  // 提示词
  prompts?: { role: 'user' | 'system' | 'assistant'; content: string; chatId: string }[]

  // 提示词是否启用
  promptsCutIn?: boolean

  // 输出设置
  outputConf?: {
    temperature: number
    top_p: number
    top_k: number
    max_tokens: number
    history_length: number
    summary_swi: boolean
    summary_thr_len: number
  }
}

type BotInfo = {
  botId: string
  bots: any[]

  botStream?: boolean
  streamSpeed?: number
  botType?: string

  botName?: string

  // 提示词
  prompts?: { role: 'user' | 'system' | 'assistant'; content: string; chatId: string }[]

  // 提示词是否启用
  promptsCutIn?: boolean

  // 输出设置
  outputConf?: {
    temperature: number
    top_p: number
    top_k: number
    max_tokens: number
    history_length: number
    summary_swi: boolean
    summary_thr_len: number
  }
}

type AiChat = {
  time: number
  icon: string
  name: string
  content: string
  isMe: boolean
  role: string
  // 0 加载中 1加载完成 -1生成出错 2持续输出 -2请求错误 -3输出中止
  status: 0 | 1 | -1 | 2 | -2 | -3
  chatId: number | string
  isPin: boolean

  showBtn: boolean // 操作按钮是否展示
  withContent: string // 内容相关，例如违法相关条例，涉及一些违规等提示或停止原因
  // 这里是谷歌gemini的文档所示的FINISH_REASON
  // FINISH_REASON_UNSPECIFIED	默认值。此值未使用。
  // STOP	模型的自然停靠点或提供的停靠站。
  // MAX_TOKENS	已达到请求中指定的令牌数量上限。
  // SAFETY	出于安全原因，举报了候选人的内容。
  // RECITATION	该候选人的内容因背书原因被举报。
  // OTHER	原因未知。
}

type AiSummary = {
  time: number
  icon: string
  name: string
  content: string
  isMe: boolean
  role: string
  // 0 加载中 1加载完成 -1生成出错 2持续输出 -2请求错误
  status: 0 | 1 | -1 | 2 | -2
  chatId: number | string
  showBtn: boolean // 操作按钮是否展示
  withContent: string // 内容相关，例如违法相关条例，涉及一些违规等提示或停止原因
  // 这里是谷歌gemini的文档所示的FINISH_REASON
  // FINISH_REASON_UNSPECIFIED	默认值。此值未使用。
  // STOP	模型的自然停靠点或提供的停靠站。
  // MAX_TOKENS	已达到请求中指定的令牌数量上限。
  // SAFETY	出于安全原因，举报了候选人的内容。
  // RECITATION	该候选人的内容因背书原因被举报。
  // OTHER	原因未知。
}

type AiChatCollection = {
  collId: string
  chatList: AiChat[]
  createat: number
  updateat: number
  collectionTitle?: string
  collectionSubTitle?: string

  collectionExtra?: string
}

declare type Recordable<T = any> = Record<string, T>
