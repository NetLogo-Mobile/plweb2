<template>
  <div class="outer">
    <div class="head">
      <!-- title的i18n应当是服务器返回自动i处理的 -->
      <!-- The title should be processed automatically by the server for i18n -->
      <div id="title">{{ props.block.Header }}</div>
      <router-link id="more" :to="`/l/${EncodeAPITargetLink(props.block.TargetLink)}`">
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
  border-radius: 8px;
  background-color: white;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
  padding: 10px;
}

.head {
  display: flex;
}

.head {
  font-size: 15px;
  color: #007bff;
  width: 100%;
  padding: 8px;
}

#title {
  align-self: flex-start;
  font-weight: bold;
}

#more {
  text-decoration: none;
  color: #007bff;
  align-self: flex-end;
  margin-left: auto;
  margin-right: 20px;
}

.div {
  box-sizing: border-box;
}
</style>
