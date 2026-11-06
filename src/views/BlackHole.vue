<template>
  <div id="blackhole">
    <Header>
      <h1>{{ $t('blackhole.title') }}</h1>
    </Header>
    <!-- Height：50px fixed -->
    <main>
      <div
        v-show="loading"
        class="loading"
        :style="{
          backgroundImage: `url(${getPath('/@base/assets/messages/Message-Default.png')})`,
        }"
      ></div>
      <div v-show="!loading" class="block-container">
        <n-grid :x-gap="12" :y-gap="12" :cols="blockItemsPerRow">
          <n-gi v-for="block in visibleBlocks" :key="getBlockKey(block)">
            <div class="block" style="height: 100%">
              <TopicBlock
                v-if="isTopicBlock(block)"
                :block="block"
                :activityProc="
                  (event) =>
                    getActivityProc(block.AuxiliaryLink || 'internal://co-dev')?.(event) ??
                    undefined
                "
              />
              <Block v-else :block="block" :maxProjectsPerBlock="maxProjectsPerBlock" />
            </div>
          </n-gi>
        </n-grid>
      </div>
    </main>
    <Footer></Footer>
  </div>
</template>

<script setup lang="ts">
import { useResponsive } from '../layout/useResponsive'
import { computed, onActivated, onMounted, onUnmounted, ref } from 'vue'
import Header from '../components/utils/Header.vue'
import TopicBlock from '../components/blocks/TopicBlock.vue'
import Block from '../components/blocks/Block.vue'
import Footer from '../components/utils/Footer.vue'
import { getData } from '@services/api/getData.ts'
import { showAPiError } from '@popup/index.ts'
import { removeToken } from '@services/utils.ts'
import { useI18n } from 'vue-i18n'
import { NGrid, NGi } from 'naive-ui'
import { getPath } from '@services/utils.ts'
import type {
  ListBlock,
  TopicBlock as TopicBlockType,
} from '@services/../pl-serve-type-main/type/main'

import '../layout/loading.css'
import '../layout/startPage.css'

const loading = ref(true)
const blocks = ref<Array<ListBlock | TopicBlockType>>([])
const visibleBlocks = computed(() => blocks.value.filter((block) => block.Summaries.length > 0))

function isTopicBlock(block: ListBlock | TopicBlockType): block is TopicBlockType {
  return block.$type === 'Quantum.Models.Contents.TopicBlock, Quantum Models'
}

function getBlockKey(block: ListBlock | TopicBlockType) {
  return isTopicBlock(block) ? block.Subject : block.Header
}

const goToWebCommunity = () => {
  window.$Logger.logEvent({
    category: 'Activity',
    action: 'Visit-External',
    label: 'https://pl.turtlesim.com',
    timestamp: Date.now(),
  })
  window.open('https://pl.turtlesim.com')
}

const goToDevelopment = () => {
  window.$Logger.logEvent({
    category: 'Activity',
    action: 'Visit-External',
    label: 'https://github.com/NetLogo-Mobile/plweb2',
    timestamp: Date.now(),
  })
  window.open(getPath('/@root/about'))
}

// Mabey some activity links will be specific to the web version one day
// @see Interceptor.AfterRequest
const activityLinkMap: Record<string, () => void> = {
  'internal://forum': goToWebCommunity,
  'internal://co-dev': goToDevelopment,
}

const getActivityProc = (link: string | undefined): ((event: MouseEvent) => void) => {
  const fn = link ? activityLinkMap[link] : undefined
  return fn
    ? (event: MouseEvent) => {
        event?.preventDefault?.()
        fn()
      }
    : () => {}
}

const { blockItemsPerRow, maxProjectsPerBlock } = useResponsive()

const { t } = useI18n()

let libraryRequestId = 0

async function fetchLibrary() {
  const requestId = ++libraryRequestId
  const getLibraryResponse = await getData('/Contents/GetLibrary', {
    Identifier: 'Discussions',
    Language: 'Chinese',
  })
  if (requestId !== libraryRequestId) return

  if (getLibraryResponse.Status !== 200 || !getLibraryResponse.Data) {
    showAPiError(
      t('errors.apiErrorTitle'),
      t('errors.apiErrorMessage', {
        path: '/Contents/GetLibrary',
        status: getLibraryResponse.Status,
        message: getLibraryResponse.Message,
      }),
      fetchLibrary,
    )
    const _req = removeToken({
      Identifier: 'Discussions',
      Language: 'Chinese',
    })
    const _res = removeToken(getLibraryResponse)
    window.$ErrorLogger.captureApiError(
      'POST',
      '/Contents/GetLibrary',
      getLibraryResponse.Status,
      _res,
      _req,
    )
    console.error(`/Contents/GetLibrary returned ${getLibraryResponse.Status}`, _res)
    return
  }
  loading.value = false
  blocks.value = getLibraryResponse.Data.Blocks
}

onMounted(() => {
  void fetchLibrary()
})

onUnmounted(() => {
  libraryRequestId++
})

onActivated(() => {
  window.$Logger.logPageView({
    pageLink: '/Discussions/',
    timeStamp: Date.now(),
  })
  window.$Logger.logPageView({
    pageLink: '/Library/Discussions/',
    timeStamp: Date.now(),
  })
})
</script>

<style scoped></style>
