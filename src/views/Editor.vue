<template>
  <div class="md-editor-page">
    <header class="editor-header">
      <button
        v-if="!hideWorkSidebar"
        class="toolbar-icon menu-button"
        type="button"
        @click="toggleSidebar"
      >
        <span>{{ showSidebar ? '✕' : '☰' }}</span>
      </button>
      <button class="toolbar-icon back-button" type="button" @click="goBack">‹</button>
      <h1>{{ t('mdEditor.title') }}</h1>
      <button
        v-if="!hideWorkSidebar"
        class="primary-button"
        type="button"
        :disabled="!isLoggedIn"
        @click="loadWorks"
      >
        {{ t('mdEditor.refreshWorks') }}
      </button>
    </header>

    <main v-if="isLoggedIn" class="editor-shell">
      <aside v-if="!hideWorkSidebar" class="work-sidebar" :class="{ open: showSidebar }">
        <div class="sidebar-header">
          <n-input
            v-model:value="searchKeyword"
            :placeholder="t('mdEditor.searchPlaceholder')"
            clearable
          />
        </div>

        <div class="tab-bar">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'Discussion' }"
            @click="activeTab = 'Discussion'"
          >
            Discussion
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'Experiment' }"
            @click="activeTab = 'Experiment'"
          >
            Experiment
          </button>
        </div>

        <div v-show="activeTab === 'Discussion'" ref="discListRef" class="tab-work-list">
          <button
            v-for="work in currentTabWorks"
            :key="work.id"
            class="work-item"
            :class="{ active: work.id === selectedId }"
            type="button"
            @click="selectWork(work.id)"
            @contextmenu.prevent="onWorkContextMenu($event, work)"
          >
            <span class="work-title">{{ work.subject }}</span>
            <span class="work-meta">{{ getWorkMeta(work) }}</span>
          </button>
          <div ref="discSentinelRef" class="sentinel" />
          <p v-if="!loading && currentTabWorks.length === 0" class="empty-tip">
            {{ t('mdEditor.emptyWorks') }}
          </p>
          <p v-if="loadingMoreByCategory[activeTab]" class="loading-more">
            {{ t('mdEditor.rendering') }}
          </p>
        </div>

        <div v-show="activeTab === 'Experiment'" ref="expListRef" class="tab-work-list">
          <button
            v-for="work in currentTabWorks"
            :key="work.id"
            class="work-item"
            :class="{ active: work.id === selectedId }"
            type="button"
            @click="selectWork(work.id)"
            @contextmenu.prevent="onWorkContextMenu($event, work)"
          >
            <span class="work-title">{{ work.subject }}</span>
            <span class="work-meta">{{ getWorkMeta(work) }}</span>
          </button>
          <div ref="expSentinelRef" class="sentinel" />
          <p v-if="!loading && currentTabWorks.length === 0" class="empty-tip">
            {{ t('mdEditor.emptyWorks') }}
          </p>
          <p v-if="loadingMoreByCategory[activeTab]" class="loading-more">
            {{ t('mdEditor.rendering') }}
          </p>
        </div>
      </aside>

      <section class="editor-main" :class="{ 'editor-full': hideWorkSidebar }">
        <div v-if="selectedWork && !detailLoading" class="editor-toolbar">
          <n-input
            v-model:value="editSubject"
            :placeholder="t('mdEditor.subjectPlaceholder')"
            class="subject-input"
          />
          <n-button type="primary" :loading="saving" :disabled="!dirty" @click="saveCurrentWork">
            {{ t('mdEditor.publish') }}
          </n-button>
        </div>

        <div v-if="selectedWork && !detailLoading" class="editor-card">
          <MdEditor
            v-model="editMarkdown"
            :language="editorLocale"
            :preview="showPreview"
            preview-theme="github"
            :html-preview="false"
            :no-katex="true"
            :no-mermaid="true"
            :no-highlight="true"
            :toolbars="toolbars"
            :preview-component="PreviewRenderer"
            @on-upload-img="handleUploadImg"
          />
        </div>

        <div v-else-if="detailLoading" class="placeholder-card">
          <n-spin size="large" />
        </div>

        <div v-else class="placeholder-card">
          <n-spin v-if="loading" size="large" />
          <p v-else>{{ t('mdEditor.selectWork') }}</p>
        </div>
      </section>
    </main>

    <section v-else class="login-required">
      <h2>{{ t('mdEditor.loginRequiredTitle') }}</h2>
      <p>{{ t('mdEditor.loginRequiredContent') }}</p>
      <router-link to="/">
        <n-button type="primary">{{ t('mdEditor.login') }}</n-button>
      </router-link>
    </section>

    <div
      v-if="showSidebar && !hideWorkSidebar"
      class="sidebar-overlay"
      @click="showSidebar = false"
    />

    <n-modal
      v-model:show="tagModalVisible"
      :title="t('mdEditor.editTags')"
      preset="card"
      style="width: 400px"
    >
      <div class="tag-edit">
        <div class="tag-list">
          <n-tag v-for="(tag, i) in editTags" :key="i" closable @close="editTags.splice(i, 1)">{{
            tag
          }}</n-tag>
        </div>
        <div class="tag-input-row">
          <n-input
            v-model:value="newTag"
            :placeholder="t('mdEditor.tagPlaceholder')"
            @keyup.enter="addTag"
          />
          <n-button size="small" @click="addTag">+</n-button>
        </div>
        <n-button type="primary" size="small" @click="updateTags">{{
          t('mdEditor.save')
        }}</n-button>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  defineComponent,
  h,
  onActivated,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { getRouteCategory } from '../router/category'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { NButton, NInput, NModal, NSpin, NTag } from 'naive-ui'
