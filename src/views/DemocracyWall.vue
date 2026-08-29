<template>
  <div class="democracy-page">
    <Header>
      <div class="page-heading">
        <h1>{{ t('democracy.title') }}</h1>
        <span>{{ t('democracy.subtitle') }}</span>
      </div>
    </Header>

    <main>
      <section class="hero" aria-labelledby="democracy-intro-title">
        <div>
          <p class="eyebrow">{{ t('democracy.eyebrow') }}</p>
          <h2 id="democracy-intro-title">{{ t('democracy.heroTitle') }}</h2>
          <p>{{ t('democracy.heroDescription') }}</p>
        </div>
        <ol class="workflow" :aria-label="t('democracy.workflowLabel')">
          <li v-for="(step, index) in workflowSteps" :key="step">
            <b>{{ index + 1 }}</b>
            <span>{{ step }}</span>
          </li>
        </ol>
      </section>

      <section class="wall-panel">
        <n-tabs v-model:value="activeTab" type="line" animated>
          <n-tab-pane name="ongoing" :tab="tabTitle('ongoing', ongoingEntries.length)">
            <EntryGrid :entries="ongoingEntries" :loading="entryLoading" @retry="loadEntries" />
          </n-tab-pane>
          <n-tab-pane name="cases" :tab="tabTitle('cases', caseEntries.length)">
            <EntryGrid :entries="caseEntries" :loading="entryLoading" @retry="loadEntries" />
          </n-tab-pane>
          <n-tab-pane name="proposals" :tab="tabTitle('proposals', proposalEntries.length)">
            <EntryGrid :entries="proposalEntries" :loading="entryLoading" @retry="loadEntries" />
          </n-tab-pane>
          <n-tab-pane name="votes" :tab="tabTitle('votes', voteContext.activities.length)">
            <div v-if="voteLoading" class="state-box">
              <n-spin size="large" />
            </div>
            <div v-else-if="voteError" class="state-box">
              <n-empty :description="t('democracy.vote.loadFailed')">
                <template #extra>
                  <n-button @click="loadVotes">{{ t('democracy.retry') }}</n-button>
                </template>
              </n-empty>
            </div>
            <div v-else-if="voteContext.activities.length" class="vote-grid">
              <AnonymousVoteCard
                v-for="activity in voteContext.activities"
                :key="activity.ID"
                :activity="activity"
                :status="statusFor(activity.ID)"
                :statistic="voteContext.statistic"
                @updated="onVoteUpdated"
              />
            </div>
            <div v-else class="state-box">
              <n-empty :description="t('democracy.vote.empty')" />
            </div>
          </n-tab-pane>
          <n-tab-pane name="archive" :tab="tabTitle('archive', resolvedEntries.length)">
            <EntryGrid :entries="resolvedEntries" :loading="entryLoading" @retry="loadEntries" />
          </n-tab-pane>
        </n-tabs>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref, type PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { NButton, NEmpty, NSpin, NTabPane, NTabs } from 'naive-ui'
import Header from '@components/utils/Header.vue'
import Footer from '@components/utils/Footer.vue'
import DemocracyEntryCard from '@components/democracy/DemocracyEntryCard.vue'
import AnonymousVoteCard from '@components/democracy/AnonymousVoteCard.vue'
import {
  fetchDemocracyEntries,
  fetchDemocracyVoteContext,
  mergeDemocracyVoteContext,
  type DemocracyEntry,
  type DemocracyVoteContext,
} from '@services/democracyWall'
import type { Sync } from '../pl-serve-type-main/type/main'

const { t } = useI18n()
const activeTab = ref('ongoing')
const entries = ref<DemocracyEntry[]>([])
const entryLoading = ref(true)
const entryError = ref(false)
const voteLoading = ref(true)
const voteError = ref(false)
const voteContext = ref<DemocracyVoteContext>({ activities: [], statuses: [] })

const workflowSteps = computed(() => [
  t('democracy.workflow.submit'),
  t('democracy.workflow.investigate'),
  t('democracy.workflow.question'),
  t('democracy.workflow.decide'),
])

const ongoingEntries = computed(() => entries.value.filter((entry) => entry.status === 'open'))
const caseEntries = computed(() =>
  entries.value.filter((entry) => entry.kind === 'case' && entry.status === 'open'),
)
const proposalEntries = computed(() =>
  entries.value.filter((entry) => entry.kind === 'proposal' && entry.status === 'open'),
)
const resolvedEntries = computed(() => entries.value.filter((entry) => entry.status === 'resolved'))

function tabTitle(key: string, count: number) {
  return `${t(`democracy.tabs.${key}`)} ${count}`
}

