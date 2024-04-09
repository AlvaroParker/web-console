<script setup lang="ts">
import '@xterm/xterm/css/xterm.css'
// const props = defineProps<{ url: string }>()

const containerContent = [{
    index: 0,
    title: 'Ubuntu 22.04',
    description: 'Ubuntu 22.04 Long term support with default packages',
    svg: ''
}]

</script>

<template>
  <div class="flex-grow mt-5" >
    <div class="max-w-7xl mx-auto" v-for="item in containerContent" :key="item.index">
        <div class="relative group">
        <div class="absolute from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <div class="relative px-7 py-6 bg-gray-900 ring-1 ring-gray-900/5 rounded-lg leading-none flex items-top justify-start space-x-6">
            <svg class="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 19H21M3 5L11 12L3 19"></path>
            </svg>
            <div class="space-y-2">
            <h3 class="text-gray-400 text-2xl">{{ item.title }}</h3>
            <p class="text-gray-400">{{ item.description }}</p>
            <RouterLink to="/terminal" class="block text-green-400 group-hover:text-green-800 transition duration-200" target="_blank">Access Machine →</RouterLink>
            </div>
        </div>
        </div>
  </div>

  </div>
</template>

<style scoped></style>