import type { ToolbarNames } from 'md-editor-v3'
import { showMessage } from '@popup/naiveui'
import showActionSheet from '@popup/actionSheet'
import type { Category } from '@services/../pl-serve-type-main/type/main'
import { checkLogin, getCoverUrl, getPath } from '@services/utils'
import parse from '@services/pltxt2htm/advancedParser'
import storageManager from '@storage/index'
import {
  fetchEditableWork,
  fetchEditableWorks,
  getCurrentUserId,
  loadWorkDetail,
  publishEditorWork,
  type EditorWork,
  type CategoryCursor,
} from '@services/editor/cloudWorks'
import getTagName from '@i18n/getTagName'

const hideWorkSidebar = computed(() => route.query.sidebar === '0')
const activeTab = ref<Category>('Discussion')

const worksByCategory = reactive<Record<string, EditorWork[]>>({
  Discussion: [],
  Experiment: [],
})
const cursorsByCategory = reactive<Record<string, CategoryCursor[]>>({
  Discussion: [{ category: 'Discussion' as Category }],
  Experiment: [{ category: 'Experiment' as Category }],
})
const hasMoreByCategory = reactive<Record<string, boolean>>({
  Discussion: true,
  Experiment: true,
})
const loadingMoreByCategory = reactive<Record<string, boolean>>({
  Discussion: false,
  Experiment: false,
})

const selectedId = ref('')
const loading = ref(true)
const saving = ref(false)
const detailLoading = ref(false)
const editSubject = ref('')
const editMarkdown = ref('')
const searchKeyword = ref('')
const isLoggedIn = ref(checkLogin(false))
const showSidebar = ref(false)
const coverUrl = ref('')
const defaultCover = getPath('/@base/assets/messages/Experiment-Default.png')
const route = useRoute()
const { t, locale } = useI18n()

const tagModalVisible = ref(false)
const editTags = ref<string[]>([])
const newTag = ref('')

const PAGE_SIZE = 20

const isMobile = ref(window.innerWidth < 768)
const isLandscape = ref(
  window.innerWidth >= 768 || (window.matchMedia?.('(orientation: landscape)').matches ?? true),
)

function updateViewState() {
  isMobile.value = window.innerWidth < 768
  isLandscape.value = isMobile.value
    ? (window.matchMedia?.('(orientation: landscape)').matches ?? true)
    : true
}

const showPreview = computed(() => !isMobile.value)

const toolbarPortrait: ToolbarNames[] = [
  'bold',
  'italic',
  'underline',
  'code',
  'link',
  'fullscreen',
  'previewOnly',
]
const toolbarLandscape: ToolbarNames[] = [
  'bold',
  'italic',
  'underline',
  'strikeThrough',
  'title',
  'unorderedList',
  'orderedList',
  'code',
  'link',
  'fullscreen',
  'preview',
  'previewOnly',
]

