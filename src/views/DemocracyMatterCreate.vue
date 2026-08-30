<template>
  <div class="create-page">
    <Header>
      <button class="back" type="button" @click="goBack">←</button>
      <div class="heading">
        <h1>{{ pageTitle }}</h1>
        <span v-if="demoMode">{{ t('democracy.demo.badge') }}</span>
      </div>
    </Header>

    <main>
      <section class="form-card">
        <div class="mode-switch">
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

        <n-alert v-if="!allowed" type="warning" :show-icon="false">
          {{ deniedMessage }}
        </n-alert>
        <n-alert v-else-if="mode === 'anonymous'" type="info" :show-icon="false">
          {{ t('democracy.create.anonymousNotice') }}
        </n-alert>

        <n-form :disabled="!allowed || submitting" @submit.prevent="submit">
          <n-form-item :label="t('democracy.create.kind')">
            <n-radio-group v-model:value="kind">
              <n-radio-button value="public">{{ t('democracy.tabs.public') }}</n-radio-button>
              <n-radio-button value="oversight">{{ t('democracy.tabs.oversight') }}</n-radio-button>
            </n-radio-group>
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
            <n-input
              v-model:value="description"
              :input-props="{ 'aria-label': t('democracy.create.description') }"
              type="textarea"
              :maxlength="2000"
              show-count
              :autosize="{ minRows: 7, maxRows: 14 }"
              :placeholder="t('democracy.create.descriptionPlaceholder')"
            />
          </n-form-item>
          <div class="submit-row">
            <n-button type="info" attr-type="submit" :loading="submitting" :disabled="!canSubmit">
              {{ t('democracy.create.submit') }}
            </n-button>
          </div>
        </n-form>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { NAlert, NButton, NForm, NFormItem, NInput, NRadioButton, NRadioGroup } from 'naive-ui'
import Header from '@components/utils/Header.vue'
import Footer from '@components/utils/Footer.vue'
import { showMessage } from '@popup/naiveui'
import {
  getDemocracyCreationAccess,
  submitDemocracyMatter,
  type DemocracyMatterInput,
} from '@services/democracyWall'
import { isDemocracyDemoMode } from '@services/democracyWallDemo'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const demoMode = isDemocracyDemoMode()
const access = getDemocracyCreationAccess()
const requestedMode = route.query.mode === 'formal' ? 'formal' : 'anonymous'
const mode = ref<'formal' | 'anonymous'>(
  requestedMode === 'formal' && !access.canInitiate ? 'anonymous' : requestedMode,
)
const kind = ref<DemocracyMatterInput['kind']>('public')
const subject = ref('')
const description = ref('')
const submitting = ref(false)

const allowed = computed(() =>
  mode.value === 'formal' ? access.canInitiate : access.canSuggestAnonymously,
)
const canSubmit = computed(
  () => allowed.value && subject.value.trim().length >= 4 && description.value.trim().length >= 10,
)
const pageTitle = computed(() =>
  t(mode.value === 'formal' ? 'democracy.create.formalTitle' : 'democracy.create.anonymousTitle'),
)
const deniedMessage = computed(() =>
  t(mode.value === 'formal' ? 'democracy.create.formalDenied' : 'democracy.create.anonymousDenied'),
)

function goBack() {
  void router.push({ name: 'democracy', query: demoMode ? { demo: '1' } : {} })
}

async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    const summary = await submitDemocracyMatter({
      anonymous: mode.value === 'anonymous',
      description: description.value,
      kind: kind.value,
      subject: subject.value,
    })
    showMessage('success', t('democracy.create.success'), { duration: 2200 })
    await router.push({
      name: 'democracy-matter-detail',
      params: { id: summary.ID },
      query: demoMode ? { demo: '1' } : {},
    })
  } catch {
    showMessage('error', t('democracy.create.failed'), { duration: 3500 })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-page {
  min-height: 100dvh;
  background: #f3f3f3;
  color: #333;
}

.back {
  padding: 0.25rem 0.6rem;
  border: 0;
  background: transparent;
  color: #555;
  cursor: pointer;
  font-size: 1.4rem;
}

.heading {
  display: flex;
  gap: 0.6rem;
  align-items: baseline;
}

.heading h1 {
  margin: 0;
  font-size: 1.2rem;
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
  width: min(760px, 100%);
  margin: 0 auto;
  padding: clamp(14px, 3vw, 24px);
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.mode-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px;
  margin-bottom: 1rem;
  padding: 4px;
  border-radius: 8px;
  background: #eef2f5;
}

.mode-switch button {
  padding: 0.65rem;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #66717b;
  cursor: pointer;
}

.mode-switch button.active {
  background: #fff;
  color: #0185c5;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.09);
  font-weight: 650;
}

.mode-switch button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.n-alert {
  margin-bottom: 1rem;
}

.submit-row {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 520px) {
  main {
    padding: 8px;
  }

  .submit-row :deep(.n-button) {
    width: 100%;
  }
}
</style>
