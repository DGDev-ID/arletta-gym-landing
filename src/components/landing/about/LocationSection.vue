<script setup lang="ts">
const props = defineProps<{}>()
</script>

<template>
  <section class="py-20 bg-(--bg-darker)">
    <div class="container-custom">
      <div class="grid lg:grid-cols-2 gap-12">
        <div>
          <h2
            v-animateonscroll="{ enterClass: 'animate-fadeinup', leaveClass: 'animate-fadeout' }"
            class="text-3xl font-bold text-white mb-6"
          >
            Visit Us
          </h2>
          <div class="space-y-6">
            <div
              class="flex items-start gap-4"
              v-animateonscroll="{ enterClass: 'animate-fadein', leaveClass: 'animate-fadeout' }"
            >
              <div
                class="w-10 h-10 rounded-full bg-(--primary)/20 flex items-center justify-center shrink-0"
              >
                <i class="pi pi-map-marker text-(--primary)"></i>
              </div>
              <div>
                <h4 class="text-white font-medium mb-1">Address</h4>
                <p class="text-(--text-muted)">
                  123 Fitness Street, Downtown District<br />New York, NY 10001
                </p>
              </div>
            </div>
            <div
              class="flex items-start gap-4"
              v-animateonscroll="{ enterClass: 'animate-fadein', leaveClass: 'animate-fadeout' }"
            >
              <div
                class="w-10 h-10 rounded-full bg-(--primary)/20 flex items-center justify-center shrink-0"
              >
                <i class="pi pi-clock text-(--primary)"></i>
              </div>
              <div>
                <h4 class="text-white font-medium mb-1">Hours</h4>
                <p class="text-(--text-muted)">
                  Members: 24/7 Access<br />Staffed Hours: Mon-Fri 6AM-10PM, Sat-Sun 8AM-8PM
                </p>
              </div>
            </div>
            <div
              class="flex items-start gap-4"
              v-animateonscroll="{ enterClass: 'animate-fadein', leaveClass: 'animate-fadeout' }"
            >
              <div
                class="w-10 h-10 rounded-full bg-(--primary)/20 flex items-center justify-center shrink-0"
              >
                <i class="pi pi-phone text-(--primary)"></i>
              </div>
              <div>
                <h4 class="text-white font-medium mb-1">Contact</h4>
                <p class="text-(--text-muted)">
                  Phone: (555) 123-4567<br />Email: hello@arlettagym.com
                </p>
              </div>
            </div>
          </div>
        </div>
        <div
          class="rounded-2xl overflow-hidden h-80 bg-white/5"
          v-animateonscroll="{ enterClass: 'animate-scalein', leaveClass: 'animate-fadeout' }"
        >
          <div class="w-full h-full flex items-center justify-center text-(--text-muted)">
            <div class="text-center">
              <i class="pi pi-map text-4xl mb-2"></i>
              <p>Interactive Map</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
