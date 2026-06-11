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
              v-for="(tag, index) in data.Tags.filter((t) => !!t)"
              :key="index"
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
                  {{ t('expeSummary.wordCount') }}：{{ descriptionWordCount }}
                </div>
              </div>
            </div>
          </n-tab-pane>
          <n-tab-pane name="Comment" :tab="`${t('expeSummary.comments')}(${data.Comments})`">
            <div class="right-bottom-container">
              <div class="message-wrapper">
                <MessageList
                  v-if="route.params.id"
                  :ID="route.params.id as string"
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
import { ref, computed, watch, onMounted, onActivated } from 'vue'
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
import type { Category, CommentResult, Summary } from '@services/../pl-serve-type-main/type/main'

const comment = ref('')
const isLoading = ref(false)
const upDate = ref(1)
// 用于使用watch触发刷新 To trigger a refresh using watch
const replyID = ref('')
const selectedTab = ref('Intro')
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const returnImagePath = ref(getPath('/@base/assets/library/Navigation-Return.png'))
const routeCategory = computed(() => getRouteCategory(route, 'Experiment'))

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
let coverUrl = ref(defaultCoverUrl)
let avatarUrl = ref(getUserUrl(data.value.User))
let avatarLoaded = ref(false)

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
  router.push(`/e/${routeCategory.value}/${route.params.id}?sidebar=0`)
}

async function fetchSummary() {
  const res = await getData('/Contents/GetSummary', {
    ContentID: route.params.id as string,
    Category: routeCategory.value,
  })
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
      ContentID: route.params.id as string,
      Category: routeCategory.value,
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
  coverUrl.value = getCoverUrl(res.Data)
}

onMounted(() => {
  fetchSummary()
})

