<template>
  <infiniteScroll :initial-items="items" :has-more="!noMore" @load="handleLoad">
    <template #default="{ items }">
      <n-grid :cols="props.row || 3" :x-gap="16" :y-gap="16" responsive="screen">
        <n-gi v-for="item in items as Summary[]" :key="item.ID">
          <Works :item="item" :show-name="!props.q?.UserID" />
        </n-gi> </n-grid
    ></template>
  </infiniteScroll>
</template>

<script setup lang="ts">
import { NGrid, NGi } from 'naive-ui'
import Works from './item.vue'
import { ref } from 'vue'
import type { ExperimentQuery, Summary } from '@services/../pl-serve-type-main/type/main'
import { getData } from '@services/api/getData.ts'
import { showAPiError } from '@popup/index.ts'
import { removeToken } from '@services/utils.ts'
import { showMessage } from '@popup/naiveui'
import infiniteScroll from '../utils/infiniteScroll.vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  row?: number
  q?: Partial<ExperimentQuery>
}>()

const { t } = useI18n()

const items = ref<Summary[]>([])
const from = ref('')
const isGettingData = ref(false)

const skip = ref(0)
const noMore = ref(false)
const hasInformed = ref(false)

function createQuery(): ExperimentQuery {
  return {
    Category: 'Discussion',
    Languages: [],
    ExcludeLanguages: null,
    Tags: ['精选'],
    ModelTags: null,
    ExcludeTags: null,
    ModelID: null,
    ParentID: null,
    UserID: null,
    Special: null,
    From: from.value || null,
    Skip: skip.value,
    Take: 24,
    Days: 0,
    Sort: 0,
    ShowAnnouncement: false,
    ...props.q,
  }
}

function queryProjects() {
  return getData('/Contents/QueryExperiments', { Query: createQuery() })
}

function reportLoadError(response: Awaited<ReturnType<typeof queryProjects>>) {
  showAPiError(
    t('errors.apiErrorTitle'),
    t('errors.apiErrorMessage', {
      path: '/Contents/QueryExperiments',
      status: response.Status,
      message: response.Message || '',
    }),
    handleLoad,
  )
  const request = removeToken({ Query: createQuery() })
  const result = removeToken(response)
  window.$ErrorLogger.captureApiError(
    'POST',
    '/Contents/QueryExperiments',
    response.Status,
    result,
    request,
  )
  console.error(`/Contents/QueryExperiments returned ${response.Status}`, result)
}

function appendProjects(projects: Summary[]) {
  if (projects.length < 24) {
    if (!hasInformed.value) showMessage('warning', t('ui.messages.noMore'), { duration: 1000 })
    noMore.value = true
  }
  skip.value += 24
  items.value.push(...projects)
  from.value = items.value.at(-1)?.ID || ''
}

async function handleLoad() {
  if (noMore.value) {
    hasInformed.value = true
    return
  }
  if (isGettingData.value === true) return // Lock
  isGettingData.value = true

  try {
    const response = await queryProjects()
    if (response.Status !== 200) {
      reportLoadError(response)
      return
    }
    if (!response.Data) {
      showAPiError(t('errors.apiErrorTitle'), t('errors.apiErrorMessage'), handleLoad)
      return
    }
    appendProjects(response.Data.$values)
  } finally {
    isGettingData.value = false
  }
}

handleLoad()
</script>
