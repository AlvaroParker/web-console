<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
</script>

<template>
  <div class="flex h-screen bg-gray-800 text-gray-200">
    <Sidebar></Sidebar>
    <div class="flex-grow mx-5">
      <RouterView/>
    </div>
  </div>
</template>

<style scoped>
</style>
