<template>
  <n-modal
    :show="show"
    preset="card"
    :title="t('democracy.report.title')"
    class="report-dialog"
    @close="close"
  >
    <div class="report-dialog__body">
      <p>{{ t('democracy.report.notice') }}</p>
      <n-select v-model:value="category" :options="categories" />
      <n-input
        v-model:value="details"
        type="textarea"
        :autosize="{ minRows: 4, maxRows: 8 }"
        :maxlength="500"
        show-count
        :placeholder="t('democracy.report.placeholder')"
      />
      <div class="report-dialog__actions">
        <n-button @click="close">{{ t('democracy.report.cancel') }}</n-button>
        <n-button type="primary" :loading="submitting" :disabled="!canSubmit" @click="submit">
          {{ t('democracy.report.submit') }}
        </n-button>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { NButton, NInput, NModal, NSelect } from 'naive-ui'
import { showMessage } from '@popup/naiveui'
import { reportDemocracyMatter } from '@services/democracyWall'
import type { DemocracyReportCategory } from '@services/democracyWallContract'

const props = defineProps<{ matterId: string; show: boolean }>()
const emit = defineEmits<{ 'update:show': [show: boolean] }>()
const { t } = useI18n()
const category = ref<DemocracyReportCategory>('Harassment')
const details = ref('')
const submitting = ref(false)
const categories = computed(() =>
  (['Harassment', 'Privacy', 'Misinformation', 'Other'] as DemocracyReportCategory[]).map(
    (value) => ({ label: t(`democracy.report.categories.${value}`), value }),
  ),
)
const canSubmit = computed(() => details.value.trim().length >= 10)

watch(
  () => props.show,
  (show) => {
    if (!show) details.value = ''
  },
)

function close() {
  if (!submitting.value) emit('update:show', false)
}

async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    await reportDemocracyMatter(props.matterId, category.value, details.value)
    showMessage('success', t('democracy.report.success'), { duration: 2500 })
    emit('update:show', false)
  } catch {
    showMessage('error', t('democracy.report.failed'), { duration: 3000 })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.report-dialog {
  width: min(520px, calc(100vw - 24px));
}

.report-dialog__body {
  display: grid;
  gap: 14px;
}

.report-dialog__body p {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
}

.report-dialog__actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>
