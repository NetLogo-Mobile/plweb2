import { computed, onMounted, onUnmounted, ref } from 'vue'

const breakpoints = {
  mobile: 0,
  phone: 360,
  tablet: 640,
  laptop: 960,
  desktop: 1400,
  wide: 1800,
}

function getViewportHeight() {
  // Avoid mobile keyboard / visualViewport changes causing layout jitter.
  // Keep layout height based on layout viewport instead of visual viewport.
  return Math.round(window.innerHeight)
}

function getBlockItemsPerRow(w: number) {
  if (w >= breakpoints.wide) return 4
  if (w >= breakpoints.laptop) return 3
  if (w >= breakpoints.tablet) return 2
  return 1
}

function getFriendItemsPerRow(w: number) {
  if (w >= breakpoints.wide) return 5
  if (w >= breakpoints.desktop) return 4
  if (w >= breakpoints.laptop) return 3
  if (w >= breakpoints.phone) return 2
  return 1
}

function getMaxProjectsPerLine(w: number) {
  const horizontalPadding = w < breakpoints.tablet ? 32 : 48
  const minCardWidth = w < breakpoints.phone ? 136 : w < 540 ? 150 : 188
  return Math.max(1, Math.floor((w - horizontalPadding) / minCardWidth))
}

function getProjectsHeight(w: number) {
  if (w < breakpoints.phone) return '108px'
  if (w < breakpoints.tablet) return '118px'
  if (w < 820) return '128px'
  return '140px'
}

function getFontSizeM(w: number) {
  if (w >= breakpoints.wide) return '20px'
  if (w >= breakpoints.desktop) return '18px'
  if (w >= breakpoints.laptop) return '16px'
  if (w >= breakpoints.tablet) return '15px'
  if (w >= breakpoints.phone) return '14px'
  return '13px'
}

function getFontSizeS(w: number) {
  if (w >= breakpoints.wide) return '16px'
  if (w >= 650) return '15px'
  if (w >= breakpoints.phone) return '13px'
  return '12px'
}

/**
 * Provide shared width/height responsive refs for layout decisions.
 */
export function useResponsive() {
  const width = ref(window.innerWidth)
  const height = ref(getViewportHeight())

  const blockItemsPerRow = ref(getBlockItemsPerRow(width.value))
  const maxProjectsPerLine = ref(getMaxProjectsPerLine(width.value))
  const maxProjectsPerBlock = ref(Math.max(4, maxProjectsPerLine.value))
  const fontSizeM = ref(getFontSizeM(width.value))
  const friendItemsPerRow = ref(getFriendItemsPerRow(width.value))
  const projectsHeight = ref(getProjectsHeight(width.value))
  const fontSizeS = ref(getFontSizeS(width.value))

  const isPortrait = computed(() => height.value >= width.value)
  const isCompact = computed(() => width.value < breakpoints.tablet || height.value < 680)
  const isUltraCompact = computed(() => width.value < breakpoints.phone || height.value < 520)
  const shouldCollapseTabs = computed(() => width.value < 720 || height.value < 560)

  function handleResize() {
    width.value = window.innerWidth
    height.value = getViewportHeight()
    blockItemsPerRow.value = getBlockItemsPerRow(width.value)
    maxProjectsPerLine.value = getMaxProjectsPerLine(width.value)
    maxProjectsPerBlock.value = Math.max(4, maxProjectsPerLine.value)
    fontSizeM.value = getFontSizeM(width.value)
    fontSizeS.value = getFontSizeS(width.value)
    friendItemsPerRow.value = getFriendItemsPerRow(width.value)
    projectsHeight.value = getProjectsHeight(width.value)
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('orientationchange', handleResize, {
      passive: true,
    })
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('orientationchange', handleResize)
  })

  return {
    width,
    height,
    blockItemsPerRow,
    friendItemsPerRow,
    maxProjectsPerLine,
    maxProjectsPerBlock,
    fontSizeM,
    fontSizeS,
    breakpoints,
    projectsHeight,
    isPortrait,
    isCompact,
    isUltraCompact,
    shouldCollapseTabs,
  }
}
