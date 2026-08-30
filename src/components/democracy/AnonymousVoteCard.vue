<template>
  <article class="vote-card">
    <header>
      <div>
        <span class="anonymous-label">{{ t('democracy.vote.anonymous') }}</span>
        <h3>{{ localized(activity.Subject) }}</h3>
      </div>
      <span class="vote-mode">
        {{
          activity.InterfaceModel === 'Vote-Single'
            ? t('democracy.vote.single')
            : t('democracy.vote.multiple')
        }}
      </span>
    </header>

    <p v-if="description" class="vote-description">{{ description }}</p>

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
import { computed, ref } from 'vue'
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
}>()
const emit = defineEmits<{ updated: [Sync | undefined] }>()

const { t, te, locale } = useI18n()
const votingIndex = ref<number | null>(null)

function localized(value?: Record<string, string | null> | null) {
  return (
    value?.[locale.value] ||
    value?.Chinese ||
    value?.English ||
    Object.values(value ?? {}).find(Boolean) ||
    t('democracy.untitled')
  )
}

const description = computed(() => {
  const content = props.activity.Contents?.[0]
  return content ? localized(content) : ''
})

const dateRange = computed(
  () =>
    `${String(props.activity.StartDate).slice(0, 10)} — ${String(props.activity.FinishDate).slice(0, 10)}`,
)

const totalVotes = computed(() =>
  props.activity.Items.reduce((total, item) => total + item.Counter + 5, 0),
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
  if (props.status.Finished) return true
  if (hasChosen(index)) return true
  return props.activity.InterfaceModel === 'Vote-Single' && props.status.Gains.length > 0
}

function percentage(index: number) {
  if (totalVotes.value <= 0) return 0
  return Math.round((((props.activity.Items[index]?.Counter ?? 0) + 5) / totalVotes.value) * 100)
}

function canVote(index: number) {
  if (!props.status || !props.statistic || props.status.Finished || hasChosen(index)) return false
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
  margin-bottom: 0.35rem;
  color: #0879b5;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h3 {
  margin: 0;
  color: #1c3142;
  font-size: clamp(1.05rem, 2vw, 1.35rem);
}

.vote-mode {
  flex: 0 0 auto;
  padding: 0.28rem 0.6rem;
  border-radius: 4px;
  background: #e5f1fa;
  color: #24658d;
  font-size: 0.75rem;
}

.vote-description {
  margin: 0;
  color: #5a6873;
  line-height: 1.55;
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
