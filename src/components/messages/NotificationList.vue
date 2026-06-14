<template>
  <infiniteScroll :hasMore="!noMore" :initialItems="items" @load="handleLoad">
    <template #default="slotProps: { items: any[] }">
      <div ref="containerRef">
        <div
          v-for="item in slotProps.items"
          :key="item.ID || item.id || Math.random()"
          :data-message-id="item.ID || item.id"
        >
          <Notification :notification="item" />
          <n-divider style="margin: 0" />
        </div>
      </div>
    </template>
  </infiniteScroll>
</template>

<script setup lang="ts">
import { ref, onActivated, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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

const route = useRoute()
const router = useRouter()

onActivated(() => {
  window.$Logger.logPageView({
    pageLink: `/Social/Notifications/${CategoryID}/`,
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
const containerRef = ref<HTMLElement | null>(null)
let skip = ref(props.initialSkip ?? (route.query.skip ? parseInt(route.query.skip as string) : 0))
const noMore = ref(false)
const scrolledToTarget = ref(false)
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

const props = withDefaults(defineProps<{
  CategoryID: number
  fromID?: string
  initialSkip?: number
}>(), {
  fromID: undefined,
  initialSkip: undefined,
})
const { CategoryID } = props

function fillInTemplate(data: string | null, message: Message) {
  const re = (data ?? '')
    .replace(
      /{Users}/g,
      message.Users.map(
        (user: string, index: number) => `<user=${user}>${message.UserNames[index]}</user>`,
        // `<span class='RUser' data-user='${user}'>${message.UserNames[index]}</span>`,
      ).join(' '),
    )
    .replace(
      /{Experiment}/g,
      message.Fields?.Discussion
        ? `<discussion=${message.Fields?.DiscussionID}>${message.Fields?.Discussion}</discussion>`
        : `<experiment=${message.Fields?.ExperimentID}>${message.Fields?.Experiment}</experiment>`,
    )
    .replace(/{\$Content}/g, message.Fields.Content)
    .replace(
      /{\$TargetName}/g,
      message.Fields.TargetName || storageManager.getObj('userInfo').value?.Nickname || '',
    )
    .replace(/{\$Until}/g, message.Fields.Until)
    .replace(/{\$Editor}/g, message.Fields.Editor)
    .replace(/{\$Gold}/g, message.Numbers?.Gold?.toString() || '{error}')
    .replace(/undefined/g, '')
  return re
}

// 处理加载事件
// eslint-disable-next-line max-lines-per-function
const handleLoad = async (noTemplates = true) => {
  if (storageManager.getObj('userInfo').value?.Nickname == null) return
  if (loading.value) return // Lock
  if (noMore.value) return
  loading.value = true
  try {
    const getMessagesResponse = await getData('/Messages/GetMessages', {
      CategoryID,
      Take: 20,
      Skip: skip.value,
      NoTemplates: noTemplates,
    })

    if (getMessagesResponse.Status !== 200 || !getMessagesResponse?.Data) {
      showAPiError(
        t('errors.apiErrorTitle'),
        t('errors.apiErrorMessage', {
          path: '/Messages/GetMessages',
          status: getMessagesResponse.Status,
          message: getMessagesResponse?.Message || '',
        }),
        async () => {
          return getData('/Messages/GetMessages', {
            CategoryID: CategoryID,
            Take: 20,
            Skip: skip.value,
            NoTemplates: noTemplates,
          })
        },
      )
      const _req = removeToken({
        CategoryID: CategoryID,
        Take: 20,
        Skip: skip.value,
        NoTemplates: noTemplates,
      })
      const _res = removeToken(getMessagesResponse)
      window.$ErrorLogger.captureApiError(
        'POST',
        '/Messages/GetMessages',
        getMessagesResponse.Status,
        _res,
        _req,
      )
      console.error(`/Messages/GetMessages returned ${getMessagesResponse.Status}`, _res)
      loading.value = false
      return
    }

    if (!noTemplates) {
      templates = getMessagesResponse.Data.Templates
    }

    const messages = getMessagesResponse.Data.Messages
    if (messages.length === 0) {
      noMore.value = true
      showMessage('warning', t('ui.messages.noMore'), { duration: 2000 })
    }

    const defaultItems = messages.map((message) => {
      const template = templates.find((t) => t.ID === message.TemplateID)
      if (!template) {
        return {
          ...message,
          msg_title: '',
          msg: message.Fields.Content,
          msg_type: message.CategoryID,
        }
      }
      const lang = (
        [
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
        ].includes(locale.value)
          ? locale.value
          : 'Chinese'
      ) as keyof MessageTemplate['Subject']
      return {
        ...message,
        msg_title: fillInTemplate(template.Subject[lang], message),
        msg: fillInTemplate(template.Content[lang], message),
        msg_type: message.CategoryID,
      }
    })

    items.value = [...items.value, ...defaultItems]

    await nextTick()
    scrollToTarget()

    loading.value = false
    skip.value += 20
    updateRouteQuery()
  } catch (error) {
    showMessage('error', String(error), { duration: 5000 })
  }
}

function scrollToTarget() {
  const targetID = props.fromID || (route.query.from as string | undefined)
  if (!targetID || scrolledToTarget.value) return

  const index = items.value.findIndex((item) => item.ID === targetID)
  if (index === -1) return

  scrolledToTarget.value = true
  if (!containerRef.value) return

  const targetEl = containerRef.value.querySelector(`[data-message-id="${targetID}"]`)
  if (targetEl) {
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

function isActiveTab(): boolean {
  const categoryParam = route.query.category as string | undefined
  if (categoryParam) {
    return String(CategoryID) === categoryParam
  }
  return CategoryID === 0
}

function updateRouteQuery() {
  if (!isActiveTab() || skip.value <= 0) return
  router.replace({
    query: {
      ...route.query,
      skip: String(skip.value),
    },
  })
}

handleLoad(false)
</script>

<style scoped>
.text {
  text-align: center;
  color: #888;
}
</style>
