<template>
  <div class="container" @click="close">
    <div class="card" @click.stop>
      <n-card>
        <n-tabs
          class="card-tabs"
          default-value="signin"
          size="large"
          type="segment"
          animated
          pane-wrapper-style="margin: 0 -4px"
          pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;"
        >
          <n-tab-pane name="signin" :tab="$t('login.login')">
            <n-form :show-label="false">
              <n-form-item-row>
                <n-input
                  v-model:value="emailOrPhone"
                  class="inputArea"
                  :placeholder="$t('login.emailOrPhone')"
                  autocomplete="username"
                  name="username"
                  clearable
                >
                  <template #suffix>
                    <img :src="getPath('/@base/assets/login/icon-login.png')" width="15px" />
                  </template>
                </n-input>
              </n-form-item-row>
              <n-form-item-row>
                <n-input
                  v-model:value="loginPassword"
                  show-password-on="click"
                  class="inputArea"
                  :placeholder="$t('login.password')"
                  type="password"
                  autocomplete="current-password"
                  name="password"
                  clearable
                />
              </n-form-item-row>
            </n-form>
            <p style="margin-bottom: 20px" v-html="$t('login.terms')"></p>
            <n-button type="primary" class="loginButton" @click="handlePasswordLogin">
              {{ $t('login.confirm') }}
            </n-button>
          </n-tab-pane>
          <n-tab-pane name="signup" :tab="$t('login.signup')">
            <h3 style="align-self: center">{{ $t('login.signupClosed') }}</h3>
            <n-form :showLabel="false">
              <n-form-item-row>
                <n-input
                  :placeholder="$t('login.emailOrPhone')"
                  class="inputArea"
                  clearable
                  disabled
                >
                  <template #suffix>
                    <img src="/assets/login/icon-login.png" width="15px" />
                  </template>
                </n-input>
              </n-form-item-row>
              <n-form-item-row>
                <n-input
                  show-password-on="click"
                  class="inputArea"
                  :placeholder="$t('login.password')"
                  type="password"
                  clearable
                  disabled
                />
              </n-form-item-row>
              <n-form-item-row>
                <n-input
                  show-password-on="click"
                  class="inputArea"
                  :placeholder="$t('login.passwordAgain')"
                  type="password"
                  clearable
                  disabled
                />
              </n-form-item-row>
            </n-form>
            <n-button type="primary" disabled class="loginButton">
              {{ $t('login.signup') }}
            </n-button>
          </n-tab-pane>
        </n-tabs>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts" vapor>
import { ref } from 'vue'
import { login } from '@api/getData.ts'
import sm from '@storage/index'
import { getPath } from '@services/utils'
import { NInput, NTabPane, NButton, NForm, NTabs, NFormItemRow, NCard } from 'naive-ui'
import Emitter from '@services/eventEmitter'
import { showMessage } from '@popup/naiveui'

const emailOrPhone = ref('')
const loginPassword = ref('')
interface LoginModelProps {
  close: () => void
}

const { close } = defineProps<LoginModelProps>()

async function handlePasswordLogin() {
  let res = await login(emailOrPhone.value, loginPassword.value, false)
  if (res.Status === 200) {
    sm.setObj('userInfo', res.Data.User)
    Emitter.emit('userLogin', res)
    close()
  } else {
    showMessage('error', res.Message)
  }
}
</script>

<style scoped>
.container {
  position: fixed;
  z-index: 8000;
  left: 0;
  top: 0;
  height: 100dvh;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.2);
}

.card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 330px;
}

.inputArea {
  margin: 1%;
  padding: 0;
  border-radius: 10px;
}

.loginButton {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border: none;
  border-radius: 10px;
}
</style>
