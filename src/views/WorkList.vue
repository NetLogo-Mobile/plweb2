<template>
  <!-- show when click 'more' in Block/TopicBlock component -->
  <Header>
    <img
      :src="getPath('/@base/assets/library/Navigation-Return.png')"
      style="width: 2.7em"
      @click="goBack"
    />
    <h2 style="margin-right: auto; margin-left: 20px" class="title">
      <span class="title-detailed">{{ detailedTitle }}</span>
      <span class="title-generic">{{ $t('worklist.title') }}</span>
    </h2>
  </Header>

  <div class="list">
    <WorksList
      :key="String(route.params.config || '')"
      :row="maxProjectsPerLine"
      :q="decodedQuery"
    />
  </div>
</template>

<script setup lang="ts">
import Header from '../components/utils/Header.vue'
import WorksList from '../components/projects/wortList.vue'
import { useRoute } from 'vue-router'
import { decodeHrefToQueryObj, getPath } from '@services/utils'
import { useResponsive } from '../layout/useResponsive'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import getTagName from '@i18n/getTagName'

const route = useRoute()
const { t } = useI18n()

const { maxProjectsPerLine } = useResponsive()

const decodedQuery = computed(() => {
  const config = route.params.config as string
  return config ? decodeHrefToQueryObj(config) : {}
})

const SORT_LABELS: Record<string, string> = {
  '0': 'worklist.sortDefault',
  Default: 'worklist.sortDefault',
  '1': 'worklist.sortPopularity',
  Popularity: 'worklist.sortPopularity',
  '2': 'worklist.sortRandom',
  Random: 'worklist.sortRandom',
}

const SPECIAL_LABELS: Record<string, string> = {
  Favorite: 'worklist.specialFavorite',
  Support: 'worklist.specialSupport',
  Star: 'worklist.specialStar',
}

function appendQueryLabels(parts: string[], query: ReturnType<typeof decodeHrefToQueryObj>) {
  const sortLabel = SORT_LABELS[String(query.Sort)]
  if (sortLabel) parts.push(t(sortLabel))
  const specialLabel = SPECIAL_LABELS[String(query.Special)]
  if (specialLabel) parts.push(t(specialLabel))
}

function appendFilterLabel(parts: string[], query: ReturnType<typeof decodeHrefToQueryObj>) {
  const tag = query.Tags?.[0]
  if (tag) {
    parts.push(tag.startsWith('C-') ? tag.slice(2) : getTagName(tag))
    return
  }
  if (!query.Category) return
  const key = `worklist.category${query.Category}`
  const category = t(key)
  if (category !== key) parts.push(category)
}

const detailedTitle = computed(() => {
  const query = decodedQuery.value
  const parts: string[] = []
  appendQueryLabels(parts, query)
  appendFilterLabel(parts, query)
  if (!parts.length) return t('worklist.title')
  parts.push(t('worklist.works'))
  return parts.join('')
})

const goBack = () => {
  window.history.back()
}
</script>

<style scoped>
.list {
  padding: 10px;
  box-sizing: border-box;
  background-color: #ccc3;
  scrollbar-width: none;
  position: fixed;
  top: 50px;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.title-detailed {
  display: none;
}

.title-generic {
  display: inline;
}

@media (min-width: 640px) {
  .title-detailed {
    display: inline;
  }
  .title-generic {
    display: none;
  }
}
</style>
