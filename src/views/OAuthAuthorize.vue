<template>
  <div class="oauth-page">
    <div class="oauth-card">
      <div class="oauth-brand">Physics Lab</div>
      <template v-if="errorKey">
        <h2 class="oauth-title">{{ t('oauth.title') }}</h2>
        <p class="oauth-text oauth-error">{{ t(errorKey) }}</p>
        <button class="oauth-btn secondary" @click="goHome">{{ t('oauth.close') }}</button>
      </template>
      <template v-else-if="!loggedIn">
        <h2 class="oauth-title">{{ t('oauth.title') }}</h2>
        <p class="oauth-text">{{ t('oauth.loginPrompt') }}</p>
        <button class="oauth-btn primary" @click="openLogin">{{ t('login.login') }}</button>
      </template>
      <template v-else>
        <h2 class="oauth-title">{{ t('oauth.title') }}</h2>
        <p class="oauth-text">{{ t('oauth.confirmPrompt', { host: displayHost }) }}</p>
        <div class="oauth-actions">
          <button class="oauth-btn secondary" @click="goHome">{{ t('oauth.cancel') }}</button>
          <button class="oauth-btn primary" :disabled="submitting" @click="authorize">
            {{ t('oauth.authorize') }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { getData } from '@api/getData.ts'
import sm from '@storage/index'
import Emitter from '@services/eventEmitter'
import { showLoginModel } from '@popup/index'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const ALLOWED_REDIRECT_HOSTS = ['pltown.online']
const CALLBACK_PATH = '/auth/oauth2_basic/callback'

const loggedIn = ref(isLoggedIn())
const submitting = ref(false)
const errorKey = ref('')
const redirectBase = ref('')
const state = ref('')
const displayHost = ref('')

function isLoggedIn(): boolean {
  return sm.getObj('userInfo').value?.Nickname != null
}

function hostAllowed(host: string): boolean {
  const target = host.toLowerCase()
  if (ALLOWED_REDIRECT_HOSTS.some((allowed) => target === allowed || target.endsWith(`.${allowed}`))) {
    return true
  }
  return import.meta.env.DEV && (target === 'localhost' || target === '127.0.0.1')
}

function parseQuery(): void {
  const raw = String(route.query.redirect_uri || '')
  state.value = String(route.query.state || '')
  if (!raw) {
    errorKey.value = 'oauth.missingRedirect'
    return
  }
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    errorKey.value = 'oauth.invalidRedirect'
    return
  }
  if ((url.protocol !== 'https:' && url.protocol !== 'http:') || !hostAllowed(url.hostname)) {
    errorKey.value = 'oauth.invalidRedirect'
    return
  }
  displayHost.value = url.hostname
  // The server appends the fixed callback path to whatever base it receives.
  let base = raw
  if (base.endsWith(CALLBACK_PATH)) base = base.slice(0, -CALLBACK_PATH.length)
  if (!base.endsWith('/')) base += '/'
  redirectBase.value = base
}

function openLogin(): void {
  showLoginModel()
}

function onUserLogin(): void {
  loggedIn.value = isLoggedIn()
}

async function authorize(): Promise<void> {
  if (submitting.value) return
  submitting.value = true
  try {
    const res = await getData('/Users/AuthorizeForum', { Redirect: redirectBase.value })
    const url = typeof res?.Data === 'string' ? res.Data : ''
    if (res?.Status !== 200 || !url) {
      errorKey.value = 'oauth.failed'
      return
    }
    window.location.replace(state.value ? `${url}&state=${encodeURIComponent(state.value)}` : url)
  } catch {
    errorKey.value = 'oauth.failed'
  } finally {
    submitting.value = false
  }
}

function goHome(): void {
  router.replace({ name: 'Home' })
}

onMounted(() => {
  Emitter.on('userLogin', onUserLogin)
  parseQuery()
  if (!errorKey.value && !loggedIn.value) openLogin()
})

onUnmounted(() => {
  Emitter.off('userLogin', onUserLogin)
})
</script>

<style scoped>
.oauth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 24px;
}
.oauth-card {
  width: 100%;
  max-width: 380px;
  padding: 28px 24px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  text-align: center;
}
.oauth-brand {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #3a506b;
  margin-bottom: 16px;
}
.oauth-title {
  font-size: 20px;
  margin: 0 0 12px;
}
.oauth-text {
  font-size: 14px;
  color: #4a5568;
  margin: 0 0 20px;
  word-break: break-word;
}
.oauth-error {
  color: #c53030;
}
.oauth-actions {
  display: flex;
  gap: 12px;
}
.oauth-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  cursor: pointer;
}
.oauth-btn:disabled {
  opacity: 0.6;
  cursor: default;
}
.oauth-btn.primary {
  background: #4285f4;
  color: #ffffff;
}
.oauth-btn.secondary {
  background: #edf2f7;
  color: #2d3748;
}
</style>