async function loadEntries() {
  entryLoading.value = true
  entryError.value = false
  try {
    entries.value = await fetchDemocracyEntries()
  } catch {
    entryError.value = true
  } finally {
    entryLoading.value = false
  }
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

const EntryGrid = defineComponent({
  name: 'DemocracyEntryGrid',
  props: {
    entries: {
      type: Array as PropType<DemocracyEntry[]>,
      required: true,
    },
    loading: Boolean,
  },
  emits: ['retry'],
  setup(props, { emit }) {
    return () => {
      if (props.loading) {
        return h('div', { class: 'state-box' }, [h(NSpin, { size: 'large' })])
      }
      if (entryError.value) {
        return h('div', { class: 'state-box' }, [
          h(
            NEmpty,
            { description: t('democracy.loadFailed') },
            {
              extra: () => h(NButton, { onClick: () => emit('retry') }, () => t('democracy.retry')),
            },
          ),
        ])
      }
      if (!props.entries.length) {
        return h('div', { class: 'state-box' }, [h(NEmpty, { description: t('democracy.empty') })])
      }
      return h(
        'div',
        { class: 'entry-grid' },
        props.entries.map((entry) => h(DemocracyEntryCard, { key: entry.summary.ID, entry })),
      )
    }
  },
})

onMounted(() => {
  void Promise.allSettled([loadEntries(), loadVotes()])
  window.$Logger.logPageView({
    pageLink: '/Democracy/',
    timeStamp: Date.now(),
  })
})
</script>

<style scoped>
.democracy-page {
  min-height: 100dvh;
  background: #f3f6f8;
  color: #253746;
}

.page-heading {
  display: flex;
  min-width: 0;
  gap: 0.65rem;
  align-items: baseline;
}

.page-heading h1 {
  margin: 0;
  font-size: 1.3rem;
}

.page-heading span {
  overflow: hidden;
  color: #7a8791;
  text-overflow: ellipsis;
  white-space: nowrap;
}

main {
  height: calc(100dvh - 100px);
  overflow-y: auto;
  padding: clamp(0.75rem, 2vw, 1.5rem);
  scrollbar-width: thin;
}

.hero,
.wall-panel {
  width: min(1180px, 100%);
  margin: 0 auto;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 1.15fr);
  gap: clamp(1rem, 3vw, 2.5rem);
  align-items: center;
  padding: clamp(1.1rem, 3vw, 2rem);
  border-radius: 1.2rem;
  overflow: hidden;
  background:
    radial-gradient(circle at 95% 10%, rgba(108, 201, 227, 0.28), transparent 34%),
    linear-gradient(135deg, #123c58, #126c88);
  color: #fff;
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: #a7e4f2;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.hero h2 {
  margin: 0;
  font-size: clamp(1.45rem, 4vw, 2.45rem);
  line-height: 1.2;
}

.hero p:last-child {
  max-width: 42rem;
  margin: 0.75rem 0 0;
  color: #d9edf3;
  line-height: 1.65;
}

.workflow {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.workflow li {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  text-align: center;
}

.workflow li:not(:last-child)::after {
  width: 50%;
  height: 1px;
  align-self: flex-end;
  margin-top: -2.45rem;
  margin-right: -29%;
  background: rgba(255, 255, 255, 0.35);
  content: '';
}

.workflow b {
  display: grid;
  width: 2.2rem;
  height: 2.2rem;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}

.workflow span {
  font-size: 0.78rem;
}

.wall-panel {
  margin-top: clamp(0.75rem, 2vw, 1.2rem);
  padding: clamp(0.75rem, 2vw, 1.2rem);
  border-radius: 1.2rem;
  background: #fff;
}

:deep(.n-tabs-nav-scroll-wrapper) {
  overflow-x: auto;
  scrollbar-width: none;
}

:deep(.n-tabs-tab) {
  white-space: nowrap;
}

:deep(.entry-grid),
.vote-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(0.75rem, 2vw, 1.2rem);
  padding: 0.35rem 0.15rem 1rem;
}

:deep(.state-box) {
  display: grid;
  min-height: 16rem;
  place-items: center;
}

@media (max-width: 820px) {
  .hero {
    grid-template-columns: 1fr;
  }

  :deep(.entry-grid),
  .vote-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .page-heading span {
    display: none;
  }

  main {
    padding: 0.6rem;
  }

  .hero,
  .wall-panel {
    border-radius: 0.9rem;
  }

  .workflow {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    row-gap: 1rem;
  }

  .workflow li::after {
    display: none;
  }
}
</style>
