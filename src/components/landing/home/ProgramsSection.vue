<script setup lang="ts">
import { ref } from 'vue'

const programs = ref([
  {
    title: 'Strength Training',
    description: 'Build muscle and increase power',
    icon: 'pi-bolt',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
  },
  {
    title: 'Cardio Blast',
    description: 'High-intensity heart-pumping workouts',
    icon: 'pi-heart',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop',
  },
  {
    title: 'Yoga & Flexibility',
    description: 'Mind-body connection and balance',
    icon: 'pi-sun',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
  },
  {
    title: 'CrossFit',
    description: 'Functional fitness at high intensity',
    icon: 'pi-flag',
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&h=300&fit=crop',
  },
])
</script>

<template>
  <section id="programs" class="section-padding bg-(--bg-darker)">
    <div class="container-custom">
      <div
        v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
        class="text-center mb-12"
      >
        <h2 class="heading-lg text-white mb-4">
          Our <span class="text-gradient">Class Programs</span>
        </h2>
        <p class="text-(--text-secondary) max-w-xl mx-auto">
          From high-intensity workouts to mindful movement, we have programs designed to help you
          reach your fitness goals.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="program in programs"
          :key="program.title"
          v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
          class="dark-card overflow-hidden group cursor-pointer"
        >
          <div class="relative h-48 overflow-hidden">
            <img
              :src="program.image"
              :alt="program.title"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div class="absolute inset-0 bg-linear-to-t from-(--bg-card) to-transparent"></div>
            <div
              class="absolute top-4 left-4 w-10 h-10 rounded-lg bg-(--primary) flex items-center justify-center"
            >
              <i :class="['pi', program.icon, 'text-white']"></i>
            </div>
          </div>

          <div class="p-5">
            <h3 class="text-lg font-semibold text-white mb-2">{{ program.title }}</h3>
            <p class="text-sm text-(--text-muted)">{{ program.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
