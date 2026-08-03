<template>
  <BiLayout>
    <template #left>
      <div
        ref="nickname"
        class="cover"
        :style="{
          backgroundImage: `url(${coverUrl}), url(${defaultCoverUrl})`,
        }"
      >
        <div>
          <img :src="returnImagePath" class="return" @click="goBack" />
          <div
            v-richText="() => parseInline(data.Subject)"
            class="title"
            @click="copySubject"
          ></div>
          <div class="tagContainer">
            <Tag
              v-if="routeCategory"
              :tag="('C-' + routeCategory) as string"
              style="color: aquamarine; font-weight: bold"
              :category="data.Category"
            />
            <Tag
              v-for="tag in filteredTags"
              :key="tag"
              :tag="tag"
              :category="data.Category"
            />
          </div>
        </div>
        <div style="margin-top: auto" class="coverBottom">
          <div class="btns" style="display: flex; justify-content: space-around">
            <n-button type="info" strong round class="enter" @click="goToExperiment">
              {{ t('expeSummary.enterExp') }}
            </n-button>
          </div>
        </div>
      </div>
    </template>

    <template #right>
      <div class="context">
        <n-tabs v-model:value="selectedTab" justify-content="space-evenly" type="line">
          <n-tab-pane name="Intro" :tab="t('expeSummary.introTab')">
            <div class="gray">
              <div
                style="
                  display: flex;
                  height: 60px;
                  background-color: white;
                  border-radius: 10px;
                  margin: 5px;
                "
                @click="showUserCard(data.User.ID)"
              >
                <div
                  style="
                    margin: auto 10px;
                    height: 90%;
                    aspect-ratio: 1;
                    border-radius: 50%;
                    overflow: hidden;
                    background: #e8e8e8;
                    flex-shrink: 0;
                  "
                >
                  <img
                    :src="avatarUrl"
                    style="
                      width: 100%;
                      height: 100%;
                      border-radius: 50%;
                      object-fit: cover;
                      transition: opacity 0.25s;
                    "
                    :style="{ opacity: avatarLoaded ? 1 : 0 }"
                    @load="avatarLoaded = true"
                    @error="avatarLoaded = true"
                  />
                </div>
                <div style="text-align: left">
                  <p style="color: #007bff; margin: 2% 0 2% 0; width: 100%; font-size: 16px">
                    {{ data.User.Nickname }}
                  </p>
                  <p
                    v-richText="() => parseInline(data.User.Signature)"
                    style="color: gray; margin: 0%; width: 100%"
                  ></p>
                </div>
              </div>
              <div
                style="
                  margin-top: 3%;
                  background-color: white;
                  border-radius: 10px;
                  padding: 10px;
                  margin: 5px;
                "
              >
                <h3 style="color: #007bff; text-align: left; margin-top: 2px; margin-bottom: 2px">
                  {{ t('expeSummary.intro') }}
                </h3>

                <div
                  v-richText="
                    () =>
                      parse(
                        Array.isArray(data.Description)
                          ? data.Description.join('\n')
                          : data.Description,
                        {
                          project: data.Subject,
                          visitorId: storageManager.getObj('userInfo')?.value?.ID ?? '',
                          authorId: data.User.ID,
                          coauthorIds: data.Coauthors.map((user) => user.ID),
                        },
                      )
                  "
                  class="intro"
                ></div>
                <div class="word-count">
                  {{ t('expeSummary.wordCount', { count: descriptionWordCount }) }}
                </div>
              </div>
            </div>
          </n-tab-pane>
          <n-tab-pane name="Comment" :tab="`${t('expeSummary.comments')}(${data.Comments})`">
            <div class="right-bottom-container">
              <div class="message-wrapper">
                <MessageList
                  v-if="routeSummaryId"
                  :ID="routeSummaryId"
                  :Category="routeCategory"
                  :upDate="upDate"
                  @msgClick="handleMsgClick"
                />
              </div>
              <div class="sendComment">
                <n-input
                  v-model:value="comment"
                  style="text-align: left"
                  type="text"
                  :placeholder="t('comments.placeholder')"
                  show-count
                  :maxlength="400"
                  :loading="isLoading"
                  :disabled="isLoading"
                  @keyup.enter="handleEnter"
                />
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
    </template>
  </BiLayout>
</template>

