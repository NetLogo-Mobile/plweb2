<template>
  <Header
    ><h1>{{ t('shop.title') }}</h1></Header
  >
  <main class="shop">
    <section class="shop__account">
      <div>
        <strong>{{ t('shop.balance') }}</strong>
        <p>{{ balance === null ? '—' : balance.toLocaleString() }} {{ t('shop.coins') }}</p>
        <small>{{ t(account ? 'shop.cached' : 'shop.login') }}</small>
      </div>
      <router-link v-if="account" :to="`/u/${account.ID}`">{{ t('shop.profile') }} →</router-link>
    </section>
    <p class="shop__notice" role="status">{{ t('shop.unavailable') }}</p>
    <nav class="shop__tabs" :aria-label="t('shop.title')">
      <button :aria-pressed="tab === 'goods'" @click="tab = 'goods'">{{ t('shop.goods') }}</button>
      <button :aria-pressed="tab === 'bag'" @click="tab = 'bag'">{{ t('shop.bag') }}</button>
    </nav>
    <div v-if="tab === 'goods'" class="shop__grid">
      <article v-for="item in WALLPAPERS" :key="item.id" class="shop__product">
        <div
          class="shop__image"
          :style="{ backgroundImage: item.background }"
          aria-hidden="true"
        ></div>
        <h2>{{ t(`wallpapers.${item.id}`) }}</h2>
        <p class="shop__price">1,000 {{ t('shop.coins') }}</p>
        <button disabled>{{ t('shop.purchaseClosed') }}</button>
        <button v-if="demo" class="shop__preview" @click="preview(item.id)">
          {{ t('shop.preview') }}
        </button>
      </article>
    </div>
    <section v-else class="shop__bag">
      <h2>{{ t('shop.bag') }}</h2>
      <p>{{ t('shop.bagUnavailable') }}</p>
      <button @click="reset">{{ t('wallpapers.default') }}</button>
    </section>
    <p role="status">{{ feedback }}</p>
    <p v-if="demo" class="shop__notice">
      {{ t('shop.previewNotice') }} <button @click="reset">{{ t('shop.endPreview') }}</button>
    </p>
  </main>
  <Footer />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Header from '../components/utils/Header.vue'
import Footer from '../components/utils/Footer.vue'
import storage from '../services/storage'
import { WALLPAPERS, setWallpaper, type WallpaperId } from '../services/wallpapers'

const { t } = useI18n()
const account = storage.getObj('userInfo').value
const balance = computed(() =>
  account && Number.isFinite(account.Gold) && account.Gold >= 0 ? account.Gold : null,
)
const demo = import.meta.env.DEV
const tab = ref<'goods' | 'bag'>('goods')
const feedback = ref('')
function preview(id: WallpaperId | null) {
  try {
    setWallpaper(id)
    feedback.value = t(id ? 'shop.previewNotice' : 'wallpapers.saved')
  } catch {
    feedback.value = t('wallpapers.error')
  }
}
function reset() {
  preview(null)
}
</script>

<style scoped>
h1 {
  font-size: 1.2rem;
  margin: 0;
}
.shop {
  box-sizing: border-box;
  height: calc(100dvh - 100px);
  overflow-y: auto;
  padding: clamp(1rem, 3vw, 2rem);
  color: #24394b;
}
.shop > * {
  max-width: 60rem;
  margin: 0 auto 1.25rem;
}
.shop__account {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border-radius: 8px;
}
.shop__account p {
  font-size: 1.4rem;
  margin: 0.5rem 0;
}
small,
.shop__notice {
  color: #4c5969;
  line-height: 1.6;
}
.shop__tabs {
  display: flex;
  gap: 1rem;
}
button {
  min-height: 2.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #0185c5;
  border-radius: 4px;
  color: #006b9e;
  background: white;
  cursor: pointer;
  font: inherit;
}
button[aria-pressed='true'] {
  background: #0185c5;
  color: white;
}
button:disabled {
  color: #68727b;
  border-color: #d1d8de;
  background: #f1f4f6;
  cursor: not-allowed;
}
button:focus-visible {
  outline: 3px solid #0185c5;
  outline-offset: 2px;
}
.shop__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
  gap: 1rem;
}
.shop__product,
.shop__bag {
  background: white;
  padding: 1rem;
  border-radius: 8px;
}
.shop__image {
  aspect-ratio: 16/10;
  border-radius: 5px;
}
h2 {
  font-size: 1.1rem;
}
.shop__price {
  color: #886016;
  font-weight: 600;
}
.shop__preview {
  margin: 0.5rem 0 0 0.5rem;
}
a {
  color: #006b9e;
}
</style>
