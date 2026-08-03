<template>
  <Header>
    <div class="header">
      <img
        :src="getPath('/@base/assets/library/Navigation-Return.png')"
        style="width: 3em"
        @click="goBack"
      />
      <div class="title">
        {{ title }}
      </div>
      <img
        :src="getPath('/@base/assets/library/Button-Category.png')"
        style="width: 3em; margin-left: auto"
      />
    </div>
  </Header>
  <div class="content">
    <div class="list">
      <MessagesList
        :Category="routeCategory"
        :ID="route.params.id as string"
        :initial-from="commentFrom"
        :initial-take="commentTake"
        :initial-skip="commentSkip"
        :target-comment-id="commentFrom"
        :upDate="upDate"
        @msgClick="handleMsgClick"
      ></MessagesList>
    </div>

    <CommentComposer
      v-model="comment"
      class="comments-page__composer"
      :maxlength="300"
      :loading="isLoading"
      :disabled="!comment.trim()"
      :placeholder="t('comments.placeholder')"
      @submit="handleEnter"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import MessagesList from '../components/messages/MessageList.vue'
import { useRoute } from 'vue-router'
import { getRouteCategory } from '../router/category'
import Header from '../components/utils/Header.vue'
import parse from '@services/pltxt2htm/commonParser'
import postComment from '@services/postComment.ts'
import { useI18n } from 'vue-i18n'
import CommentComposer from '../components/utils/CommentComposer.vue'
import type { Category, CommentResult } from '@services/../pl-serve-type-main/type/main'
import { getPath } from '@services/utils'

const { t } = useI18n()
const route = useRoute()
const routeCategory = computed(() => getRouteCategory(route, 'Discussion'))
const commentFrom = computed(() => {
  const from = route.query.from
  return typeof from === 'string' ? from : ''
})
const commentSkip = computed(() => {
  const skip = Number(route.query.skip)
  return Number.isSafeInteger(skip) && skip >= 0 ? skip : 0
})
const commentTake = computed(() => {
  const take = Number(route.query.take)
  return Number.isSafeInteger(take) && take > 0 && take <= 50 ? take : 20
})
let isLoading = ref(false)
let replyID = ref('')
let upDate = ref(0)
const title = ref('')
let comment = ref('') // 输入的内容 Input content

onMounted(async () => {
  const parsedName = await parse(route.params.name as string)
  title.value = t('comments.title', {
    name: parsedName,
    category: routeCategory.value === 'User' ? t('comments.home') : t('comments.area'),
  })
})

const goBack = () => {
  window.history.back()
}

function handleMsgClick(item: CommentResult) {
  replyID.value = item.UserID
  comment.value = `${t('ui.messages.replyToUser')}@${item.Nickname}: `
}

const handleEnter = async () => {
  await postComment(
    comment,
    isLoading,
    routeCategory.value as Category,
    route.params.id as string,
    replyID,
    upDate,
  )
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
  padding-right: 20px;
}

.title {
  font: 1.4em sans-serif;
  white-space: nowrap;
  z-index: 0;
}

.content {
  height: calc(100dvh - 50px);
  display: flex;
  flex-direction: column;
}

.list {
  padding-left: 5px;
  flex: 1;
  min-height: 0;
}

.sendComment {
  width: 97%;
  margin: 7px auto;
  flex-shrink: 0;
}

@media (min-aspect-ratio: 1/1) {
  .list {
    padding-left: 20px;
  }
}
</style>