<script setup lang="ts">
import { computed, onActivated, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getRouteCategory } from '../router/category'
import { canEditSummary } from '@services/editor/cloudWorks'
import { getData } from '@services/api/getData.ts'
import { showAPiError } from '@popup/index.ts'
import { removeToken } from '@services/utils.ts'
import { NTabs, NTabPane, NInput, NButton } from 'naive-ui'
import Tag from '../components/utils/TagLarger.vue'
import MessageList from '../components/messages/MessageList.vue'
import parse from '@services/pltxt2htm/advancedParser'
import parseInline from '@services/pltxt2htm/commonParser'
import showUserCard from '@popup/userProfileDialog.ts'
import postComment from '@services/postComment.ts'
import { copyText, getCoverUrl, getUserUrl, getPath } from '@services/utils.ts'
import BiLayout from '../layout/BiLayout.vue'
import '../layout/BiLayout.css'
import { useI18n } from 'vue-i18n'
import showActionSheet from '@popup/actionSheet.ts'
import { showMessage } from '@popup/naiveui'
import storageManager from '@storage/index.ts'
import type {
  Category,
  CommentResult,
  Result,
  Summary,
} from '@services/../pl-serve-type-main/type/main'

const comment = ref('')
const isLoading = ref(false)
const upDate = ref(1)
// 用于使用watch触发刷新 To trigger a refresh using watch
const replyID = ref('')
const selectedTab = ref('Intro')
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const returnImagePath = getPath('/@base/assets/library/Navigation-Return.png')
const routeCategory = computed(() => getRouteCategory(route, 'Experiment'))
const routeSummaryId = computed(() => {
  const id = route.params.id
  return Array.isArray(id) ? id[0] || '' : id || ''
})

const data = ref<Summary>({
  $type: 'Quantum.Models.Contents.Summary, Quantum Models',
  Type: 0,
  ContentID: '642cf37a494746375aae306a',
  Coauthors: [],
  Description: ['Loading...'],
  LocalizedDescription: null,
  Tags: ['C-Loading'],
  Visits: 0,
  Stars: 0,
  Supports: 0,
  Remixes: 0,
  Comments: 0,
  Price: 0,
  Popularity: 0,
  ID: '',
  Category: 'Discussion',
  Subject: 'Loading...',
  LocalizedSubject: null,
  Image: 0,
  ImageRegion: 0,
  Version: 0,
  Language: 'Chinese',
  UpdateDate: 0,
  Visibility: 0,
  SortingDate: 0,
  CreationDate: 0,
  Multilingual: false,
  User: {
    ID: '0',
    Nickname: 'Loading...',
    Signature: 'Loading...',
    Avatar: 0,
    AvatarRegion: 0,
    Decoration: 0,
    Verification: 'Banned',
  },
})

const defaultCoverUrl = getPath('/@base/assets/messages/Experiment-Default.png')
const coverUrl = ref(defaultCoverUrl)
const avatarUrl = ref(getUserUrl(data.value.User))
const avatarLoaded = ref(false)
const filteredTags = computed(() => data.value.Tags.filter(Boolean))

const descriptionSource = computed(() => {
  const description = data.value.Description
  return Array.isArray(description) ? description.join('\n') : description || ''
})

const descriptionWordCount = computed(() => countReadableWords(descriptionSource.value))

