<template>
  <n-config-provider class="detail-page" :theme-overrides="democracyTheme">
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
          <div v-richText="renderDescription" class="summary-description"></div>
          <div class="author">
            <span v-if="entry.anonymousAuthor">{{
              entry.summary.User.Nickname || t('democracy.create.anonymousAuthor')
            }}</span>
            <router-link v-else-if="!demoMode" :to="`/u/${entry.summary.User.ID}`">
              {{ entry.summary.User.Nickname }}
            </router-link>
            <span v-else>{{ entry.summary.User.Nickname }}</span>
            <Tag
              v-if="entry.summary.User.Verification && !entry.anonymousAuthor"
              category="User"
              :tag="`C-${entry.summary.User.Verification}`"
            />
            <n-button v-if="!readOnly && canReport" text size="small" @click="reportOpen = true">
              {{ t('democracy.report.action') }}
            </n-button>
            <n-button
              v-if="publisherCanEdit && ((accountCanWrite && !readOnly) || managementVisible)"
              text
              size="small"
              @click="editMatter"
            >
              {{ t('democracy.create.editAction') }}
            </n-button>
          </div>
        </header>

        <DemocracyInvitationCard
          v-if="invitationId"
          :matter-id="matterId"
          :invite-id="invitationId"
          :disabled="readOnly || !accountCanWrite"
          @updated="loadManagementAccess"
        />

        <DemocracyManagementPanel
          v-if="managementVisible"
          :matter-id="matterId"
          :kind="matterKind"
          :can-manage="managementVisible"
          @deleted="handleMatterDeleted"
        />

        <section v-if="demoMode" class="overview">
          <h3>{{ t('democracy.matter.overview') }}</h3>
          <p class="rule">{{ detail.rule }}</p>
          <ul>
            <li v-for="fact in detail.facts" :key="fact">{{ fact }}</li>
          </ul>
        </section>

        <section class="stages">
          <p v-if="votePlan && currentStage === 'Questions'" class="vote-schedule">
            {{
              t('democracy.matter.voteScheduled', {
                date: new Date(votePlan.StartAt).toLocaleString(),
              })
            }}
          </p>
          <n-tabs v-model:value="activeStage" type="line" animated>
            <n-tab-pane name="questions" :tab="t('democracy.matter.questionsStage')">
              <div class="stage-intro">
                <h3>{{ t('democracy.matter.suggestTitle') }}</h3>
                <span v-if="readOnly" class="read-only">{{ t('democracy.matter.readOnly') }}</span>
              </div>

              <div class="contribution-list">
                <div v-if="contributionLoading" class="center-state compact"><n-spin /></div>
                <n-empty
                  v-else-if="contributionError"
                  :description="t('democracy.matter.contributionLoadFailed')"
                >
                  <template #extra>
                    <n-button size="small" @click="loadContributions">
                      {{ t('democracy.retry') }}
                    </n-button>
                  </template>
                </n-empty>
                <n-empty
                  v-else-if="!contributions.length"
                  :description="t('democracy.matter.noContributions')"
                />
                <template v-else>
                  <DemocracyContributionCard
                    v-for="contribution in contributions"
                    :key="contribution.ID"
                    :contribution="contribution"
                    :matter-id="matterId"
                    :can-manage="managementVisible"
                    @disclosed="loadContributions"
                  />
                </template>
              </div>

              <CommentComposer
                v-if="!readOnly && canContribute"
                v-model="comment"
                :placeholder="t('democracy.matter.suggestPlaceholder')"
                :maxlength="400"
                :loading="isSubmitting"
                :disabled="!comment.trim()"
                @submit="submitSuggestion"
              />
            </n-tab-pane>

            <n-tab-pane
              v-if="
                matterParticipation === 'Vote' &&
                (currentStage === 'Voting' || matterActivities.length)
              "
              name="vote"
              :tab="t('democracy.matter.voteStage')"
            >
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
                  :disabled="readOnly || currentStage !== 'Voting' || !accountCanWrite"
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

    <DemocracyReportDialog v-model:show="reportOpen" :matter-id="matterId" />
    <Footer />
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NButton, NConfigProvider, NEmpty, NSpin, NTabPane, NTabs } from 'naive-ui'
import { democracyTheme } from '../components/democracy/theme'
import Header from '@components/utils/Header.vue'
import Footer from '@components/utils/Footer.vue'
import Tag from '@components/utils/TagLarger.vue'
import CommentComposer from '@components/utils/CommentComposer.vue'
import AnonymousVoteCard from '@components/democracy/AnonymousVoteCard.vue'
import DemocracyContributionCard from '@components/democracy/DemocracyContributionCard.vue'
import DemocracyManagementPanel from '@components/democracy/DemocracyManagementPanel.vue'
import DemocracyInvitationCard from '@components/democracy/DemocracyInvitationCard.vue'
import DemocracyReportDialog from '@components/democracy/DemocracyReportDialog.vue'
import { showMessage } from '@popup/naiveui'
import parse from '@services/pltxt2htm/advancedParser'
import {
  fetchDemocracyContributions,
  fetchDemocracyMatter,
  fetchDemocracyContext,
  fetchDemocracyVoteContext,
  getDemocracyMatterActivities,
  mergeDemocracyVoteContext,
  submitDemocracyContribution,
  toDemocracyEntry,
  type DemocracyVoteContext,
} from '@services/democracyWall'
import {
  DEMOCRACY_DEMO_DETAILS,
  isDemocracyDemoMode,
  type DemocracyDemoDetail,
} from '@services/democracyWallDemo'
import type {
  DemocracyMatterKind,
  DemocracyContribution,
  DemocracyMatterParticipation,
  DemocracyMatterStage,
  DemocracyVotePlan,
} from '@services/democracyWallContract'
import type { Activity, Summary, Sync } from '../pl-serve-type-main/type/main'
import { isDemocracyWallWritable } from '@services/democracyWallFeature'
import { isDemocracyHistoryStage } from '@services/democracyMatterState'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const matterId = computed(() => String(route.params.id || ''))
const invitationId = computed(() =>
  typeof route.query.invitation === 'string' ? route.query.invitation : '',
)
const demoMode = isDemocracyDemoMode()
const demoAdminMode = computed(() => route.query.admin === '1')
const readOnly = computed(
  () => !isDemocracyWallWritable() || isDemocracyHistoryStage(currentStage.value),
)
const activeStage = ref(route.query.stage === 'vote' ? 'vote' : 'questions')
const summary = ref<Summary>()
const loading = ref(true)
const comment = ref('')
const isSubmitting = ref(false)
const contributions = ref<DemocracyContribution[]>([])
const contributionLoading = ref(true)
const contributionError = ref(false)
const voteLoading = ref(true)
const voteError = ref(false)
const voteContext = ref<DemocracyVoteContext>({ activities: [], statuses: [] })
const linkedVoteActivity = ref<Activity>()
const currentStage = ref<DemocracyMatterStage>('Questions')
const matterKind = ref<DemocracyMatterKind>('Public')
const matterParticipation = ref<DemocracyMatterParticipation>('Consultation')
const publisherCanEdit = ref(false)
const votePlan = ref<DemocracyVotePlan>()
const developerAccess = ref(false)
const canContribute = ref(false)
const canReport = ref(false)
const accountCanWrite = ref(false)
const reportOpen = ref(false)

