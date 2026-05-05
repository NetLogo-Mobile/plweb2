<template>
  <div class="work-box" @click="handleClick">
    <div class="cover" :style="{ height: projectsHeight }">
      <img :src="imgUrl" alt="" />
      <div class="time">{{ formatDate(item.ID, false, "date") }}</div>
    </div>
    <div class="info">
      <div class="title">{{ item.Subject }}</div>
      <div v-if="showName" class="user">
        <div
          class="avartar"
          :style="{
            height: Number(fontSizeS.slice(0, 2)) * 3 - 20 + 'px',
            minWidth: Number(fontSizeS.slice(0, 2)) * 3 - 20 + 'px',
          }"
        >
          <img :src="avartarUrl" alt="item.User.Nickname" />
        </div>
        <div class="name" :style="{ fontSize: fontSizeS }">
          {{ item.User.Nickname }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from "../../router";
import type { Summary } from "@services/../pl-serve-type-main/type/main";
import { getCoverUrl, getUserUrl, formatDate } from "@services/utils";
import { useResponsive } from "../../layout/useResponsive";

const { projectsHeight, fontSizeS } = useResponsive();
const { item } = defineProps<{
  item: Summary;
  showName?: boolean;
}>();

const imgUrl = getCoverUrl(item);
const avartarUrl = getUserUrl(item.User);

const handleClick = () => {
  router.push(`/p/${item.Category}/${item.ID}`);
};
</script>

<style scoped>
.work-box {
  background: #fff;
  border-radius: 5%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  position: relative;
  height: fit-content;
}

.cover {
  width: 100%;
  height: calc(100% - 67px);
  position: relative;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5% 5% 0 0;
}

.cover .time {
  position: absolute;
  top: 8px;
  right: 8px;
  color: white;
  font-size: 1em;
  /* mix-blend-mode: difference; */
  /* 放弃解决白色底板看不清 give up solving white-background mode */
}

.info {
  height: fit-content;
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 3px;
}

.title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
}

.user {
  display: flex;
  flex-direction: row;
}

.avartar {
  height: auto;
  border-radius: 50%;
  overflow: hidden;
}

.avartar img {
  height: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

.user .name {
  margin-left: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: hidden;
}
</style>