const toolbars = computed(() => (isLandscape.value ? toolbarLandscape : toolbarPortrait))

const editorLocale = computed(() => {
  const map: Record<string, string> = {
    Chinese: 'zh-CN',
    English: 'en-US',
    German: 'de-DE',
    Japanese: 'ja-JP',
    French: 'fr-FR',
  }
  return map[locale.value] || 'zh-CN'
})

const allWorks = computed(() => [...worksByCategory.Discussion, ...worksByCategory.Experiment])

const selectedWork = computed(
  () => allWorks.value.find((work) => work.id === selectedId.value) || null,
)

const dirty = computed(() => {
  const work = selectedWork.value
  return !!work && (work.subject !== editSubject.value || work.markdown !== editMarkdown.value)
})

const currentTabWorks = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  const items = worksByCategory[activeTab.value] || []
  if (!kw) return items
  return items.filter((work) => work.subject.toLowerCase().includes(kw))
})

function toggleSidebar() {
  showSidebar.value = !showSidebar.value
}

function goBack() {
  window.history.back()
}

function applyWork(work: EditorWork) {
  editSubject.value = work.subject
  editMarkdown.value = work.markdown
  coverUrl.value = work.rawSummary ? getCoverUrl(work.rawSummary) : defaultCover
}

function getWorkMeta(work: EditorWork) {
  return work.tags.map((tag) => (tag.startsWith('Type-') ? '' : getTagName(tag))).join(' ')
}

let selectTicket = 0

async function selectWork(id: string) {
  if (id === selectedId.value) return
  selectedId.value = id

  const work = allWorks.value.find((w) => w.id === id)
  if (!work) return

  const ticket = ++selectTicket
  history.replaceState(null, '', `#/e/${work.category}/${work.id}`)

  showSidebar.value = false
  detailLoading.value = true

  try {
    const updated = await loadWorkDetail(work)
    if (ticket !== selectTicket) return
    const cat = updated.category
    const idx = worksByCategory[cat].findIndex((w) => w.id === updated.id)
    if (idx >= 0) {
      worksByCategory[cat][idx] = updated
    }
  } catch (error) {
    if (ticket === selectTicket) {
      showMessage('error', (error as Error).message, { duration: 4000 })
    }
    detailLoading.value = false
    return
  }
  applyWork(selectedWork.value!)
  detailLoading.value = false
}

async function loadCategory(category: Category) {
  const result = await fetchEditableWorks(cursorsByCategory[category], PAGE_SIZE)
  cursorsByCategory[category] = result.cursors
  worksByCategory[category] = result.works
  hasMoreByCategory[category] = result.hasMore
}

async function loadWorks() {
  if (!checkLogin(true)) {
    isLoggedIn.value = false
    return
  }
  isLoggedIn.value = true
  loading.value = true
  try {
    await Promise.all([loadCategory('Discussion'), loadCategory('Experiment')])
    if (allWorks.value.length > 0) {
      selectWork(allWorks.value[0].id)
    } else {
      selectedId.value = ''
    }
  } catch (error) {
    showMessage('error', (error as Error).message, { duration: 4000 })
  } finally {
    loading.value = false
  }
}

async function loadMoreWorks(category: Category) {
  const key = category
  if (loadingMoreByCategory[key] || !hasMoreByCategory[key]) return
  loadingMoreByCategory[key] = true
  try {
    const result = await fetchEditableWorks(cursorsByCategory[key], PAGE_SIZE)
    cursorsByCategory[key] = result.cursors
    worksByCategory[key].push(...result.works)
    hasMoreByCategory[key] = result.hasMore
  } catch (error) {
    showMessage('error', (error as Error).message, { duration: 4000 })
  } finally {
    loadingMoreByCategory[key] = false
  }
}

function buildPreviewContext(work: EditorWork | null) {
  return {
    project: editSubject.value,
    visitorId: storageManager.getObj('userInfo').value?.ID || getCurrentUserId(),
    authorId: work?.rawSummary?.User?.ID || '',
    coauthorIds: work?.rawSummary?.Coauthors?.map((user) => user.ID) || [],
  }
}

