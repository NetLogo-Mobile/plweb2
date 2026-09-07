<template>
  <n-config-provider class="create-page" :theme-overrides="democracyTheme">
    <Header>
      <div class="heading">
        <button
          class="toolbar-icon"
          type="button"
          :aria-label="t('democracy.demo.back')"
          @click="goBack"
        >
          ‹
        </button>
        <h1>{{ pageTitle }}</h1>
        <span v-if="demoMode">{{ t('democracy.demo.badge') }}</span>
      </div>
    </Header>

    <main>
      <section class="form-card">
        <div v-if="!isEditing" class="mode-switch">
          <button
            type="button"
            :class="{ active: mode === 'formal' }"
            :disabled="!access.canInitiate"
            @click="mode = 'formal'"
          >
            {{ t('democracy.create.formalAction') }}
          </button>
          <button
            type="button"
            :class="{ active: mode === 'anonymous' }"
            :disabled="!access.canSuggestAnonymously"
            @click="mode = 'anonymous'"
          >
            {{ t('democracy.create.anonymousAction') }}
          </button>
        </div>

        <n-alert v-if="accessLoading" type="info" :show-icon="false">
          {{ t('democracy.release.checkingAccess') }}
        </n-alert>
        <n-alert v-else-if="accessError" type="error" :show-icon="false">
          <div class="access-error">
            <span>{{ t('democracy.release.accessFailed') }}</span>
            <n-button size="small" @click="loadAccess">{{ t('democracy.retry') }}</n-button>
          </div>
        </n-alert>
        <n-alert v-else-if="votingStarted" type="warning" :show-icon="false">
          {{ t('democracy.create.votingLocked') }}
        </n-alert>
        <n-alert v-else-if="!allowed" type="warning" :show-icon="false">
          {{ deniedMessage }}
        </n-alert>
        <n-alert v-else type="info" :show-icon="false">
          {{ t('democracy.create.anonymousNotice') }}
        </n-alert>

        <n-form :disabled="!allowed || submitting" @submit.prevent="submit">
          <n-form-item v-if="mode === 'formal'" :label="t('democracy.create.kind')">
            <n-radio-group v-model:value="kind" :disabled="isEditing || !allowed || submitting">
              <n-radio-button value="public">{{ t('democracy.tabs.public') }}</n-radio-button>
              <n-radio-button value="oversight">{{ t('democracy.tabs.oversight') }}</n-radio-button>
            </n-radio-group>
          </n-form-item>
          <n-form-item :label="t('democracy.create.participation')">
            <n-radio-group
              v-if="mode === 'formal'"
              v-model:value="participation"
              :disabled="votingStarted || !allowed || submitting"
            >
              <n-radio-button value="Consultation">
                {{ t('democracy.create.consultation') }}
              </n-radio-button>
              <n-radio-button value="Vote">{{ t('democracy.create.vote') }}</n-radio-button>
            </n-radio-group>
            <div v-else class="consultation-only">
              <strong>{{ t('democracy.create.consultation') }}</strong>
              <span>{{ t('democracy.create.anonymousConsultationOnly') }}</span>
            </div>
          </n-form-item>
          <n-form-item :label="t('democracy.create.alias')">
            <n-input
              v-model:value="anonymousAlias"
              :input-props="{ 'aria-label': t('democracy.create.alias') }"
              :maxlength="16"
              :disabled="isEditing || !allowed || submitting"
              show-count
              :placeholder="t('democracy.create.aliasPlaceholder')"
            />
          </n-form-item>
          <n-form-item :label="t('democracy.create.subject')">
            <n-input
              v-model:value="subject"
              :input-props="{ 'aria-label': t('democracy.create.subject') }"
              :maxlength="80"
              show-count
              :placeholder="t('democracy.create.subjectPlaceholder')"
            />
          </n-form-item>
          <n-form-item :label="t('democracy.create.description')">
            <MdEditor
              v-model="description"
              class="democracy-editor"
              :language="editorLocale"
              :preview="showPreview"
              preview-theme="github"
              :html-preview="false"
              :no-katex="true"
              :no-mermaid="true"
              :no-highlight="true"
              :no-echarts="true"
              :no-prettier="true"
              :no-upload-img="true"
              :toolbars="toolbars"
              :read-only="!allowed || submitting"
              :placeholder="t('democracy.create.descriptionPlaceholder')"
            />
            <div class="editor-count" :class="{ over: description.length > 2000 }">
              {{ description.length }} / 2000
            </div>
          </n-form-item>
          <section v-if="participation === 'Vote'" class="vote-plan">
            <div class="vote-plan__heading">
              <div>
                <h2>{{ t('democracy.create.votePlanTitle') }}</h2>
                <p>{{ t('democracy.create.votePlanNotice') }}</p>
              </div>
            </div>
            <n-form-item :label="t('democracy.management.voteOptions')">
              <DemocracyVoteOptionEditor
                v-model="voteOptions"
                :disabled="votingStarted || !allowed"
              />
            </n-form-item>
            <div class="vote-plan__dates">
              <label>
                <span>{{ t('democracy.create.voteStart') }}</span>
                <input
                  v-model="voteStart"
                  type="datetime-local"
                  step="1"
                  :disabled="votingStarted || !allowed"
                />
              </label>
              <label>
                <span>{{ t('democracy.management.voteDeadline') }}</span>
                <input
                  v-model="voteFinish"
                  type="datetime-local"
                  step="1"
                  :disabled="votingStarted || !allowed"
                />
              </label>
            </div>
            <n-checkbox
              v-model:checked="voteMultiple"
              :disabled="votingStarted || !allowed || submitting"
            >
              {{ t('democracy.management.multiple') }}
            </n-checkbox>
          </section>
          <div class="submit-row">
            <n-button
              type="primary"
              attr-type="submit"
              :loading="submitting"
              :disabled="!canSubmit"
            >
              {{ t('mdEditor.publish') }}
            </n-button>
          </div>
        </n-form>
      </section>
    </main>

    <Footer />
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  NAlert,
  NButton,
  NCheckbox,
  NConfigProvider,
  NForm,
  NFormItem,
  NInput,
  NRadioButton,
  NRadioGroup,
} from 'naive-ui'
import { MdEditor } from 'md-editor-v3'
import type { ToolbarNames } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import Header from '@components/utils/Header.vue'
import Footer from '@components/utils/Footer.vue'
import DemocracyVoteOptionEditor from '@components/democracy/DemocracyVoteOptionEditor.vue'
import { showMessage } from '@popup/naiveui'
import {
  getDemocracyCreationAccess,
  fetchDemocracyCreationAccess,
  fetchDemocracyMatter,
  fetchDemocracyContext,
  submitDemocracyMatter,
  updateDemocracyMatter,
  type DemocracyMatterInput,
} from '@services/democracyWall'
import { getDemocracyDemoAnonymousProfile, isDemocracyDemoMode } from '@services/democracyWallDemo'
import type { DemocracyMatterParticipation } from '@services/democracyWallContract'
import { democracyTheme } from '../components/democracy/theme'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const demoMode = isDemocracyDemoMode()
const demoAdminMode = computed(() => route.query.admin === '1')
const editMatterId = computed(() => String(route.query.edit || ''))
const isEditing = computed(() => !!editMatterId.value)
const access = ref(getDemocracyCreationAccess())
const requestedMode = route.query.mode === 'formal' ? 'formal' : 'anonymous'
const mode = ref<'formal' | 'anonymous'>(requestedMode)
const kind = ref<DemocracyMatterInput['kind']>('public')
const participation = ref<DemocracyMatterParticipation>('Consultation')
const subject = ref('')
const description = ref('')
const revision = ref('')
const existingCanEdit = ref(false)
const developerAccess = ref(false)
const originalVoteStart = ref('')
const now = ref(Date.now())
let editClock: ReturnType<typeof setInterval> | undefined
const votingStarted = computed(
  () =>
    isEditing.value &&
    !!originalVoteStart.value &&
    new Date(originalVoteStart.value).getTime() <= now.value,
)
const voteOptions = ref(['', ''])
const voteStart = ref('')
const voteFinish = ref('')
const voteMultiple = ref(false)
const clientRequestId = crypto.randomUUID()
const anonymousAlias = ref(demoMode ? getDemocracyDemoAnonymousProfile().alias : '')
const accessLoading = ref(!demoMode)
const accessError = ref(false)
const submitting = ref(false)
const isMobile = ref(window.innerWidth < 768)

