<template>
  <div class="d-flex flex-column flex-shrink-0 p-3 bg-light" style="width: 250px; height: 100vh; position: fixed;">
    <router-link to="/" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-decoration-none">
      <span class="fs-5 fw-bold">Quản lý Sinh Viên</span>
    </router-link>
    <hr>
    <ul class="nav nav-pills flex-column mb-auto">
      <!-- Existing navigation items -->
      <li class="nav-item">
        <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
          <i class="bi bi-people me-2"></i> Danh sách sinh viên
        </router-link>
      </li>
      
      <!-- New navigation items for course and class management -->
      <li>
        <router-link to="/courses" class="nav-link" :class="{ active: $route.path === '/courses' }">
          <i class="bi bi-book me-2"></i> Quản lý khóa học
        </router-link>
      </li>
      <li>
        <router-link to="/classes" class="nav-link" :class="{ active: $route.path === '/classes' }">
          <i class="bi bi-calendar3 me-2"></i> Quản lý lớp học
        </router-link>
      </li>
      
      <!-- Other existing items -->
      <li>
        <router-link to="/departments" class="nav-link" :class="{ active: $route.path === '/departments' }">
          <i class="bi bi-building me-2"></i> Danh sách khoa
        </router-link>
      </li>
      <li>
        <router-link to="/status-types" class="nav-link" :class="{ active: $route.path === '/status-types' }">
          <i class="bi bi-patch-check me-2"></i> Tình trạng sinh viên
        </router-link>
      </li>
      <li>
        <router-link to="/status-transitions" class="nav-link" :class="{ active: $route.path === '/status-transitions' }">
          <i class="bi bi-arrow-left-right me-2"></i> Quy tắc chuyển trạng thái
        </router-link>
      </li>
      <li>
        <router-link to="/programs" class="nav-link" :class="{ active: $route.path === '/programs' }">
          <i class="bi bi-mortarboard me-2"></i> Chương trình đào tạo
        </router-link>
      </li>
      <li>
        <router-link to="/academic-affairs-registration" class="nav-link" :class="{ active: $route.path === '/academic-affairs-registration' }">
          Quản lí đăng kí môn học
        </router-link>
      </li>
      <li>
        <router-link to="/grade-table" class="nav-link" :class="{ active: $route.path === '/grade-table' }">
          Bảng điểm
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