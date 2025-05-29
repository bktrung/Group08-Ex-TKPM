<template>
  <div class="d-flex flex-column min-vh-100">
    <div class="d-flex flex-grow-1">
      <AppSidebar />
      <div class="content">
        <router-view />
      </div>
    </div>

    <div class="language-float">
      <div class="dropdown">
        <button
          class="btn btn-primary rounded-circle lang-btn"
          @click="toggleDropdown"
        >
          🌐
        </button>

        <ul v-if="dropdownOpen" class="dropdown-menu show lang-dropdown">
          <li v-for="(label, code) in languages" :key="code">
            <a class="dropdown-item" href="#" @click.prevent="changeLang(code)">
              {{ label }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { useI18n } from 'vue-i18n'
import { ref, onMounted } from 'vue'

export default {
  name: 'App',
  components: {
    AppSidebar
  },
  setup() {
    const { locale } = useI18n()
    const dropdownOpen = ref(false)

    const languages = {
      vi: '🇻🇳 Tiếng Việt',
      en: '🇺🇸 English'
    }

    const toggleDropdown = () => {
      dropdownOpen.value = !dropdownOpen.value
    }

    const changeLang = (lang) => {
      locale.value = lang
      localStorage.setItem('language', lang)
      dropdownOpen.value = false
    }

    onMounted(() => {
      const savedLang = localStorage.getItem('language')
      if (savedLang && savedLang !== locale.value) {
        locale.value = savedLang
      }
    })

    return {
      languages,
      dropdownOpen,
      toggleDropdown,
      changeLang
    }
  }
}
</script>

<style>
.content {
  margin-left: 260px;
  width: calc(100% - 260px);
  padding: 20px;
}

.language-float {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}

.lang-btn {
  width: 50px;
  height: 50px;
  font-size: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.lang-dropdown {
  position: absolute;
  bottom: 60px;
  right: 0;
  min-width: 150px;
}
</style>