const entry = computed(() => (summary.value ? toDemocracyEntry(summary.value) : undefined))
const fallbackDetail = computed<DemocracyDemoDetail>(() => ({
  id: matterId.value,
  rule: t('democracy.demo.fallbackRule'),
  facts: [t('democracy.demo.fallbackFact')],
  timeline: [{ date: '08-29', text: t('democracy.demo.fallbackTimeline') }],
  finding: t('democracy.demo.fallbackFinding'),
  questions: [],
}))
const detail = computed(() => DEMOCRACY_DEMO_DETAILS[matterId.value] ?? fallbackDetail.value)
const descriptionText = computed(() => entry.value?.summary.Description?.join('\n') || '')
const matterActivities = computed(() => {
  if (matterParticipation.value !== 'Vote') return []
  const linked = linkedVoteActivity.value ? [linkedVoteActivity.value] : []
  const discovered = getDemocracyMatterActivities(voteContext.value.activities, matterId.value)
  const refreshed = voteContext.value.activities.filter((activity) =>
    linked.some((item) => item.ID === activity.ID),
  )
  return [...refreshed, ...discovered, ...linked].filter(
    (activity, index, activities) =>
      activities.findIndex((candidate) => candidate.ID === activity.ID) === index,
  )
})
const statusText = computed(() => t(`democracy.management.stages.${currentStage.value}`))
const managementVisible = computed(() => isDemocracyWallWritable() && developerAccess.value)
let activationTimer: number | undefined
let disposed = false

const renderDescription = () =>
  parse(descriptionText.value, {
    project: entry.value?.summary.Subject || '',
    visitorId: '',
    authorId: '',
    coauthorIds: [],
  })

