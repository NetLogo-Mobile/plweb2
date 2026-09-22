<template>
  <n-config-provider class="democracy-page" :theme-overrides="democracyTheme">
    <Header>
      <div class="page-heading">
        <h1>{{ t('democracy.title') }}</h1>
        <span>{{ t('democracy.subtitle') }}</span>
        <b v-if="demoMode" class="demo-chip">{{ t('democracy.demo.badge') }}</b>
      </div>
    </Header>

    <main>
      <section v-if="demoMode" class="demo-banner">
        <div>
          <strong>{{ t('democracy.demo.title') }}</strong>
          <span>{{ t('democracy.demo.description') }}</span>
        </div>
        <div class="demo-actions">
          <n-button size="small" @click="switchDemoRole">
            {{
              demoAdminMode ? t('democracy.demo.switchToUser') : t('democracy.demo.switchToAdmin')
            }}
          </n-button>
          <n-button size="small" @click="resetDemo">{{ t('democracy.demo.reset') }}</n-button>
        </div>
      </section>
      <n-alert v-else-if="releaseMode === 'read-only'" type="info" :show-icon="false">
        {{ t('democracy.release.readOnly') }}
      </n-alert>

      <nav class="scope-switch" :aria-label="t('democracy.scopes.label')">
        <button
          type="button"
          :class="{ active: activeScope === 'current' }"
          @click="activeScope = 'current'"
        >
          <span>{{ t('democracy.scopes.current') }}</span>
          <small>{{ entries.length }}</small>
        </button>
        <button
          type="button"
          :class="{ active: activeScope === 'history' }"
          @click="activeScope = 'history'"
        >
          <span>{{ t('democracy.scopes.history') }}</span>
          <small>{{ historyEntries.length }}</small>
        </button>
      </nav>

      <section v-if="activeScope === 'current'" class="content-panel">
        <header class="panel-heading">
          <div>
            <h2>{{ t('democracy.scopes.current') }}</h2>
            <p>{{ t('democracy.scopes.currentDescription') }}</p>
          </div>
          <div class="create-actions">
            <n-button v-if="access.canSuggestAnonymously" tag="a" :href="createPath('anonymous')">
              {{ t('democracy.create.anonymousAction') }}
            </n-button>
            <n-button v-if="access.canInitiate" type="info" tag="a" :href="createPath('formal')">
              {{ t('democracy.create.formalAction') }}
            </n-button>
          </div>
        </header>

        <n-tabs v-model:value="activeTab" type="line" animated>
          <n-tab-pane name="ongoing" :tab="tabTitle('ongoing', ongoingEntries.length)">
            <EntryGrid
              :entries="ongoingEntries"
              :loading="entryLoading"
              :error="entryError"
              @retry="loadEntries"
            />
          </n-tab-pane>
          <n-tab-pane name="public" :tab="tabTitle('public', publicAffairsCount)">
            <EntryGrid
              :entries="proposalEntries"
              :loading="entryLoading"
              :error="entryError"
              @retry="loadEntries"
            />
          </n-tab-pane>
          <n-tab-pane name="oversight" :tab="tabTitle('oversight', caseEntries.length)">
            <EntryGrid
              :entries="caseEntries"
              :loading="entryLoading"
              :error="entryError"
              @retry="loadEntries"
            />
          </n-tab-pane>
          <n-tab-pane
            name="suggestions"
            :tab="tabTitle('suggestions', anonymousSuggestionEntries.length)"
          >
            <EntryGrid
              :entries="anonymousSuggestionEntries"
              :loading="entryLoading"
              :error="entryError"
              @retry="loadEntries"
            />
          </n-tab-pane>
        </n-tabs>
      </section>

      <section v-else class="content-panel history-panel">
        <header class="panel-heading">
          <div>
            <h2>{{ t('democracy.scopes.history') }}</h2>
            <p>{{ t('democracy.scopes.historyDescription') }}</p>
          </div>
        </header>
        <n-tabs v-model:value="activeHistoryTab" type="line" animated>
          <n-tab-pane name="public" :tab="historyTabTitle('public', historyPublicEntries.length)">
            <EntryGrid
              :entries="historyPublicEntries"
              :loading="historyLoading"
              :error="historyError"
              read-only
              @retry="loadHistory"
            />
          </n-tab-pane>
          <n-tab-pane
            name="oversight"
            :tab="historyTabTitle('oversight', historyOversightEntries.length)"
          >
            <EntryGrid
              :entries="historyOversightEntries"
              :loading="historyLoading"
              :error="historyError"
              read-only
              @retry="loadHistory"
            />
          </n-tab-pane>
          <n-tab-pane name="replies" :tab="historyTabTitle('replies', historyReplyEntries.length)">
            <EntryGrid
              :entries="historyReplyEntries"
              :loading="historyLoading"
              :error="historyError"
              read-only
              @retry="loadHistory"
            />
          </n-tab-pane>
        </n-tabs>
      </section>
    </main>

    <Footer />
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onActivated, onMounted, ref, type PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { NAlert, NButton, NConfigProvider, NEmpty, NSpin, NTabPane, NTabs } from 'naive-ui'
import { democracyTheme } from '../components/democracy/theme'
import Header from '@components/utils/Header.vue'
import Footer from '@components/utils/Footer.vue'
import DemocracyEntryCard from '@components/democracy/DemocracyEntryCard.vue'
import {
  fetchDemocracyEntries,
  fetchDemocracyHistoryEntries,
  fetchDemocracyCreationAccess,
  getDemocracyCreationAccess,
  type DemocracyEntry,
} from '@services/democracyWall'
import { isDemocracyDemoMode, resetDemocracyDemoVotes } from '@services/democracyWallDemo'
import { getDemocracyWallReleaseMode } from '@services/democracyWallFeature'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const demoMode = isDemocracyDemoMode()
const demoAdminMode = computed(() => route.query.admin === '1')
const releaseMode = getDemocracyWallReleaseMode()
const access = ref(getDemocracyCreationAccess())
const activeScope = ref<'current' | 'history'>(
  route.query.scope === 'history' ? 'history' : 'current',
)
const activeTab = ref('ongoing')
const activeHistoryTab = ref('public')
const entries = ref<DemocracyEntry[]>([])
const historyEntries = ref<DemocracyEntry[]>([])
const entryLoading = ref(true)
const entryError = ref(false)
const historyLoading = ref(true)
const historyError = ref(false)

