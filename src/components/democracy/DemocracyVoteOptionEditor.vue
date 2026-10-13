<template>
  <div class="vote-option-editor">
    <div v-for="(option, index) in model" :key="index" class="vote-option-editor__row">
      <n-input
        :value="option"
        :disabled="disabled"
        :maxlength="80"
        show-count
        :placeholder="t('democracy.management.optionPlaceholder', { number: index + 1 })"
        @update:value="updateOption(index, $event)"
      />
      <n-button
        quaternary
        circle
        :aria-label="t('democracy.management.removeOption', { number: index + 1 })"
        :disabled="disabled || model.length <= MIN_OPTIONS"
        @click="removeOption(index)"
      >
        −
      </n-button>
    </div>
    <n-button dashed block :disabled="disabled || model.length >= MAX_OPTIONS" @click="addOption">
      {{ t('democracy.management.addOption') }}
    </n-button>
    <small>{{ t('democracy.management.optionLimit', { max: MAX_OPTIONS }) }}</small>
  </div>
</template>

<script setup lang="ts">
import { NButton, NInput } from 'naive-ui'
import { useI18n } from 'vue-i18n'

const MIN_OPTIONS = 2
const MAX_OPTIONS = 20
const model = defineModel<string[]>({ required: true })
const props = defineProps<{ disabled?: boolean }>()
const { t } = useI18n()

function addOption() {
  if (props.disabled || model.value.length >= MAX_OPTIONS) return
  model.value = [...model.value, '']
}

function removeOption(index: number) {
  if (props.disabled || model.value.length <= MIN_OPTIONS) return
  model.value = model.value.filter((_, optionIndex) => optionIndex !== index)
}

function updateOption(index: number, value: string) {
  if (props.disabled) return
  model.value = model.value.map((option, optionIndex) => (optionIndex === index ? value : option))
}
</script>

<style scoped>
.vote-option-editor {
  display: grid;
  width: 100%;
  gap: 0.65rem;
}

.vote-option-editor__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.45rem;
  align-items: center;
}

.vote-option-editor small {
  color: #64748b;
}
</style>
