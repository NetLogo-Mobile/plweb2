import { ref, onMounted, onUnmounted } from "vue";

const breakpoints = {
  mobile: 0,
  tablet: 500,
  laptop: 1000,
  desktop: 1400,
  wide: 1800,
};

/**
 * 依据当前窗口宽度计算响应式布局参数
 * A composable function that provides responsive layout values (ref) based on the current window width.
 *
 * @returns {Object} 会在响应式变化时自动更新的响应式布局参数对象。Reactive references automatically update when the window is resized.
 *
 * @example
 * ```typescript
 * const { width, blockItemsPerRow, maxProjectsPerBlock, fontSize } = useResponsive();
 * ```
 * ```vue
 * <My :param="fontsize"></My>
 * ```
 */
// eslint-disable-next-line max-lines-per-function
export function useResponsive() {
  const width = ref(window.innerWidth);

  const blockItemsPerRow = ref(getBlockItemsPerRow(width.value));
  const maxProjectsPerLine = ref(getMaxProjectsPerLine(width.value));
  const maxProjectsPerBlock = ref(Math.max(5, maxProjectsPerLine.value));
  const fontSizeM = ref(getFontSizeM(width.value));
  const friendItemsPerRow = ref(getFriendItemsPerRow(width.value));
  const projectsHeight = ref(getProjectsHeight(width.value));
  const fontSizeS = ref(getFontSizeS(width.value));

  // 首页等展示的盒子数量
  // The number of boxes displayed on the homepage
  function getBlockItemsPerRow(w: number) {
    if (w >= breakpoints.wide) return 4;
    if (w >= breakpoints.laptop) return 3;
    if (w >= breakpoints.tablet) return 2;
    return 1;
  }

  // 好友界面展示的盒子数量
  // The number of boxes displayed on the friends.vue
  function getFriendItemsPerRow(w: number) {
    if (w >= breakpoints.wide) return 5;
    if (w >= breakpoints.desktop) return 4;
    if (w >= breakpoints.laptop) return 3;
    return 2;
  }

  //  WorkList界面每行的作品盒子数量
  // The number of work boxes per line in the WorkList page
  function getMaxProjectsPerLine(w: number) {
    if (w <= 800) return Math.round(w / 200);
    return Math.round(w / 240);
  }

  function getProjectsHeight(w: number) {
    if (w <= 800) return "120px";
    return "140px";
  }

  // ExperimentSummary字体大小
  // The font size of the ExperimentSummary
  function getFontSizeM(w: number) {
    if (w >= breakpoints.wide) return "20px";
    if (w >= breakpoints.desktop) return "18px";
    if (w >= breakpoints.laptop) return "16px";
    if (w >= breakpoints.tablet) return "15px";
    return "14px";
  }

  function getFontSizeS(w: number) {
    if (w >= breakpoints.wide) return "16px";
    if (w >= 650) return "15px";
    return "13px";
  }

  function handleResize() {
    width.value = window.innerWidth;
    blockItemsPerRow.value = getBlockItemsPerRow(width.value);
    maxProjectsPerLine.value = getMaxProjectsPerLine(width.value);
    maxProjectsPerBlock.value = Math.max(5, maxProjectsPerLine.value);
    fontSizeM.value = getFontSizeM(width.value);
    fontSizeS.value = getFontSizeS(width.value);
    friendItemsPerRow.value = getFriendItemsPerRow(width.value);
    projectsHeight.value = getProjectsHeight(width.value);
  }

  onMounted(() => {
    window.addEventListener("resize", handleResize);
  });
  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
  });

  return {
    width,
    blockItemsPerRow,
    friendItemsPerRow,
    maxProjectsPerLine,
    maxProjectsPerBlock,
    fontSizeM,
    fontSizeS,
    breakpoints,
    projectsHeight,
  };
}
