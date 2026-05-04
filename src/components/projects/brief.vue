<template>
  <a :href="summaryHref">
    <div class="card" :type="type">
      <img :src="imgUrl" class="icon" />
      <div class="text">
        <p v-richText="() => parse(data.Subject || '')" class="title"></p>
        <p class="subtitle">
          {{ data.User.Nickname + "&nbsp;&nbsp;-" + formattedDate }}
        </p>
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Summary } from "@services/../pl-serve-type-main/type/main";
import parse from "@services/pltxt2htm/commonParser";
import { getCoverUrl, formatDate } from "@services/utils.ts";

declare global {
  interface Window {
    formtDate: typeof formatDate;
  }
}

window.formtDate = formatDate;

const { data } = defineProps<{
  data: Summary;
}>();

const type = "Experiment";

const imgUrl = getCoverUrl(data);
const formattedDate = computed(() => {
  return formatDate(data.ID);
});
const summaryHref = `/${data.Category || "Experiment"}/${data.ID}`;
</script>

<style scoped>
.card {
  display: flex;
  align-items: center;
  padding: 0 10px;
  height: 50px;
}

.card img {
  object-fit: cover;
}

.icon {
  width: 35px;
  height: 35px;
  border-radius: 5px;
  margin-right: 10px;
}

.text {
  display: flex;
  flex-direction: column;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title {
  font-size: 14px;
  font-weight: 500;
  color: white;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subtitle {
  font-size: 13px;
  color: white;
  margin: 0 0 0 0;
}

a {
  text-decoration: none;
}
</style>
