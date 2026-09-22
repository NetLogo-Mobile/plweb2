<template>
  <section class="invitation" aria-live="polite">
    <h3>{{ t('democracy.invitation.title') }}</h3>
    <n-spin v-if="loading" />
    <template v-else-if="failed">
      <p>{{ t('democracy.invitation.unavailable') }}</p>
      <n-button @click="load">{{ t('democracy.retry') }}</n-button>
    </template>
    <template v-else-if="invitation">
      <p>{{ t(`democracy.management.invite${invitation.Status}`) }}</p>
      <div v-if="invitation.Status === 'Pending' && !disabled" class="invitation__actions">
        <n-button type="primary" :disabled="busy" @click="respond('Accepted')">
          {{ t('democracy.invitation.accept') }}
        </n-button>
        <n-button :disabled="busy" @click="respond('Declined')">
          {{ t('democracy.invitation.decline') }}
        </n-button>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { NButton, NSpin } from 'naive-ui'
import { showMessage } from '@popup/naiveui'
import {
  fetchInvestigationInvitation,
  respondInvestigationInvitation,
} from '@services/democracyInvitations'
import type { DemocracyReceivedInvitation } from '@services/democracyWallContract'

const props = defineProps<{ matterId: string; inviteId: string; disabled: boolean }>()
const emit = defineEmits<{ updated: [] }>()
const { t } = useI18n()
const invitation = ref<DemocracyReceivedInvitation>()
const loading = ref(false)
const failed = ref(false)
const busy = ref(false)
let request = 0

async function load() {
  const version = ++request
  loading.value = true
  failed.value = false
  invitation.value = undefined
  try {
    const result = await fetchInvestigationInvitation(props.matterId, props.inviteId)
    if (version === request) invitation.value = result
  } catch {
    if (version === request) failed.value = true
  } finally {
    if (version === request) loading.value = false
  }
}

async function respond(decision: 'Accepted' | 'Declined') {
  if (busy.value || props.disabled || invitation.value?.Status !== 'Pending') return
  busy.value = true
  try {
    invitation.value = await respondInvestigationInvitation(
      props.matterId,
      props.inviteId,
      decision,
    )
    emit('updated')
  } catch {
    showMessage('error', t('democracy.management.failed'), { duration: 3000 })
    await load()
  } finally {
    busy.value = false
  }
}

watch(() => [props.matterId, props.inviteId], load, { immediate: true })
</script>

<style scoped>
.invitation {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}
.invitation h3 {
  margin-top: 0;
}
.invitation__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}
</style>
