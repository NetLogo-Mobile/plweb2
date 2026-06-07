<template>
  <div id="stage" ref="stageRef">
    <!-- dot and logo -->
    <div id="charContainer" ref="charContainerRef" class="character-container bouncing">
      <div id="dot1" class="dot-wrapper"><div class="inner-dot"></div></div>
      <div id="dot2" class="dot-wrapper"><div class="inner-dot"></div></div>
      <div id="dot3" class="dot-wrapper"><div class="inner-dot"></div></div>
      <div id="dot4" class="dot-wrapper"><div class="inner-dot"></div></div>
      <div id="dot5" class="dot-wrapper"><div class="inner-dot"></div></div>
    </div>

    <!-- search bar -->
    <div id="searchBar" ref="searchBarRef" class="search-bar" :class="{ active: searchActive }">
      <div id="searchLogoPlaceholder" ref="searchLogoPlaceholderRef" class="search-logo">
        <!-- Search context will be dynamically inserted here -->
      </div>
      <div class="search-input-container">
        <span id="typed-text">{{ typedText }}</span>
        <div class="cursor"></div>
      </div>
      <svg class="search-icon" viewBox="0 0 24 24" @click="openGithubLink">
        <path
          d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
        />
      </svg>
    </div>

    <!-- pl-card -->
    <div
      id="banknoteCard"
      ref="banknoteCardRef"
      class="banknote-card"
      :class="{ show: banknoteShow }"
    >
      <div class="card-header">
        <div class="denom">plweb2</div>
        <div class="card-meta">
          <div @click="openGithubLink">hosted by netlogo-mobile</div>
        </div>
      </div>
      <div class="card-bg-geometric"></div>
      <div class="bulb-watermark">
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          style="width: 100%; height: 100%"
        >
          <path
            d="M 28 46 A 22 22 0 1 1 72 46"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <path
            d="M 28 54 C 28 65, 38 71, 38 75"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <path
            d="M 72 54 C 72 65, 62 71, 62 75"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <path
            d="M 18 50 L 37 50 L 42 38 L 47 62 L 52 28 L 57 58 L 62 50 L 82 50"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
          <path
            d="M 38 75 C 38 75, 50 77, 62 75"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <path
            d="M 39 81 C 39 81, 50 83, 61 81"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <path
            d="M 43 87 C 43 87, 50 89, 57 87"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </div>
      <div class="card-footer">
        <div class="serial">No. {{ userId }}</div>
        <div class="card-brand">v{{ sysConfig.version }} ({{ sysConfig.buildHash }})</div>
      </div>
    </div>

    <!-- slogan -->
    <div id="sloganText" class="slogan" :class="{ show: sloganShow }">
      <span>Build</span> <span>Community</span> <span>Together</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import sysConfig from '../config/system.config'
import storageManager from '@storage/index'

const userId = storageManager.getObj('userInfo').value?.ID

const charContainerRef = ref(null)
const searchBarRef = ref(null)
const searchLogoPlaceholderRef = ref(null)
const stageRef = ref(null)
const banknoteCardRef = ref(null)

const typedText = ref('')
const searchActive = ref(false)
const banknoteShow = ref(false)
const sloganShow = ref(false)

const typingQueue = [
  { text: 'Connect community everywhere', action: 'type' },
  { text: 'Connect community everywhere', action: 'wait', duration: 800 },
  { text: 'Connect community everywhere', action: 'backspace' },
  { text: 'More advanced features', action: 'type' },
  { text: 'More advanced features', action: 'wait', duration: 800 },
  { text: 'More advanced features', action: 'backspace' },
  { text: 'do i need to write sth more?', action: 'type' },
  { text: 'do i need to write sth more?', action: 'wait', duration: 800 },
  { text: 'do i need to write sth more?', action: 'backspace' },
  { text: 'What are you waiting for?', action: 'type' },
  { text: 'What are you waiting for?', action: 'wait', duration: 800 },
  { text: 'What are you waiting for?', action: 'backspace' },
  { text: 'There will be nothing......', action: 'type' },
  { text: 'There will be nothing......', action: 'wait', duration: 800 },
  { text: 'There will be nothing......', action: 'backspace' },
  { text: 'Boom!', action: 'type' },
  { text: 'Boom!', action: 'wait', duration: 12000 },
  { text: 'Boom!', action: 'backspace' },
  { text: 'Just kidding....', action: 'type' },
  { text: 'Just kidding....', action: 'wait', duration: 800 },
  { text: 'Just kidding....', action: 'backspace' },
  { text: ' You will not recieve an achievement', action: 'type' },
  { text: ' You will not recieve an achievement', action: 'wait', duration: 800 },
]

