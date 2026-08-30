<template>
  <div class="detail-page">
    <Header>
      <button class="back" type="button" @click="goBack">←</button>
      <div class="heading">
        <h1>{{ t('democracy.matter.title') }}</h1>
        <span v-if="demoMode">{{ t('democracy.demo.badge') }}</span>
      </div>
    </Header>

    <main v-if="loading" class="center-state"><n-spin size="large" /></main>

    <main v-else-if="entry">
      <article class="matter-card">
        <header class="matter-header">
          <div class="labels">
            <span class="status">{{ statusText }}</span>
            <Tag
              v-for="tag in entry.summary.Tags.filter((item) => item !== '民主墙')"
              :key="tag"
              category="Discussion"
              :tag="tag"
            />
          </div>
          <h2>{{ entry.summary.Subject }}</h2>
          <p>{{ entry.summary.Description?.[0] }}</p>
          <div class="author">
            <router-link v-if="!demoMode" :to="`/u/${entry.summary.User.ID}`">
              {{ entry.summary.User.Nickname }}
            </router-link>
            <span v-else>{{ entry.summary.User.Nickname }}</span>
            <Tag category="User" :tag="`C-${entry.summary.User.Verification}`" />
          </div>
        </header>

        <section v-if="demoMode" class="overview">
          <h3>{{ t('democracy.matter.overview') }}</h3>
          <p class="rule">{{ detail.rule }}</p>
          <ul>
            <li v-for="fact in detail.facts" :key="fact">{{ fact }}</li>
          </ul>
        </section>

        <section class="stages">
          <n-tabs v-model:value="activeStage" type="line" animated>
            <n-tab-pane name="questions" :tab="t('democracy.matter.questionsStage')">
              <div class="stage-intro">
                <h3>{{ t('democracy.matter.suggestTitle') }}</h3>
                <span v-if="readOnly" class="read-only">{{ t('democracy.matter.readOnly') }}</span>
              </div>

              <div v-if="demoMode" class="demo-questions">
                <blockquote v-for="question in displayedDemoQuestions" :key="question">
                  {{ question }}
                </blockquote>
              </div>
              <MessageList
                v-else
                :ID="matterId"
                Category="Discussion"
                :upDate="upDate"
                @msgClick="handleMsgClick"
              />

              <div v-if="!readOnly" class="composer">
                <n-input
                  v-model:value="comment"
                  type="textarea"
                  :placeholder="t('democracy.matter.suggestPlaceholder')"
                  :maxlength="400"
                  show-count
                  :autosize="{ minRows: 2, maxRows: 5 }"
                  :disabled="isSubmitting"
                  @keyup.ctrl.enter="submitSuggestion"
                />
                <n-button
                  type="info"
                  :loading="isSubmitting"
                  :disabled="!comment.trim()"
                  @click="submitSuggestion"
                >
                  {{ t('democracy.matter.submitSuggestion') }}
                </n-button>
              </div>
            </n-tab-pane>

            <n-tab-pane name="vote" :tab="t('democracy.matter.voteStage')">
              <div v-if="voteLoading" class="center-state compact"><n-spin /></div>
              <n-empty v-else-if="voteError" :description="t('democracy.vote.loadFailed')">
                <template #extra>
                  <n-button size="small" @click="loadVotes">{{ t('democracy.retry') }}</n-button>
                </template>
              </n-empty>
              <div v-else-if="matterActivities.length" class="vote-grid">
                <AnonymousVoteCard
                  v-for="activity in matterActivities"
                  :key="activity.ID"
                  :activity="activity"
                  :status="statusFor(activity.ID)"
                  :statistic="voteContext.statistic"
                  @updated="onVoteUpdated"
                />
              </div>
              <n-empty v-else :description="t('democracy.matter.noVotes')" />
            </n-tab-pane>
          </n-tabs>
        </section>
      </article>
    </main>

    <main v-else class="center-state">
      <n-empty :description="t('democracy.demo.missing')">
        <template #extra
          ><n-button @click="goBack">{{ t('democracy.demo.back') }}</n-button></template
        >
      </n-empty>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NButton, NEmpty, NInput, NSpin, NTabPane, NTabs } from 'naive-ui'
