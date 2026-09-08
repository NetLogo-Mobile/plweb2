<template>
  <Header
    ><h1>{{ t('wallpapers.title') }}</h1></Header
  >
  <main class="wallpapers">
    <section class="wallpapers__intro">
      <p>{{ t('wallpapers.description') }}</p>
      <router-link to="/s">{{ t('wallpapers.settings') }} →</router-link>
    </section>
    <div class="wallpapers__grid">
      <button class="wallpapers__card" :aria-pressed="wallpaperId === null" @click="select(null)">
        <span class="wallpapers__swatch wallpapers__default" aria-hidden="true"></span>
        <span>{{ t('wallpapers.default') }}</span>
        <small>{{ t(wallpaperId === null ? 'wallpapers.selected' : 'wallpapers.apply') }}</small>
      </button>
      <button
        v-for="item in WALLPAPERS"
        :key="item.id"
        class="wallpapers__card"
        :data-wallpaper="item.id"
        :aria-pressed="wallpaperId === item.id"
        @click="select(item.id)"
      >
        <span
          class="wallpapers__swatch"
          :style="{ backgroundImage: item.background }"
          aria-hidden="true"
        ></span>
        <span>{{ t(`wallpapers.${item.id}`) }}</span>
        <small>{{ t(wallpaperId === item.id ? 'wallpapers.selected' : 'wallpapers.apply') }}</small>
      </button>
    </div>
    <p class="wallpapers__status" role="status">{{ feedback }}</p>
    <section class="wallpapers__sample">
      <h2>{{ t('wallpapers.preview') }}</h2>
      <p>{{ t('wallpapers.readability') }}</p>
      <nav>
        <router-link to="/">{{ t('footer.home') }}</router-link>
        <router-link to="/b">{{ t('footer.blackHole') }}</router-link>
        <router-link to="/n">{{ t('footer.notifications') }}</router-link>
      </nav>
    </section>
  </main>
  <Footer />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Header from '../components/utils/Header.vue'
import Footer from '../components/utils/Footer.vue'
import { WALLPAPERS, wallpaperId, setWallpaper, type WallpaperId } from '../services/wallpapers'

const { t } = useI18n()
const feedback = ref('')
function select(id: WallpaperId | null) {
  try {
    setWallpaper(id)
    feedback.value = t('wallpapers.saved')
  } catch {
    feedback.value = t('wallpapers.error')
  }
}
</script>

<style scoped>
h1 {
  margin: 0;
  font-size: 1.2rem;
}
.wallpapers {
  height: calc(100dvh - 100px);
  overflow-y: auto;
  box-sizing: border-box;
  padding: clamp(1rem, 4vw, 3rem);
  color: #24394b;
}
.wallpapers__intro,
.wallpapers__grid,
.wallpapers__sample,
.wallpapers__status {
  max-width: 64rem;
  margin: 0 auto 1.5rem;
}
.wallpapers__intro p {
  font-size: 1.1rem;
  line-height: 1.7;
}
.wallpapers__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
  gap: 1rem;
}
.wallpapers__card {
  padding: 0.6rem;
  border: 2px solid transparent;
  border-radius: 0.75rem;
  background: #fff;
  color: inherit;
  cursor: pointer;
  text-align: left;
  box-shadow: 0 2px 12px #1c436512;
  font: inherit;
}
.wallpapers__card[aria-pressed='true'] {
  border-color: #0185c5;
}
.wallpapers__card:focus-visible {
  outline: 3px solid #0185c5;
  outline-offset: 3px;
}
.wallpapers__swatch {
  display: block;
  aspect-ratio: 4 / 3;
  border-radius: 0.4rem;
  margin-bottom: 0.9rem;
}
.wallpapers__default {
  background: #f5f5f5;
}
.wallpapers__card > span:last-of-type {
  display: block;
  font-weight: 600;
}
small {
  display: block;
  margin-top: 0.5rem;
  color: #526675;
}
.wallpapers__sample {
  padding: 1.5rem;
  background: #fffffff0;
  border-radius: 0.75rem;
  line-height: 1.7;
}
.wallpapers__sample h2 {
  font-size: 1.1rem;
  margin-top: 0;
}
.wallpapers__sample nav {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}
a {
  color: #006b9e;
}
.wallpapers__status {
  min-height: 1.5em;
}
@media (max-width: 480px) {
  .wallpapers__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }
  .wallpapers__intro p {
    font-size: 1rem;
  }
}
</style>
