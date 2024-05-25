import qs from 'qs'
import { reToken } from '@/service/prelogin'
import { useMailUserStore } from '@/store'

export type CustomRequestOptions = UniApp.RequestOptions & {
  query?: Record<string, any>
} & IUniUploadFileOptions // 添加uni.uploadFile参数类型

// 请求基地址
const baseURL = import.meta.env.VITE_SERVER_BASEURL

// 拦截器配置
const httpInterceptor = {
  // 拦截前触发
  invoke(options: CustomRequestOptions) {
    // 接口请求支持通过 query 参数配置 queryString
    if (options.query) {
      const queryStr = qs.stringify(options.query)
      if (options.url.includes('?')) {
        options.url += `&${queryStr}`
      } else {
        options.url += `?${queryStr}`
      }
    }
    options.url = baseURL + options.url
    // 2. 请求超时
    options.timeout = 60000 // 60s
    // 3. 添加小程序端请求头标识
    options.header = {
      platform: '', // 可选值与 uniapp 定义的平台一致，告诉后台来源
      ...options.header,
    }
    // 4. 添加 token 请求头标识
    const mailUserStore = useMailUserStore()
    const { token } = mailUserStore.mailUserInfo as unknown as UsersInfo
    if (token) {
      options.header.Authorization = `Bearer ${token}`
    }
  },
  async success(args, req) {
    const mailUserStore = useMailUserStore()
    if (args.statusCode === 401 && !req.url.includes('reToken')) {
      // jwt错误397-402，刷新token
      // 阻塞一下，等token刷新在请求
      try {
        const { code, data } = await reToken()
        if (code === 0 && data.token) {
          mailUserStore.setInfoByKey('token', data.token) // 更新 token
        } else {
          // TODO 如果不知原因进入该此，不建议自动请求了
          // TODO 搞个模态框用户手动刷新一次，没成功的话只能让用户重登，或其他方案
          return Promise.reject(
            await uni.showToast({
              icon: 'none',
              position: 'bottom',
              title: '刷新token失败，可退出登录重试',
            }),
          )
        }
      } catch (e) {
        // TODO 进入到这里还可以判断下是否为307-402的refreshToken失效，是则重登，不是则其他处理
        return Promise.reject(
          uni.showToast({
            icon: 'none',
            position: 'bottom',
            title: '身份信息失效，请重新登录',
            success: () => {
              const mail = mailUserStore.mailUserInfo.mail
              mailUserStore.clearInfo()
              setTimeout(() => {
                uni.redirectTo({
                  url: `/pages/login/login?mail=${encodeURIComponent(mail)}`,
                })
              }, 1000)
            },
          }),
        )
      }
    }
    return Promise.resolve(args)
  },
}

export const requestInterceptor = {
  install() {
    // 拦截 request 请求
    uni.addInterceptor('request', httpInterceptor)
    // 拦截 uploadFile 文件上传
    uni.addInterceptor('uploadFile', httpInterceptor)
  },
}