import Header from '@components/utils/Header.vue'
import Footer from '@components/utils/Footer.vue'
import Tag from '@components/utils/TagLarger.vue'
import MessageList from '@components/messages/MessageList.vue'
import AnonymousVoteCard from '@components/democracy/AnonymousVoteCard.vue'
import { getData } from '@services/api/getData'
import postComment from '@services/postComment'
import {
  fetchDemocracyVoteContext,
  getDemocracyMatterActivities,
  mergeDemocracyVoteContext,
  toDemocracyEntry,
  type DemocracyVoteContext,
} from '@services/democracyWall'
import {
  DEMOCRACY_DEMO_DETAILS,
  DEMOCRACY_DEMO_SUMMARIES,
  isDemocracyDemoMode,
  type DemocracyDemoDetail,
} from '@services/democracyWallDemo'
import type { CommentResult, Summary, Sync } from '../pl-serve-type-main/type/main'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const matterId = computed(() => String(route.params.id || ''))
const demoMode = isDemocracyDemoMode()
const readOnly = computed(() => route.query.scope === 'history')
const activeStage = ref(route.query.stage === 'vote' ? 'vote' : 'questions')
const summary = ref<Summary>()
const loading = ref(true)
const comment = ref('')
const isSubmitting = ref(false)
const replyID = ref('')
const upDate = ref(0)
const voteLoading = ref(true)
const voteError = ref(false)
const voteContext = ref<DemocracyVoteContext>({ activities: [], statuses: [] })
const localQuestions = ref<string[]>([])

const entry = computed(() => (summary.value ? toDemocracyEntry(summary.value) : undefined))
const fallbackDetail = computed<DemocracyDemoDetail>(() => ({
  id: matterId.value,
  rule: t('democracy.demo.fallbackRule'),
  facts: [t('democracy.demo.fallbackFact')],
  timeline: [{ date: '08-29', text: t('democracy.demo.fallbackTimeline') }],
  finding: t('democracy.demo.fallbackFinding'),
  questions: [t('democracy.demo.fallbackQuestion')],
}))
const detail = computed(() => DEMOCRACY_DEMO_DETAILS[matterId.value] ?? fallbackDetail.value)
const displayedDemoQuestions = computed(() => [...detail.value.questions, ...localQuestions.value])
const matterActivities = computed(() =>
  getDemocracyMatterActivities(voteContext.value.activities, matterId.value),
)
const statusText = computed(() =>
  entry.value?.status === 'resolved' ? t('democracy.status.resolved') : t('democracy.status.open'),
)

function demoQuestionKey() {
  return `plweb2.democracy.demoQuestions.${matterId.value}`
}

function loadDemoQuestions() {
  try {
    const value = JSON.parse(localStorage.getItem(demoQuestionKey()) || '[]')
    localQuestions.value = Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string')
      : []
  } catch {
    localQuestions.value = []
  }
}

async function loadMatter() {
  loading.value = true
  if (demoMode) {
    summary.value = DEMOCRACY_DEMO_SUMMARIES.find((item) => item.ID === matterId.value)
    loadDemoQuestions()
    loading.value = false
    return
  }

  const response = await getData('/Contents/GetSummary', {
    ContentID: matterId.value,
    Category: 'Discussion',
  })
  if (response.Status === 200) summary.value = response.Data ?? undefined
  loading.value = false
}

async function loadVotes() {
  voteLoading.value = true
  voteError.value = false
  try {
    voteContext.value = await fetchDemocracyVoteContext()
  } catch {
    voteError.value = true
  } finally {
    voteLoading.value = false
  }
}

function statusFor(activityId: string) {
  return voteContext.value.statuses.find((status) => status.ActivityID === activityId)
}

