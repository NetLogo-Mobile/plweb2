<template>
  <div id="my-page">
    <Header>
      <div class="my-page__title">{{ $t('footer.my') }}</div>
    </Header>
    <main>
      <div v-show="isLoading" class="loading"></div>
      <div v-show="!isLoading" class="block-container">
        <n-grid :x-gap="12" :y-gap="12" :cols="blockItemsPerRow">
          <n-gi v-for="block in blocks" :key="block.Header">
            <div class="my-page__block">
              <Block :block="block" :maxProjectsPerBlock="maxProjectsPerBlock" />
            </div>
          </n-gi>
        </n-grid>
      </div>
    </main>
  </div>
  <Footer></Footer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NGrid, NGi } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { getData } from '@api/getData'
import { checkLogin } from '@services/utils'
import { showLoginModel } from '@popup/index'
import { useResponsive } from '../layout/useResponsive'
import Header from '../components/utils/Header.vue'
import Footer from '../components/utils/Footer.vue'
import Block from '../components/blocks/Block.vue'
import type { ListBlock, Summary } from '@services/../pl-serve-type-main/type/main'

const { t } = useI18n()
const isLoading = ref(true)
const blocks = ref<ListBlock[]>([])
const { blockItemsPerRow, maxProjectsPerBlock } = useResponsive()

function createBlock(header: string, summaries: Summary[]): ListBlock {
  return {
    $type: 'Quantum.Models.Contents.ListBlock, Quantum Models',
    Header: header,
    Summaries: summaries,
    DefaultLink: null,
    DefaultText: null,
    FetchAmount: 0,
    FetchConfiguration: null,
    FetchSource: '',
    Locations: null,
    Permission: null,
    TargetLink: '',
    Type: 0,
  }
}

async function querySummaries(category: 'Experiment' | 'Discussion', special: 'Favorite' | 'Support' | null) {
  const response = await getData('/Contents/QueryExperiments', {
    Query: {
      Category: category,
      Languages: [],
      Tags: [],
      Take: 24,
      Sort: 0,
      Skip: 0,
      Days: 0,
      Special: special,
      UserID: null,
      ExcludeLanguages: null,
      ExcludeTags: null,
      ModelTags: null,
      ModelID: null,
      ParentID: null,
      From: null,
      ShowAnnouncement: false,
    },
  })

  return response.Data?.$values ?? []
}

onMounted(async () => {
  if (!checkLogin(false)) {
    showLoginModel()
    isLoading.value = false
    return
  }

  const [publishedExp, publishedDiscussion, favoriteExp, favoriteDiscussion, supportExp, supportDiscussion] =
    await Promise.all([
      querySummaries('Experiment', null),
      querySummaries('Discussion', null),
      querySummaries('Experiment', 'Favorite'),
      querySummaries('Discussion', 'Favorite'),
      querySummaries('Experiment', 'Support'),
      querySummaries('Discussion', 'Support'),
    ])

  blocks.value = [
    createBlock(t('myPage.publishedExperiment'), publishedExp),
    createBlock(t('myPage.publishedDiscussion'), publishedDiscussion),
    createBlock(t('myPage.favoriteExperiment'), favoriteExp),
    createBlock(t('myPage.favoriteDiscussion'), favoriteDiscussion),
    createBlock(t('myPage.supportedExperiment'), supportExp),
    createBlock(t('myPage.supportedDiscussion'), supportDiscussion),
  ]

  isLoading.value = false
})
</script>

<style scoped>
.my-page__title {
  font-size: 20px;
  font-weight: 600;
}

.my-page__block {
  height: 100%;
}
</style>
