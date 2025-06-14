<template>
  <div class="d-flex justify-content-between align-items-center">
    <!-- Display Count -->
    <div>
      <span>{{ t('common.display_count', { current: currentItems, total: totalItems }) }}</span>
    </div>

    <!-- Pagination Navigation -->
    <nav>
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
            {{ t('common.previous') }}
          </a>
        </li>

        <li
          v-for="page in pages"
          :key="page"
          class="page-item"
          :class="{ active: page === currentPage }"
        >
          <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
        </li>

        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
            {{ t('common.next') }}
          </a>
        </li>
      </ul>
    </nav>

    <!-- Page Size Selector -->
    <div>
      <select
        v-model="internalPageSize"
        class="form-select form-select-sm"
        style="width: auto"
        @change="updatePageSize"
      >
        <option :value="1">5 / {{ t('common.page') }}</option>
        <option :value="10">10 / {{ t('common.page') }}</option>
        <option :value="20">20 / {{ t('common.page') }}</option>
      </select>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'BasePagination',
  props: {
    modelValue: { type: Number, required: true }, // v-model:currentPage
    pageSize: { type: Number, required: true },
    totalItems: { type: Number, required: true },
    currentItems: { type: Number, required: true },
    maxVisible: { type: Number, default: 5 }
  },
  emits: ['update:modelValue', 'update:pageSize'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const internalPageSize = ref(props.pageSize)

    const totalPages = computed(() =>
      Math.ceil(props.totalItems / internalPageSize.value)
    )

    const startPage = computed(() => {
      const half = Math.floor(props.maxVisible / 2)
      let start = props.modelValue - half
      if (start + props.maxVisible - 1 > totalPages.value) {
        start = totalPages.value - props.maxVisible + 1
      }
      return Math.max(1, start)
    })

    const endPage = computed(() =>
      Math.min(totalPages.value, startPage.value + props.maxVisible - 1)
    )

    const pages = computed(() => {
      const result = []
      for (let i = startPage.value; i <= endPage.value; i++) {
        result.push(i)
      }
      return result
    })

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value && page !== props.modelValue) {
        emit('update:modelValue', page)
      }
    }

    const updatePageSize = () => {
      emit('update:pageSize', Number(internalPageSize.value))
    }

    // Sync external prop changes
    watch(
      () => props.pageSize,
      (newVal) => {
        internalPageSize.value = newVal
      }
    )

    return {
      t,
      internalPageSize,
      totalPages,
      pages,
      changePage,
      updatePageSize,
      currentPage: computed(() => props.modelValue)
    }
  }
}
</script>
