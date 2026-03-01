import { ref, onUnmounted } from 'vue'

export function useCountUp(target: number, duration: number = 2000) {
  const count = ref(0)
  let observer: IntersectionObserver | null = null
  let animationFrame: number | null = null
  let hasAnimated = false

  const animate = (_element?: Element) => {
    if (hasAnimated) return
    hasAnimated = true

    const start = 0
    const end = target
    const startTime = performance.now()

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)

      count.value = Math.floor(start + (end - start) * easeOut)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step)
      } else {
        count.value = end
      }
    }

    animationFrame = requestAnimationFrame(step)
  }

  const observe = (element: HTMLElement) => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target)
          }
        })
      },
      { threshold: 0.5 },
    )

    observer.observe(element)
  }

  const cleanup = () => {
    if (observer) {
      observer.disconnect()
    }
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame)
    }
  }

  onUnmounted(cleanup)

  return { count, observe }
}
