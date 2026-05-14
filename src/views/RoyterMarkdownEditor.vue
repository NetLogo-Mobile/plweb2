<template>
  <div class="royter-editor-page">
    <header class="editor-header">
      <button class="back-button" type="button" @click="goBack">‹</button>
      <div>
        <h1>{{ t("royterEditor.title") }}</h1>
      </div>
      <button class="primary-button" type="button" :disabled="!isLoggedIn" @click="loadWorks">
        {{ t("royterEditor.refreshWorks") }}
      </button>
    </header>

    <main v-if="isLoggedIn" class="editor-shell">
      <aside class="work-sidebar">
        <n-input
          v-model:value="searchKeyword"
          :placeholder="t('royterEditor.searchPlaceholder')"
          clearable
        />
        <div class="work-list" :aria-label="t('royterEditor.workListAria')">
          <button
            v-for="work in filteredWorks"
            :key="work.id"
            class="work-item"
            :class="{ active: work.id === selectedWork?.id }"
            type="button"
            @click="selectWork(work.id)"
          >
            <span class="work-title">{{ work.subject }}</span>
            <span class="work-meta">{{ work.category }} · {{ work.language }}</span>
          </button>
          <p v-if="!loading && filteredWorks.length === 0" class="empty-tip">
            {{ t("royterEditor.emptyWorks") }}
          </p>
        </div>
      </aside>

      <section class="editor-main">
        <div v-if="selectedWork" class="editor-toolbar">
          <n-input
            v-model:value="editSubject"
            :placeholder="t('royterEditor.subjectPlaceholder')"
            class="subject-input"
          />
          <n-button type="primary" :loading="saving" :disabled="!dirty" @click="saveCurrentWork">
            {{ t("royterEditor.save") }}
          </n-button>
        </div>

        <div v-if="selectedWork" class="editor-grid">
          <div class="editor-card">
            <MdEditor
              v-model="editMarkdown"
              language="zh-CN"
              :preview="false"
              :html-preview="false"
              :toolbars-exclude="toolbarExcludes"
              :style="{ height: 'calc(100vh - 210px)' }"
            />
          </div>
          <section class="preview-card">
            <div class="preview-heading">
              <h2>{{ t("royterEditor.previewTitle") }}</h2>
              <span v-if="previewLoading">{{ t("royterEditor.rendering") }}</span>
            </div>
            <article class="adv-preview" v-html="previewHtml"></article>
          </section>
        </div>

        <div v-else class="placeholder-card">
          <n-spin v-if="loading" size="large" />
          <p v-else>{{ t("royterEditor.selectWork") }}</p>
        </div>
      </section>
    </main>

    <section v-else class="login-required">
      <h2>{{ t("royterEditor.loginRequiredTitle") }}</h2>
      <p>{{ t("royterEditor.loginRequiredContent") }}</p>
      <n-button type="primary" @click="showLoginModel">{{ t("royterEditor.login") }}</n-button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onActivated, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { MdEditor } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import { NButton, NInput, NSpin } from "naive-ui";
import { showLoginModel } from "@popup/index";
import { showMessage } from "@popup/naiveui";
import { checkLogin } from "@services/utils";
import parse from "@services/pltxt2htm/advancedParser";
import storageManager from "@storage/index";
import {
  fetchEditableWorks,
  getCurrentUserId,
  saveEditorWork,
  type EditorWork,
} from "@services/editor/cloudWorks";

const works = ref<EditorWork[]>([]);
const selectedId = ref("");
const loading = ref(false);
const saving = ref(false);
const previewLoading = ref(false);
const previewHtml = ref("");
const editSubject = ref("");
const editMarkdown = ref("");
const searchKeyword = ref("");
const isLoggedIn = ref(checkLogin(false));
let previewTicket = 0;
const { t } = useI18n();

const toolbarExcludes = ["htmlPreview", "catalog", "github"] as any;

const selectedWork = computed(
  () => works.value.find((work) => work.id === selectedId.value) || null,
);

const dirty = computed(() => {
  const work = selectedWork.value;
  return !!work && (work.subject !== editSubject.value || work.markdown !== editMarkdown.value);
});

const filteredWorks = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();
  if (!keyword) return works.value;
  return works.value.filter((work) => work.subject.toLowerCase().includes(keyword));
});

function goBack() {
  window.history.back();
}

function applyWork(work: EditorWork | null) {
  if (!work) return;
  editSubject.value = work.subject;
  editMarkdown.value = work.markdown;
}

function selectWork(id: string) {
  selectedId.value = id;
  applyWork(selectedWork.value);
}

