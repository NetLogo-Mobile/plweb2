<template>
  <div id="blackhole">
    <Header>
      <h1>{{ $t("blackhole.title") }}</h1>
    </Header>
    <!-- Height：50px fixed -->
    <main>
      <div v-show="loading" class="loading"></div>
      <div v-show="!loading" class="block-container">
        <n-grid :x-gap="12" :y-gap="12" :cols="blockItemsPerRow">
          <n-gi
            v-for="block in blocks.filter((i: any) => i.Summaries.length > 0)"
            :key="block.Subject"
          >
            <div class="block" style="height: 100%">
              <TopicBlock
                v-if="
                  block.$type.startsWith('Quantum.Models.Contents.TopicBlock')
                "
                type="Discussion"
                :projects="block.Summaries"
                :activityName="
                  block.AuxiliaryText || $t('blackhole.participate')
                "
                :activityBackground="getPath('/@base/assets/mechanics.png')"
                :projectsName="block.Subject"
                :activityProc="
                  (event) =>
                    //@ts-ignore no need to infer its type
                    getActivityProc(
                      block.AuxiliaryLink || 'internal://co-dev',
                    )?.(event) ?? undefined
                "
                :link="EncodeAPITargetLink(block.TargetLink)"
              />
              <Block
                v-else
                type="Discussion"
                :data="block.Summaries.slice(0, maxProjectsPerBlock)"
                :title="block.Header"
                :link="EncodeAPITargetLink(block.TargetLink)"
              />
            </div>
          </n-gi>
        </n-grid>
      </div>
    </main>
    <Footer></Footer>
  </div>
</template>

<script setup lang="ts">
import { useResponsive } from "../layout/useResponsive";
import { ref, onMounted, onActivated } from "vue";
import Header from "../components/utils/Header.vue";
import TopicBlock from "../components/blocks/TopicBlock.vue";
import Block from "../components/blocks/Block.vue";
import Footer from "../components/utils/Footer.vue";
import { getData } from "@services/api/getData.ts";
import { NGrid, NGi } from "naive-ui";
import { EncodeAPITargetLink, getPath } from "@services/utils.ts";
import "../layout/loading.css";
import "../layout/startPage.css";

const loading = ref(true);
const blocks = ref<any>([]);

const goToWebCommunity = () => {
  window.$Logger.logEvent({
    category: "Activity",
    action: "Visit-External",
    label: "https://pl.turtlesim.com",
    timestamp: Date.now(),
  });
  window.open("https://pl.turtlesim.com");
};

const goToDevelopment = () => {
  window.$Logger.logEvent({
    category: "Activity",
    action: "Visit-External",
    label: "https://github.com/NetLogo-Mobile/Physics-Lab-Web",
    timestamp: Date.now(),
  });
  window.open(getPath("/@root/about"));
};

// Mabey some activity links will be specific to the web version one day
// @see Interceptor.AfterRequest
const activityLinkMap: Record<string, () => void> = {
  "internal://forum": goToWebCommunity,
  "internal://co-dev": goToDevelopment,
};

const getActivityProc = (
  link: string | undefined,
): ((event: MouseEvent) => void) => {
  const fn = link ? activityLinkMap[link] : undefined;
  return fn
    ? (event: MouseEvent) => {
        event?.preventDefault?.();
        fn();
      }
    : () => {};
};

const { blockItemsPerRow, maxProjectsPerBlock } = useResponsive();

onMounted(async () => {
  const getLibraryResponse = await getData("/Contents/GetLibrary", {
    Identifier: "Discussions",
    Language: "Chinese",
  });
  loading.value = false;
  blocks.value = getLibraryResponse.Data.Blocks;
});

onActivated(() => {
  window.$Logger.logPageView({
    pageLink: "/Discussions/",
    timeStamp: Date.now(),
  });
  window.$Logger.logPageView({
    pageLink: "/Library/Discussions/",
    timeStamp: Date.now(),
  });
});
</script>

<style scoped></style>
