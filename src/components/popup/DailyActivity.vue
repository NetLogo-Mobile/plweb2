<template>
  <div v-if="open" class="activity-mask" @click.self="emit('close')">
    <section
      class="activity-dialog"
      role="dialog"
      aria-modal="true"
      :aria-label="t('activity.ariaLabel')"
    >
      <nav class="activity-nav" :aria-label="t('activity.list')">
        <button
          v-for="activity in visibleActivities"
          :key="activity.ID"
          class="activity-tab"
          :class="{ active: activity.ID === selected?.ID }"
          @click="selectedId = activity.ID"
        >
          <span>{{ localized(activity.Subject) }}</span>
          <small>{{ tabLabel(activity) }}</small>
        </button>
      </nav>

      <div class="activity-content">
        <button class="close" :aria-label="t('activity.close')" @click="emit('close')">×</button>

        <div v-if="selected" class="activity-body" :class="{ attendance: isAttendance }">
          <header class="activity-header">
            <div>
              <p class="eyebrow">
                {{
                  isAttendance
                    ? t('activity.dailyCheckIn')
                    : isUpgrade
                      ? t('activity.versionUpdate')
                      : t('activity.limitedActivity')
                }}
              </p>
              <h2>{{ activityTitle }}</h2>
              <p class="date">{{ dateRange }}</p>
            </div>
            <button
              v-if="localized(selected.TargetLink)"
              class="view-link"
              type="button"
              @click="followTargetLink(selected)"
            >
              {{ localized(selected.TargetText) || t('activity.view') }}
            </button>
          </header>

          <p class="description">{{ activityDescription }}</p>

          <div v-if="isAttendance" class="attendance-grid">
            <article
              v-for="(item, index) in selected.Items"
              :key="index"
              class="attendance-card"
              :class="{ claimed: isClaimed(index), available: canClaim(item, index) }"
            >
              <div class="attendance-day">{{ t('activity.day', { day: item.Counter }) }}</div>
              <div class="rewards compact">
                <span
                  v-for="[type, amount] in bonusEntries(item)"
                  :key="type"
                  class="reward"
                  :class="type.toLowerCase()"
                >
                  <img v-if="bonusIcon(type)" :src="bonusIcon(type)" :alt="bonusLabel(type)" />
                  <i v-else>{{ bonusLabel(type).slice(0, 2) }}</i>
                  <b>{{ amount }}</b>
                </span>
              </div>
              <div
                class="attendance-state"
                :class="{ claimed: isClaimed(index), available: canClaim(item, index) }"
              >
                {{ stateText(index, item) }}
              </div>
              <button
                v-if="isClaimed(index) || canClaim(item, index)"
                class="claim"
                :disabled="isClaimed(index) || !canClaim(item, index) || claimingIndex === index"
                @click="claim(index)"
              >
                {{
                  isClaimed(index)
                    ? t('activity.claimed')
                    : canClaim(item, index)
                      ? t('activity.claim')
                      : t('activity.notMet')
                }}
              </button>
            </article>
          </div>

          <div v-else class="reward-list">
            <article v-for="(item, index) in selected.Items" :key="index" class="reward-row">
              <div class="rewards">
                <span
                  v-for="[type, amount] in bonusEntries(item)"
                  :key="type"
                  class="reward"
                  :class="type.toLowerCase()"
                >
                  <img v-if="bonusIcon(type)" :src="bonusIcon(type)" :alt="bonusLabel(type)" />
                  <i v-else>{{ bonusLabel(type).slice(0, 2) }}</i>
                  <b>{{ amount }}</b>
                </span>
              </div>
              <div class="reward-action">
                <div class="condition">
                  {{ conditionText(item) }} ·
                  {{ isUpgrade ? upgradeProgressText(item) : progressText(item, index) }}
                </div>
                <button
                  v-if="isClaimed(index) || canClaim(item, index)"
                  class="claim"
                  :disabled="isClaimed(index) || !canClaim(item, index) || claimingIndex === index"
                  @click="claim(index)"
                >
                  {{
                    isClaimed(index)
                      ? t('activity.claimed')
                      : canClaim(item, index)
                        ? t('activity.claimReward')
                        : t('activity.notMet')
                  }}
                </button>
              </div>
            </article>
          </div>
        </div>

        <div v-else class="empty">{{ t('activity.empty') }}</div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import router from '../../router'
