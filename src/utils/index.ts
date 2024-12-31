import { saveAs } from 'file-saver'
import { format as prettyFormat } from 'pretty-format'
import pagesJson from '@/pages.json'
import { translate as t } from '@/locale/index'

/** 判断当前页面是否是tabbar页  */
export const getIsTabbar = () => {
  if (!Object.keys(pagesJson).includes('tabBar')) {
    return false
  }
  const pages = getCurrentPages()
  const lastPage = getLastItem(pages)
  const currPath = lastPage.route
  return !!pagesJson.tabBar.list.find((e) => e.pagePath === currPath)
}

export function exportJson(obj: object, name: string) {
  const jsonData = prettyFormat(obj)
  const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8' })
  saveAs(blob, `${name}.json`)
}

// 防抖函数
export function debounce(func, delay) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

// 节流函数
export function throttle(func, delay) {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      func.apply(this, args)
      lastTime = now
    }
  }
}

export function prettyJson(json, options = {}) {
  // 默认选项
  const defaultOptions = {
    indent: 2, // 缩进空格数
    highlight: true, // 是否高亮显示语法
  }
  // 合并选项
  const finalOptions = Object.assign({}, defaultOptions, options)
  // 使用 JSON.stringify 格式化 JSON 数据
  const formattedJson = JSON.stringify(json, null, finalOptions.indent)
  // 使用 JSON.stringify 格式化 JSON 数据，缩进为 2 个空格

  // 将格式化后的 JSON 字符串转换为 markdown 代码块
  return `\`\`\`json\n${formattedJson}\n\`\`\``
}

export function decodeUtf8(inputString) {
  const valuesArray = Object.values(new Uint8Array(inputString))
  return decodeURIComponent(escape(String.fromCharCode(...valuesArray)))
}

export function getLocalStorageSize() {
  const info = { currentSize: 0, limitSize: 0 } // 单位：kb
  try {
    const res = uni.getStorageInfoSync()
    info.currentSize = res.currentSize / 1024 // KB
    info.limitSize = res.limitSize / 1024 // KB
  } catch (e) {
    console.log('获取内存信息失败', e)
  }
  return info
}

// 超长数值截取
export function toFixed(num, fixed) {
  // 将数值转换为字符串
  const numStr = num.toString()
  // 获取小数点的位置
  const dotIndex = numStr.indexOf('.')
  // 如果小数位数超过了指定的位数，则截取到指定位数
  if (dotIndex !== -1 && numStr.length - dotIndex > fixed) {
    return numStr.substr(0, dotIndex + fixed + 1)
  }
  // 如果小数位数不足指定的位数，则补充0
  return numStr.padEnd(numStr.indexOf('.') + fixed + 1, '0')
}

// navigateBack优化
export const back = () => {
  const pages = getCurrentPages()
  if (pages.length === 1) {
    return uni.reLaunch({
      query: {},
      url: '/pages/index/index',
    })
  }
  return uni.navigateBack()
}

/** 生成uuid(伪)  */
export function generateUniqueId() {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${randomStr}`
}

/** 对象深拷贝  */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  const newObj = Array.isArray(obj) ? [] : {}
  for (const key in obj) {
    newObj[key] = deepClone(obj[key])
  }
  return newObj
}
/**
 * test i18n in not .vue file
 */
export const testI18n = () => {
  console.log(t('app.name'))
  // 下面同样生效
  uni.showModal({
    title: 'i18n 测试',
    content: t('app.name'),
  })
}
/**
 * 获取当前页面路由的 path 路劲和 redirectPath 路径
 * path 如 ‘/pages/login/index’
 * redirectPath 如 ‘/pages/demo/base/route-interceptor’
 */
export const currRoute = () => {
  const pages = getCurrentPages()
  const lastPage = getLastItem(pages)
  const currRoute = (lastPage as any).$page
  // console.log('lastPage.$page:', currRoute)
  // console.log('lastPage.$page.fullpath:', currRoute.fullPath)
  // console.log('lastPage.$page.options:', currRoute.options)
  // console.log('lastPage.options:', (lastPage as any).options)
  // 经过多端测试，只有 fullPath 靠谱，其他都不靠谱
  const { fullPath } = currRoute as { fullPath: string }
  console.log(fullPath)
  // eg: /pages/login/index?redirect=%2Fpages%2Fdemo%2Fbase%2Froute-interceptor (小程序)
  // eg: /pages/login/index?redirect=%2Fpages%2Froute-interceptor%2Findex%3Fname%3Dfeige%26age%3D30(h5)
  return getUrlObj(fullPath)
}

const ensureDecodeURIComponent = (url: string) => {
  if (url.startsWith('%')) {
    return ensureDecodeURIComponent(decodeURIComponent(url))
  }
  return url
}
/**
 * 解析 url 得到 path 和 query
 * 比如输入url: /pages/login/index?redirect=%2Fpages%2Fdemo%2Fbase%2Froute-interceptor
 * 输出: {path: /pages/login/index, query: {redirect: /pages/demo/base/route-interceptor}}
 */
export const getUrlObj = (url: string) => {
  const [path, queryStr] = url.split('?')
  console.log(path, queryStr)

  const query: Record<string, string> = {}
  queryStr.split('&').forEach((item) => {
    const [key, value] = item.split('=')
    console.log(key, value)
    query[key] = ensureDecodeURIComponent(value) // 这里需要统一 decodeURIComponent 一下，可以兼容h5和微信y
  })
  return { path, query }
}
/**
 * 得到所有的需要登录的pages，包括主包和分包的
 * 这里设计得通用一点，可以传递key作为判断依据，默认是 needLogin, 与 route-block 配对使用
 * 如果没有传 key，则表示所有的pages，如果传递了 key, 则表示通过 key 过滤
 */
export const getAllPages = (key = 'needLogin') => {
  // 这里处理主包
  const pages = [
    ...pagesJson.pages
      .filter((page) => !key || page[key])
      .map((page) => ({
        ...page,
        path: `/${page.path}`,
      })),
  ]
  // 这里处理分包
  const subPages: any[] = []
  pagesJson.subPackages.forEach((subPageObj) => {
    // console.log(subPageObj)
    const { root } = subPageObj

    subPageObj.pages
      .filter((page) => !key || page[key])
      .forEach((page: { path: string } & Record<string, any>) => {
        subPages.push({
          ...page,
          path: `/${root}/${page.path}`,
        })
      })
  })
  const result = [...pages, ...subPages]
  console.log(`getAllPages by ${key} result: `, result)
  return result
}

/**
 * 得到所有的需要登录的pages，包括主包和分包的
 * 只得到 path 数组
 */
export const getNeedLoginPages = (): string[] => getAllPages('needLogin').map((page) => page.path)

/**
 * 得到所有的需要登录的pages，包括主包和分包的
 * 只得到 path 数组
 */
export const needLoginPages: string[] = getAllPages('needLogin').map((page) => page.path)

/** 主要是处理 arr.at(-1) 在安卓机上运行报错的 兼容性问题 */
export const getArrElementByIdx = (arr: any[], index: number) => {
  if (index < 0) return arr[arr.length + index]
  if (index >= arr.length) return undefined
  return arr[index]
}

export const getLastItem = (arr: any[]) => getArrElementByIdx(arr, -1)