function runTypingEffect(callback) {
  let step = 0
  function executeNext() {
    if (step >= typingQueue.length) {
      if (callback) callback()
      return
    }
    const current = typingQueue[step]
    if (current.action === 'type') {
      let i = 0
      const interval = setInterval(() => {
        typedText.value += current.text[i]
        i++
        if (i >= current.text.length) {
          clearInterval(interval)
          step++
          setTimeout(executeNext, 200)
        }
      }, 60)
    } else if (current.action === 'backspace') {
      let text = typedText.value
      const interval = setInterval(() => {
        text = text.substring(0, text.length - 1)
        typedText.value = text
        if (text.length === 0) {
          clearInterval(interval)
          step++
          setTimeout(executeNext, 300)
        }
      }, 30)
    } else if (current.action === 'wait') {
      setTimeout(() => {
        step++
        executeNext()
      }, current.duration)
    }
  }
  executeNext()
}

onMounted(() => {
  const charContainer = charContainerRef.value
  const searchLogoPlaceholder = searchLogoPlaceholderRef.value
  const stage = stageRef.value

  // Innitial dots
  setTimeout(() => {
    if (charContainer) charContainer.classList.remove('bouncing')
    // Turn dots into "PL" shape
    if (charContainer) charContainer.classList.add('morphing')
  }, 2500)

  // Move "PL" into search bar and expand it
  setTimeout(() => {
    if (searchLogoPlaceholder && charContainer) searchLogoPlaceholder.appendChild(charContainer)
    searchActive.value = true
  }, 4200)

  // Run typing effect
  setTimeout(() => {
    runTypingEffect(() => {
      // Show pl-card
      setTimeout(() => {
        if (stage) stage.classList.add('stage-up')
        banknoteShow.value = true
        sloganShow.value = true
        setTimeout(() => {
          searchActive.value = false
        }, 200)
      }, 500)
    })
  }, 5200)
})

function openGithubLink() {
  window.open(sysConfig.links.github, '_blank')
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#stage {
  position: relative;
  width: 100%;
  max-width: 98vw;
  height: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  perspective: 1000px;
}

.character-container {
  position: relative;
  width: 150px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 1s cubic-bezier(0.77, 0, 0.175, 1);
}
.dot-wrapper {
  position: absolute;
  border-radius: 50%;
  transition: all 1.2s cubic-bezier(0.77, 0, 0.175, 1);
}
.inner-dot {
  width: 100%;
  height: 100%;
  background-color: inherit;
  border-radius: inherit;
}
#dot1 {
  width: 16px;
  height: 16px;
  background-color: #34a853;
  transform: translate(-60px, 0);
}
#dot2 {
  width: 16px;
  height: 16px;
  background-color: #ea4335;
  transform: translate(-30px, 0);
}
#dot3 {
  width: 16px;
  height: 16px;
  background-color: #fbbc05;
  transform: translate(0px, 0);
}
#dot4 {
  width: 16px;
  height: 16px;
  background-color: #ff9900;
  transform: translate(30px, 0);
}
#dot5 {
  width: 16px;
  height: 16px;
  background-color: #4285f4;
  transform: translate(60px, 0);
}
.bouncing .inner-dot {
  animation: bounce 1.2s infinite ease-in-out;
}
#dot1 .inner-dot {
  animation-delay: 0s;
}
#dot2 .inner-dot {
  animation-delay: 0.15s;
}
#dot3 .inner-dot {
  animation-delay: 0.3s;
}
#dot4 .inner-dot {
  animation-delay: 0.45s;
}
#dot5 .inner-dot {
  animation-delay: 0.6s;
}
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

.morphing #dot1 {
  width: 32px;
  height: 10px;
  transform: translate(-1px, -25px);
  border-radius: 4px;
}
.morphing #dot2 {
  width: 42px;
  height: 10px;
  transform: translate(4px, 25px);
  border-radius: 4px;
}
.morphing #dot3 {
  width: 10px;
  height: 60px;
  transform: translate(-15px, 0px);
  border-radius: 5px;
}
.morphing #dot4 {
  width: 32px;
  height: 10px;
  transform: translate(-1px, 0px);
  border-radius: 4px;
}
.morphing #dot5 {
  width: 10px;
  height: 35px;
  transform: translate(10px, -12.5px);
  border-radius: 4px;
}

