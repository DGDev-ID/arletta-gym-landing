<script setup lang="ts">
const props = defineProps<{ timeline: { year: string; event: string }[] }>()
</script>

<template>
  <section class="py-20 bg-(--bg-darker)">
    <div class="container-custom">
      <h2
        v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
        class="text-3xl font-bold text-white text-center mb-12"
      >
        Perjalanan Kami
      </h2>
      <div class="max-w-3xl mx-auto">
        <div class="relative">
          <div
            class="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-(--primary)/30 -translate-x-1/2"
          ></div>
          <div
            v-for="(item, index) in props.timeline"
            :key="item.year"
            class="relative mb-8 last:mb-0"
          >
            <div
              :class="[
                'md:flex items-center',
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse',
              ]"
            >
              <div
                class="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-(--primary) -translate-x-1/2 z-10"
              ></div>
              <div
                :class="[
                  'ml-12 md:ml-0 md:w-1/2',
                  index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12',
                ]"
              >
                <div
                  v-animateonscroll="{
                    enterClass: 'animate-fadein',
                    leaveClass: 'animate-fadeout',
                  }"
                  class="glass-card p-4 rounded-xl inline-block"
                >
                  <div class="text-(--primary) font-bold mb-1">{{ item.year }}</div>
                  <div class="text-white">{{ item.event }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
