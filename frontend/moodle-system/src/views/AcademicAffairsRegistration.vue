<template>
  <div class="container-fluid px-5 mt-5">
    <div class="screen">
      <h2>{{ $t('enrollment.management_title') }}</h2>

      <div class="card-buttons">
        <!-- Nút mở modal -->
        <div class="card" @click="goToRegisterPage" style="cursor: pointer;">
          <h3>📚 {{ $t('enrollment.register.title') }}</h3>
          <p>{{ $t('enrollment.register.description') }}</p>
        </div>

        <div class="card danger" @click="goToDropPage">
          <h3>🗑️ {{ $t('enrollment.drop.title') }}</h3>
          <p>{{ $t('enrollment.drop.description') }}</p>
        </div>
      </div>
    </div>



  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  props: {},
  setup() {
    const router = useRouter()

    const goToRegisterPage = () => {
      router.push('/register-course')
    }

    const goToDropPage = () => {
      router.push('/drop-course')
    }

    return { 
      goToRegisterPage, 
      goToDropPage 
    }
  }
}
</script>


<style scoped>
.screen {
  max-width: 700px;
  margin: 50px auto;
  text-align: center;
}

h2 {
  margin-bottom: 32px;
}

.card-buttons {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  flex-wrap: wrap;
}

.card {
  flex: 1;
  min-width: 250px;
  background-color: #f0f8ff;
  border: 2px solid #007bff;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
}

.card h3 {
  margin-bottom: 12px;
  color: #007bff;
}

.card p {
  color: #333;
}

.card.danger {
  background-color: #fff5f5;
  border-color: #dc3545;
}

.card.danger h3 {
  color: #dc3545;
}

.card.danger:hover {
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2);
}
</style>