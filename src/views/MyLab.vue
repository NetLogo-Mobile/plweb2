<template>
  <main class="my-lab">
    <h1>{{ t('myLab.title') }}</h1>
    <p v-if="loading">{{ t('ui.messages.loading') }}</p>
    <p v-else-if="error">{{ error }}</p>
    <p v-else-if="visibleBlocks.length === 0">{{ t('myLab.empty') }}</p>
    <template v-else>
      <section
        v-for="(block, blockIndex) in visibleBlocks"
        :key="`${block.$type}-${blockIndex}`"
        class="lab-section"
      >
        <h2>{{ block.Header }}</h2>
        <div class="cards">
          <article v-for="summary in block.Summaries" :key="summary.ID" class="card">
            <h3>{{ summary.Subject || summary.ID }}</h3>
            <button type="button" @click="openWork(summary)">
              {{ t(canEditSummary(summary) ? 'myLab.edit' : 'myLab.view') }}
            </button>
          </article>
        </div>
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getData } from '@services/api/getData'
import { canEditSummary } from '@services/editor/cloudWorks'
import { checkLogin } from '@services/utils'
import type { ListBlock, Summary, TopicBlock } from '@services/../pl-serve-type-main/type/main'

const router = useRouter()
const { locale, t } = useI18n()
const loading = ref(true)
const error = ref('')
const blocks = ref<Array<ListBlock | TopicBlock>>([])
const visibleBlocks = computed(() =>
  blocks.value.filter((block) => (block.Summaries?.length ?? 0) > 0),
)

function openWork(summary: Summary) {
  const name = canEditSummary(summary) ? 'Editor' : 'ExperimentSummary'
  void router.push({
    name,
    params: { category: summary.Category || 'Discussion', id: summary.ID },
  })
}

onMounted(async () => {
  if (!checkLogin(true)) {
    error.value = t('myLab.loginRequired')
    loading.value = false
    return
  }
  try {
    const result = await getData('/Contents/GetLibrary', {
      Identifier: 'Workspace',
      Language: locale.value,
    })
    if (result.Status === 200 && result.Data) blocks.value = result.Data.Blocks || []
    else error.value = result.Message || t('myLab.loadFailed')
  } catch {
    error.value = t('myLab.loadFailed')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.my-lab {
  min-height: 100dvh;
  padding: 2rem;
  background: #f4f7fb;
}
.lab-section {
  margin: 1.5rem 0;
}
.cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
}
.card {
  padding: 1rem;
  border-radius: 0.75rem;
  background: #fff;
  box-shadow: 0 1px 3px rgb(0 0 0 / 12%);
}
</style>
