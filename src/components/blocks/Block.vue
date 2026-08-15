<template>
  <div class="outer">
    <div class="head">
      <!-- title的i18n应当是服务器返回自动i处理的 -->
      <!-- The title should be processed automatically by the server for i18n -->
      <div class="title">{{ props.block.Header }}</div>
      <router-link class="more" :to="`/l/${EncodeAPITargetLink(props.block.TargetLink)}`">
        <div>{{ $t('worklist.more') }}</div>
      </router-link>
    </div>
    <div style="display: flex; flex-direction: column; gap: 10px">
      <Detailed
        v-for="(item, index) in props.block.Summaries.slice(0, displayCount)"
        :key="index"
        :data="item"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Block as BlockType, TopicBlock } from '@services/../pl-serve-type-main/type/main'
import { useResponsive } from '../../layout/useResponsive'
import Detailed from '../projects/detailed.vue'
import { EncodeAPITargetLink } from '@services/utils.ts'
type Props = {
  block: BlockType | TopicBlock
  maxProjectsPerBlock?: number
}
const props = withDefaults(defineProps<Props>(), {})
const { maxProjectsPerBlock: maxDefault } = useResponsive()
const displayCount = computed(() => props.maxProjectsPerBlock ?? maxDefault.value)
</script>

<style scoped>
.outer {
  height: 100%;
  border-radius: var(--surface-radius);
  background-color: white;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
  padding: clamp(0.5rem, 1vw, 0.8rem);
}

.head {
  display: flex;
}

.head {
  font-size: clamp(0.9rem, 1vw, 1rem);
  color: #007bff;
  width: 100%;
  padding: 0.5em;
}

.title {
  align-self: flex-start;
  font-weight: bold;
}

.more {
  text-decoration: none;
  color: #007bff;
  align-self: flex-end;
  margin-left: auto;
  margin-right: 0.5em;
}

.div {
  box-sizing: border-box;
}
</style>
