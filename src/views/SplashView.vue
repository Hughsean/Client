<template>
  <Transition name="splash-fade">
    <div v-if="!isTransitioning" class="splash-container">
      <!-- 动态渐变背景层 -->
      <div class="gradient-overlay"></div>
      
      <!-- 视频层 -->
      <video
        ref="videoRef"
        class="splash-video"
        autoplay
        muted
        playsinline
        @ended="handleVideoEnd"
        @error="handleVideoError"
      >
        <source :src="videoSrc" type="video/mp4" />
        您的浏览器不支持视频播放。
      </video>
      
      <!-- 光效层 -->
      <div class="light-effects">
        <div class="light-beam light-beam-1"></div>
        <div class="light-beam light-beam-2"></div>
        <div class="light-beam light-beam-3"></div>
      </div>
      
      <!-- 可选：跳过按钮 -->
      <Transition name="button-fade">
        <button class="skip-button" @click="skipToMain" v-if="showSkipButton">
          <span class="skip-text">跳过</span>
          <span v-if="countdown > 0" class="countdown">{{ countdown }}</span>
        </button>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const videoRef = ref<HTMLVideoElement>()
const showSkipButton = ref(false)
const countdown = ref(3)
const isTransitioning = ref(false)

// 视频源 - 请将您的视频文件放在 public 目录下
const videoSrc = '/splash-video.mp4'

let countdownTimer: number | undefined
let skipButtonTimer: number | undefined

onMounted(() => {
  // 3秒后显示跳过按钮
  skipButtonTimer = window.setTimeout(() => {
    showSkipButton.value = true
    startCountdown()
  }, 3000)
  
  // 确保视频静音播放
  if (videoRef.value) {
    videoRef.value.muted = true
  }
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  if (skipButtonTimer) {
    clearTimeout(skipButtonTimer)
  }
})

const startCountdown = () => {
  countdownTimer = window.setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    }
  }, 1000)
}

const handleVideoEnd = () => {
  navigateToMain()
}

const handleVideoError = (error: Event) => {
  console.error('视频加载失败:', error)
  // 如果视频加载失败，3秒后自动跳转
  setTimeout(() => {
    navigateToMain()
  }, 3000)
}

const skipToMain = () => {
  navigateToMain()
}

const navigateToMain = () => {
  // 开始过渡动画
  isTransitioning.value = true
  
  // 等待过渡动画完成后再跳转
  setTimeout(() => {
    router.replace({ name: 'Users' })
  }, 800) // 与 CSS 过渡时间匹配
}
</script>

<style scoped>
.splash-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0d1117 0%, #1a1f2e 50%, #0d1117 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
}

/* 动态渐变背景层 */
.gradient-overlay {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at center,
    rgba(255, 193, 49, 0.15) 0%,
    rgba(36, 200, 219, 0.15) 50%,
    transparent 70%
  );
  animation: rotateGradient 20s linear infinite;
  z-index: 1;
}

@keyframes rotateGradient {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.2);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

/* 视频层 */
.splash-video {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 2;
  opacity: 0;
  animation: videoFadeIn 1s ease-out 0.3s forwards;
}

@keyframes videoFadeIn {
  0% {
    opacity: 0;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 光效层 */
.light-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3;
  overflow: hidden;
}

.light-beam {
  position: absolute;
  width: 2px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(255, 193, 49, 0.8) 50%,
    transparent 100%
  );
  opacity: 0;
  animation: lightBeam 3s ease-in-out infinite;
}

.light-beam-1 {
  left: 20%;
  animation-delay: 0s;
}

.light-beam-2 {
  left: 50%;
  animation-delay: 1s;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(36, 200, 219, 0.8) 50%,
    transparent 100%
  );
}

.light-beam-3 {
  left: 80%;
  animation-delay: 2s;
}

@keyframes lightBeam {
  0%, 100% {
    opacity: 0;
    transform: translateY(-100%) scaleY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(0) scaleY(1);
  }
}

/* 跳过按钮 */
.skip-button {
  position: absolute;
  bottom: 40px;
  right: 40px;
  padding: 14px 28px;
  background: linear-gradient(135deg, rgba(255, 193, 49, 0.2), rgba(36, 200, 219, 0.2));
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.skip-button:hover {
  background: linear-gradient(135deg, rgba(255, 193, 49, 0.35), rgba(36, 200, 219, 0.35));
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 12px 40px rgba(255, 193, 49, 0.3);
}

.skip-button:active {
  transform: translateY(0) scale(0.98);
}

.skip-text {
  letter-spacing: 0.5px;
}

.countdown {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* 页面过渡动画 */
.splash-fade-enter-active {
  animation: splashEnter 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.splash-fade-leave-active {
  animation: splashLeave 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes splashEnter {
  0% {
    opacity: 0;
    transform: scale(1.1);
    filter: blur(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
}

@keyframes splashLeave {
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
    filter: blur(10px);
  }
}

/* 按钮过渡动画 */
.button-fade-enter-active {
  animation: buttonEnter 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.button-fade-leave-active {
  animation: buttonLeave 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes buttonEnter {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes buttonLeave {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(10px) scale(0.9);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .skip-button {
    bottom: 24px;
    right: 24px;
    padding: 12px 20px;
    font-size: 14px;
  }
  
  .light-beam {
    width: 1px;
  }
}
</style>
