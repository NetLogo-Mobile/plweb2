<template>
  <Header
    ><h1>{{ t('avatarFrames.title') }}</h1></Header
  >
  <main class="frames">
    <p v-if="demo">{{ t('avatarFrames.demo') }}</p>
    <p v-if="error" role="alert">
      {{ t('avatarFrames.error') }} <button @click="load">{{ t('avatarFrames.retry') }}</button>
    </p>
    <p v-if="inventory?.IsBanned" role="status">{{ t('avatarFrames.banned') }}</p>
    <section class="frames__preview">
      <UserAvatar :src="avatar" :user="displayUser" class="frames__avatar" />
      <strong>{{ t('avatarFrames.current') }}</strong>
      <button
        :disabled="busy || !inventory || inventory.IsBanned || !inventory.Equipped"
        @click="equip(null)"
      >
        {{ t('avatarFrames.remove') }}
      </button>
    </section>
    <div class="frames__grid">
      <article v-for="id in inventory?.Owned || []" :key="id" class="frames__card">
        <UserAvatar :src="avatar" :preview="id" class="frames__avatar" />
        <h2>{{ t(`avatarFrames.${id}`) }}</h2>
        <button
          :disabled="busy || inventory?.IsBanned || inventory?.Equipped === id"
          @click="equip(id)"
        >
          {{ t(inventory?.Equipped === id ? 'avatarFrames.equipped' : 'avatarFrames.equip') }}
        </button>
      </article>
    </div>
    <button
      v-if="demo"
      class="frames__demo"
      :disabled="busy"
      @click="setDemoFrameBan(!inventory?.IsBanned)"
    >
      {{ t(inventory?.IsBanned ? 'avatarFrames.unbanTest' : 'avatarFrames.banTest') }}
    </button>
  </main>
  <Footer />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Header from '../components/utils/Header.vue'
import Footer from '../components/utils/Footer.vue'
import UserAvatar from '../components/utils/UserAvatar.vue'
import {
  frameInventory as inventory,
  loadFrames,
  equipFrame,
  isFrameDemo,
  setDemoFrameBan,
  type AvatarFrameId,
} from '../services/avatarFrames'
import { getPath, getUserUrl } from '../services/utils'
import storage from '../services/storage'

const { t } = useI18n()
const demo = isFrameDemo()
const user = storage.getObj('userInfo').value
const avatar = demo || !user ? getPath('/@base/assets/user/default-avatar.png') : getUserUrl(user)
const displayUser = computed(() => ({
  ID: demo ? 'frame-demo' : user?.ID,
  Verification: demo ? 'User' : user?.Verification,
  IsBanned: inventory.value?.IsBanned,
  AvatarFrameID: inventory.value?.Equipped,
}))
const busy = ref(false)
const error = ref(false)
async function load() {
  busy.value = true
  error.value = false
  try {
    await loadFrames()
  } catch {
    error.value = true
  } finally {
    busy.value = false
  }
}
async function equip(id: AvatarFrameId | null) {
  if (busy.value) return
  busy.value = true
  error.value = false
  try {
    await equipFrame(id)
  } catch {
    error.value = true
  } finally {
    busy.value = false
  }
}
onMounted(load)
</script>

<style scoped>
h1 {
  margin: 0;
  font-size: 1.2rem;
}
.frames {
  box-sizing: border-box;
  height: calc(100dvh - 100px);
  padding: 1.5rem;
  overflow: auto;
  background: #f5f5f5;
  color: #333;
}
.frames__preview,
.frames__grid {
  max-width: 56rem;
  margin: 0 auto 1.5rem;
}
.frames__preview {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
}
.frames__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 1rem;
}
.frames__card {
  padding: 2rem 1rem 1rem;
  text-align: center;
  border-radius: 8px;
  background: white;
  box-shadow: 0 0 5px #00000019;
}
.frames__avatar {
  width: 4rem;
  height: 4rem;
  font-size: 1.5rem;
}
h2 {
  font-size: 1rem;
  margin-top: 1.5rem;
}
button {
  padding: 0.5rem 1rem;
  border: 1px solid #0185c5;
  border-radius: 4px;
  color: #0185c5;
  background: white;
  cursor: pointer;
}
button:disabled {
  opacity: 0.45;
  cursor: default;
}
.frames__demo {
  display: block;
  margin: 1rem auto;
}
@media (max-width: 480px) {
  .frames {
    padding: 1rem;
  }
  .frames__preview {
    flex-wrap: wrap;
  }
}
</style>