const PreviewRenderer = defineComponent({
  name: 'CustomPreview',
  props: {
    id: String,
    class: String,
  },
  setup(props) {
    const html = ref('')
    let ticket = 0

    watch(
      [editMarkdown, editSubject, selectedId],
      async () => {
        const cur = ++ticket
        try {
          const result = await parse(editMarkdown.value, buildPreviewContext(selectedWork.value))
          if (cur !== ticket) return
          html.value = result || `<p class="empty-preview">${t('mdEditor.emptyPreview')}</p>`
        } catch (error) {
          if (cur !== ticket) return
          html.value = `<p class="preview-error">${(error as Error).message}</p>`
        }
      },
      { immediate: true },
    )

    return () => h('div', { id: props.id, class: props.class, innerHTML: html.value })
  },
})

async function saveCurrentWork() {
  const work = selectedWork.value
  if (!work) return
  saving.value = true
  try {
    const result = await publishEditorWork(work, editMarkdown.value, editSubject.value)
    const cat = result.updatedWork.category
    const idx = worksByCategory[cat].findIndex((w) => w.id === result.updatedWork.id)
    if (idx >= 0) {
      worksByCategory[cat][idx] = result.updatedWork
    }
    showMessage('success', t('mdEditor.saveSuccess'), { duration: 2500 })
  } catch (error) {
    showMessage('error', (error as Error).message, { duration: 5000 })
  } finally {
    saving.value = false
  }
}

function handleUploadImg(_files: File[], _callback: (urls: string[]) => void) {
  showMessage('info', t('mdEditor.uploadImgHint'), { duration: 3000 })
}

function onWorkContextMenu(_event: MouseEvent, work: EditorWork) {
  showActionSheet([{ label: t('mdEditor.editTags') }], (idx) => {
    if (idx === 0) {
      openTagEditor(work)
    }
  })
}

function openTagEditor(work: EditorWork) {
  editTags.value = [...work.tags]
  newTag.value = ''
  tagModalVisible.value = true
}

function addTag() {
  const tag = newTag.value.trim()
  if (tag && !editTags.value.includes(tag)) {
    editTags.value.push(tag)
  }
  newTag.value = ''
}

async function updateTags() {
  const work = selectedWork.value
  if (!work) return
  const cat = work.category
  const idx = worksByCategory[cat].findIndex((w) => w.id === work.id)
  if (idx < 0) return

  const updatedRaw = { ...work.rawSummary!, Tags: [...editTags.value] }
  worksByCategory[cat][idx] = {
    ...worksByCategory[cat][idx],
    tags: [...editTags.value],
    rawSummary: updatedRaw,
  }

  try {
    await publishEditorWork(
      { ...work, rawSummary: updatedRaw },
      editMarkdown.value,
      editSubject.value,
    )
    showMessage('success', t('mdEditor.saveSuccess'), { duration: 2000 })
  } catch (error) {
    showMessage('error', (error as Error).message, { duration: 5000 })
  }
  tagModalVisible.value = false
}

async function loadWorkById(category: string, id: string) {
  loading.value = true
  try {
    const [work, discResult, expResult] = await Promise.all([
      fetchEditableWork(category as any, id),
      fetchEditableWorks(cursorsByCategory.Discussion, PAGE_SIZE),
      fetchEditableWorks(cursorsByCategory.Experiment, PAGE_SIZE),
    ])

    cursorsByCategory.Discussion = discResult.cursors
    cursorsByCategory.Experiment = expResult.cursors
    worksByCategory.Discussion = discResult.works
    worksByCategory.Experiment = expResult.works
    hasMoreByCategory.Discussion = discResult.hasMore
    hasMoreByCategory.Experiment = expResult.hasMore

    const seen = new Set(allWorks.value.map((w) => w.id))
    if (!seen.has(work.id)) {
      worksByCategory[work.category].unshift(work)
    }

    selectedId.value = work.id
    applyWork(work)
    detailLoading.value = false
  } catch (error) {
    showMessage('error', (error as Error).message, { duration: 5000 })
    loadWorks()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  updateViewState()
  window.addEventListener('resize', updateViewState)

  if (isLoggedIn.value) {
    const category = getRouteCategory(route, 'Discussion')
    const id = route.params.id as string
    if (id) {
      loadWorkById(category, id)
    } else {
      loadWorks()
    }
  } else {
    loading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateViewState)
})

