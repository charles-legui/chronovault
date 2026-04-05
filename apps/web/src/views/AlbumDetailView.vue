<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <div>
    <h1 class="page-title">Album #{{ route.params.id }}</h1>
  </div>
</template>

<style scoped>
.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}
</style>