async function loadMatter() {
  loading.value = true
  try {
    const matter = await fetchDemocracyMatter(matterId.value)
    summary.value = matter.summary
    linkedVoteActivity.value = matter.voteActivity
    currentStage.value = matter.stage
    matterKind.value = matter.kind
    matterParticipation.value = matter.participation
    publisherCanEdit.value = matter.canEdit
    votePlan.value = matter.votePlan
    if (matter.stage === 'Voting') activeStage.value = 'vote'
    scheduleVoteActivation()
  } catch {
    summary.value = undefined
  }
  loading.value = false
}

function scheduleVoteActivation() {
  if (activationTimer) window.clearTimeout(activationTimer)
  if (
    disposed ||
    matterParticipation.value !== 'Vote' ||
    !votePlan.value ||
    currentStage.value !== 'Questions'
  ) {
    return
  }
  const delay = new Date(votePlan.value.StartAt).getTime() - Date.now()
  if (!Number.isFinite(delay)) return
  activationTimer = window.setTimeout(
    () => void activateScheduledVote(),
    Math.min(Math.max(delay + 100, 5_000), 2_147_000_000),
  )
}

async function activateScheduledVote() {
  await Promise.allSettled([loadMatter(), loadVotes()])
  if (currentStage.value === 'Voting') activeStage.value = 'vote'
}

async function loadManagementAccess() {
  try {
    const context = await fetchDemocracyContext()
    const canPublish = context.Profile?.CanPublish === true
    accountCanWrite.value = canPublish
    canContribute.value = canPublish && context.Permissions.CanContribute
    canReport.value = canPublish
    developerAccess.value = context.Permissions.CanDeveloperManage === true
  } catch {
    accountCanWrite.value = false
    canContribute.value = false
    canReport.value = false
    developerAccess.value = false
  }
}

function handleMatterDeleted() {
  goBack()
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

async function loadContributions() {
  contributionLoading.value = true
  contributionError.value = false
  try {
    contributions.value = await fetchDemocracyContributions(matterId.value)
  } catch {
    contributionError.value = true
  } finally {
    contributionLoading.value = false
  }
}

async function submitSuggestion() {
  const content = comment.value.trim()
  if (!content || readOnly.value || isSubmitting.value) return
  isSubmitting.value = true
  try {
    const contribution = await submitDemocracyContribution(matterId.value, content)
    contributions.value = [...contributions.value, contribution]
    comment.value = ''
  } catch {
    showMessage('error', t('democracy.matter.contributionSubmitFailed'), { duration: 2800 })
  } finally {
    isSubmitting.value = false
  }
}

function goBack() {
  void router.push({
    path: '/d',
    query: {
      ...(demoMode ? { demo: '1' } : {}),
      ...(demoMode && route.query.developer === '1' ? { developer: '1' } : {}),
      ...(demoMode && demoAdminMode.value ? { admin: '1' } : {}),
      ...(readOnly.value ? { scope: 'history' } : {}),
    },
  })
}

function editMatter() {
  void router.push({
    path: '/d/new',
    query: {
      edit: matterId.value,
      ...(demoMode ? { demo: '1' } : {}),
      ...(demoMode && route.query.developer === '1' ? { developer: '1' } : {}),
      ...(demoMode && demoAdminMode.value ? { admin: '1' } : {}),
    },
  })
}

onMounted(() => {
  void Promise.allSettled([loadMatter(), loadVotes(), loadManagementAccess(), loadContributions()])
})

onUnmounted(() => {
  disposed = true
  if (activationTimer) window.clearTimeout(activationTimer)
})
</script>

<style scoped>
.detail-page {
  min-height: 100dvh;
  background: #f5f5f5;
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
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
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
.stage-intro {
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
  font-size: clamp(1.15rem, 2.5vw, 1.4rem);
}

.summary-description,
.overview li {
  color: #666;
  line-height: 1.65;
}

.summary-description {
  margin: 0.65rem 0;
  overflow-wrap: anywhere;
}

.summary-description :deep(p) {
  margin: 0.45rem 0;
}

.summary-description :deep(img),
.summary-description :deep(svg) {
  max-width: 100%;
  height: auto;
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

.vote-schedule {
  margin: 0 0 0.8rem;
  padding: 0.65rem 0.8rem;
  border-radius: 6px;
  background: #eef6ff;
  color: #245f96;
  font-size: 0.84rem;
}

.contribution-list {
  display: grid;
  gap: 0.6rem;
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
}
</style>