onActivated(() => {
  isLoggedIn.value = checkLogin(false)
  window.$Logger?.logPageView({
    pageLink: '/markdown-editor',
    timeStamp: Date.now(),
  })
})

const discSentinelRef = ref<HTMLElement | null>(null)
const discListRef = ref<HTMLElement | null>(null)
const expSentinelRef = ref<HTMLElement | null>(null)
const expListRef = ref<HTMLElement | null>(null)

function setupTabObserver(
  sentinelRef: ReturnType<typeof ref<HTMLElement | null>>,
  listRef: ReturnType<typeof ref<HTMLElement | null>>,
  category: Category,
) {
  let initialized = false
  watch(sentinelRef, (el) => {
    if (!el || initialized) return
    initialized = true
    const root = listRef.value || el.parentElement
    if (!root) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreWorks(category)
        }
      },
      { root, rootMargin: '200px' },
    )
    obs.observe(el)
  })
}

setupTabObserver(discSentinelRef, discListRef, 'Discussion')
setupTabObserver(expSentinelRef, expListRef, 'Experiment')
</script>

<style scoped>
.md-editor-page {
  min-height: 100dvh;
  background: #f4f7fb;
  color: #1f2937;
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 20;
}

.editor-header h1 {
  margin: 0;
  font-size: 18px;
  white-space: nowrap;
}

.toolbar-icon {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef2ff;
  color: #2563eb;
  font-size: 16px;
  flex-shrink: 0;
  transition: background 0.15s;
}

.toolbar-icon:hover {
  background: #dbeafe;
}

.toolbar-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #2563eb;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.back-button {
  font-size: 22px;
}

.primary-button {
  margin-left: auto;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
  padding: 7px 12px;
  background: #2563eb;
  color: #ffffff;
  font-size: 13px;
  white-space: nowrap;
  flex-shrink: 0;
}

.primary-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.editor-shell {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  min-height: calc(100dvh - 52px);
}

.work-sidebar {
  position: fixed;
  top: 0;
  left: -300px;
  width: 280px;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
  z-index: 30;
  padding: 50px 10px 10px;
  transition: left 0.25s ease;
}

.work-sidebar.open {
  left: 0;
}

.sidebar-header {
  flex-shrink: 0;
}

.tab-bar {
  display: flex;
  flex-shrink: 0;
  border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
  flex: 1;
  padding: 6px 8px;
  border: 0;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition:
    color 0.15s,
    border-color 0.15s;
}

.tab-btn.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

.tab-btn:hover {
  color: #2563eb;
}

.tab-work-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.work-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  width: 100%;
  padding: 6px 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: #f8fafc;
  cursor: pointer;
  text-align: left;
}

.work-item.active {
  border-color: #2563eb;
  background: #eff6ff;
}

.work-title {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
  font-size: 13px;
}

.work-meta,
.empty-tip,
.loading-more {
  color: #64748b;
  font-size: 11px;
}

.loading-more {
  text-align: center;
  padding: 8px;
}

.sentinel {
  height: 1px;
  flex-shrink: 0;
}

.sidebar-overlay {
  display: block;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 25;
}

.editor-main {
  flex: 1;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
  padding: 12px;
  min-width: 0;
  margin: 12px;
}

.editor-main.editor-full {
  /* max-width: 960px; */
  margin: 12px 2vw;
}

.editor-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.subject-input {
  flex: 1;
}

.editor-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
}

:deep(.preview-error) {
  color: #dc2626;
}

.login-required,
.placeholder-card {
  max-width: 600px;
  margin: 48px auto;
  text-align: center;
  padding: 24px;
}

.tag-edit {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-input-row {
  display: flex;
  gap: 6px;
}

.tag-input-row .n-input {
  flex: 1;
}

@media (max-width: 768px) {
  .editor-header {
    padding: 8px 10px;
    gap: 6px;
  }

  .editor-header h1 {
    font-size: 15px;
  }

  .editor-toggle {
    display: flex;
  }

  .editor-main {
    border-radius: 0;
    border-left: 0;
    border-right: 0;
    margin: 0;
    padding: 12px;
  }

  .editor-main.editor-full {
    margin: 0;
  }

  .work-title {
    max-width: 200px;
  }
}
</style>