import { getData } from '@api/getData'
import { showLoginModel } from '@popup/index'
import { showMessage } from '@popup/naiveui'
import { EncodeAPITargetLink, checkLogin, getPath } from '@services/utils'
import type {
  Activity,
  ActivityItem,
  ActivityStatus,
  Statistic,
  Sync,
} from '../../pl-serve-type-main/type/main'

type BonusMap = ActivityItem['Bonuses'] & Record<string, number | undefined>

const props = defineProps<{
  open: boolean
  activities: Activity[]
  statuses: ActivityStatus[]
  statistic?: Statistic
}>()
const emit = defineEmits<{ close: []; updated: [Sync | undefined] }>()

const { t, locale } = useI18n()

const selectedId = ref<string>()
const claimingIndex = ref<number | null>(null)

const selected = computed(() =>
  visibleActivities.value.find((activity) => activity.ID === selectedId.value),
)
const currentStatus = computed(() => getStatus(selected.value))
const isAttendance = computed(() => selected.value?.InterfaceModel === 'Attendance')
const isUpgrade = computed(() => selected.value?.InterfaceModel === 'Upgrade')
const visibleActivities = computed(() =>
  props.activities.filter(
    (activity) => !activity.Languages?.length || activity.Languages.includes(locale.value),
  ),
)

watch(
  () => visibleActivities.value,
  (items) => {
    if (!items.some((activity) => activity.ID === selectedId.value)) {
      selectedId.value = items[0]?.ID
    }
  },
  { immediate: true },
)

const localized = (value: Record<string, string | null> | null | undefined) =>
  value?.[locale.value] ||
  value?.Chinese ||
  value?.['zh-CN'] ||
  Object.values(value || {}).find(Boolean) ||
  ''

const formatDate = (date: string) => String(date || '').slice(0, 10)

const dateRange = computed(() => {
  if (!selected.value) return ''
  return `${formatDate(selected.value.StartDate)} - ${formatDate(selected.value.FinishDate)}`
})

const activityTitle = computed(() => localized(selected.value?.Subject))
const activityDescription = computed(() => {
  const activity = selected.value
  if (!activity) return ''
  return (
    localized(activity.Contents?.[0] as Record<string, string | null>) ||
    activity.Items.find((item) => item.Description)?.Description ||
    t('activity.descriptionFallback')
  )
})

const LOCAL_COUNTERS_KEY = 'plweb2.activity.localCounters'
const localCounterKey = () => `${LOCAL_COUNTERS_KEY}.${props.statistic?.ID || 'anon'}`

function loadLocalCounters(): Record<string, number[]> {
  try {
    const raw = localStorage.getItem(localCounterKey())
    return raw ? (JSON.parse(raw) as Record<string, number[]>) : {}
  } catch {
    return {}
  }
}
const localCounters = ref<Record<string, number[]>>(loadLocalCounters())
watch(localCounterKey, () => {
  localCounters.value = loadLocalCounters()
})
function saveLocalCounters() {
  try {
    localStorage.setItem(localCounterKey(), JSON.stringify(localCounters.value))
  } catch {
    // ignore quota / private-mode errors
  }
}
function localCounterAt(activityId: string, index: number) {
  return localCounters.value[activityId]?.[index] ?? 0
}
function recordLocalAction(activity: Activity, condition: string) {
  const next = {
    ...localCounters.value,
    [activity.ID]: [...(localCounters.value[activity.ID] ?? [])],
  }
  let changed = false
  activity.Items.forEach((item, index) => {
    if (item.Local && item.Condition === condition) {
      next[activity.ID][index] = (next[activity.ID][index] ?? 0) + 1
      changed = true
    }
  })
  if (changed) {
    localCounters.value = next
    saveLocalCounters()
  }
}

function getStatus(activity: Activity | undefined) {
  return props.statuses.find((item) => item.ActivityID === activity?.ID)
}

function counterFor(item: ActivityItem, index: number) {
  if (item.Local) return localCounterAt(selected.value?.ID ?? '', index)
  return currentStatus.value?.Counters?.[index] ?? 0
}

function isClaimed(index: number) {
  return Boolean(currentStatus.value?.Gains?.includes(index))
}

function canClaim(item: ActivityItem, index: number) {
  if (!props.statistic || isClaimed(index)) return false
  if (item.Local) return counterFor(item, index) >= item.Counter
  return Boolean(currentStatus.value?.Avails?.includes(index))
}

function progressText(item: ActivityItem, index: number) {
  return `${Math.min(counterFor(item, index), item.Counter)} / ${item.Counter}`
}

