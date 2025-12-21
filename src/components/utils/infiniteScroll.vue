<template>
  <!-- 我再也无法忍受naiveui监听滚动条这一不靠谱的行为了 -->
  <div ref="scrollContainer" class="scroll-container">
    <slot :items="items"></slot>
    <div ref="sentinel" class="observer-element"></div>
  </div>
</template>

<script setup lang="ts">
// 通过观察哨兵元素触发加载事件 To trigger load events by observing sentinel elements
// <template>
//   <InfiniteScroll
//     :initial-items="initialData"
//     :has-more="hasMore"
//     :load-fn="fetchData"
//   >
//     <template #default="{ items }">
//       <div v-for="item in items" :key="item.id">
//         <!-- 这里把数据控制权交给父组件  Here the data control is transferred to the parent component -->
//         {{ item.content }}
//       </div>
//     </template>

//     <template #loading>
//       在加载时展示 show while loading
//     </template>
//   </InfiniteScroll>
// </template>

import { ref, onMounted, onUnmounted, watch } from "vue";

const props = defineProps({
  initialItems: {
    type: Array,
    default: () => [],
  },
  hasMore: Boolean,
  scrollTarget: {
    type: String,
    default: null,
  },
  marginTop: {
    type: Number,
    default: -800,
  },
});

const emit = defineEmits(["load"]);

const sentinel = ref<HTMLElement>();
const items = ref([...props.initialItems]);
const loading = ref(false);
const noMore = ref(!props.hasMore);
let observer: IntersectionObserver;

const initObserver = () => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !loading.value && !noMore.value) {
          handleLoad();
        }
      });
    },
    {
      root: props.scrollTarget
        ? document.querySelector(props.scrollTarget)
        : null,
      rootMargin: "200px",
      threshold: 0.1,
    },
  );

  if (sentinel.value) observer.observe(sentinel.value);
  sentinel.value?.style.setProperty("margin-top", `${props.marginTop}px`);
};

const handleLoad = async () => {
  try {
    loading.value = true;
    emit("load");
  } finally {
    loading.value = false;
  }
};

// 重置状态
const reset = () => {
  items.value = [...props.initialItems];
  noMore.value = !props.hasMore;
};

watch(
  () => props.hasMore,
  (val) => {
    noMore.value = !val;
  },
);

watch(
  () => props.initialItems,
  (newVal) => {
    items.value = [...newVal];
  },
  { deep: true },
);

onMounted(initObserver);
onUnmounted(() => observer?.disconnect());

defineExpose({ reset });
</script>

<style scoped>
.scroll-container {
  height: 100%;
  overflow-y: auto;
}

.observer-element {
  height: 10px;
  visibility: hidden;
  background-color: red;
  margin-top: -100px;
}

.status-text {
  text-align: center;
  padding: 12px;
  color: #666;
  font-size: 0.9em;
}
</style>
