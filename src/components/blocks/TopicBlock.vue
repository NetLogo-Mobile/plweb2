<template>
  <!-- API的$Type:TopicBlock的对应组件 -->
  <!-- The component corresponding to the API's $Type:TopicBlock -->
  <div style="height: 100%">
    <div
      class="container"
      :style="{
        backgroundImage: block.Summaries[0] ? `url(${getCoverUrl(block.Summaries[0]!)})` : 'none',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }"
      @click="handleContainerClick"
    >
      <h2 class="title">{{ block.Subject }}</h2>
      <div class="box" @click.stop="">
        <Works v-for="item in block.Summaries" :key="item.ID" :data="item"></Works>
      </div>
    </div>
    <!-- activity的内容和APP端不一致，但是我们不在这里处理，将会在API层面修改服务器端响应在渲染，参见getData.ts -->
    <!-- The content of activity is different from the app version, but we won't handle it here. Instead, we will modify the server response at the API level, see getData.ts -->
    <div
      class="activity"
      :style="{
        backgroundImage: `url(${getPath('/@base/assets/support.png')})`,
      }"
      @click="props.activityProc"
    >
      <h1 class="activity-text">{{ block.AuxiliaryText }}</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { TopicBlock as TopicBlockType } from '@services/../pl-serve-type-main/type/main'
import Works from '../projects/brief.vue'
import { getCoverUrl, getPath } from '@services/utils.ts'

const router = useRouter()

interface Props {
  block: TopicBlockType
  activityProc?: (event: MouseEvent) => void
}

const props = withDefaults(defineProps<Props>(), {
  activityProc: () => {},
})

const handleContainerClick = () => {
  router.push(`/l/${props.block.TargetLink}`)
}
</script>

<style scoped>
.container {
  position: relative;
  border-radius: 8px;
  color: #fff;
  height: calc(100% - 95px);
  display: flex;
  flex-direction: column;
}

.container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* 为了防止底部背景与字体颜色冲突的灰色遮罩 */
  background: linear-gradient(to bottom, rgba(128, 128, 128, 0.3) 0%, rgba(128, 128, 128, 0) 50%);
  pointer-events: none;
  border-radius: 8px;
  z-index: 1;
}

.title {
  text-align: center;
  margin-bottom: 10px; /* 添加底边距使标题与 box 之间有些间距 */
  text-align: left;
  padding-left: 20px;
  z-index: 2;
}

.box {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: auto 0 0; /* 顶部 margin 设置为 auto 推动 box 到底部 */
  gap: 5px;
  background-color: rgba(0, 0, 0, 0.3);
}

.activity {
  height: 75px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: left;
  margin-top: 20px;
  border-radius: 10px;
}

.activity-text {
  color: white;
  text-align: left;
  padding-left: 20px;
  font-weight: normal;
}

.div {
  box-sizing: border-box;
}
</style>
