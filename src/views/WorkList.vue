<template>
  <!-- show when click 'more' in Block/TopicBlock component -->
  <Header>
    <img src="/assets/library/Navigation-Return.png" style="width: 2.7em" @click="goBack" />
    <h2 style="margin-right: auto; margin-left: 20px" class="title">
      <span class="title-detailed">{{ detailedTitle }}</span>
      <span class="title-generic">{{ $t('worklist.title') }}</span>
    </h2>
  </Header>

  <div class="list">
    <WorksList
      :row="maxProjectsPerLine"
      :q="route.params.config ? decodeHrefToQueryObj(route.params.config as string) : {}"
    />
  </div>
</template>

<script setup lang="ts">
import Header from '../components/utils/Header.vue'
import WorksList from '../components/projects/wortList.vue'
import { useRoute } from 'vue-router'
import { decodeHrefToQueryObj } from '@services/utils'
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

const detailedTitle = computed(() => {
  const query = decodedQuery.value
  const parts: string[] = []

  const sort = query.Sort
  if (sort === 0 || sort === '0' || sort === 'Default') parts.push(t('worklist.sortDefault'))
  else if (sort === 1 || sort === '1' || sort === 'Popularity')
    parts.push(t('worklist.sortPopularity'))
  else if (sort === 2 || sort === '2' || sort === 'Random') parts.push(t('worklist.sortRandom'))

  if (query.Special === 'Favorite') parts.push(t('worklist.specialFavorite'))
  else if (query.Special === 'Support') parts.push(t('worklist.specialSupport'))
  else if (query.Special === 'Star') parts.push(t('worklist.specialStar'))

  if (query.Tags?.length) {
    const tag = query.Tags[0]
    parts.push(tag.startsWith('C-') ? tag.slice(2) : getTagName(tag))
  } else if (query.Category) {
    const key = `worklist.category${query.Category}`
    const cat = t(key)
    if (cat !== key) parts.push(cat)
  }

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