function countReadableWords(source: string) {
  const plainText = source
    .replace(/```[\s\S]*?```/gu, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/gu, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/gu, ' $1 ')
    .replace(/<[^>]+>/gu, ' ')
    .replace(/`([^`]*)`/gu, ' $1 ')
    .replace(/[#>*_~|=\-]+/gu, ' ')
  const readableUnits = plainText.match(
    /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]|[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu,
  )
  return readableUnits?.reduce((count) => count + 1, 0) ?? 0
}

const canEdit = computed(() => canEditSummary(data.value))

function goToEditor() {
  router.push(`/e/${routeCategory.value}/${routeSummaryId.value}?sidebar=0`)
}

let summaryRequestId = 0

async function fetchSummary() {
  const contentId = routeSummaryId.value
  const category = routeCategory.value
  const requestId = ++summaryRequestId
  const res = await getData('/Contents/GetSummary', {
    ContentID: contentId,
    Category: category,
  })
  if (requestId !== summaryRequestId) return
  if (res.Status !== 200) {
    showAPiError(
      t('errors.apiErrorTitle'),
      t('errors.apiErrorMessage', {
        path: '/Contents/GetSummary',
        status: res.Status,
        message: res?.Message || '',
      }),
      fetchSummary,
    )
    const _req = removeToken({
      ContentID: contentId,
      Category: category,
    })
    const _res = removeToken(res)
    window.$ErrorLogger.captureApiError('POST', '/Contents/GetSummary', res.Status, _res, _req)
    console.error(`/Contents/GetSummary returned ${res.Status}`, _res)
    return
  }
  if (!res.Data) return
  data.value = res.Data
  avatarUrl.value = getUserUrl(data.value.User)
  avatarLoaded.value = false
  // Civitas-john always procrastinate on addressing the request to solve the anti-leeching issue.
  // That's why the below occurs
  await fetch(getCoverUrl(res.Data), {
    referrerPolicy: 'no-referrer',
    mode: 'no-cors',
  })
  if (requestId !== summaryRequestId) return
  coverUrl.value = getCoverUrl(res.Data)
}

watch(
  [routeSummaryId, routeCategory],
  () => {
    selectedTab.value = 'Intro'
    comment.value = ''
    replyID.value = ''
    coverUrl.value = defaultCoverUrl
    avatarLoaded.value = false
    void fetchSummary()
  },
  { immediate: true },
)

function handleMsgClick(item: CommentResult) {
  replyID.value = item.UserID
  comment.value = `${t('ui.messages.replyToUser')}@${item.Nickname}: `
}

async function handleEnter() {
  await postComment(
    comment,
    isLoading,
    routeCategory.value as Category,
    routeSummaryId.value,
    replyID,
    upDate,
  )
}

function goBack() {
  window.history.back()
}

function goToExperiment() {
  const category = routeCategory.value.toLowerCase()
  const contentType = category === 'experiment' ? 'experiment' : 'discussion'
  const target = `physics://chinese/${contentType}/${routeSummaryId.value}`
  window.location.href = target
}

async function copy(text: string) {
  const ok = await copyText(text)
  if (ok) {
    showMessage('info', t('ui.messages.copySuccess'), { duration: 1000 })
  } else {
    showMessage('error', t('ui.messages.copyFailed'), { duration: 2000 })
  }
}
function summaryRequest() {
  return getData('/Contents/GetSummary', {
    ContentID: routeSummaryId.value,
    Category: routeCategory.value,
  })
}

function confirmCoverRequest(image: number) {
  return getData('/Contents/ConfirmExperiment', {
    Category: routeCategory.value,
    SummaryID: routeSummaryId.value,
    Image: image,
    Extension: '.png',
  })
}

function reportRequestError(
  path: string,
  response: Result,
  request: unknown,
  retry: () => Promise<unknown> | void,
) {
  showAPiError(
    t('errors.apiErrorTitle'),
    t('errors.apiErrorMessage', {
      path,
      status: response.Status,
      message: response.Message || '',
    }),
    retry,
  )
  const result = removeToken(response)
  window.$ErrorLogger.captureApiError('POST', path, response.Status, result, removeToken(request))
  console.error(`${path} returned ${response.Status}`, result)
}

async function confirmCover(image: number) {
  const request = {
    Category: routeCategory.value,
    SummaryID: routeSummaryId.value,
    Image: image,
    Extension: '.png',
  }
  const response = await confirmCoverRequest(image)
  if (response.Status === 200) return true
  reportRequestError('/Contents/ConfirmExperiment', response, request, () =>
    confirmCoverRequest(image),
  )
  return false
}

async function submitCover(file: File, summary: Summary) {
  const request = {
    Request: { FileSize: -Math.abs(file.size), Extension: '.jpg' },
    Summary: summary,
  }
  const response = await getData('/Contents/SubmitExperiment', request)
  if (response.Status === 200) return response.Data
  reportRequestError('/Contents/SubmitExperiment', response, request, () =>
    getData('/Contents/SubmitExperiment', request),
  )
  return null
}

async function uploadCoverFile(file: File, token: { Authorization: string; Policy: string }) {
  const form = new FormData()
  form.append('authorization', token.Authorization || '')
  form.append('policy', token.Policy || '')
  form.append('file', file, 'cover.jpg')
  await fetch('https://v0.api.upyun.com/qphysics', { method: 'POST', body: form })
}

let coverRefreshTimeout: ReturnType<typeof window.setTimeout> | undefined

async function refreshCover() {
  const response = await summaryRequest()
  if (response.Status !== 200) {
    const request = { ContentID: routeSummaryId.value, Category: routeCategory.value }
    reportRequestError('/Contents/GetSummary', response, request, summaryRequest)
    return
  }
  coverUrl.value = getCoverUrl(response.Data)
}

