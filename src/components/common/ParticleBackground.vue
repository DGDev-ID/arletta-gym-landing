<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let particles: THREE.Points
let mouseX = 0
let mouseY = 0
let targetX = 0
let targetY = 0
let animationFrameId: number

const initThreeJS = () => {
  if (!canvasRef.value) return

  const parentElement = canvasRef.value.parentElement
  if (!parentElement) return

  // Scene setup
  scene = new THREE.Scene()

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    75,
    parentElement.clientWidth / parentElement.clientHeight,
    0.1,
    1000,
  )
  camera.position.z = 5

  // Renderer setup
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    alpha: true,
    antialias: true,
  })
  renderer.setSize(parentElement.clientWidth, parentElement.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // Create particles
  const particlesGeometry = new THREE.BufferGeometry()
  const particlesCount = 5000

  const posArray = new Float32Array(particlesCount * 3)
  const colorArray = new Float32Array(particlesCount * 3)

  // Primary color (orange-ish from gradient)
  const color1 = new THREE.Color(0xff6b35)
  // Secondary color (purple-ish from gradient)
  const color2 = new THREE.Color(0x8b5cf6)

  for (let i = 0; i < particlesCount * 3; i += 3) {
    // Position
    posArray[i] = (Math.random() - 0.5) * 15
    posArray[i + 1] = (Math.random() - 0.5) * 15
    posArray[i + 2] = (Math.random() - 0.5) * 15

    // Color - mix between two colors
    const mixRatio = Math.random()
    const color = color1.clone().lerp(color2, mixRatio)
    colorArray[i] = color.r
    colorArray[i + 1] = color.g
    colorArray[i + 2] = color.b
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3))

  // Create circular texture for particles
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 1)'
    ctx.beginPath()
    ctx.arc(16, 16, 16, 0, Math.PI * 2)
    ctx.fill()
  }
  const texture = new THREE.CanvasTexture(canvas)

  // Material
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.015,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    map: texture,
    alphaMap: texture,
    depthWrite: false,
  })

  // Mesh
  particles = new THREE.Points(particlesGeometry, particlesMaterial)
  scene.add(particles)

  // Animation
  let time = 0
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)
    time += 0.001

    // Smooth mouse follow
    targetX += (mouseX - targetX) * 0.02
    targetY += (mouseY - targetY) * 0.02

    // Combine mouse interaction with continuous wave motion
    particles.rotation.y = targetX * 0.0005 + Math.sin(time) * 0.3
    particles.rotation.x = targetY * 0.0005 + Math.cos(time * 0.7) * 0.2

    // Animate individual particles
    const posAttr = particles.geometry?.attributes?.position as THREE.BufferAttribute | undefined
    if (posAttr && posAttr.array) {
      const positions = posAttr.array as Float32Array
      for (let i = 0; i < positions.length; i += 3) {
        // With strict indexing flags positions[...] may be number | undefined
        // guard with nullish coalescing to ensure numbers
        const x = positions[i] ?? 0
        const y = positions[i + 1] ?? 0
        const z = positions[i + 2] ?? 0

        // Wave effect
        positions[i + 1] = y + Math.sin(time + x * 0.5) * 0.002
        positions[i + 2] = z + Math.cos(time + y * 0.5) * 0.002
      }
      posAttr.needsUpdate = true
    }

    // Render
    renderer.render(scene, camera)
  }

  animate()
}

const handleMouseMove = (event: MouseEvent) => {
  if (!canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  mouseX = event.clientX - rect.left - rect.width / 2
  mouseY = event.clientY - rect.top - rect.height / 2
}

const handleResize = () => {
  if (!camera || !renderer || !canvasRef.value) return

  const parentElement = canvasRef.value.parentElement
  if (!parentElement) return

  camera.aspect = parentElement.clientWidth / parentElement.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(parentElement.clientWidth, parentElement.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

onMounted(() => {
  initThreeJS()
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('resize', handleResize)

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }

  if (renderer) {
    renderer.dispose()
  }

  if (particles) {
    particles.geometry.dispose()
    if (particles.material instanceof THREE.Material) {
      particles.material.dispose()
    }
  }
})
</script>

<template>
  <canvas ref="canvasRef" class="particle-canvas"></canvas>
</template>

<style scoped>
.particle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
