<template>
  <div class="account-controls">
    <label class="account-controls__days">
      {{ t('democracy.sensitive.days') }}
      <input v-model.number="days" type="number" min="1" step="1" :disabled="busy" />
    </label>
    <div class="account-controls__actions">
      <n-button :disabled="busy || !validReason" @click="trace">
        {{
          t(contributionId ? 'democracy.sensitive.traceContributor' : 'democracy.management.trace')
        }}
      </n-button>
      <n-button :disabled="busy || !validReason || !validDays" type="error" @click="act('Ban')">
        {{
          t(
            contributionId
              ? 'democracy.sensitive.banContributor'
              : 'democracy.management.banAccount',
          )
        }}
      </n-button>
      <n-button :disabled="busy || !validReason" @click="act('Warn')">{{
        t('democracy.management.warnAccount')
      }}</n-button>
      <n-button v-if="identity?.Banned" :disabled="busy || !validReason" @click="act('Unban')">{{
        t('democracy.management.unbanAccount')
      }}</n-button>
      <n-button
        v-if="identity && !contributionId"
        :disabled="busy || !validReason"
        @click="togglePublishing"
        >{{
          t(
            identity.PublishingRevoked
              ? 'democracy.management.restore'
              : 'democracy.management.revoke',
          )
        }}</n-button
      >
      <n-popconfirm
        v-if="contributionId && identity"
        :disabled="busy || !validReason"
        @positive-click="disclose"
      >
        <template #trigger
          ><n-button :disabled="busy || !validReason" type="warning">{{
            t('democracy.sensitive.disclose')
          }}</n-button></template
        >
        {{ t('democracy.sensitive.discloseConfirm') }}
      </n-popconfirm>
    </div>
    <dl v-if="identity" class="account-controls__trace">
      <dt>{{ t('democracy.management.alias') }}</dt>
      <dd>{{ identity.Alias }}</dd>
      <dt>{{ t('democracy.management.account') }}</dt>
      <dd>{{ identity.UserID }}</dd>
      <dt>{{ t('democracy.management.accountStatus') }}</dt>
      <dd>
        {{
          t(
            identity.Banned
              ? 'democracy.management.accountBanned'
              : 'democracy.management.accountActive',
          )
        }}
      </dd>
      <dt>{{ t('democracy.management.publishingStatus') }}</dt>
      <dd>
        {{
          t(
            identity.PublishingRevoked
              ? 'democracy.management.publishingRevoked'
              : 'democracy.management.publishingActive',
          )
        }}
      </dd>
      <template v-if="identity.BannedUntil"
        ><dt>{{ t('democracy.sensitive.until') }}</dt>
        <dd>{{ new Date(identity.BannedUntil).toLocaleString() }}</dd></template
      >
    </dl>
    <p v-else-if="resultText">{{ resultText }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { NButton, NPopconfirm } from 'naive-ui'
import { showMessage } from '@popup/naiveui'
import {
  traceDemocracyPublisher,
  moderateDemocracyAccount,
  moderateDemocracyPublisher,
} from '@services/democracyWall'
import {
  traceContribution,
  moderateContributor,
  discloseContribution,
} from '@services/democracyContributionModeration'
import { validateDemocracyBanDays } from '@services/democracyModerationRules'
import type {
  DemocracyAccountAction,
  DemocracyPublisherTrace,
} from '@services/democracyWallContract'
const props = defineProps<{ matterId: string; contributionId?: string; reason: string }>()
const emit = defineEmits<{ updated: []; disclosed: [] }>()
const { t } = useI18n()
const identity = ref<DemocracyPublisherTrace>()
const days = ref(7)
const busy = ref(false)
const resultText = ref('')
const validReason = computed(() => props.reason.trim().length >= 6)
const validDays = computed(() => {
  try {
    validateDemocracyBanDays(days.value)
    return true
  } catch {
    return false
  }
})

async function run(action: () => Promise<void>) {
  if (busy.value || !validReason.value) return
  busy.value = true
  try {
    await action()
    emit('updated')
  } catch {
    showMessage('error', t('democracy.management.failed'), { duration: 3000 })
  } finally {
    busy.value = false
  }
}
async function trace() {
  await run(async () => {
    identity.value = props.contributionId
      ? await traceContribution(props.matterId, props.contributionId, props.reason.trim())
      : await traceDemocracyPublisher(props.matterId, props.reason.trim())
  })
}
async function act(action: DemocracyAccountAction) {
  if (action === 'Ban' && !validDays.value) return
  await run(async () => {
    const result = props.contributionId
      ? await moderateContributor(
          props.matterId,
          props.contributionId,
          action,
          props.reason.trim(),
          days.value,
        )
      : await moderateDemocracyAccount(props.matterId, action, props.reason.trim(), days.value)
    if (identity.value) identity.value = { ...identity.value, ...result }
    resultText.value = t(
      result.Banned ? 'democracy.management.accountBanned' : 'democracy.management.saved',
    )
    showMessage('success', t('democracy.management.saved'), { duration: 2200 })
  })
}
async function disclose() {
  if (!props.contributionId || !identity.value) return
  await run(async () => {
    await discloseContribution(props.matterId, props.contributionId!, props.reason.trim())
    emit('disclosed')
  })
}
async function togglePublishing() {
  if (!identity.value || props.contributionId) return
  await run(async () => {
    const result = await moderateDemocracyPublisher(
      props.matterId,
      !identity.value!.PublishingRevoked,
      props.reason.trim(),
    )
    identity.value = {
      ...identity.value!,
      CanPublish: result.CanPublish,
      PublishingRevoked: result.Revoked,
    }
  })
}
</script>

<style scoped>
.account-controls {
  display: grid;
  gap: 0.75rem;
}
.account-controls__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.account-controls__days {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.account-controls__days input {
  width: 8rem;
  padding: 0.4rem;
}
.account-controls__trace {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem;
  overflow-wrap: anywhere;
}
.account-controls__trace dd {
  margin: 0;
}
</style>