async function changeCover(file: File) {
  const summaryResponse = await summaryRequest()
  if (summaryResponse.Status !== 200 || !summaryResponse.Data) {
    const request = { ContentID: routeSummaryId.value, Category: routeCategory.value }
    reportRequestError('/Contents/GetSummary', summaryResponse, request, summaryRequest)
    return
  }
  const image = (summaryResponse.Data.Image || 0) + 1
  if (!(await confirmCover(image))) return
  const submission = await submitCover(file, summaryResponse.Data)
  if (!submission?.Token) return
  try {
    await uploadCoverFile(file, submission.Token)
    if (!(await confirmCover(image))) return
  } catch {
    showMessage('error', t('ui.messages.uploadFailed'), { duration: 2000 })
    return
  }
  showMessage('success', t('ui.messages.uploadSuccess'), { duration: 2000 })
  window.clearTimeout(coverRefreshTimeout)
  coverRefreshTimeout = window.setTimeout(refreshCover, 800)
}

async function onCoverSelected(event: Event) {
  const file = (event.target as HTMLInputElement | null)?.files?.[0]
  if (!file) return
  try {
    await changeCover(file)
  } catch {
    showMessage('error', t('ui.messages.changeCoverFailed'), { duration: 2000 })
  }
}

function selectCover() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = onCoverSelected
  input.click()
}

function runSubjectAction(action: string | undefined) {
  const category = routeCategory.value.toLowerCase()
  const actions: Record<string, () => void> = {
    [t('expeSummary.copyID')]: () => void copy(data.value.ID),
    [t('expeSummary.copyInternalLink')]: () =>
      void copy(`<${category}=${routeSummaryId.value}>${data.value.Subject}</${category}>`),
    [t('expeSummary.copyExternalLink')]: () =>
      void copy(`<external=${window.location.href}>${data.value.Subject}[web]</external>`),
    [t('expeSummary.changeCover')]: selectCover,
    [t('expeSummary.editWork')]: goToEditor,
  }
  if (action) actions[action]?.()
}

function copySubject() {
  const list = [
    { label: t('expeSummary.copyID') },
    { label: t('expeSummary.copyInternalLink') },
    { label: t('expeSummary.copyExternalLink') },
  ]
  if (data.value.User.ID === storageManager.getObj('userInfo').value?.ID)
    list.push({ label: t('expeSummary.changeCover') })
  if (canEdit.value) list.push({ label: t('expeSummary.editWork') })
  showActionSheet(list, (index) => runSubjectAction(list[index]?.label))
}

onActivated(() => {
  window.$Logger.logPageView({
    pageLink: `/${routeCategory.value}/${routeSummaryId.value}/`,
    timeStamp: Date.now(),
  })
})

onUnmounted(() => {
  window.clearTimeout(coverRefreshTimeout)
})
</script>

<style scoped>
/* Be careful with inline CSS  */
.return {
  width: 2.7em;
}

.tagContainer {
  position: absolute;
  z-index: 100;
}
.title {
  color: white;
  font-size: 1.7em;
  text-align: left;
  position: relative;
  z-index: 30;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cover {
  padding: 20px;
  position: absolute;
  height: 100%;
  width: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 40% 70%;
  background-color: #333;
}

.context {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.intro {
  max-width: 100%;
  min-width: 0;
  overflow-wrap: anywhere;
}

.intro :deep(img),
.intro :deep(svg) {
  max-width: 100%;
  height: auto;
}

.intro :deep(.mermaid-diagram) {
  display: block;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
}

.intro :deep(.mermaid-diagram svg) {
  display: block;
  max-width: none;
}

.word-count {
  color: #666;
  font-size: 14px;
  margin-top: 12px;
  text-align: right;
}

.context .n-tabs {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.context .n-tab-pane,
.context .n-tab-pane__content {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.enter {
  display: none;
}

.gray {
  width: 98%;
  margin: 5px;
  flex: 1 1 auto;
  overflow-y: auto;
  border-radius: 10px;
  background-color: #eee;
  margin-bottom: 10px;
}

@media (min-aspect-ratio: 1/1) {
  .gray {
    width: calc(100% - 30px);
  }

  .title {
    font-size: x-large;
  }

  .enter {
    display: flex;
    position: absolute;
    padding: 10px 10%;
    width: 80%;
    bottom: calc(50px + env(safe-area-inset-bottom));
  }
}

@media (max-aspect-ratio: 1/1) {
  .return {
    display: blobk;
    /* 等到做了收藏和支持，这里会被隐藏 */
    /* Wait until you do the collection and support, this will be hidden */
  }
}

.sendComment {
  width: 97%;
  margin: 0 auto;
}

div {
  box-sizing: border-box;
}
</style>