async function loadWorks() {
  if (!checkLogin(true)) {
    isLoggedIn.value = false;
    return;
  }
  isLoggedIn.value = true;
  loading.value = true;
  try {
    works.value = await fetchEditableWorks();
    if (works.value.length > 0) {
      selectWork(works.value[0].id);
    } else {
      selectedId.value = "";
    }
  } catch (error) {
    showMessage("error", (error as Error).message, { duration: 4000 });
  } finally {
    loading.value = false;
  }
}

function isLatestPreview(ticket: number) {
  return ticket === previewTicket;
}

function buildPreviewContext(work: EditorWork | null) {
  return {
    project: editSubject.value,
    visitorId: storageManager.getObj("userInfo").value?.ID || getCurrentUserId(),
    authorId: work?.rawSummary.User?.ID || "",
    coauthorIds: work?.rawSummary.Coauthors?.map((user) => user.ID) || [],
  };
}

function setPreviewResult(ticket: number, html: string) {
  if (!isLatestPreview(ticket)) return;
  previewHtml.value = html || `<p class="empty-preview">${t("royterEditor.emptyPreview")}</p>`;
}

async function renderPreview() {
  const ticket = ++previewTicket;
  previewLoading.value = true;
  try {
    const html = await parse(
      editMarkdown.value,
      buildPreviewContext(selectedWork.value),
    );
    setPreviewResult(ticket, html);
  } catch (error) {
    setPreviewResult(
      ticket,
      `<p class=\"preview-error\">${(error as Error).message}</p>`,
    );
  } finally {
    if (isLatestPreview(ticket)) previewLoading.value = false;
  }
}

async function saveCurrentWork() {
  const work = selectedWork.value;
  if (!work) return;
  saving.value = true;
  try {
    await saveEditorWork(work, editMarkdown.value, editSubject.value);
    showMessage("success", t("royterEditor.saveSuccess"), { duration: 2500 });
  } catch (error) {
    showMessage("error", (error as Error).message, { duration: 5000 });
  } finally {
    saving.value = false;
  }
}

let previewTimer: number | undefined;
watch([editMarkdown, editSubject, selectedId], () => {
  window.clearTimeout(previewTimer);
  previewTimer = window.setTimeout(renderPreview, 250);
});

onMounted(() => {
  if (isLoggedIn.value) {
    loadWorks();
  }
});
onActivated(() => {
  isLoggedIn.value = checkLogin(false);
  window.$Logger?.logPageView({
    pageLink: "/royter",
    timeStamp: Date.now(),
  });
});
</script>

<style scoped>
.royter-editor-page {
  height: 100dvh;
  overflow: auto;
  background: #f4f7fb;
  color: #1f2937;
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.editor-header h1 {
  margin: 0;
  font-size: 22px;
}

.editor-header p {
  margin: 4px 0 0;
  color: #64748b;
}

.back-button,
.primary-button {
  border: 0;
  border-radius: 10px;
  cursor: pointer;
}

.back-button {
  width: 40px;
  height: 40px;
  font-size: 32px;
  line-height: 1;
  background: #eef2ff;
  color: #2563eb;
}

.primary-button {
  margin-left: auto;
  padding: 10px 16px;
  background: #2563eb;
  color: #ffffff;
}

.primary-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.editor-shell {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 16px;
  padding: 16px;
}

.work-sidebar,
.editor-main,
.login-required,
.placeholder-card,
.preview-card,
.editor-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.work-sidebar {
  padding: 14px;
  min-height: calc(100vh - 124px);
}

.work-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.work-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
  padding: 10px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: #f8fafc;
  cursor: pointer;
  text-align: left;
}

.work-item.active {
  border-color: #2563eb;
  background: #eff6ff;
}

.work-title {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 700;
}

.work-meta,
.empty-tip,
.preview-heading span {
  color: #64748b;
  font-size: 12px;
}

.editor-main {
  padding: 14px;
  min-width: 0;
}

.editor-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.subject-input {
  flex: 1;
}

.editor-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;
}

.editor-card,
.preview-card,
.placeholder-card,
.login-required {
  padding: 12px;
}

.preview-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 12px;
}

.preview-heading h2 {
  margin: 0 0 10px;
  font-size: 16px;
}

.adv-preview {
  height: calc(100vh - 260px);
  overflow: auto;
  line-height: 1.7;
  word-break: break-word;
}

:deep(.adv-preview img) {
  max-width: 100%;
}

:deep(.preview-error) {
  color: #dc2626;
}

.login-required,
.placeholder-card {
  max-width: 720px;
  margin: 64px auto;
  text-align: center;
}

@media (max-width: 980px) {
  .editor-shell,
  .editor-grid {
    grid-template-columns: 1fr;
  }

  .work-sidebar {
    min-height: auto;
  }
}
</style>
