<script setup lang="ts">
// No props required for this section
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
                  Gang Kelapa Gading RT 02 / RW 01, Kel. Wates, Kec. Ngaliyan,<br />Semarang Barat,
                  Jawa Tengah
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
                  Phone: 0851-6860-2728<br />Email: gym@arlettaluxury.com<br />Instagram:
                  @arletta.gym
                </p>
              </div>
            </div>
          </div>
        </div>
        <div
          class="rounded-2xl overflow-hidden h-80 bg-white/5"
          v-animateonscroll="{ enterClass: 'animate-scalein', leaveClass: 'animate-fadeout' }"
        >
          <!-- Embedded Google Map for interactive location -->
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1979.956584062852!2d110.33500179073792!3d-7.019492570567144!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708b001478d139%3A0xf40ddc5c17cc4434!2sARLETTA%20GYM!5e0!3m2!1sen!2sid!4v1774884111212!5m2!1sen!2sid" width="600" height="450" style="border:0;" :allowfullscreen="true" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </div>
    </div>
  </section>
</template>
