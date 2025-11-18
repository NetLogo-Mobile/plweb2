<template>
  <div style="text-align: center; margin-top: 50px">
    <h1>{{ t("notfound.title") }}</h1>
    <img src="/assets/messages/Message-Default.png" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>