watch(
  () => [route.params.id, routeCategory.value],
  () => {
    fetchSummary()
  },
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
    route.params.id as string,
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
  const target = `physics://chinese/${contentType}/${route.params.id as string}`
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
// eslint-disable-next-line max-lines-per-function
function copySubject() {
  const list: { label: string }[] = [
    { label: t('expeSummary.copyID') },
    { label: t('expeSummary.copyInternalLink') },
    { label: t('expeSummary.copyExternalLink') },
  ]
  if (data.value.User.ID === storageManager.getObj('userInfo')?.value?.ID) {
    list.push({ label: t('expeSummary.changeCover') })
  }
  if (canEdit.value) {
    list.push({ label: t('expeSummary.editWork') })
  }
  // eslint-disable-next-line max-lines-per-function
  showActionSheet(list, (idx) => {
    const action = list[idx]?.label
    if (action === t('expeSummary.copyID')) {
      copy(data.value.ID)
    } else if (action === t('expeSummary.copyInternalLink')) {
      copy(
        `<${routeCategory.value.toLowerCase()}=${route.params.id}>${data.value.Subject}</${routeCategory.value.toLowerCase()}>`,
      )
    } else if (action === t('expeSummary.copyExternalLink')) {
      copy(`<external=${window.location.href}>${data.value.Subject}[web]</external>`)
    } else if (action === t('expeSummary.changeCover')) {
      try {
        // ask user to select an image
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        // eslint-disable-next-line max-lines-per-function
        input.onchange = async (e: Event) => {
          try {
            const target = e.target as HTMLInputElement | null
            const file = target?.files?.[0]
            if (!file) return
            const summaryRes = await getData('/Contents/GetSummary', {
              ContentID: route.params.id as string,
              Category: routeCategory.value,
            })
            if (summaryRes.Status !== 200) {
              showAPiError(
                t('errors.apiErrorTitle'),
                t('errors.apiErrorMessage', {
                  path: '/Contents/GetSummary',
                  status: summaryRes.Status,
                  message: summaryRes?.Message || '',
                }),
                async () => {
                  return getData('/Contents/GetSummary', {
                    ContentID: route.params.id as string,
                    Category: routeCategory.value,
                  })
                },
              )
              const _req = removeToken({
                ContentID: route.params.id,
                Category: routeCategory.value,
              })
              const _res = removeToken(summaryRes)
              window.$ErrorLogger.captureApiError(
                'POST',
                '/Contents/GetSummary',
                summaryRes.Status,
                _res,
                _req,
              )
              console.error(`/Contents/GetSummary returned ${summaryRes.Status}`, _res)
              return
            }
            if (!summaryRes.Data) return
            const imageIndex = (summaryRes.Data.Image || 0) + 1
            const confirmRes = await getData('/Contents/ConfirmExperiment', {
              Category: routeCategory.value,
              SummaryID: route.params.id as string,
              Image: imageIndex,
              Extension: '.png',
            })
            if (confirmRes.Status !== 200) {
              showAPiError(
                t('errors.apiErrorTitle'),
                t('errors.apiErrorMessage', {
                  path: '/Contents/ConfirmExperiment',
                  status: confirmRes.Status,
                  message: confirmRes?.Message || '',
                }),
                async () => {
                  return getData('/Contents/ConfirmExperiment', {
                    Category: routeCategory.value,
                    SummaryID: route.params.id as string,
                    Image: imageIndex,
                    Extension: '.png',
                  })
                },
              )
              const _req = removeToken({
                Category: routeCategory.value,
                SummaryID: route.params.id,
                Image: imageIndex,
                Extension: '.png',
              })
              const _res = removeToken(confirmRes)
              window.$ErrorLogger.captureApiError(
                'POST',
                '/Contents/ConfirmExperiment',
                confirmRes.Status,
                _res,
                _req,
              )
              console.error(`/Contents/ConfirmExperiment returned ${confirmRes.Status}`, _res)
              return
            }
            const submitRes = await getData('/Contents/SubmitExperiment', {
              Request: {
                FileSize: 0 - Math.abs(file.size),
                Extension: '.jpg',
              },
              Summary: summaryRes.Data,
            })
            if (submitRes.Status !== 200) {
              showAPiError(
                t('errors.apiErrorTitle'),
                t('errors.apiErrorMessage', {
                  path: '/Contents/SubmitExperiment',
                  status: submitRes.Status,
                  message: submitRes?.Message || '',
                }),
                async () => {
                  return getData('/Contents/SubmitExperiment', {
                    Request: {
                      FileSize: 0 - Math.abs(file.size),
                      Extension: '.jpg',
                    },
                    Summary: summaryRes.Data,
                  })
                },
              )
              const _req = removeToken({
                Request: {
                  FileSize: 0 - Math.abs(file.size),
                  Extension: '.jpg',
                },
                Summary: summaryRes.Data,
              })
              const _res = removeToken(submitRes)
              window.$ErrorLogger.captureApiError(
                'POST',
                '/Contents/SubmitExperiment',
                submitRes.Status,
                _res,
                _req,
              )
              console.error(`/Contents/SubmitExperiment returned ${submitRes.Status}`, _res)
              return
            }
            try {
              const form = new FormData()
              form.append('authorization', submitRes.Data?.Token?.Authorization || '')
              form.append('policy', submitRes.Data?.Token?.Policy || '')
              form.append('file', file, 'cover.jpg')
              await fetch('https://v0.api.upyun.com/qphysics', {
                method: 'POST',
                body: form,
              })
              const confirmRes2 = await getData('/Contents/ConfirmExperiment', {
                Category: routeCategory.value,
                SummaryID: route.params.id as string,
                Image: imageIndex,
                Extension: '.png',
              })
              if (confirmRes2.Status !== 200) {
                showAPiError(
                  t('errors.apiErrorTitle'),
                  t('errors.apiErrorMessage', {
                    path: '/Contents/ConfirmExperiment',
                    status: confirmRes2.Status,
                    message: confirmRes2?.Message || '',
                  }),
                  async () => {
                    return getData('/Contents/ConfirmExperiment', {
                      Category: routeCategory.value,
                      SummaryID: route.params.id as string,
                      Image: imageIndex,
                      Extension: '.png',
                    })
                  },
                )
                const _req = removeToken({
                  Category: routeCategory.value,
                  SummaryID: route.params.id,
                  Image: imageIndex,
                  Extension: '.png',
                })
                const _res = removeToken(confirmRes2)
                window.$ErrorLogger.captureApiError(
                  'POST',
                  '/Contents/ConfirmExperiment',
                  confirmRes2.Status,
                  _res,
                  _req,
                )
                console.error(`/Contents/ConfirmExperiment returned ${confirmRes2.Status}`, _res)
                return
              }
            } catch (_upErr) {
              showMessage('error', t('ui.messages.uploadFailed'), {
                duration: 2000,
              })
              return
            }
            showMessage('success', t('ui.messages.uploadSuccess'), {
              duration: 2000,
            })
            // refresh current cover (using existing utility function)
            setTimeout(async () => {
              const refreshed = await getData('/Contents/GetSummary', {
                ContentID: route.params.id as string,
                Category: routeCategory.value,
              })
              if (refreshed.Status !== 200) {
                showAPiError(
                  t('errors.apiErrorTitle'),
                  t('errors.apiErrorMessage', {
                    path: '/Contents/GetSummary',
                    status: refreshed.Status,
                    message: refreshed?.Message || '',
                  }),
                  async () => {
                    return getData('/Contents/GetSummary', {
                      ContentID: route.params.id as string,
                      Category: routeCategory.value,
                    })
                  },
                )
                const _req = removeToken({
                  ContentID: route.params.id,
                  Category: routeCategory.value,
                })
                const _res = removeToken(refreshed)
                window.$ErrorLogger.captureApiError(
                  'POST',
                  '/Contents/GetSummary',
                  refreshed.Status,
                  _res,
                  _req,
                )
                console.error(`/Contents/GetSummary returned ${refreshed.Status}`, _res)
                return
              }
              coverUrl.value = getCoverUrl(refreshed.Data)
            }, 800)
          } catch (_err) {
            showMessage('error', t('ui.messages.changeCoverFailed'), {
              duration: 2000,
            })
          }
        }
        input.click()
      } catch (_error) {
        showMessage('error', t('errors.unknownError'), {
          duration: 2000,
        })
      }
    } else if (action === t('expeSummary.editWork')) {
      goToEditor()
    }
  })
}

onActivated(() => {
  window.$Logger.logPageView({
    pageLink: `/${routeCategory.value}/${route.params.id}/`,
    timeStamp: Date.now(),
  })
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
