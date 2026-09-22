<template>
  <article class="contribution-card">
    <header>
      <div>
        <strong>{{ contribution.AuthorAlias }}</strong>
        <span>{{ contribution.AuthorPosition }}</span>
      </div>
      <time :datetime="contribution.CreatedAt">{{ formattedTime }}</time>
    </header>
    <p>{{ contribution.Content }}</p>
    <aside v-if="contribution.Disclosure" class="contribution-card__disclosure">
      <strong>{{ t('democracy.sensitive.publicIdentity') }}</strong>
      <router-link :to="`/u/${contribution.Disclosure.UserID}`">{{
        contribution.Disclosure.UserID
      }}</router-link>
      <p>{{ contribution.Disclosure.Reason }}</p>
    </aside>
    <details v-if="canManage" class="contribution-card__management">
      <summary>{{ t('democracy.sensitive.manageContributor') }}</summary>
      <n-input
        v-model:value="reason"
        type="textarea"
        :maxlength="300"
        :placeholder="t('democracy.management.reasonPlaceholder')"
      />
      <DemocracyAccountControls
        :matter-id="matterId"
        :contribution-id="contribution.ID"
        :reason="reason"
        @disclosed="emit('disclosed')"
      />
    </details>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { NInput } from 'naive-ui'
import DemocracyAccountControls from './DemocracyAccountControls.vue'
import { useI18n } from 'vue-i18n'
import type { DemocracyContribution } from '@services/democracyWallContract'

const props = defineProps<{
  contribution: DemocracyContribution
  matterId: string
  canManage: boolean
}>()
const emit = defineEmits<{ disclosed: [] }>()
const reason = ref('')
const { locale, t } = useI18n()
const formattedTime = computed(() =>
  new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(props.contribution.CreatedAt)),
)
</script>

<style scoped>
.contribution-card__management {
  display: grid;
  gap: 0.75rem;
}
.contribution-card__management summary {
  cursor: pointer;
  padding: 0.5rem 0;
}
.contribution-card__disclosure {
  padding: 0.75rem;
  background: #fff5dc;
  overflow-wrap: anywhere;
}
.contribution-card__disclosure a {
  margin-left: 0.5rem;
}
.contribution-card {
  display: grid;
  gap: 0.7rem;
  padding: 0.85rem 0.95rem;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  background: #fff;
}

header,
header > div {
  display: flex;
  gap: 0.55rem;
  align-items: center;
}

header {
  justify-content: space-between;
}

header strong {
  color: #243746;
}

header span {
  padding: 0.16rem 0.45rem;
  border-radius: 999px;
  background: #e9f5fb;
  color: #0879b5;
  font-size: 0.72rem;
}

time {
  flex: none;
  color: #87939d;
  font-size: 0.72rem;
}

p {
  margin: 0;
  color: #4b5563;
  line-height: 1.65;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

@media (max-width: 480px) {
  header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
