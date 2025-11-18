<template>
  <!-- show when click 'more' in Block/TopicBlock component -->
  <Header>
    <img
      src="/assets/library/Navigation-Return.png"
      style="width: 2.7em"
      @click="goBack"
    />
    <h2 style="margin-right: auto; margin-left: 20px">
      {{ $t("worklist.title") }}
    </h2>
  </Header>

  <div class="list">
    <WorksList
      :row="maxProjectsPerLine"
      :q="
        route.params.config
          ? decodeHrefToQueryObj(route.params.config as string)
          : {}
      "
    />
  </div>
</template>

<script setup lang="ts">
import Header from "../components/utils/Header.vue";
import WorksList from "../components/projects/wortList.vue";
import { useRoute } from "vue-router";
import { decodeHrefToQueryObj } from "@services/utils";
import { useResponsive } from "../layout/useResponsive";

const route = useRoute();

const { maxProjectsPerLine } = useResponsive();

const goBack = () => {
  window.history.back();
};
</script>

<style scoped>
.list {
  padding: 10px;
  box-sizing: border-box;
  background-color: #ccc3;
  scrollbar-width: none;
  position: fixed;
  top: 50px;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
</style>