function upgradeProgressText(item: ActivityItem) {
  const attended = (currentStatus.value?.Counters?.[0] ?? 0) + 1
  return `${Math.min(attended, item.Counter)} / ${item.Counter}`
}

function conditionText(item: ActivityItem) {
  if (item.Description) return item.Description
  if (isUpgrade.value && item.Condition === 'Attendance') {
    return t('activity.conditions.upgradeAttendance', { days: item.Counter })
  }
  const labels: Record<string, string> = {
    Click: t('activity.conditions.click'),
    Attendance: t('activity.conditions.attendance', { days: item.Counter }),
    Share: t('activity.conditions.share'),
    Comment: t('activity.conditions.comment'),
    Star: t('activity.conditions.star'),
    Follow: t('activity.conditions.follow'),
    Bind: t('activity.conditions.bind'),
    Break: t('activity.conditions.break'),
    Publish: t('activity.conditions.publish'),
  }
  return item.Condition
    ? labels[item.Condition] || item.Condition
    : t('activity.conditions.fallback')
}

function tabLabel(activity: Activity) {
  if (activity.InterfaceModel === 'Attendance') return t('activity.checkIn')
  if (activity.InterfaceModel === 'Upgrade') return t('activity.upgrade')
  return t('activity.activity')
}

function stateText(index: number, item: ActivityItem) {
  if (isClaimed(index)) return t('activity.claimed')
  if (canClaim(item, index)) return t('activity.claimable')
  return t('activity.notMet')
}

function bonusEntries(item: ActivityItem) {
  return Object.entries((item.Bonuses || {}) as BonusMap).filter(
    (entry): entry is [string, number] => {
      const value = entry[1]
      return typeof value === 'number' && value !== 0
    },
  )
}

function bonusLabel(type: string) {
  const labels: Record<string, string> = {
    Gold: t('activity.bonuses.gold'),
    Experience: t('activity.bonuses.experience'),
    Diamond: t('activity.bonuses.diamond'),
    Fragment: t('activity.bonuses.fragment'),
    Experiment: t('activity.bonuses.experiment'),
  }
  return labels[type] || type
}

function bonusIcon(type: string) {
  if (type === 'Gold') return getPath('/@base/assets/icons/coins.png')
  if (type === 'Diamond') return getPath('/@base/assets/icons/gems.png')
  return ''
}

async function followTargetLink(activity: Activity) {
  const link = localized(activity.TargetLink)
  if (!link) return

  recordLocalAction(activity, 'Click')

  if (/^https?:\/\//i.test(link)) {
    window.open(link, '_blank')
    return
  }

  const contentMatch = link.match(/^(discussion|experiment):\/\/([a-f0-9]{24})$/i)
  if (contentMatch) {
    await router.push(
      `/p/${contentMatch[1] === 'discussion' ? 'Discussion' : 'Experiment'}/${contentMatch[2]}`,
    )
    emit('close')
    return
  }

  if (link === 'internal://forum') {
    await router.push('/b')
    emit('close')
    return
  }

  if (link === 'internal://co-dev') {
    await router.push('/about')
    emit('close')
    return
  }

  if (/^(discussion|experiment):\/\//i.test(link) && link.includes('/')) {
    await router.push(`/l/${EncodeAPITargetLink(link)}`)
    emit('close')
    return
  }

  showMessage('warning', t('activity.unsupportedEntry'), { duration: 2000 })
}

function buildClaimStatistic(activity: Activity, index: number) {
  if (!props.statistic) return undefined
  const nextActivities = [...(props.statistic.Activities ?? [])]
  const statusIndex = nextActivities.findIndex((s) => s.ActivityID === activity.ID)
  const source = nextActivities[statusIndex]
  const nextStatus: ActivityStatus = source
    ? { ...source, Counters: [...(source.Counters ?? [])] }
    : {
        ActivityID: activity.ID,
        Avails: [],
        Counters: [],
        Expiration: activity.FinishDate,
        Finished: false,
        Gains: [],
        LastModified: new Date().toISOString(),
      }
  const localCounter = localCounterAt(activity.ID, index)
  nextStatus.Counters[index] = Math.max(nextStatus.Counters[index] ?? 0, localCounter)
  if (statusIndex >= 0) nextActivities[statusIndex] = nextStatus
  else nextActivities.push(nextStatus)
  return { ...props.statistic, Activities: nextActivities }
}

