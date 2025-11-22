<template>
  <infiniteScroll
    :initial-items="items"
    :has-more="!noMore"
    :margin-top="-200"
    @load="handleLoad"
  >
    <template #default="{ items }">
      <n-grid :cols="cols || 2">
        <n-gi v-for="user in items as User[]" :key="user.User.ID">
          <UserItem :user="user.User" />
        </n-gi>
      </n-grid>
    </template>
  </infiniteScroll>
</template>

<script setup lang="ts">
import UserItem from "./item.vue";
import { NGrid, NGi } from "naive-ui";
import { ref } from "vue";
import { getData } from "@services/api/getData.ts";
import infiniteScroll from "../utils/infiniteScroll.vue";
import { useI18n } from "vue-i18n";
import { showMessage } from "@popup/naiveui";

interface User {
  User: any;
}

// cols需要在父组件传参，这可能会在好友界面和Profile界面（未实现）展现
//  Props `cols` needs to be passed from the parent component, which may be displayed in the Friends page and Profile page (not implemented yet).
const { userid, type } = defineProps({
  userid: String,
  type: String,
  cols: Number,
});

let loading = ref(false);
let skip = ref(0);
let noMore = ref(false);
let hasInformed = ref(false);
const items = ref<User[]>([]);
const { t } = useI18n();
// Vue对于Ref会自动处理数据竞争问题
// Vue automatically handles data race issues with Ref.

async function handleLoad() {
  if (!userid) return;
  if (loading.value) return; // Serves as a "lock"
  loading.value = true;
  if (noMore.value) {
    if (!hasInformed.value) showMessage("info", t("ui.messages.noMore"));
    hasInformed.value = true;
    return;
  }
  const getRelationsRes = await getData("/Users/GetRelations", {
    UserID: userid,
    DisplayType: type,
    Skip: skip.value,
    Take: 24,
    Query: "",
  });
  // 在某些地方用的skip传入的是时间戳，但是这里找不到可能与时间戳有关的逻辑，skip为整数也能work
  // In some places, the 'skip' is a timestamp, but here there doesn't seem to be any logic related to the timestamp; 'skip' as an integer also works.
  noMore.value = getRelationsRes.Data.$values.length < 24;
  loading.value = false;
  skip.value += 24;
  items.value = [...items.value, ...getRelationsRes.Data.$values];
}

window.$Logger.logPageView({
  pageLink: `/Social/Friends/${Number(type)}/`,
  timeStamp: Date.now(),
});

handleLoad();
</script>

<style scoped></style>
