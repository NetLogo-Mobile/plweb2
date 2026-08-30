<template>
  <article class="entry-card">
    <div class="entry-topline">
      <span class="entry-kind" :class="entry.kind">
        {{ entry.kind === 'case' ? t('democracy.kinds.case') : t('democracy.kinds.proposal') }}
      </span>
      <span class="entry-status" :class="entry.status">
        {{
          entry.status === 'resolved' ? t('democracy.status.resolved') : t('democracy.status.open')
        }}
      </span>
      <time>{{ formatDate(entry.summary.ID, false, 'date') }}</time>
    </div>

    <router-link class="entry-title" :to="targetPath">
      {{ localizedSubject }}
    </router-link>

    <p v-if="description" class="entry-description">{{ description }}</p>

    <div class="entry-tags">
      <Tag v-for="tag in visibleTags" :key="tag" category="Discussion" :tag="tag" />
    </div>

    <footer class="entry-footer">
      <component
        :is="demoMode ? 'div' : 'router-link'"
        class="author"
        :to="demoMode ? undefined : `/u/${entry.summary.User.ID}`"
      >
        <img :src="avatarUrl" alt="" />
        <span>{{ entry.summary.User.Nickname }}</span>
        <Tag
          v-if="entry.summary.User.Verification"
          category="User"
          :tag="`C-${entry.summary.User.Verification}`"
        />
      </component>
      <div class="metrics" :aria-label="t('democracy.metrics')">
        <router-link :to="commentsPath">
          {{ t('democracy.comments', { count: entry.summary.Comments }) }}
        </router-link>
        <span>{{ t('democracy.visits', { count: entry.summary.Visits }) }}</span>
      </div>
    </footer>

    <div class="entry-actions">
      <router-link :to="targetPath">{{ t('democracy.actions.view') }}</router-link>
      <router-link :to="commentsPath">{{ t('democracy.actions.question') }}</router-link>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Tag from '@components/utils/TagLarger.vue'
import { formatDate, getUserUrl } from '@services/utils'
import type { DemocracyEntry } from '@services/democracyWall'

const props = defineProps<{ entry: DemocracyEntry; demoMode?: boolean }>()
const { t, locale } = useI18n()

const targetPath = computed(() =>
  props.demoMode
    ? `/d/demo/${props.entry.summary.ID}?demo=1`
    : `/p/${props.entry.summary.Category || 'Discussion'}/${props.entry.summary.ID}`,
)
const commentsPath = computed(() =>
  props.demoMode
    ? targetPath.value
    : {
        name: 'Comments',
        params: {
          category: props.entry.summary.Category || 'Discussion',
          id: props.entry.summary.ID,
          name: localizedSubject.value,
        },
      },
)
const avatarUrl = computed(() => getUserUrl(props.entry.summary.User))
const localizedSubject = computed(
  () =>
    props.entry.summary.LocalizedSubject?.[locale.value] ||
    props.entry.summary.LocalizedSubject?.Chinese ||
    props.entry.summary.Subject ||
    t('democracy.untitled'),
)
const description = computed(() => {
  const localized =
    props.entry.summary.LocalizedDescription?.[locale.value] ||
    props.entry.summary.LocalizedDescription?.Chinese
  const source = localized || props.entry.summary.Description?.[0] || ''
  return source
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180)
})
const visibleTags = computed(() =>
  (props.entry.summary.Tags ?? []).filter((tag) => tag !== '民主墙').slice(0, 5),
)
</script>

<style scoped>
.entry-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.75rem;
  padding: 14px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
}

.entry-topline {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: center;
  color: #75808b;
  font-size: 0.78rem;
}

.entry-topline time {
  margin-left: auto;
}

.entry-kind,
.entry-status {
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  font-weight: 650;
}

.entry-kind.case {
  background: #fff0e4;
  color: #a84c13;
}

.entry-kind.proposal {
  background: #e7f1ff;
  color: #1766ad;
}

.entry-status.open {
  background: #e7f7ee;
  color: #187448;
}

.entry-status.resolved {
  background: #edf0f4;
  color: #606b76;
}

.entry-title {
  color: #333;
  font-size: clamp(1.05rem, 2vw, 1.3rem);
  font-weight: 700;
  line-height: 1.35;
  text-decoration: none;
}

.entry-title:hover {
  color: #087ab8;
}

.entry-description {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: #666;
  font-size: 0.92rem;
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.entry-tags {
  display: flex;
  min-height: 1.6rem;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.entry-footer {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.7rem;
  border-top: 1px solid #edf1f5;
}

.author {
  display: flex;
  min-width: 0;
  gap: 0.45rem;
  align-items: center;
  color: #34485a;
  text-decoration: none;
}

.author img {
  width: 1.8rem;
  height: 1.8rem;
  flex: 0 0 auto;
  border-radius: 50%;
  object-fit: cover;
}

.author > span {
  max-width: 9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metrics {
  display: flex;
  flex: 0 0 auto;
  gap: 0.7rem;
  color: #7b858e;
  font-size: 0.78rem;
}

.metrics a {
  color: inherit;
  text-decoration: none;
}

.metrics a:hover {
  color: #0185c5;
}

.entry-actions {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
}

.entry-actions a {
  padding: 0.38rem 0.75rem;
  border: 1px solid #d7dce1;
  border-radius: 0.35rem;
  color: #555;
  font-size: 0.8rem;
  text-decoration: none;
}

.entry-actions a:last-child {
  border-color: #0185c5;
  color: #0185c5;
}

.entry-actions a:hover {
  background: #f2f7fa;
}

@media (max-width: 420px) {
  .entry-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .metrics {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
