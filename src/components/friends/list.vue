<template>
  <infiniteScroll :initial-items="items" :has-more="!noMore" :margin-top="-200" @load="handleLoad">
    <template #default="{ items }">
      <n-grid :cols="props.cols || 2">
        <n-gi v-for="user in items as RelationList[]" :key="user.User?.ID">
          <UserItem v-if="user.User" :user="user.User" />
        </n-gi>
      </n-grid>
    </template>
  </infiniteScroll>
</template>

<script setup lang="ts">
import UserItem from './item.vue'
import { NGrid, NGi } from 'naive-ui'
import { ref } from 'vue'
import type { RelationList } from '@services/../pl-serve-type-main/type/main'
import { getData } from '@services/api/getData.ts'
import { showAPiError } from '@popup/index.ts'
import { removeToken } from '@services/utils.ts'
import infiniteScroll from '../utils/infiniteScroll.vue'
import { useI18n } from 'vue-i18n'
import { showMessage } from '@popup/naiveui'

// cols需要在父组件传参，这可能会在好友界面和Profile界面（未实现）展现
//  Props `cols` needs to be passed from the parent component, which may be displayed in the Friends page and Profile page (not implemented yet).
const props = defineProps<{
  userid?: string
  type?: string
  cols?: number
}>()

const loading = ref(false)
const skip = ref(0)
const noMore = ref(false)
const hasInformed = ref(false)
const items = ref<RelationList[]>([])
const { t } = useI18n()
// Vue对于Ref会自动处理数据竞争问题
// Vue automatically handles data race issues with Ref.

async function handleLoad() {
  if (!props.userid) return
  if (loading.value) return // Serves as a "lock"
  if (noMore.value) {
    if (!hasInformed.value) showMessage('info', t('ui.messages.noMore'))
    hasInformed.value = true
    return
  }
  loading.value = true
  try {
    const getRelationsRes = await getData('/Users/GetRelations', {
      UserID: props.userid,
      DisplayType: props.type ? Number(props.type) : 0,
      Skip: skip.value,
      Take: 24,
      Query: '',
    })
    if (getRelationsRes.Status !== 200) {
      showAPiError(t('errors.apiErrorTitle'), t('errors.apiErrorMessage'), handleLoad)
      const request = removeToken({
        UserID: props.userid,
        DisplayType: props.type,
        Skip: skip.value,
        Take: 24,
        Query: '',
      })
      const result = removeToken(getRelationsRes)
      window.$ErrorLogger.captureApiError(
        'POST',
        '/Users/GetRelations',
        getRelationsRes.Status,
        result,
        request,
      )
      console.error(`/Users/GetRelations returned ${getRelationsRes.Status}`, result)
      return
    }
  // 在某些地方用的skip传入的是时间戳，但是这里找不到可能与时间戳有关的逻辑，skip为整数也能work
  // In some places, the 'skip' is a timestamp, but here there doesn't seem to be any logic related to the timestamp; 'skip' as an integer also works.
    noMore.value = (getRelationsRes.Data?.$values?.length ?? 0) < 24
    skip.value += 24
    if (getRelationsRes.Data?.$values) {
      items.value.push(...getRelationsRes.Data.$values)
    }
  } finally {
    loading.value = false
  }
}

window.$Logger.logPageView({
  pageLink: `/Social/Friends/${Number(props.type)}/`,
  timeStamp: Date.now(),
})

handleLoad()
</script>

<style scoped></style>