const desktopToolbars: ToolbarNames[] = [
  'bold',
  'italic',
  'underline',
  'title',
  'unorderedList',
  'orderedList',
  'quote',
  'code',
  'link',
  'preview',
]
const mobileToolbars: ToolbarNames[] = ['bold', 'italic', 'title', 'unorderedList', 'link']

const allowed = computed(() =>
  isEditing.value
    ? existingCanEdit.value && (!votingStarted.value || developerAccess.value)
    : mode.value === 'formal'
      ? access.value.canInitiate
      : access.value.canSuggestAnonymously,
)
const parsedVoteOptions = computed(() =>
  voteOptions.value.map((option) => option.trim()).filter(Boolean),
)
const votePlanValid = computed(() => {
  if (participation.value !== 'Vote') return true
  if (votingStarted.value) return developerAccess.value
  const start = new Date(voteStart.value).getTime()
  const finish = new Date(voteFinish.value).getTime()
  return (
    parsedVoteOptions.value.length >= 2 &&
    Number.isFinite(start) &&
    Number.isFinite(finish) &&
    start > now.value &&
    finish > start
  )
})
const canSubmit = computed(
  () =>
    !accessLoading.value &&
    !accessError.value &&
    allowed.value &&
    subject.value.trim().length >= 4 &&
    description.value.trim().length >= 10 &&
    description.value.length <= 2000 &&
    anonymousAlias.value.trim().length >= 2 &&
    votePlanValid.value,
)
const pageTitle = computed(() =>
  t(
    isEditing.value
      ? 'democracy.create.editTitle'
      : mode.value === 'formal'
        ? 'democracy.create.formalTitle'
        : 'democracy.create.anonymousTitle',
  ),
)
const deniedMessage = computed(() =>
  t(
    demoMode
      ? 'democracy.create.postingRevoked'
      : mode.value === 'formal'
        ? 'democracy.create.formalDenied'
        : 'democracy.create.anonymousDenied',
  ),
)
const showPreview = computed(() => !isMobile.value)
const toolbars = computed(() => (isMobile.value ? mobileToolbars : desktopToolbars))
const editorLocale = computed(() => {
  const locales: Record<string, string> = {
    Chinese: 'zh-CN',
    English: 'en-US',
    German: 'de-DE',
    Japanese: 'ja-JP',
    French: 'fr-FR',
  }
  return locales[locale.value] || 'zh-CN'
})

