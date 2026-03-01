<script setup lang="ts">
const props = defineProps<{ facilities: { name: string; description: string; image: string }[] }>()
</script>

<template>
  <section class="py-20">
    <div class="container-custom">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-white mb-4">World-Class Facilities</h2>
        <p class="text-(--text-secondary) max-w-2xl mx-auto">
          Our 15,000 sq ft facility is designed to support every aspect of your fitness journey.
        </p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          v-for="fac in props.facilities"
          :key="fac.name"
          class="group relative rounded-2xl overflow-hidden"
        >
          <img
            :src="fac.image"
            :alt="fac.name"
            class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div
            class="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent"
          ></div>
          <div class="absolute bottom-0 left-0 right-0 p-6">
            <h3 class="text-xl font-bold text-white mb-1">{{ fac.name }}</h3>
            <p class="text-(--text-secondary) text-sm">{{ fac.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