.search-bar {
  position: absolute;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #dfe1e5;
  border-radius: 30px;
  width: 60px;
  height: 60px;
  padding: 0 15px;
  box-shadow: 0 1px 6px rgba(32, 33, 36, 0.1);
  transition: all 0.8s cubic-bezier(0.77, 0, 0.175, 1);
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
}
.search-bar.active {
  width: 480px;
  opacity: 1;
  pointer-events: auto;
}
.search-logo {
  transform: scale(0.35);
  width: 150px;
  height: 150px;
  position: relative;
  flex-shrink: 0;
  margin-left: -45px;
}
.search-input-container {
  flex-grow: 1;
  margin-left: -35px;
  font-size: 18px;
  color: #202124;
  display: flex;
  align-items: center;
}
#typed-text {
  font-weight: 500;
  white-space: pre;
}
.cursor {
  width: 2px;
  height: 20px;
  background-color: #4285f4;
  margin-left: 2px;
  animation: blink 0.8s infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}
.search-icon {
  width: 20px;
  height: 20px;
  fill: #9aa0a6;
  transition: fill 0.3s;
}
.stage-up {
  transform: translateY(-120px);
  transition: transform 1.2s cubic-bezier(0.77, 0, 0.175, 1);
}

.banknote-card {
  position: absolute;
  bottom: -300px;
  width: 420px;
  height: 230px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 4px solid #ffffff;
  opacity: 0;
  transform: scale(0.8) rotateX(10deg);
  transition: all 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  overflow: hidden;
}
.banknote-card.show {
  bottom: 20%;
  opacity: 1;
  transform: scale(1) rotateX(0);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 2;
}
.denom {
  font-size: 48px;
  font-weight: 900;
  color: #3a506b;
  line-height: 1;
  font-family: 'Georgia', serif;
}
.card-meta {
  text-align: right;
  font-size: 10px;
  color: #5c6b73;
  line-height: 1.4;
}
.card-bg-geometric {
  position: absolute;
  right: -20px;
  bottom: 0px;
  width: 320px;
  height: 180px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(66, 133, 244, 0.12) 40%,
    rgba(234, 67, 53, 0.08) 80%
  );
  clip-path: polygon(0 80%, 60% 80%, 100% 20%, 100% 100%, 0 100%);
  transform: skewX(-15deg);
  z-index: 1;
  pointer-events: none;
}
.bulb-watermark {
  position: absolute;
  right: 25px;
  bottom: 15px;
  width: 140px;
  height: 140px;
  color: #3a506b;
  opacity: 0.18;
  transform: rotate(-10deg);
  z-index: 1;
  pointer-events: none;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  z-index: 2;
}
.serial {
  font-family: 'Courier New', Courier, monospace;
  font-size: 11px;
  color: #2b2d42;
  letter-spacing: 1px;
}
.card-brand {
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 2px;
  color: #3a506b;
  text-transform: uppercase;
}

.slogan {
  position: absolute;
  bottom: -50px;
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 1px;
  opacity: 0;
  transition: all 1s ease 0.5s;
}
.slogan.show {
  bottom: -15px;
  opacity: 1;
}
.slogan span:nth-child(1) {
  color: #4285f4;
}
.slogan span:nth-child(2) {
  color: #202124;
}
.slogan span:nth-child(3) {
  color: #ff9900;
}

@media screen and (orientation: portrait) {
  #stage {
    max-width: 90vw;
    height: 520px;
  }

  .search-bar.active {
    width: 85%;
  }

  .character-container {
    width: 120px;
    height: 120px;
  }

  .banknote-card {
    width: 320px;
    height: 180px;
    bottom: -220px;
    transform-origin: center;
  }

  .banknote-card.show {
    bottom: 32%;
  }

  .denom {
    font-size: 36px;
  }

  .card-meta {
    font-size: 9px;
  }

  .slogan {
    font-size: 20px;
  }

  .search-logo {
    transform: scale(0.28);
    margin-left: -30px;
  }
}
</style>
