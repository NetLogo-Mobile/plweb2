<template>
  <main class="my-lab">
    <h1>My Lab</h1>
    <p v-if="loading">Loading…</p>
    <p v-else-if="error">{{ error }}</p>
    <section v-for="block in blocks" v-else :key="block.Header" class="lab-section">
      <h2>{{ block.Header }}</h2>
      <div class="cards">
        <article v-for="summary in block.Summaries" :key="summary.ID" class="card">
          <h3>{{ summary.Subject }}</h3>
          <button type="button" @click="edit(summary.Category, summary.ID)">Edit</button>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getData } from '@services/api/getData'
import type { ListBlock } from '@services/../pl-serve-type-main/type/main'

const router = useRouter()
const loading = ref(true)
const error = ref('')
const blocks = ref<ListBlock[]>([])

function edit(category: string, id: string) {
  void router.push({ name: 'Editor', params: { category, id } })
}

onMounted(async () => {
  const result = await getData('/Contents/GetLibrary', { Identifier: 'Workspace', Language: 'Chinese' })
  if (result.Status === 200 && result.Data) blocks.value = result.Data.Blocks || []
  else error.value = result.Message || 'Unable to load your lab.'
  loading.value = false
})
</script>

<style scoped>
.my-lab { min-height: 100dvh; padding: 2rem; background: #f4f7fb; }
.lab-section { margin: 1.5rem 0; }
.cards { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); }
.card { padding: 1rem; border-radius: .75rem; background: #fff; box-shadow: 0 1px 3px rgb(0 0 0 / 12%); }
</style>
