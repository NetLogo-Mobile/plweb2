<template>
  <div
    v-if="tag && !tag.startsWith('Type-')"
    class="tag"
    @click.stop="jump"
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
  if (category === "User") return;
  router.push(`/list/${EncodeAPITargetLink(APILink)}`);
};
</script>

<style scoped>
.tag {
  display: inline-block;
  border-radius: 5px;
  background-color: hsla(0, 6%, 7%, 0.559);
  color: white;

  font-size: 0.8em;

  padding: 0.1em 7px;
  margin: 0 3px;
}

@media (min-aspect-ratio: 1/1) {
  .tag {
    padding: 0.2em 10px;
    font-size: 0.8em;
  }
}
</style>