const ongoingEntries = computed(() =>
  entries.value.filter((entry) => entry.status === 'open' && !entry.anonymousSuggestion),
)
const caseEntries = computed(() =>
  entries.value.filter(
    (entry) => entry.kind === 'case' && entry.status === 'open' && !entry.anonymousSuggestion,
  ),
)
const proposalEntries = computed(() =>
  entries.value.filter(
    (entry) => entry.kind === 'proposal' && entry.status === 'open' && !entry.anonymousSuggestion,
  ),
)
const anonymousSuggestionEntries = computed(() =>
  entries.value.filter((entry) => entry.anonymousSuggestion && entry.status === 'open'),
)
const publicAffairsCount = computed(() => proposalEntries.value.length)
const historyReplyEntries = computed(() =>
  historyEntries.value.filter(
    (entry) => entry.anonymousSuggestion || entry.summary.Tags.includes('提议回复'),
  ),
)
const historyOversightEntries = computed(() =>
  historyEntries.value.filter(
    (entry) =>
      entry.kind === 'case' &&
      !entry.anonymousSuggestion &&
      !entry.summary.Tags.includes('提议回复'),
  ),
)
const historyPublicEntries = computed(() =>
  historyEntries.value.filter(
    (entry) =>
      entry.kind === 'proposal' &&
      !entry.anonymousSuggestion &&
      !entry.summary.Tags.includes('提议回复'),
  ),
)

function tabTitle(key: string, count: number) {
  return `${t(`democracy.tabs.${key}`)} ${count}`
}

function historyTabTitle(key: string, count: number) {
  return `${t(`democracy.historyTabs.${key}`)} ${count}`
}

function createPath(mode: 'formal' | 'anonymous') {
  const query = new URLSearchParams({ mode })
  if (demoMode) query.set('demo', '1')
  if (demoMode && route.query.developer === '1') query.set('developer', '1')
  if (demoAdminMode.value) query.set('admin', '1')
  return `#/d/new?${query.toString()}`
}

