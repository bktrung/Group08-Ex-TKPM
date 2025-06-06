<template>
  <div class="d-flex flex-column flex-shrink-0 p-3 bg-light" style="width: 250px; height: 100vh; position: fixed;">
    <router-link to="/" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-decoration-none">
      <span class="fs-5 fw-bold">{{ $t('sidebar.title') }}</span>
    </router-link>
    <hr>
    <ul class="nav nav-pills flex-column mb-auto">

      <li class="nav-item">
        <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
          <i class="bi bi-people me-2"></i> {{ $t('sidebar.student_list') }}
        </router-link>
      </li>

      <li>
        <router-link to="/courses" class="nav-link" :class="{ active: $route.path === '/courses' }">
          <i class="bi bi-book me-2"></i> {{ $t('sidebar.courses') }}
        </router-link>
      </li>
      <li>
        <router-link to="/classes" class="nav-link" :class="{ active: $route.path === '/classes' }">
          <i class="bi bi-calendar3 me-2"></i> {{ $t('sidebar.classes') }}
        </router-link>
      </li>
      <li>
        <router-link to="/departments" class="nav-link" :class="{ active: $route.path === '/departments' }">
          <i class="bi bi-building me-2"></i> {{ $t('sidebar.departments') }}
        </router-link>
      </li>
      <li>
        <router-link to="/status-types" class="nav-link" :class="{ active: $route.path === '/status-types' }">
          <i class="bi bi-patch-check me-2"></i> {{ $t('sidebar.status_types') }}
        </router-link>
      </li>
      <li>
        <router-link to="/status-transitions" class="nav-link"
          :class="{ active: $route.path === '/status-transitions' }">
          <i class="bi bi-arrow-left-right me-2"></i> {{ $t('sidebar.status_transitions') }}
        </router-link>
      </li>
      <li>
        <router-link to="/programs" class="nav-link" :class="{ active: $route.path === '/programs' }">
          <i class="bi bi-mortarboard me-2"></i> {{ $t('sidebar.programs') }}
        </router-link>
      </li>
      <li>
        <router-link to="/academic-affairs-registration" class="nav-link"
          :class="{ active: $route.path === '/academic-affairs-registration' }">
          <i class="bi bi-journal-plus me-2"></i> {{ $t('sidebar.academic_affairs_registration') }}
        </router-link>
      </li>
      <li>
        <router-link to="/grade-table" class="nav-link" :class="{ active: $route.path === '/grade-table' }">
          <i class="bi bi-table me-2"></i> {{ $t('sidebar.grade_table') }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n'

export default {
  setup() {
    const { t } = useI18n()
    return {
      t
    }
  },
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