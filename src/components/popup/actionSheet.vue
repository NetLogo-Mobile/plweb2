<template>
  <div class="action-sheet-mask" @click="close">
    <div class="action-sheet-panel" @click.stop="">
      <div
        v-for="(item, idx) in options"
        :key="idx"
        class="action-sheet-option"
        :style="{ color: item.color || 'rgb(4 94 229)' }"
        @click="select(idx)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ActionSheetOption {
  label: string;
  color?: string;
}

interface Props {
  options: ActionSheetOption[];
  close: () => void;
  onSelect: (idx: number) => void;
}

const props = defineProps<Props>();

function select(idx: number) {
  props.onSelect(idx);
  props.close();
}
function close() {
  props.close();
}
</script>

<style scoped>
.action-sheet-mask {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100dvh;
  background: rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.action-sheet-panel {
  width: 250px;
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  padding: 2px 0;
  margin-bottom: 5px;
  animation: slideUp 0.2s;
}
@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
.action-sheet-option {
  padding: 5px;
  text-align: center;
  font-size: 1.1em;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background 0.2s;
}
.action-sheet-option:last-child {
  border-bottom: none;
}
.action-sheet-option:active {
  background: #f2f2f2;
}
</style>
