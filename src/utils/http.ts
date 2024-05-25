import { CustomRequestOptions } from '@/interceptors/request'
import { reToken } from '@/service/prelogin'
import { useMailUserStore } from '@/store'

// 请求基地址
const baseURL = import.meta.env.VITE_SERVER_BASEURL

export const http = <T>(options: CustomRequestOptions) => {
  // 1. 返回 Promise 对象
  return new Promise<IResData<T>>((resolve, reject) => {
    uni.request({
      ...options,
      dataType: 'json',
      // #ifndef MP-WEIXIN
      responseType: 'json',
      // #endif
      // 响应成功
      async success(res) {
        // 状态码 2xx，参考 axios 的设计
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 2.1 提取核心数据 res.data
          resolve(res.data as IResData<T>)
        } else if (res.statusCode === 401) {
          // Jwt397-402处理逻辑在请求成功拦截器中
          resolve(await http(options))
        } else {
          reject(res)
        }
      },
      // 响应失败
      async fail(err) {
        await uni.showToast({
          icon: 'none',
          title: '网络错误，换个网络试试',
        })
        reject(err)
      },
    })
  })
}

export const httpChunk = <T>(options: CustomRequestOptions, retry: number = 0) => {
  return new Promise((resolve, reject) => {
    const chunks: [] = []
    const task: UniApp.RequestTask = uni.request({
      ...options,
      dataType: 'json',
      enableChunked: true,
      responseType: 'text',
      header: {
        Accept: '*/*',
      },
      // 响应成功
      async success(res) {
        if (res.statusCode === 401 && retry === 0) {
          resolve(await httpChunk(options, ++retry))
        }
      },
      fail(err) {
        reject(err)
      },
    })
    const firstChunkPromise = new Promise((resolve) => {
      task.onChunkReceived((res) => {
        chunks.push(res.data)
        resolve({ task, chunks })
      })
    })
    const headersReceivedPromise = new Promise((resolve) => {
      task.onHeadersReceived((res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ task, chunks })
        }
      })
    })
    Promise.race([firstChunkPromise, headersReceivedPromise]).then(resolve).catch(reject)
  })
}

// uni.uploadFile封装
export const uniFileUpload = <T>(options: CustomRequestOptions) => {
  // 1. 返回 Promise 对象
  return new Promise<IResData<T>>((resolve, reject) => {
    uni.uploadFile({
      ...options,
      // 响应成功
      success(res) {
        // 状态码 2xx，参考 axios 的设计
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 文件上传接口的rea.data的类型为string，这里转一下
          const resData = JSON.parse(res.data) as IResData<T>
          resolve(resData)
        } else if (res.statusCode === 401) {
          // 401错误  -> 清理用户信息，跳转到登录页
          // userStore.clearUserInfo()
          // uni.navigateTo({ url: '/pages/login/login' })
          reject(res)
        } else {
          // 其他错误 -> 根据后端错误信息轻提示
          uni.showToast({
            icon: 'none',
            title: '文件上传错误',
          })
          reject(res)
        }
      },
      // 响应失败
      fail(err) {
        uni.showToast({
          icon: 'none',
          title: '网络错误，换个网络试试',
        })
        reject(err)
      },
    })
  })
}

// refreshToken封装，独立这个请求不能和普通请求混入，以免401无限鉴权
export const refresh = <T>(options: CustomRequestOptions) => {
  // 1. 返回 Promise 对象
  return new Promise<IResData<T>>((resolve, reject) => {
    const mailUserStore = useMailUserStore()
    const { refreshToken } = mailUserStore.mailUserInfo as unknown as UsersInfo
    uni.request({
      ...options,
      dataType: 'json',
      // #ifndef MP-WEIXIN
      responseType: 'json',
      // #endif
      data: { refreshToken },
      // 响应成功
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as any)
        } else {
          reject(res)
        }
      },
      // 响应失败
      fail(err) {
        reject(err)
      },
    })
  })
}

// 简易fetch拦截器, h5 fetch api read chunk，sse事件流请求封装
// TODO 小程序端不支持fetch，可用uni.request封装一个read chunk
export const fetchWithInterceptor = (options: CustomRequestOptions) => {
  // 4. 添加 token 请求头标识
  const mailUserStore = useMailUserStore()
  const { token } = mailUserStore.mailUserInfo as unknown as UsersInfo
  const url = baseURL + options.url
  const opts = {
    ...options,
    timeout: 60000,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options.data),
  }
  return fetch(url, opts) // 返回
    .then(async (response) => {
      if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response)
      } else if (response.status === 401) {
        // jwt397-402错误码
        // 这里是jwt鉴权失败，重新请求token，做到无感刷新
        try {
          const { code, data } = await reToken()
          if (code === 0 && data.token) {
            mailUserStore.setInfoByKey('token', data.token)
            opts.headers.Authorization = `Bearer ${data.token}` // 更新 token
          } else {
            // TODO 如果不知原因进入该此，不建议自动请求了
            // TODO 搞个模态框用户手动刷新一次，没成功的话只能让用户重登，或其他方案
            await uni.showToast({
              icon: 'none',
              position: 'bottom',
              title: '刷新token失败，可退出登录重试',
            })
          }
        } catch (e) {
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
        return Promise.resolve(await fetch(url, opts))
      } else {
        return Promise.reject(response)
      }
    })
}