function updateViewport() {
  isMobile.value = window.innerWidth < 768
}

function goBack() {
  void router.push({
    name: 'democracy',
    query: {
      ...(demoMode ? { demo: '1' } : {}),
      ...(demoMode && route.query.developer === '1' ? { developer: '1' } : {}),
      ...(demoAdminMode.value ? { admin: '1' } : {}),
    },
  })
}

async function loadAccess() {
  accessLoading.value = true
  accessError.value = false
  try {
    access.value = await fetchDemocracyCreationAccess()
    developerAccess.value = (await fetchDemocracyContext()).Permissions.CanDeveloperManage === true
    if (!anonymousAlias.value) anonymousAlias.value = access.value.anonymousAlias
  } catch {
    access.value = getDemocracyCreationAccess()
    accessError.value = true
  } finally {
    accessLoading.value = false
  }
}

function toLocalDateTime(value: string) {
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 19)
}

function buildVotePlan() {
  if (participation.value !== 'Vote') return undefined
  return {
    FinishAt: new Date(voteFinish.value).toISOString(),
    Multiple: voteMultiple.value,
    Options: parsedVoteOptions.value,
    StartAt: new Date(voteStart.value).toISOString(),
  }
}

async function loadExistingMatter() {
  if (!isEditing.value) return
  try {
    const matter = await fetchDemocracyMatter(editMatterId.value)
    existingCanEdit.value = matter.canEdit
    revision.value = matter.revision
    mode.value = matter.mode === 'Suggestion' ? 'anonymous' : 'formal'
    kind.value = matter.kind === 'Oversight' ? 'oversight' : 'public'
    participation.value = matter.mode === 'Suggestion' ? 'Consultation' : matter.participation
    subject.value = matter.summary.Subject
    description.value = matter.summary.Description?.join('\n') || ''
    if (matter.votePlan) {
      originalVoteStart.value = matter.votePlan.StartAt
      voteOptions.value =
        matter.votePlan.Options.length >= 2 ? [...matter.votePlan.Options] : ['', '']
      voteStart.value = toLocalDateTime(matter.votePlan.StartAt)
      voteFinish.value = toLocalDateTime(matter.votePlan.FinishAt)
      voteMultiple.value = matter.votePlan.Multiple
    }
  } catch {
    existingCanEdit.value = false
    showMessage('error', t('democracy.create.loadFailed'), { duration: 3500 })
  }
}

