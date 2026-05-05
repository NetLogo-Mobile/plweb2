<template>
  <div class="api-error-popup">
    <div class="overlay" @click="onCancel" />
    <div class="dialog" role="dialog" aria-modal="true">
      <h3 class="title">{{ displayTitle }}</h3>
      <p class="message">{{ displayMessage }}</p>
      <div class="buttons">
        <button class="btn cancel" @click="onCancel">{{ cancelLabel }}</button>
        <button class="btn confirm" :disabled="loading" @click="onConfirmClick">
          <span v-if="loading">{{ confirmingLabel }}</span>
          <span v-else>{{ confirmLabel }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { Ref } from "vue";

interface Props {
  title?: string;
  message?: string;
  titleRef?: Ref<string>;
  messageRef?: Ref<string>;
  icon?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmingLabel?: string;
  onConfirm?: () => Promise<unknown> | void;
  close?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  icon: "/assets/messages/Message-Default.png",
  confirmLabel: "OK",
  cancelLabel: "Cancel",
  confirmingLabel: "Retrying...",
});

const loading = ref(false);

const displayTitle = computed(() => {
  const tr = props.titleRef as Ref<string> | undefined;
  return tr?.value ?? props.title ?? "";
});

const displayMessage = computed(() => {
  const mr = props.messageRef as Ref<string> | undefined;
  return mr?.value ?? props.message ?? "";
});

async function onConfirmClick() {
  if (!props.onConfirm) {
    props.close?.();
    return;
  }
  try {
    loading.value = true;
    await props.onConfirm();
    // on success the caller may close via close()
  } catch (_e) {
    // keep dialog open on failure – caller can decide behavior
  } finally {
    loading.value = false;
  }
}

function onCancel() {
  props.close?.();
}
</script>

<style scoped>
.api-error-popup {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
}
.dialog {
  position: relative;
  width: min(420px, calc(100vw - 24px));
  max-width: 100%;
  background: #fff;
  padding: 18px 12px 0;
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  text-align: center;
}
.title {
  font-size: clamp(18px, 5vw, 22px);
  font-weight: 600;
  color: #222;
  margin: 6px 0 8px 0;
}
.message {
  color: #333;
  margin: 6px 10px 18px 10px;
  line-height: 1.6;
  text-align: center;
}
.message a {
  color: #0b6fff;
  text-decoration: underline;
}
.buttons {
  display: flex;
  border-top: 1px solid #eee;
  margin-top: 6px;
}
.btn {
  flex: 1 1 50%;
  padding: 14px 4px;
  border: none;
  background: transparent;
  color: #0b6fff;
  font-size: clamp(15px, 4vw, 17px);
}
.btn.cancel {
  border-right: 1px solid #eee;
}
.btn:disabled {
  opacity: 0.6;
  pointer-events: none;
}
</style>
