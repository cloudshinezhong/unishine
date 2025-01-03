const md = require('./parse/markdown/index')
const parse = require('./parse/index')

export const towxml = (str, type, option = {}) => {
  let result
  switch (type) {
    case 'markdown':
      result = parse(md(str), option)
      break
    case 'html':
      result = parse(str, option)
      break
    default:
      throw new Error('Invalid type, only markdown and html are supported')
  }
  return result
}
