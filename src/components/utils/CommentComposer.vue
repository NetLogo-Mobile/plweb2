<template>
  <div
    class="comment-composer"
    :class="{ 'comment-composer--compact': isCompact }"
  >
    <div class="comment-composer__surface">
      <n-input
        ref="inputRef"
        class="comment-composer__input"
        :value="modelValue"
        type="text"
        clearable
        :show-count="!isUltraCompact"
        :maxlength="maxlength"
        :loading="loading"
        :disabled="loading"
        :placeholder="placeholder"
        @update:value="emit('update:modelValue', $event)"
        @focus="handleFocus"
        @keydown.enter="handleKeydown"
      />

      <n-button
        type="primary"
        strong
        secondary
        class="comment-composer__send"
        :loading="loading"
        :disabled="isSubmitDisabled"
        @click="handleSubmit"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 19L20 12L4 5L4 11L15 12L4 13L4 19Z" fill="currentColor" />
        </svg>
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { NButton, NInput } from "naive-ui";
import { useResponsive } from "../../layout/useResponsive";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    placeholder: string;
    maxlength?: number;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    maxlength: 300,
    loading: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "submit"): void;
}>();

const inputRef = ref<{ $el?: HTMLElement } | null>(null);
const { isCompact, isUltraCompact } = useResponsive();
const isSubmitDisabled = computed(() => props.disabled || props.loading);

function handleSubmit() {
  if (isSubmitDisabled.value) return;
  emit("submit");
}

function handleKeydown(event: KeyboardEvent) {
  if (event.isComposing) return;
  event.preventDefault();
  handleSubmit();
}

async function handleFocus() {
  await nextTick();
  setTimeout(() => {
    inputRef.value?.$el?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "smooth",
    });
  }, 180);
}
</script>

<style scoped>
.comment-composer {
  position: sticky;
  bottom: 0;
  z-index: 6;
  padding-bottom: max(env(safe-area-inset-bottom, 0px), 4px);
  background: linear-gradient(
    180deg,
    rgba(248, 251, 255, 0) 0%,
    rgba(248, 251, 255, 0.92) 28%,
    rgba(248, 251, 255, 1) 100%
  );
}

.comment-composer__surface {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px;
  border-radius: calc(var(--card-radius) + 2px);
  border: 1px solid var(--border-soft);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
}

.comment-composer__input {
  flex: 1 1 auto;
  min-width: 0;
}

.comment-composer__send {
  width: clamp(42px, 11vw, 50px);
  min-width: clamp(42px, 11vw, 50px);
  height: clamp(42px, 11vw, 50px);
  padding: 0;
  border-radius: 14px;
}

.comment-composer__send svg {
  width: 20px;
  height: 20px;
}

.comment-composer :deep(input) {
  font-size: 16px !important;
}

.comment-composer--compact .comment-composer__surface {
  gap: 6px;
  padding: 6px;
}

.comment-composer--compact .comment-composer__send {
  width: 40px;
  min-width: 40px;
  height: 40px;
  border-radius: 12px;
}
</style>
