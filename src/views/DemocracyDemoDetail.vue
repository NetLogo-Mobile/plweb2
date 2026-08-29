<template>
  <div class="detail-page">
    <Header>
      <button class="back" type="button" @click="goBack">←</button>
      <div class="heading">
        <h1>{{ t('democracy.demo.detailTitle') }}</h1>
        <span>{{ t('democracy.demo.badge') }}</span>
      </div>
    </Header>

    <main v-if="entry">
      <article class="docket">
        <header class="docket-header">
          <div class="labels">
            <span class="status">{{ statusText }}</span>
            <Tag
              v-for="tag in entry.summary.Tags.filter((item) => item !== '民主墙')"
              :key="tag"
              category="Discussion"
              :tag="tag"
            />
          </div>
          <h2>{{ entry.summary.Subject }}</h2>
          <p>{{ entry.summary.Description?.[0] }}</p>
          <div class="author">
            <span>{{ entry.summary.User.Nickname }}</span>
            <Tag category="User" :tag="`C-${entry.summary.User.Verification}`" />
          </div>
        </header>

        <section>
          <h3>{{ t('democracy.demo.rule') }}</h3>
          <p class="rule">{{ detail.rule }}</p>
        </section>

        <section>
          <h3>{{ t('democracy.demo.confirmedFacts') }}</h3>
          <ul>
            <li v-for="fact in detail.facts" :key="fact">{{ fact }}</li>
          </ul>
        </section>

        <section>
          <h3>{{ t('democracy.demo.timeline') }}</h3>
          <ol class="timeline">
            <li v-for="item in detail.timeline" :key="`${item.date}-${item.text}`">
              <time>{{ item.date }}</time>
              <span>{{ item.text }}</span>
            </li>
          </ol>
        </section>

        <section>
          <h3>{{ t('democracy.demo.finding') }}</h3>
          <p>{{ detail.finding }}</p>
        </section>

        <section>
          <h3>{{ t('democracy.demo.publicQuestions') }}</h3>
          <div class="questions">
            <blockquote v-for="question in detail.questions" :key="question">
              {{ question }}
            </blockquote>
          </div>
        </section>
      </article>
    </main>

    <main v-else class="missing">
      <n-empty :description="t('democracy.demo.missing')">
        <template #extra>
          <n-button @click="goBack">{{ t('democracy.demo.back') }}</n-button>
        </template>
      </n-empty>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NButton, NEmpty } from 'naive-ui'
import Header from '@components/utils/Header.vue'
import Footer from '@components/utils/Footer.vue'
import Tag from '@components/utils/TagLarger.vue'
import { toDemocracyEntry } from '@services/democracyWall'
import {
  DEMOCRACY_DEMO_DETAILS,
  DEMOCRACY_DEMO_SUMMARIES,
  type DemocracyDemoDetail,
} from '@services/democracyWallDemo'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const id = computed(() => String(route.params.id || ''))
const summary = computed(() => DEMOCRACY_DEMO_SUMMARIES.find((item) => item.ID === id.value))
const entry = computed(() => (summary.value ? toDemocracyEntry(summary.value) : undefined))
const fallbackDetail: DemocracyDemoDetail = {
  id: id.value,
  rule: t('democracy.demo.fallbackRule'),
  facts: [t('democracy.demo.fallbackFact')],
  timeline: [{ date: '08-29', text: t('democracy.demo.fallbackTimeline') }],
  finding: t('democracy.demo.fallbackFinding'),
  questions: [t('democracy.demo.fallbackQuestion')],
}
const detail = computed(() => DEMOCRACY_DEMO_DETAILS[id.value] ?? fallbackDetail)
const statusText = computed(() =>
  entry.value?.status === 'resolved' ? t('democracy.status.resolved') : t('democracy.status.open'),
)

function goBack() {
  void router.push('/d?demo=1')
}
</script>

<style scoped>
.detail-page {
  min-height: 100dvh;
  background: #f2f5f7;
  color: #263846;
}

.back {
  width: 2.2rem;
  height: 2.2rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #edf3f7;
  color: #28536d;
  font-size: 1.4rem;
  cursor: pointer;
}

.heading {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  margin-left: 0.7rem;
}

.heading h1 {
  margin: 0;
  font-size: 1.15rem;
}

.heading span {
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  background: #fff1c7;
  color: #8b5b00;
  font-size: 0.7rem;
}

main {
  height: calc(100dvh - 100px);
  overflow-y: auto;
  padding: clamp(0.75rem, 2vw, 1.5rem);
}

.docket {
  width: min(900px, 100%);
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid #dbe3e9;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 0.35rem 1.4rem rgba(28, 52, 69, 0.08);
}

.docket-header,
section {
  padding: clamp(1rem, 3vw, 1.7rem);
}

.docket-header {
  background: linear-gradient(140deg, #153f59, #18728c);
  color: #fff;
}

.labels,
.author {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: center;
}

.status {
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: #dff4e8;
  color: #126b41;
  font-size: 0.75rem;
  font-weight: 700;
}

.docket-header h2 {
  margin: 1rem 0 0.6rem;
  font-size: clamp(1.35rem, 4vw, 2rem);
}

.docket-header p {
  color: #d9edf3;
  line-height: 1.65;
}

.author {
  justify-content: flex-end;
  font-size: 0.85rem;
}

section + section {
  border-top: 1px solid #e8edf1;
}

section h3 {
  margin: 0 0 0.8rem;
  color: #183e57;
}

section p,
section li {
  line-height: 1.7;
}

.rule {
  padding: 0.85rem 1rem;
  border-left: 0.25rem solid #1883ad;
  background: #eff8fc;
}

.timeline {
  display: grid;
  gap: 0;
  padding: 0;
  list-style: none;
}

.timeline li {
  display: grid;
  grid-template-columns: 7rem 1fr;
  gap: 1rem;
  padding: 0.65rem 0;
  border-bottom: 1px dashed #dbe3e8;
}

.timeline time {
  color: #1681a8;
  font-weight: 700;
}

.questions {
  display: grid;
  gap: 0.65rem;
}

blockquote {
  margin: 0;
  padding: 0.8rem 1rem;
  border-radius: 0.7rem;
  background: #f5f7f9;
  color: #425563;
  line-height: 1.6;
}

.missing {
  display: grid;
  place-items: center;
}

@media (max-width: 520px) {
  .heading span {
    display: none;
  }

  .timeline li {
    grid-template-columns: 1fr;
    gap: 0.15rem;
  }
}
</style>
