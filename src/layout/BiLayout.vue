<template>
  <!-- BiLayout用于Profile和ExperimentSummaries页面的适配，他们都是两个区块，宽屏左右分布，长屏上下分布。 -->
  <!-- BiLayout is used for the Profile and ExperimentSummaries pages, which have two blocks, distributed left and right in wide screens, and top and bottom in long screens. -->
  <div class="basic-layout">
    <!-- 封面区域  cover area -->
    <div class="layout-left">
      <slot name="left"></slot>
    </div>

    <!-- 作品介绍或者个人作品列表  Experiment introduction or personal work list -->
    <div class="layout-right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
<style scoped>
.basic-layout {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column; /* 竖屏：上下排列 */
  box-sizing: border-box;
}

/* 默认竖屏布局 */
.layout-left {
  position: relative;
  height: 28vh;
  flex: 0 0 auto;
}

.layout-right {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-left::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(128, 128, 128, 0.2) 10%,
    rgba(128, 128, 128, 0) 90%
  );
  pointer-events: none;
  border-radius: 8px;
  z-index: 2;
}

/* 横屏布局：左右并排 */
@media (min-aspect-ratio: 1/1) {
  .basic-layout {
    flex-direction: row;
  }

  .layout-left {
    width: 50vw;
    min-height: calc(var(--vh, 1vh) * 100);
    flex: 0 0 50vw;
  }

  .layout-right {
    width: 50vw;
    min-height: calc(var(--vh, 1vh) * 100);
    flex: 1 1 50vw;
  }

  .scroll-container {
    padding: 0 10px;
  }
}
</style>
