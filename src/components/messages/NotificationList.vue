<template>
  <InfiniteScroll :has-more="!noMore" :initial-items="items" @load="handleLoad">
    <template #default="{ items: notificationItems }">
      <div v-for="item in asNotificationMessages(notificationItems)" :key="item.ID">
        <Notification :notification="item" />
        <n-divider style="margin: 0" />
      </div>
    </template>
  </InfiniteScroll>
</template>

<script setup lang="ts">
import { ref, onActivated } from 'vue'
import Notification from './NotificationItem.vue'
import { getData } from '@services/api/getData.ts'
import { showAPiError } from '@popup/index.ts'
import { removeToken } from '@services/utils.ts'
import { showMessage } from '@popup/naiveui'
import InfiniteScroll from '../utils/infiniteScroll.vue'
import { NDivider } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import storageManager from '@storage/index.ts'
import type { Message, MessageTemplate } from '@services/../pl-serve-type-main/type/main'

onActivated(() => {
  window.$Logger.logPageView({
    pageLink: `/Social/Notifications/${props.CategoryID}/`,
    timeStamp: Date.now(),
  })
})

const { locale, t } = useI18n()

type NotificationMessage = Message & {
  msg_title: string
  msg: string
  msg_type: number
}

const items = ref<NotificationMessage[]>([])
const loading = ref(false)
let skip = ref(0) // 获取消息API的必要参数 A necessary parameter for the GetMessages API
const noMore = ref(false)
let templates: MessageTemplate[] = [
  {
    ID: '5c90f172a2409b51dc5cb945',
    Identifier: 'Letter-Test',
    CategoryID: 1,
    Management: false,
    Subject: {
      Chinese: '一封测试邮件 {Users}',
      English: 'A letter for test {Users}',
      ChineseTraditional: '一封測試郵件 {Users}',
      German: 'Ein Brief für den Test {Benutzer}',
      French: 'Une lettre pour le test {Utilisateurs}',
      Japanese: 'テスト用の手紙{Users}',
      Italian: 'Una lettera per il test {Utenti}',
      Polish: null,
      Spanish: null,
      Ukrainian: null,
    },
    Content: {
      Chinese: '这是一封测试邮件，用于测试所有功能。{Users}',
      English: 'This is a letter for test to test every features. {Users}',
      ChineseTraditional: '這是一封測試郵件，用於測試所有功能。 {Users}',
      German: 'Dies ist ein Testbrief zum Testen aller Funktionen. {Benutzer}',
      French: 'Ceci est une lettre de test pour tester toutes les fonctionnalités. {Utilisateurs}',
      Japanese: 'これはすべての機能をテストするためのテスト用の手紙です。 {ユーザー}',
      Italian: 'Questa è una lettera per test per testare tutte le funzionalità. {} utenti',
      Polish: null,
      Spanish: null,
      Ukrainian: null,
    },
    Description: null,
    Bonuses: {
      Fragment: 1,
    },
    Action: null,
    CombineLimit: 0,
    AvailableFrom: 1546322400000,
    AvailableUntil: 1893477600000,
    Push: 0,
  },
]

const props = defineProps<{
  CategoryID: number
}>()

function asNotificationMessages(items: unknown[]): NotificationMessage[] {
  return items as NotificationMessage[]
}

function fillInTemplate(data: string | null, message: Message) {
  const users = message.Users.map(
    (user: string, index: number) => `<user=${user}>${message.UserNames[index]}</user>`,
  ).join(' ')
  const experiment = message.Fields?.Discussion
    ? `<discussion=${message.Fields.DiscussionID}>${message.Fields.Discussion}</discussion>`
    : `<experiment=${message.Fields?.ExperimentID}>${message.Fields?.Experiment}</experiment>`
  const targetName = [message.Fields.TargetName, storageManager.getObj('userInfo').value?.Nickname]
    .find(Boolean)
    ?.toString() ?? ''
  const replacements: Array<[RegExp, string]> = [
    [/{Users}/g, users],
    [/{Experiment}/g, experiment],
    [/{\$Content}/g, message.Fields.Content],
    [/{\$TargetName}/g, targetName],
    [/{\$Until}/g, message.Fields.Until],
    [/{\$Editor}/g, message.Fields.Editor],
    [/{\$Gold}/g, message.Numbers?.Gold?.toString() ?? '{error}'],
    [/undefined/g, ''],
  ]
  return replacements.reduce((text, [pattern, value]) => text.replace(pattern, value), data ?? '')
}

function getMessages(noTemplates: boolean) {
  return getData('/Messages/GetMessages', {
    CategoryID: props.CategoryID,
    Take: 20,
    Skip: skip.value,
    NoTemplates: noTemplates,
  })
}

function reportLoadError(response: Awaited<ReturnType<typeof getMessages>>, noTemplates: boolean) {
  showAPiError(
    t('errors.apiErrorTitle'),
    t('errors.apiErrorMessage', {
      path: '/Messages/GetMessages',
      status: response.Status,
      message: response.Message || '',
    }),
    () => getMessages(noTemplates),
  )
  const request = removeToken({
    CategoryID: props.CategoryID,
    Take: 20,
    Skip: skip.value,
    NoTemplates: noTemplates,
  })
  const result = removeToken(response)
  window.$ErrorLogger.captureApiError(
    'POST',
    '/Messages/GetMessages',
    response.Status,
    result,
    request,
  )
  console.error(`/Messages/GetMessages returned ${response.Status}`, result)
}

const supportedLanguages: Array<keyof MessageTemplate['Subject']> = [
  'Chinese',
  'English',
  'ChineseTraditional',
  'German',
  'French',
  'Japanese',
  'Italian',
  'Polish',
  'Spanish',
  'Ukrainian',
]

function formatMessage(message: Message): NotificationMessage {
  const template = templates.find((item) => item.ID === message.TemplateID)
  if (!template) {
    return { ...message, msg_title: '', msg: message.Fields.Content, msg_type: message.CategoryID }
  }
  const currentLocale = locale.value as keyof MessageTemplate['Subject']
  const language = supportedLanguages.includes(currentLocale) ? currentLocale : 'Chinese'
  return {
    ...message,
    msg_title: fillInTemplate(template.Subject[language], message),
    msg: fillInTemplate(template.Content[language], message),
    msg_type: message.CategoryID,
  }
}

function appendMessages(messages: Message[]) {
  if (messages.length === 0) {
    noMore.value = true
    showMessage('warning', t('ui.messages.noMore'), { duration: 2000 })
  }
  items.value.push(...messages.map(formatMessage))
  skip.value += 20
}

const handleLoad = async (noTemplates = true) => {
  if (!storageManager.getObj('userInfo').value?.Nickname || loading.value || noMore.value) return
  loading.value = true
  try {
    const response = await getMessages(noTemplates)
    if (response.Status !== 200 || !response.Data) {
      reportLoadError(response, noTemplates)
      return
    }
    if (!noTemplates) templates = response.Data.Templates
    appendMessages(response.Data.Messages)
  } catch (error) {
    showMessage('error', String(error), { duration: 5000 })
  } finally {
    loading.value = false
  }
}

handleLoad(false)
</script>

<style scoped>
.text {
  text-align: center;
  color: #888;
}
</style>
