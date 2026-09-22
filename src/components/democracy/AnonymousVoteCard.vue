<template>
  <article class="vote-card">
    <header>
      <span class="anonymous-label">{{ t('democracy.vote.anonymous') }}</span>
      <span class="vote-meta">
        <span v-if="isFinished" class="vote-status">{{ t('democracy.vote.finished') }}</span>
        <span class="vote-mode">
          {{
            activity.InterfaceModel === 'Vote-Single'
              ? t('democracy.vote.single')
              : t('democracy.vote.multiple')
          }}
        </span>
      </span>
    </header>

    <div class="choices">
      <button
        v-for="(item, index) in activity.Items"
        :key="index"
        type="button"
        class="choice"
        :class="{ chosen: hasChosen(index), result: shouldShowResult(index) }"
        :disabled="votingIndex !== null || !canVote(index)"
        @click="vote(index)"
      >
        <span class="choice-line">
          <strong>{{ choiceLabel(item.Description, index) }}</strong>
          <b v-if="shouldShowResult(index)">{{ percentage(index) }}%</b>
        </span>
        <span v-if="shouldShowResult(index)" class="bar" aria-hidden="true">
          <i :style="{ width: `${percentage(index)}%` }"></i>
        </span>
        <small v-else>
          {{ status ? t('democracy.vote.cast') : t('democracy.vote.loginOrIneligible') }}
        </small>
      </button>
    </div>

    <footer>
      <span>{{ t('democracy.vote.privacy') }}</span>
      <span>{{ dateRange }}</span>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { showLoginModel } from '@popup/index'
import { showMessage } from '@popup/naiveui'
import { submitDemocracyVote } from '@services/democracyWall'
import { isDemocracyDemoMode } from '@services/democracyWallDemo'
import { checkLogin } from '@services/utils'
import type { Activity, ActivityStatus, Statistic, Sync } from '../../pl-serve-type-main/type/main'

const props = defineProps<{
  activity: Activity
  status?: ActivityStatus
  statistic?: Statistic
  disabled?: boolean
}>()
const emit = defineEmits<{ updated: [Sync | undefined] }>()

const { t, te } = useI18n()
const votingIndex = ref<number | null>(null)
const currentTime = ref(Date.now())
let deadlineTimer: ReturnType<typeof setInterval> | undefined

const finishTimestamp = computed(() => new Date(props.activity.FinishDate).getTime())
const isFinished = computed(
  () =>
    props.status?.Finished === true ||
    (Number.isFinite(finishTimestamp.value) && finishTimestamp.value <= currentTime.value),
)

const dateRange = computed(
  () =>
    `${String(props.activity.StartDate).slice(0, 10)} — ${String(props.activity.FinishDate).slice(0, 10)}`,
)

const totalVotes = computed(() =>
  props.activity.Items.reduce((total, item) => total + Math.max(0, item.Counter), 0),
)

function choiceLabel(description: string | null, index: number) {
  if (!description) return t('democracy.vote.option', { number: index + 1 })
  return te(description) ? t(description) : description
}

function hasChosen(index: number) {
  return props.status?.Gains?.includes(index) ?? false
}

function shouldShowResult(index: number) {
  if (!props.status) return true
  if (isFinished.value) return true
  if (hasChosen(index)) return true
  return props.activity.InterfaceModel === 'Vote-Single' && props.status.Gains.length > 0
}

function percentage(index: number) {
  if (totalVotes.value <= 0) return 0
  return Math.round(
    (Math.max(0, props.activity.Items[index]?.Counter ?? 0) / totalVotes.value) * 100,
  )
}

function canVote(index: number) {
  if (props.disabled || new Date(props.activity.StartDate).getTime() > currentTime.value)
    return false
  if (!props.status || !props.statistic || isFinished.value || hasChosen(index)) return false
  if (props.activity.InterfaceModel === 'Vote-Single' && props.status.Gains.length > 0) return false
  return true
}

async function vote(index: number) {
  if (!isDemocracyDemoMode() && !checkLogin(false)) {
    showLoginModel()
    return
  }
  if (!props.statistic || !canVote(index) || votingIndex.value !== null) return

  votingIndex.value = index
  try {
    const response = await submitDemocracyVote(props.activity, index, props.statistic)
    if (response.Status === 200) {
      emit('updated', response.Data ?? undefined)
      showMessage('success', t('democracy.vote.success'), { duration: 1600 })
      return
    }
    showMessage('error', response.Message || t('democracy.vote.failed'), { duration: 2400 })
  } catch {
    showMessage('error', t('democracy.vote.failed'), { duration: 2400 })
  } finally {
    votingIndex.value = null
  }
}

onMounted(() => {
  deadlineTimer = setInterval(() => {
    currentTime.value = Date.now()
  }, 500)
})

onUnmounted(() => {
  if (deadlineTimer) clearInterval(deadlineTimer)
})
</script>

<style scoped>
.vote-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 1rem;
  padding: 14px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
}

header,
footer,
.choice-line {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  justify-content: space-between;
}

header {
  align-items: flex-start;
}

.anonymous-label {
  display: inline-block;
  color: #0879b5;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.vote-mode {
  flex: 0 0 auto;
  padding: 0.28rem 0.6rem;
  border-radius: 4px;
  background: #e5f1fa;
  color: #24658d;
  font-size: 0.75rem;
}

.vote-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  justify-content: flex-end;
}

.vote-status {
  padding: 0.28rem 0.6rem;
  border-radius: 4px;
  background: #edf0f2;
  color: #5c6870;
  font-size: 0.75rem;
  font-weight: 700;
}

.choices {
  display: grid;
  gap: 0.65rem;
}

.choice {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.8rem 0.9rem;
  border: 1px solid #cfdae3;
  border-radius: 6px;
  background: #fff;
  color: #334654;
  text-align: left;
  cursor: pointer;
}

.choice:enabled:hover {
  border-color: #1686c0;
  background: #f6fbfe;
}

.choice:disabled {
  cursor: default;
  opacity: 1;
}

.choice.chosen {
  border-color: #e3ae3d;
  background: #fffaf0;
}

.choice small {
  color: #75828d;
}

.bar {
  display: block;
  height: 0.45rem;
  overflow: hidden;
  border-radius: 999px;
  background: #e9eef2;
}

.bar i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #0784c2, #43b5d8);
}

.chosen .bar i {
  background: linear-gradient(90deg, #d69216, #f0bd4d);
}

footer {
  flex-wrap: wrap;
  padding-top: 0.8rem;
  border-top: 1px solid #e2e9ee;
  color: #77848e;
  font-size: 0.75rem;
}
</style>
