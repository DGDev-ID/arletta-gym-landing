<script setup lang="ts">
import { ref } from 'vue'
type Faq = { question: string; answer: string }
const props = defineProps<{ faqs?: Faq[] }>()
const activeFaq = ref<number | null>(null)
const toggleFaq = (index: number) => {
  activeFaq.value = activeFaq.value === index ? null : index
}
</script>

<template>
  <section class="py-20">
    <div class="container-custom">
      <div class="max-w-3xl mx-auto">
        <h2
          v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
          class="text-2xl font-bold text-white text-center mb-12"
        >
          Frequently Asked Questions
        </h2>

        <div class="space-y-4">
          <div
            v-for="(faq, index) in props.faqs"
            :key="index"
            v-animateonscroll="{ enterClass: 'animate-fadein', leaveClass: 'animate-fadeout' }"
            class="glass-card rounded-xl overflow-hidden"
          >
            <button
              class="w-full px-6 py-4 flex items-center justify-between text-left"
              @click="toggleFaq(index)"
            >
              <span class="text-white font-medium">{{ faq.question }}</span>
              <i
                :class="[
                  'pi transition-transform',
                  activeFaq === index ? 'pi-minus rotate-180' : 'pi-plus',
                  'text-(--primary)',
                ]"
              ></i>
            </button>
            <div v-if="activeFaq === index" class="px-6 pb-4 text-(--text-secondary)">
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
