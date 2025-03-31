<template>
  <div class="d-flex">
    <AppSidebar />
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script>
import AppSidebar from '@/components/layout/AppSidebar.vue'

export default {
  name: 'App',
  components: {
    AppSidebar
  }
}
</script>

<style>
.content {
  margin-left: 260px;
  width: calc(100% - 260px);
  padding: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>