async function submit() {
  now.value = Date.now()
  if (!canSubmit.value) return
  submitting.value = true
  try {
    const votePlan = buildVotePlan()
    const summary = isEditing.value
      ? await updateDemocracyMatter({
          description: description.value,
          expectedRevision: revision.value,
          matterId: editMatterId.value,
          participation: participation.value,
          subject: subject.value,
          votePlan,
        })
      : await submitDemocracyMatter({
          anonymous: mode.value === 'anonymous',
          anonymousAlias: anonymousAlias.value,
          clientRequestId,
          description: description.value,
          kind: mode.value === 'anonymous' ? 'public' : kind.value,
          participation: mode.value === 'anonymous' ? 'Consultation' : participation.value,
          subject: subject.value,
          votePlan,
        })
    showMessage('success', t('democracy.create.success'), { duration: 2200 })
    await router.push({
      name: 'democracy-matter-detail',
      params: { id: summary.ID },
      query: {
        ...(demoMode ? { demo: '1' } : {}),
        ...(demoMode && route.query.developer === '1' ? { developer: '1' } : {}),
        ...(demoAdminMode.value ? { admin: '1' } : {}),
      },
    })
  } catch {
    showMessage('error', t('democracy.create.failed'), { duration: 3500 })
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  editClock = setInterval(() => {
    now.value = Date.now()
  }, 500)
  window.addEventListener('resize', updateViewport)
  void Promise.allSettled([loadAccess(), loadExistingMatter()])
})

watch(mode, (value) => {
  if (value === 'anonymous') participation.value = 'Consultation'
})

onUnmounted(() => {
  if (editClock) clearInterval(editClock)
  window.removeEventListener('resize', updateViewport)
})
</script>

<style scoped>
.create-page {
  min-height: 100dvh;
  background: #f5f5f5;
  color: #333;
}

.toolbar-icon {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 6px;
  background: #e7f4fb;
  color: #0185c5;
  cursor: pointer;
  font-size: 1.5rem;
}

.heading {
  display: flex;
  width: 100%;
  min-width: 0;
  gap: 0.6rem;
  align-items: center;
}

.heading h1 {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  font-size: 1.2rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.heading span {
  color: #0185c5;
  font-size: 0.75rem;
}

main {
  height: calc(100dvh - 100px);
  overflow-y: auto;
  padding: 12px;
}

.form-card {
  box-sizing: border-box;
  width: min(920px, 100%);
  margin: 0 auto;
  padding: clamp(14px, 3vw, 24px);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.access-error {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  flex-direction: column;
}

.mode-switch {
  display: flex;
  gap: 1.25rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.mode-switch button {
  position: relative;
  padding: 0.7rem 0.2rem;
  border: 0;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
}

.mode-switch button.active {
  color: #0185c5;
  font-weight: 650;
}

.mode-switch button.active::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  background: #0185c5;
  content: '';
}

.mode-switch button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.n-alert {
  margin-bottom: 1rem;
}

.democracy-editor {
  width: 100%;
  min-width: 0;
  height: clamp(320px, 48dvh, 520px);
  border-radius: 8px;
  overflow: hidden;
}

.democracy-editor :deep(.cm-content) {
  font-size: 16px;
}

.editor-count {
  width: 100%;
  margin-top: 0.35rem;
  color: #9ca3af;
  font-size: 0.75rem;
  text-align: right;
}

.editor-count.over {
  color: #d03050;
}

:deep(.n-form-item-blank) {
  flex-wrap: wrap;
  min-width: 0;
}

.consultation-only {
  display: grid;
  width: 100%;
  gap: 0.2rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid #cfe4f3;
  border-radius: 6px;
  background: #f3f9fd;
  color: #285f80;
}

.consultation-only span {
  color: #64748b;
  font-size: 0.82rem;
}

.vote-plan {
  margin: 0.5rem 0 1.25rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f8fafc;
}

.vote-plan__heading {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  justify-content: space-between;
}

.vote-plan__heading h2 {
  margin: 0;
  font-size: 1rem;
}

.vote-plan__heading p {
  margin: 0.35rem 0 1rem;
  color: #64748b;
  font-size: 0.82rem;
}

.vote-plan__dates {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 0.8rem;
}

.vote-plan__dates label {
  display: grid;
  gap: 0.35rem;
  color: #475569;
  font-size: 0.82rem;
}

.vote-plan__dates input {
  min-width: 0;
  padding: 0.55rem 0.65rem;
  border: 1px solid #d8dee8;
  border-radius: 4px;
  background: #fff;
  color: inherit;
}

.submit-row {
  display: flex;
  justify-content: flex-end;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 520px) {
  main {
    padding: 8px;
  }

  .heading span {
    display: none;
  }

  .submit-row :deep(.n-button) {
    width: 100%;
  }

  .democracy-editor {
    height: min(48dvh, 380px);
  }

  .vote-plan__dates {
    grid-template-columns: 1fr;
  }
}
</style>