function onVoteUpdated(sync?: Sync) {
  voteContext.value = mergeDemocracyVoteContext(voteContext.value, sync)
}

function handleMsgClick(item: CommentResult) {
  replyID.value = item.UserID
  comment.value = `${t('ui.messages.replyToUser')}@${item.Nickname}: `
}

async function submitSuggestion() {
  const content = comment.value.trim()
  if (!content || readOnly.value || isSubmitting.value) return
  if (demoMode) {
    localQuestions.value.push(content)
    localStorage.setItem(demoQuestionKey(), JSON.stringify(localQuestions.value))
    comment.value = ''
    return
  }
  await postComment(comment, isSubmitting, 'Discussion', matterId.value, replyID, upDate)
}

function goBack() {
  void router.push({
    path: '/d',
    query: {
      ...(demoMode ? { demo: '1' } : {}),
      ...(readOnly.value ? { scope: 'history' } : {}),
    },
  })
}

onMounted(() => {
  void Promise.allSettled([loadMatter(), loadVotes()])
})
</script>

<style scoped>
.detail-page {
  min-height: 100dvh;
  background: #f3f3f3;
  color: #333;
}

.back {
  width: 2.2rem;
  height: 2.2rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #f0f0f0;
  color: #555;
  font-size: 1.4rem;
  cursor: pointer;
}

.heading {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  margin-left: 0.7rem;
}

.heading h1 {
  margin: 0;
  font-size: 1.15rem;
}

.heading span,
.read-only {
  padding: 0.18rem 0.5rem;
  border-radius: 4px;
  background: #e7f4fb;
  color: #0185c5;
  font-size: 0.72rem;
}

main {
  height: calc(100dvh - 100px);
  overflow-y: auto;
  padding: 12px;
}

.matter-card {
  width: min(920px, 100%);
  margin: 0 auto;
  overflow: hidden;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.matter-header,
.overview,
.stages {
  padding: 16px;
}

.matter-header {
  border-bottom: 1px solid #eee;
}

.labels,
.author,
.stage-intro,
.composer {
  display: flex;
  gap: 0.55rem;
  align-items: center;
}

.labels {
  flex-wrap: wrap;
}

.status {
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  background: #e8f6ee;
  color: #187448;
  font-size: 0.75rem;
  font-weight: 700;
}

.matter-header h2 {
  margin: 0.9rem 0 0.45rem;
  color: #333;
  font-size: clamp(1.25rem, 3vw, 1.7rem);
}

.matter-header p,
.overview li {
  color: #666;
  line-height: 1.65;
}

.author {
  justify-content: flex-end;
}

.author a {
  color: #0185c5;
  text-decoration: none;
}

.overview {
  border-bottom: 1px solid #eee;
}

.overview h3,
.stage-intro h3 {
  margin: 0;
}

.rule {
  padding: 0.75rem 0.9rem;
  border-left: 3px solid #0185c5;
  background: #f4f8fa;
  line-height: 1.6;
}

.stage-intro {
  justify-content: space-between;
  margin-bottom: 0.8rem;
}

.demo-questions {
  display: grid;
  gap: 0.6rem;
}

blockquote {
  margin: 0;
  padding: 0.75rem 0.9rem;
  border: 1px solid #eee;
  border-radius: 6px;
  background: #fafafa;
  color: #555;
  line-height: 1.6;
}

.composer {
  align-items: flex-end;
  margin-top: 0.9rem;
}

.composer :deep(.n-input) {
  flex: 1;
}

.vote-grid {
  display: grid;
  gap: 12px;
}

.center-state {
  display: grid;
  place-items: center;
}

.center-state.compact {
  min-height: 10rem;
  padding: 0;
}

@media (max-width: 520px) {
  .heading span {
    display: none;
  }

  main {
    padding: 8px;
  }

  .matter-header,
  .overview,
  .stages {
    padding: 12px;
  }

  .composer {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
