<template>
  <div class="d-flex flex-column flex-shrink-0 p-3 bg-light" style="width: 250px; height: 100vh; position: fixed;">
    <router-link to="/" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-decoration-none">
      <span class="fs-5 fw-bold">Quản lý Sinh Viên</span>
    </router-link>
    <hr>
    <ul class="nav nav-pills flex-column mb-auto">
      <li class="nav-item">
        <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
          Danh sách sinh viên
        </router-link>
      </li>
      <li>
        <router-link to="/departments" class="nav-link" :class="{ active: $route.path === '/departments' }">
          Danh sách khoa
        </router-link>
      </li>
      <li>
        <router-link to="/status-types" class="nav-link" :class="{ active: $route.path === '/status-types' }">
          Danh sách tình trạng sinh viên
        </router-link>
      </li>
      <li>
        <router-link to="/status-transitions" class="nav-link" :class="{ active: $route.path === '/status-transitions' }">
          Quy tắc chuyển trạng thái
        </router-link>
      </li>
      <li>
        <router-link to="/programs" class="nav-link" :class="{ active: $route.path === '/programs' }">
          Danh sách chương trình đào tạo
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'AppSidebar'
}
</script>

<style scoped>
.nav-link {
  color: #212529;
}
.nav-link.active {
  background-color: #0d6efd;
  color: white;
}
</style>