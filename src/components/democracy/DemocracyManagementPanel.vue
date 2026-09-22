<template>
  <section v-if="canManage" class="management-panel">
    <div class="management-panel__heading">
      <div>
        <h3>{{ t('democracy.management.title') }}</h3>
        <p>{{ t('democracy.management.notice') }}</p>
      </div>
    </div>

    <n-input
      v-model:value="reason"
      type="textarea"
      :autosize="{ minRows: 2, maxRows: 4 }"
      :maxlength="300"
      show-count
      :placeholder="t('democracy.management.reasonPlaceholder')"
    />

    <DemocracyAccountControls :matter-id="matterId" :reason="reason" @updated="loadAudit" />

    <div v-if="canManage && kind === 'Oversight'" class="management-panel__group">
      <h4>{{ t('democracy.management.investigationTitle') }}</h4>
      <p class="management-panel__hint">{{ t('democracy.management.investigationNotice') }}</p>
      <div class="management-panel__invite-form">
        <n-input
          v-model:value="inviteeTarget"
          :placeholder="t('democracy.management.invitePlaceholder')"
        />
        <n-button
          type="primary"
          :loading="busy === 'invite'"
          :disabled="!validReason || !inviteeUserId"
          @click="inviteInvestigator"
        >
          {{ t('democracy.management.inviteAction') }}
        </n-button>
      </div>
      <n-empty
        v-if="!investigationTeam.length"
        size="small"
        :description="t('democracy.management.investigationEmpty')"
      />
      <ul v-else class="management-panel__team">
        <li v-for="member in investigationTeam" :key="member.ID">
          <div>
            <strong>{{ member.Nickname }}</strong>
            <small>{{ member.UserID }}</small>
          </div>
          <span>{{ t(`democracy.management.invite${member.Status}`) }}</span>
        </li>
      </ul>
    </div>

    <div v-if="canManage" class="management-panel__group management-panel__danger">
      <h4>{{ t('democracy.management.contentActions') }}</h4>
      <p>{{ t('democracy.management.deleteNotice') }}</p>
      <n-popconfirm
        :positive-text="t('democracy.management.confirmDelete')"
        :negative-text="t('democracy.report.cancel')"
        :disabled="!validReason"
        @positive-click="deleteMatter"
      >
        <template #trigger>
          <n-button type="error" :loading="busy === 'delete'" :disabled="!validReason">
            {{ t('democracy.management.deleteMatter') }}
          </n-button>
        </template>
        {{ t('democracy.management.deleteConfirm') }}
      </n-popconfirm>
    </div>

    <div class="management-panel__group">
      <div class="management-panel__audit-heading">
        <h4>{{ t('democracy.management.auditTitle') }}</h4>
        <n-button text size="small" :loading="auditLoading" :disabled="!!busy" @click="loadAudit">
          {{ t('democracy.management.refreshAudit') }}
        </n-button>
      </div>
      <n-empty v-if="!audit.length" size="small" :description="t('democracy.management.noAudit')" />
      <ol v-else class="management-panel__audit">
        <li v-for="entry in audit" :key="entry.ID">
          <div>
            <strong>{{ entry.Action }}</strong
            ><time>{{ formatAuditTime(entry.CreatedAt) }}</time>
          </div>
          <p>{{ entry.Details }}</p>
          <small>{{ entry.ActorAlias }}</small>
        </li>
      </ol>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { NButton, NEmpty, NInput, NPopconfirm } from 'naive-ui'
import DemocracyAccountControls from './DemocracyAccountControls.vue'
import { showMessage } from '@popup/naiveui'
import {
  deleteDemocracyMatter,
  fetchDemocracyAudit,
  fetchDemocracyInvestigationTeam,
  inviteDemocracyInvestigator,
} from '@services/democracyWall'
import type {
  DemocracyAuditEntry,
  DemocracyInvestigationInvite,
  DemocracyMatterKind,
} from '@services/democracyWallContract'

const props = defineProps<{ canManage: boolean; kind: DemocracyMatterKind; matterId: string }>()
const emit = defineEmits<{ deleted: [] }>()
const { t, locale } = useI18n()
const reason = ref('')
const audit = ref<DemocracyAuditEntry[]>([])
const investigationTeam = ref<DemocracyInvestigationInvite[]>([])
const inviteeTarget = ref('')
const busy = ref<'invite' | 'delete' | ''>('')
const auditLoading = ref(false)
const validReason = computed(() => reason.value.trim().length >= 6)
const inviteeUserId = computed(() => inviteeTarget.value.match(/[a-f\d]{24}/i)?.[0] ?? '')

function formatAuditTime(value: string) {
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  )
}
async function loadAudit() {
  if (auditLoading.value || !props.canManage) return
  auditLoading.value = true
  try {
    audit.value = await fetchDemocracyAudit(props.matterId)
  } catch {
    showMessage('error', t('democracy.management.failed'), { duration: 3000 })
  } finally {
    auditLoading.value = false
  }
}
async function loadInvestigationTeam() {
  if (props.kind !== 'Oversight' || !props.canManage) return
  try {
    investigationTeam.value = await fetchDemocracyInvestigationTeam(props.matterId)
  } catch {
    showMessage('error', t('democracy.management.failed'), { duration: 3000 })
  }
}
async function inviteInvestigator() {
  if (busy.value || !props.canManage || !inviteeUserId.value || !validReason.value) return
  busy.value = 'invite'
  try {
    const invitation = await inviteDemocracyInvestigator(
      props.matterId,
      inviteeUserId.value,
      reason.value,
    )
    investigationTeam.value = [
      invitation,
      ...investigationTeam.value.filter((entry) => entry.ID !== invitation.ID),
    ]
    inviteeTarget.value = ''
    await loadAudit()
    showMessage('success', t('democracy.management.inviteSent'), { duration: 2200 })
  } catch {
    showMessage('error', t('democracy.management.failed'), { duration: 3000 })
  } finally {
    busy.value = ''
  }
}
async function deleteMatter() {
  if (busy.value || !props.canManage || !validReason.value) return
  busy.value = 'delete'
  try {
    await deleteDemocracyMatter(props.matterId, reason.value)
    showMessage('success', t('democracy.management.deleted'), { duration: 2200 })
    emit('deleted')
  } catch {
    showMessage('error', t('democracy.management.failed'), { duration: 3000 })
  } finally {
    busy.value = ''
  }
}
onMounted(() => {
  void Promise.allSettled([loadAudit(), loadInvestigationTeam()])
})
</script>
<style scoped>
.management-panel {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}
.management-panel__heading,
.management-panel__audit-heading,
.management-panel__invite-form {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}
.management-panel h3,
.management-panel h4 {
  margin: 0 0 0.5rem;
}
.management-panel p {
  font-size: 0.85rem;
  color: #64748b;
}
.management-panel__group {
  display: grid;
  gap: 0.5rem;
}
.management-panel__team,
.management-panel__audit {
  padding-left: 1.25rem;
  overflow-wrap: anywhere;
}
.management-panel__team li,
.management-panel__audit li {
  padding: 0.5rem 0;
}
.management-panel__team small {
  display: block;
}
.management-panel__audit time {
  margin-left: 0.5rem;
}
.management-panel__danger {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}
@media (max-width: 520px) {
  .management-panel__invite-form {
    flex-direction: column;
  }
}
</style>