async function claim(index: number) {
  if (!selected.value) return
  if (!checkLogin(false)) {
    showLoginModel()
    return
  }
  if (!props.statistic || claimingIndex.value !== null) return

  const activity = selected.value
  const item = activity.Items[index]
  claimingIndex.value = index
  try {
    const claimStatistic = item.Local ? buildClaimStatistic(activity, index) : props.statistic
    const result = await getData('/Users/ReceiveBonus', {
      ActivityID: activity.ID,
      Index: index,
      Statistic: claimStatistic,
    })
    const sync = result.Data as Sync | null
    if (result.Status === 200) {
      emit('updated', sync ?? undefined)
      showMessage('success', t('activity.rewardReceived'), { duration: 1600 })
    } else {
      showMessage('error', result.Message || t('activity.claimFailed'), { duration: 2500 })
    }
  } catch {
    showMessage('error', t('activity.claimFailed'), { duration: 2500 })
  } finally {
    claimingIndex.value = null
  }
}
</script>


<style scoped>
.activity-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  box-sizing: border-box;
  padding: max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right))
    max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
  background: rgba(0, 0, 0, 0.48);
}
.activity-dialog {
  position: relative;
  display: flex;
  width: min(920px, 88vw);
  height: min(650px, 82dvh);
  overflow: hidden;
  border-radius: 22px;
  background: #f4f5f6;
  color: #292929;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.22);
}
.activity-nav {
  width: 250px;
  flex: 0 0 auto;
  overflow-y: auto;
  background: #fff;
  border-right: 1px solid #d4d4d4;
  scrollbar-width: none;
}
.activity-tab {
  display: flex;
  width: 100%;
  min-height: 96px;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 18px 24px;
  border: 0;
  border-bottom: 1px solid #d1d1d1;
  background: #fff;
  color: #333;
  font-size: 20px;
  line-height: 1.35;
  letter-spacing: 0;
  text-align: left;
  cursor: pointer;
}
.activity-tab span {
  white-space: pre-line;
}
.activity-tab small {
  color: #777;
  font-size: 0.62em;
}
.activity-tab.active {
  background: #2c86df;
  color: #fff;
}
.activity-tab.active small {
  color: rgba(255, 255, 255, 0.78);
}
.activity-content {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding: 28px 34px 34px;
  scrollbar-color: #12a7ee #e7e7e7;
  scrollbar-width: thin;
}
.close {
  position: absolute;
  z-index: 2;
  top: 12px;
  right: 14px;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #666;
  font:
    400 44px / 0.8 Arial,
    sans-serif;
  cursor: pointer;
}
.activity-body {
  display: flex;
  min-height: 100%;
  flex-direction: column;
}
.activity-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  justify-content: space-between;
  padding-right: 44px;
}
.eyebrow {
  margin: 0 0 4px;
  color: #2c86df;
  font-size: clamp(13px, 1.6vw, 17px);
}
h2 {
  margin: 0 0 6px;
  color: #333;
  font-size: 27px;
  font-weight: 500;
  letter-spacing: 0;
}
.date {
  margin: 0;
  color: #666;
  font-size: clamp(15px, 1.8vw, 22px);
}
.description {
  min-height: 70px;
  margin: 16px 0 20px;
  white-space: pre-line;
  font-size: 18px;
  line-height: 1.55;
}
.view-link {
  width: min(210px, 100%);
  align-self: center;
  flex: 0 0 auto;
  padding: clamp(10px, 1.5vw, 14px);
  border: 1px solid #bd9b5d;
  border-radius: 7px;
  background: linear-gradient(90deg, #ffc75b, #e69a16 55%, #ffd069);
  box-shadow: 0 2px 5px #aaa;
  color: #fff;
  font-size: 19px;
  text-align: center;
  cursor: pointer;
}
.reward-list {
  display: grid;
  gap: clamp(12px, 2vw, 18px);
}
.reward-row {
  display: flex;
  gap: clamp(12px, 2vw, 22px);
  align-items: center;
  min-height: 104px;
  padding: 12px 18px;
  border-radius: 16px;
  background: #fff;
}
.rewards {
  display: flex;
  flex: 1 1 0;
  flex-wrap: wrap;
  gap: clamp(8px, 1.4vw, 14px);
  min-width: 230px;
}
.reward {
  position: relative;
  display: grid;
  width: 76px;
  height: 76px;
  place-items: center;
  border: 2px solid #e29b3c;
  border-radius: 9px;
  overflow: hidden;
  background: #514b44;
  color: #fff;
}
.reward img {
  width: 100%;
  height: 100%;
}
.reward i {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  background: radial-gradient(circle, #4fb087 0 36%, #1f7658 37% 100%);
  font-style: normal;
}
.reward.experience i {
  background: radial-gradient(circle, #ad46ff 0 35%, #7421d1 36% 54%, #b163f5 55% 59%, #4e158e 60%);
}
.reward b {
  position: absolute;
  right: 4px;
  bottom: 0;
  color: #fff;
  font-size: 20px;
  line-height: 1;
  text-shadow:
    -2px -2px #111,
    2px 2px #111;
}
.reward-action {
  flex: 0 1 clamp(160px, 28%, 260px);
  text-align: center;
}
.condition {
  margin-bottom: clamp(8px, 1.5vw, 15px);
  color: #555;
  font-size: 17px;
  line-height: 1.35;
}
.claim {
  width: min(220px, 100%);
  padding: clamp(8px, 1.5vw, 14px);
  border: 0;
  border-radius: 5px;
  background: linear-gradient(90deg, #aaa69d, #746f69 50%, #aaa69d);
  color: #fff;
  font-size: 22px;
  cursor: pointer;
}
.claim:disabled {
  cursor: default;
}
.attendance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(126px, 1fr));
  gap: clamp(10px, 1.8vw, 16px);
}
.attendance-card {
  display: grid;
  position: relative;
  gap: 7px;
  align-content: start;
  aspect-ratio: 1;
  min-height: 0;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #fff;
  text-align: center;
}
.attendance-card.available {
  border-color: #2c86df;
  box-shadow: inset 0 0 0 1px #2c86df;
}
.attendance-card.claimed {
  opacity: 0.72;
}
.attendance-day {
  color: #333;
  font-size: clamp(16px, 1.8vw, 21px);
  font-weight: 600;
}
.attendance-state {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 3px 6px;
  border-radius: 9px 9px 0 0;
  background: #eee;
  color: #888;
  font-size: 11px;
}
.attendance-state.available {
  background: #e3f0fd;
  color: #1c6fbf;
}
.attendance-state:not(.claimed):not(.available) {
  opacity: 0;
}
.attendance-state.claimed {
  background: #e9f7ee;
  color: #2e8b57;
}
.rewards.compact {
  justify-content: center;
  min-width: 0;
}
.rewards.compact .reward {
  width: clamp(66px, 8vw, 86px);
  height: clamp(66px, 8vw, 86px);
}
.empty {
  display: grid;
  min-height: 100%;
  place-items: center;
  color: #666;
  font-size: 18px;
}
@media (max-width: 760px) {
  .activity-dialog {
    width: calc(100vw - 32px);
    height: calc(100dvh - 32px);
    border-radius: 18px;
    flex-direction: column;
  }
  .activity-nav {
    display: flex;
    width: 100%;
    height: auto;
    max-height: 112px;
    overflow-x: auto;
    overflow-y: hidden;
    border-right: 0;
    border-bottom: 1px solid #d1d1d1;
  }
  .activity-tab {
    width: min(56vw, 220px);
    min-width: min(56vw, 220px);
    min-height: 76px;
    padding: 13px 17px;
    font-size: 17px;
  }
  .activity-header {
    flex-direction: column;
    padding-right: 38px;
  }
  .view-link {
    width: 100%;
  }
  .activity-content {
    padding: 22px 16px 28px;
  }
  h2 {
    font-size: 23px;
  }
  .description {
    font-size: 17px;
  }
  .description {
    min-height: auto;
  }
  .reward-row {
    align-items: flex-start;
  }
  .rewards {
    min-width: 0;
  }
  .reward-action {
    flex-basis: clamp(130px, 34vw, 180px);
  }
}
@media (max-width: 600px) {
  .reward-row {
    gap: 12px;
    padding: 14px;
  }
  .reward-action {
    flex-basis: 145px;
  }
  .claim {
    width: min(210px, 100%);
  }
  .reward {
    width: 68px;
    height: 68px;
  }
  .reward b {
    font-size: 21px;
  }
  .condition {
    font-size: 16px;
  }
  .attendance-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 390px) {
  .reward-row {
    flex-direction: column;
    align-items: stretch;
  }
  .reward-action {
    flex-basis: auto;
  }
}
@media (max-height: 560px) and (min-width: 761px) {
  .activity-mask {
    padding: 8px;
  }
  .activity-dialog {
    height: calc(100dvh - 16px);
  }
  .activity-tab {
    min-height: 68px;
  }
  .activity-content {
    padding-block: 16px;
  }
  .description {
    min-height: 48px;
    margin-block: 10px;
  }
}
</style>
