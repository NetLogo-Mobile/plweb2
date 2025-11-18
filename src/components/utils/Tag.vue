<template>
  <div
    v-if="tag && !tag.startsWith('Type-')"
    class="tag"
    @click.stop.prevent="jump"
    v-text="tag.startsWith('C-') ? tag.slice(2) : tagName"
  ></div>
  <!-- 外层包裹了router-link，必须阻止冒泡和默认行为 The outer wrapper is a router-link, which must prevent bubbling and default behavior -->
</template>

<script setup lang="ts">
import router from "../../router";
import { EncodeAPITargetLink } from "@services/utils";
import getTagName from "@i18n/getTagName";

const { tag, category } = defineProps<{ tag: string; category: string }>();
const tagName = getTagName(tag);
const APILink = `${category.toLowerCase()}://Tags/${tag}`;
const jump = () => {
  router.push(`/list/${EncodeAPITargetLink(APILink)}`);
};
</script>

<style scoped>
.tag {
  display: inline-block;
  padding: 1px 5px;
  border-radius: 20%;
  background-color: rgba(240, 240, 240, 0.8);
  color: #333;
  font-size: 10px;
  margin: 0 15px 0 0;
}
</style>