async function switchDemoRole() {
  await router.replace({
    path: '/d',
    query: demoAdminMode.value ? { demo: '1' } : { demo: '1', admin: '1' },
  })
  await loadCreationAccess()
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

async function loadCreationAccess() {
  access.value = await fetchDemocracyCreationAccess()
}

async function loadHistory() {
  historyLoading.value = true
  historyError.value = false
  try {
    historyEntries.value = await fetchDemocracyHistoryEntries()
  } catch {
    historyError.value = true
  } finally {
    historyLoading.value = false
  }
}

async function resetDemo() {
  resetDemocracyDemoVotes()
  await Promise.allSettled([loadEntries(), loadHistory()])
}

const EntryGrid = defineComponent({
  name: 'DemocracyEntryGrid',
  props: {
    entries: { type: Array as PropType<DemocracyEntry[]>, required: true },
    loading: Boolean,
    error: Boolean,
    readOnly: Boolean,
  },
  emits: ['retry'],
  setup(props, { emit }) {
    return () => {
      if (props.loading) return h('div', { class: 'state-box' }, [h(NSpin, { size: 'large' })])
      if (props.error) {
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
        props.entries.map((entry) =>
          h(DemocracyEntryCard, {
            key: entry.summary.ID,
            entry,
            demoMode,
            demoAdminMode: demoAdminMode.value,
            readOnly: props.readOnly,
          }),
        ),
      )
    }
  },
})

onActivated(() => {
  void Promise.allSettled([loadEntries(), loadHistory(), loadCreationAccess()])
})

onMounted(() => {
  window.$Logger.logPageView({ pageLink: '/Democracy/', timeStamp: Date.now() })
})
</script>

<style scoped>
.democracy-page {
  min-height: 100dvh;
  background: #f5f5f5;
  color: #333;
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
  color: #777;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.demo-chip {
  padding: 0.15rem 0.45rem;
  border-radius: 0.3rem;
  background: #eef2ff;
  color: #2563eb;
  font-size: 0.72rem;
}

main {
  height: calc(100dvh - 100px);
  overflow-y: auto;
  padding: 12px;
  scrollbar-width: thin;
}

.demo-banner,
.scope-switch,
.content-panel {
  width: min(1180px, 100%);
  margin-right: auto;
  margin-left: auto;
}

.demo-banner {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 10px 12px;
  border-left: 4px solid #2563eb;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.demo-banner div {
  display: flex;
  gap: 0.2rem;
  flex-direction: column;
}

.demo-banner .demo-actions {
  gap: 0.5rem;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.demo-banner span {
  color: #777;
  font-size: 0.8rem;
}

.scope-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 10px;
  padding: 4px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.scope-switch button {
  display: flex;
  gap: 0.55rem;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 1rem;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #666;
  cursor: pointer;
}

.scope-switch button.active {
  background: #e7f4fb;
  color: #0185c5;
  box-shadow: inset 0 -2px #0185c5;
}

.scope-switch button:focus-visible {
  outline: 2px solid #6ec1e8;
  outline-offset: 1px;
}

.scope-switch small {
  min-width: 1.3rem;
  padding: 0.05rem 0.35rem;
  border-radius: 999px;
  background: rgba(128, 128, 128, 0.15);
}

.content-panel {
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.panel-heading h2,
.panel-heading p {
  margin: 0;
}

.create-actions {
  display: flex;
  flex: 0 0 auto;
  gap: 0.55rem;
}

.panel-heading h2 {
  color: #333;
  font-size: 1.15rem;
}

.panel-heading p {
  margin-top: 0.25rem;
  color: #777;
  font-size: 0.82rem;
}

:deep(.n-tabs-nav-scroll-wrapper) {
  overflow-x: auto;
  scrollbar-width: none;
}

:deep(.n-tabs-tab) {
  white-space: nowrap;
}

:deep(.entry-grid) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 4px 0 10px;
}

:deep(.state-box) {
  display: grid;
  min-height: 14rem;
  place-items: center;
}

@media (max-width: 820px) {
  :deep(.entry-grid) {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .page-heading span {
    display: none;
  }

  main {
    padding: 8px;
  }

  .demo-banner {
    align-items: flex-start;
  }

  .content-panel {
    padding: 10px;
  }

  .panel-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.75rem;
  }

  .create-actions {
    width: 100%;
  }

  .create-actions :deep(.n-button) {
    flex: 1;
  }

  .panel-heading p {
    line-height: 1.45;
  }
}
</style>
