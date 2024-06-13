import { fetchWithInterceptor, http, httpChunk } from '@/utils/http'

// 获取ai模型
export const getAiModels = (uid: string) => {
  return http({
    url: `/ai/aiModels`,
    method: 'GET',
    query: { uid },
  })
}

export const cozeBots = (uid: string) => {
  return http({
    url: `/coze/bots`,
    method: 'GET',
    query: { uid },
  })
}

export const getGems = (uid: string) => {
  return http({
    url: `/gem/gems`,
    method: 'GET',
    query: { uid },
  })
}

export const getLLMs = (uid: string) => {
  return http({
    url: `/gpt/models`,
    method: 'GET',
    query: { uid },
  })
}

// ai对话
export const conversationAi = (
  content: string,
  aimodel: string,
  name: string,
  uid: string,
  collId: string,
  prompts: AiInfo['prompts'],
  outputConf: AiInfo['outputConf'],
) => {
  return http({
    url: `/ai/aiChat`,
    method: 'POST',
    data: {
      uid,
      name,
      content,
      aimodel,
      collId,
      prompts,
      outputConf,
    },
  })
}

export const summaryAi = (content: string, name: string, uid: string, outputConf?: object) => {
  return http({
    url: `/ai/aiSummary`,
    method: 'POST',
    data: {
      uid,
      name,
      content,
      outputConf,
    },
  })
}

export const cozeChat = (
  content: string,
  botId: string,
  name: string,
  uid: string,
  collId: string,
  prompts: AiInfo['prompts'],
  outputConf: AiInfo['outputConf'],
) => {
  return http({
    url: `/coze/cozeChat`,
    method: 'POST',
    data: {
      uid,
      name,
      content,
      botId,
      collId,
      prompts,
      outputConf,
    },
  })
}

export const geminiChat = (
  content: string,
  aimodel: string,
  name: string,
  uid: string,
  collId: string,
  prompts: AiInfo['prompts'],
  outputConf: AiInfo['outputConf'],
) => {
  return http({
    url: `/gem/geminiChat`,
    method: 'POST',
    data: {
      uid,
      name,
      content,
      aimodel,
      collId,
      prompts,
      outputConf,
    },
  })
}

export const gptChat = (
  content: string,
  aimodel: string,
  name: string,
  uid: string,
  collId: string,
  prompts: AiInfo['prompts'],
  outputConf: AiInfo['outputConf'],
) => {
  return http({
    url: `/gpt/gptChat`,
    method: 'POST',
    data: {
      uid,
      name,
      content,
      aimodel,
      collId,
      prompts,
      outputConf,
    },
  })
}

export const gptChatStream = (
  val: {
    content: string
    aimodel: string
    name: string
    uid: string
    collId: string
    streamSpeed: number
    prompts: AiInfo['prompts']
    outputConf: AiInfo['outputConf']
  },
  opts,
) => {
  return fetchWithInterceptor({
    ...opts,
    url: `/gpt/gptChat`,
    method: 'POST',
    data: {
      ...val,
      stream: true,
    },
  })
}

export const gptChatStreamMp = (val: {
  content: string
  aimodel: string
  name: string
  uid: string
  collId: string
  streamSpeed: number
  prompts: AiInfo['prompts']
  outputConf: AiInfo['outputConf']
}) => {
  return httpChunk({
    url: `/gpt/gptChat`,
    method: 'POST',
    data: {
      ...val,
      stream: true,
    },
  })
}

export const cozeChatStream = (
  val: {
    content: string
    botId: string
    name: string
    uid: string
    collId: string
    streamSpeed: number
    prompts: AiInfo['prompts']
    outputConf: AiInfo['outputConf']
  },
  opts,
) => {
  return fetchWithInterceptor({
    ...opts,
    url: `/coze/cozeChat`,
    method: 'POST',
    data: {
      ...val,
      stream: true,
    },
  })
}

export const cozeChatStreamMp = (val: {
  content: string
  botId: string
  name: string
  uid: string
  collId: string
  streamSpeed: number
  prompts: AiInfo['prompts']
  outputConf: AiInfo['outputConf']
}) => {
  return httpChunk({
    url: `/coze/cozeChat`,
    method: 'POST',
    data: {
      ...val,
      stream: true,
    },
  })
}

export const conversationAiStream = (
  val: {
    content: string
    aimodel: string
    name: string
    uid: string
    collId: string
    streamSpeed: number
    prompts: AiInfo['prompts']
    outputConf: AiInfo['outputConf']
  },
  opts,
) => {
  return fetchWithInterceptor({
    ...opts,
    url: `/ai/aiChat`,
    method: 'POST',
    data: {
      ...val,
      stream: true,
    },
  })
}

export const conversationAiStreamMp = (val: {
  content: string
  aimodel: string
  name: string
  uid: string
  collId: string
  streamSpeed: number
  prompts: AiInfo['prompts']
  outputConf: AiInfo['outputConf']
}) => {
  return httpChunk({
    url: `/ai/aiChat`,
    method: 'POST',
    data: {
      ...val,
      stream: true,
    },
  })
}

export const geminiChatStream = (
  val: {
    content: string
    aimodel: string
    name: string
    uid: string
    collId: string
    streamSpeed: number
    prompts: AiInfo['prompts']
    outputConf: AiInfo['outputConf']
  },
  opts,
) => {
  return fetchWithInterceptor({
    ...opts,
    url: `/gem/geminiChat`,
    method: 'POST',
    data: {
      ...val,
      stream: true,
    },
  })
}

export const geminiChatStreamMp = (val: {
  content: string
  aimodel: string
  name: string
  uid: string
  collId: string
  streamSpeed: number
  prompts: AiInfo['prompts']
  outputConf: AiInfo['outputConf']
}) => {
  return httpChunk({
    url: `/gem/geminiChat`,
    method: 'POST',
    data: {
      ...val,
      stream: true,
    },
  })
}
