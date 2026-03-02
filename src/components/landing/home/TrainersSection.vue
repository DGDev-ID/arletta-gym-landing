<script setup lang="ts">
import { ref } from 'vue'

const trainers = ref([
  {
    name: 'Sandy Wibowo',
    specialty: 'Prepare for body contest, Fat loss, Muscle gain',
    image: '/sandy.svg',
  },
  {
    name: 'Rita Lestari',
    specialty: 'Weight loss, Fat loss, Body shaping',
    image: '/rita.svg',
  },
])
</script>

<template>
  <section id="trainers" class="section-padding bg-(--bg-dark)">
    <div class="container-custom">
      <div
        v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
        class="text-center mb-12"
      >
        <h2 class="heading-lg text-white mb-4">
          Meet Our <span class="text-gradient">Expert Trainers</span>
        </h2>
        <p class="text-(--text-secondary) max-w-xl mx-auto">
          Our certified personal trainers are here to guide you on your fitness journey with
          personalized programs and expert knowledge.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="trainer in trainers"
          :key="trainer.name"
          v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
          class="dark-card overflow-hidden group"
        >
          <div class="relative h-72 overflow-hidden">
            <img
              :src="trainer.image"
              :alt="trainer.name"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div
              class="absolute inset-0 bg-linear-to-t from-(--bg-card) via-transparent to-transparent"
            ></div>
          </div>

          <div class="p-6 text-center">
            <h3 class="text-xl font-semibold text-white mb-1">{{ trainer.name }}</h3>
            <p class="text-sm text-(--primary)">{{ trainer.specialty }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
