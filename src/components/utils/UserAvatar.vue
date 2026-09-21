<template>
  <span class="user-avatar" :class="frame ? `user-avatar--${frame}` : ''">
    <img :src="src" :alt="alt" @error="fallback" />
    <span v-if="frame" class="user-avatar__frame" aria-hidden="true">
      <svg
        v-if="frame === 'prism'"
        class="user-avatar__ornament"
        viewBox="0 0 120 120"
        fill="none"
        focusable="false"
      >
        <circle cx="60" cy="60" r="48" stroke="#283658" stroke-width="5" />
        <circle cx="60" cy="60" r="49" stroke="#bfa5ef" stroke-width="1.5" />
        <circle cx="60" cy="60" r="44.5" stroke="#d2f4ff" stroke-width="1" />
        <path
          d="M18 43A46 46 0 0 1 43 18M77 18A46 46 0 0 1 102 43M102 77A46 46 0 0 1 77 102M43 102A46 46 0 0 1 18 77"
          stroke="#7cdeeb"
          stroke-width="3"
          stroke-linecap="round"
        />
        <path
          d="M60 1L65 10L78 9L72 21L60 17L48 21L42 9L55 10Z"
          fill="#34375f"
          stroke="#d6b7ff"
          stroke-width="1.3"
          stroke-linejoin="round"
        />
        <path d="M60 3L66 12L60 22L54 12Z" fill="#b5efff" />
        <path d="M60 3V22L66 12Z" fill="#957bd2" />
        <path
          d="M7 49L16 60L7 71L2 60ZM113 49L118 60L113 71L104 60Z"
          fill="#353960"
          stroke="#bdabef"
          stroke-width="1.2"
        />
        <path d="M7 53L12 60L7 67L5 60ZM113 53L115 60L113 67L108 60Z" fill="#9edeea" />
        <path
          d="M34 99L47 105L60 101L73 105L86 99L80 111L65 110L60 117L55 110L40 111Z"
          fill="#34375f"
          stroke="#c4a6ed"
          stroke-width="1.3"
          stroke-linejoin="round"
        />
        <path d="M60 104L64 109L60 114L56 109Z" fill="#c0f6ff" />
        <path
          d="M22 22L24 28L30 30L24 32L22 38L20 32L14 30L20 28ZM98 22L100 28L106 30L100 32L98 38L96 32L90 30L96 28Z"
          fill="#e8daff"
        />
        <circle cx="24" cy="90" r="2" fill="#b0eafa" />
        <circle cx="96" cy="90" r="2" fill="#b0eafa" />
      </svg>
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { visibleFrame, type FramedUser, type AvatarFrameId } from '../../services/avatarFrames'
import { getPath } from '../../services/utils'

const props = withDefaults(
  defineProps<{ src: string; alt?: string; user?: FramedUser; preview?: AvatarFrameId | null }>(),
  { alt: '' },
)
const frame = computed(() =>
  props.preview === undefined ? visibleFrame(props.user) : props.preview,
)
function fallback(event: Event) {
  const image = event.target as HTMLImageElement
  const url = getPath('/@base/assets/user/default-avatar.png')
  if (image.getAttribute('src') !== url) image.src = url
}
</script>

<style scoped>
.user-avatar {
  position: relative;
  display: inline-block;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  vertical-align: middle;
  border-radius: 50%;
}
.user-avatar img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
}
.user-avatar__frame {
  position: absolute;
  inset: -8%;
  border: 0.15em solid #0185c5;
  border-radius: inherit;
  pointer-events: none;
}
.user-avatar--orbit .user-avatar__frame {
  border-color: #0185c5;
  box-shadow:
    0 0 0 0.08em #bceaff,
    inset 0 0 0 0.08em #bceaff;
}
.user-avatar--laurel .user-avatar__frame {
  border: 0.22em double #b98b26;
  box-shadow: 0 0 0 0.07em #ffe7a0;
}
.user-avatar--prism .user-avatar__frame {
  inset: -18%;
  border: 0;
}
.user-avatar__ornament {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
