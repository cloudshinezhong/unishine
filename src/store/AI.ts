import { defineStore } from 'pinia'
import { getLocalStorageSize, toFixed, debounce } from '@/utils/'
import { ref } from 'vue'

const aiInfoInitState = {
  aiModel: '',
  aiModels: [],
  aiStream: true,
  streamSpeed: 50,
  aiType: '',
  prompts: [],
  promptsCutIn: false,
  // 输出设置
  outputConf: {
    temperature: 0.5,
    top_p: 1,
    top_k: 1,
    max_tokens: 2048,
    history_length: 4,
  },
}

const botInfoInitState = {
  botId: '',
  bots: [],
  botStream: true,
  streamSpeed: 50,
  botType: '',
  botName: '',
  prompts: [],
  promptsCutIn: false,
  // 输出设置
  outputConf: {
    temperature: 0.5,
    top_p: 1,
    top_k: 1,
    max_tokens: 2048,
    history_length: 4,
  },
}

const geminiInfoInitState = {
  aiModel: '',
  aiModels: [],
  aiStream: true,
  streamSpeed: 50,
  aiType: '',
  prompts: [],
  promptsCutIn: false,
  // 输出设置
  outputConf: {
    temperature: 0.5,
    top_p: 1,
    top_k: 1,
    max_tokens: 2048,
    history_length: 4,
  },
}

const groqInfoInitState = {
  aiModel: '',
  aiModels: [],
  aiStream: true,
  streamSpeed: 50,
  aiType: '',
  prompts: [],
  promptsCutIn: false,
  // 输出设置
  outputConf: {
    temperature: 0.5,
    top_p: 1,
    top_k: 1,
    max_tokens: 2048,
    history_length: 4,
  },
}

const localStorageInitState = { currentSize: 0, limitSize: 0, percent: 0, activeColor: '#4ddd87' }

export const useAiStore = defineStore(
  'AI',
  () => {
    const aiInfo = ref<AiInfo>({ ...aiInfoInitState })

    const groqInfo = ref<AiInfo>({ ...groqInfoInitState })

    const botInfo = ref<BotInfo>({ ...botInfoInitState })

    const geminiInfo = ref<AiInfo>({ ...geminiInfoInitState })

    const aiChatCollection = ref<Array<AiChatCollection>>([])

    const localStorageInfo = ref({ ...localStorageInitState })

    const setAiInfo = (val: AiInfo) => {
      aiInfo.value = val
    }

    const unshiftAiCollection = (val: AiChatCollection) => {
      aiChatCollection.value.unshift(val)
    }

    const pushAiCollection = (val: AiChatCollection) => {
      aiChatCollection.value.push(val)
    }

    const updateAiCollection = (val: AiChatCollection) => {
      const { chatList } = val
      let collTitle, collSubTitle
      if (chatList.length) {
        const idxj = chatList.findIndex((i) => i.isMe && i.content)
        if (idxj >= 0) collTitle = chatList[idxj].content
        const idxk = chatList.findIndex((i, index) => !i.isMe && i.content && index !== 0)
        if (idxk >= 0) collSubTitle = chatList[idxk].content
      }
      const upIndex = aiChatCollection.value.findIndex((i) => i.collId === val.collId)
      aiChatCollection.value[upIndex] = {
        ...val,
        updateat: Date.now(),
        collectionTitle: collTitle,
        collectionSubTitle: collSubTitle,
      }
      aiChatCollection.value.sort((a, b) => b.updateat - a.updateat)
    }

    const delAiCollection = (val: Pick<AiChatCollection, 'collId'>) => {
      const delIndex = aiChatCollection.value.findIndex((i) => i.collId === val.collId)
      aiChatCollection.value.splice(delIndex, 1)
    }

    const setAiCollection = (val: Array<AiChatCollection>) => {
      aiChatCollection.value = val
    }

    // 监听 消息集 变化，更新存储信息
    watch(
      aiChatCollection,
      debounce(() => updateLocalStorageInfo(), 500),
      { deep: true },
    )

    // 更新缓存状态
    const updateLocalStorageInfo = () => {
      const info = getLocalStorageSize()
      const currentSize: number = info.currentSize === 0 ? 0 : toFixed(info.currentSize, 4)
      const limitSize: number = info.limitSize === 0 ? 0 : toFixed(info.limitSize, 4)
      let percent
      if (limitSize === 0)
        percent = 0 // 避免除以零
      else percent = Number(((currentSize / limitSize) * 100).toFixed(2))
      const activeColor = percent <= 20 ? '#4ddd87' : percent <= 80 ? '#10AEFF' : '#ff0000'
      localStorageInfo.value = { currentSize, limitSize, percent, activeColor }
    }

    const clearAiCollection = () => {
      aiChatCollection.value = []
    }

    const setAiInfoByKey = (key: keyof AiInfo, val: any) => {
      aiInfo.value[key as any] = val
    }

    const setBotInfoByKey = (key: keyof BotInfo, val: any) => {
      botInfo.value[key as any] = val
    }

    const setGeminiInfoByKey = (key: keyof AiInfo, val: any) => {
      geminiInfo.value[key as any] = val
    }

    const setGroqInfoByKey = (key: keyof AiInfo, val: any) => {
      groqInfo.value[key as any] = val
    }

    const clearAiInfo = () => {
      aiInfo.value = { ...aiInfoInitState }
    }

    const clearBotInfo = () => {
      botInfo.value = { ...botInfoInitState }
    }

    const clearGeminiInfo = () => {
      geminiInfo.value = { ...geminiInfoInitState }
    }

    const clearGroqInfo = () => {
      groqInfo.value = { ...groqInfoInitState }
    }

    return {
      aiInfo,
      botInfo,
      groqInfo,
      geminiInfo,
      localStorageInfo,
      updateLocalStorageInfo,
      aiChatCollection,
      setAiInfo,
      unshiftAiCollection,
      pushAiCollection,
      updateAiCollection,
      delAiCollection,
      setAiCollection,
      clearAiCollection,
      setAiInfoByKey,
      setBotInfoByKey,
      setGroqInfoByKey,
      setGeminiInfoByKey,
      clearAiInfo,
      clearBotInfo,
      clearGroqInfo,
      clearGeminiInfo,
    }
  },
  {
    persist: true,
  },
)
