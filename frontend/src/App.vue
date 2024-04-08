<script setup lang="ts">
import Terminal from './components/Terminal.vue'
import Sidebar from './components/Sidebar.vue'
</script>

<template>
  <div class="flex h-screen bg-gray-800 text-gray-200">
    <Sidebar></Sidebar>
    <div class="flex-grow mx-5">
      <Terminal url="ws://127.0.0.1:8080/console/ws" />
    </div>
  </div>
</template>

<style scoped>
</style>
