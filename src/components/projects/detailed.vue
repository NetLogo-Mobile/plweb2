<template>
  <div @click="goToExperimentSummary">
    <!-- 早期实验区作品类型为null -->
    <!-- Early works in the experimental area have a type of null -->
    <div class="card">
      <img :src="imgUrl" class="icon" />
      <div class="text">
        <p v-richText="() => parse(data.Subject)" class="title"></p>
        <p class="subtitle">{{ data.User.Nickname }}</p>
        <div class="subtitle">
          <Tag v-for="i in data.Tags" :category="data.Category" :tag="i" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Tag from "../utils/Tag.vue";
import parse from "@services/pltxt2htm/commonParser";
import { getCoverUrl, getPath } from "@services/utils";
import { useRouter } from "vue-router";

interface IData {
  ID: string;
  Subject: string;
  User: {
    Nickname: string;
  };
  Tags: string[];
  Category: string;
  Image: number;
}

const { data } = defineProps<{
  data: IData;
}>();

const router = useRouter();
const imgUrl =
  data.Image != -1
    ? getCoverUrl(data)
    : getPath("/@base/assets/messages/Experiment-Default.png");

function goToExperimentSummary() {
  router.push({
    name: "ExperimentSummary",
    params: {
      category: data.Category || "Experiment",
      id: data.ID,
    },
  });
}
</script>

<style scoped>
.card {
  display: flex;
  align-items: center;
  padding: 5px;
  padding-bottom: 0;
  height: 55px;
}

.card img {
  object-fit: cover;
}

.icon {
  width: 50px;
  height: 50px;
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
  color: #333;
  margin: 0;
}

.subtitle {
  font-size: 12px;
  color: #666;
  margin: 0;
}

a {
  text-decoration: none;
}

div {
  box-sizing: border-box;
}
</style>
