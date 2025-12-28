<template>
  <div class="api-error-popup">
    <div class="overlay" @click="onCancel" />
    <div class="dialog" role="dialog" aria-modal="true">
      <h3 class="title">{{ displayTitle }}</h3>
      <p class="message" v-html="displayMessage"></p>
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
import type { PropType, Ref } from "vue";

const props = defineProps({
  title: String,
  message: String,
  // Optional reactive refs for live updates
  titleRef: { type: Object as PropType<Ref<string> | undefined> },
  messageRef: { type: Object as PropType<Ref<string> | undefined> },
  icon: { type: String as PropType<string>, default: "/assets/messages/Message-Default.png" },
  confirmLabel: { type: String as PropType<string>, default: "OK" },
  cancelLabel: { type: String as PropType<string>, default: "Cancel" },
  confirmingLabel: { type: String as PropType<string>, default: "Retrying..." },
  onConfirm: Function as PropType<() => Promise<any> | void>,
  close: Function as PropType<() => void>,
});

const loading = ref(false);

const displayTitle = computed(() => {
  const tr = props.titleRef as Ref<string> | undefined;
  return (tr?.value ?? props.title ?? "");
});

const displayMessage = computed(() => {
  const mr = props.messageRef as Ref<string> | undefined;
  return (mr?.value ?? props.message ?? "");
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
  } catch (e) {
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
  min-width: 300px;
  max-width: 88%;
  background: #fff;
  padding: 18px 12px 0 12px;
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  text-align: center;
}
.title {
  font-size: 22px;
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
  font-size: 17px;
}
.btn.cancel {
  border-right: 1px solid #eee;
}
.btn:disabled {
  opacity: 0.6;
  pointer-events: none;}
</style>