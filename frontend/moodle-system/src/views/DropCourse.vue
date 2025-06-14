<template>
  <div class="container py-4">
    <h3 class="pb-3">{{ $t('enrollment.drop.title') }}</h3>

    <!-- Form input -->
    <div class="mb-3">
      <label class="form-label">{{ $t('student.student_id') }}</label>
      <input v-model="studentId" class="form-control" :placeholder="$t('student.enter_student_id')" />
    </div>

    <div class="mb-3">
      <label class="form-label">{{ $t('class.class_code') }}</label>
      <input v-model="classCode" class="form-control" :placeholder="$t('enrollment.enter_class_code')" />
    </div>

    <div class="mb-3">
      <label class="form-label">{{ $t('enrollment.drop.reason') }}</label>
      <textarea v-model="reason" class="form-control" rows="3"
        :placeholder="$t('enrollment.drop.enter_reason')"></textarea>
    </div>

    <!-- Delete button -->
    <button class="btn btn-danger" @click="confirmDelete">{{ $t('common.delete') }}</button>

    <!-- Filter MSSV -->
    <div class="mt-5 mb-3">
      <label class="form-label">{{ $t('enrollment.drop.history.search_by_id') }}</label>
      <div class="input-group">
        <input v-model="searchMSSV" class="form-control" :placeholder="$t('student.enter_student_id')" />
        <button class="btn btn-primary" @click="loadHistory">{{ $t('common.search') }}</button>
      </div>
    </div>

    <!-- Drop history table -->
    <div v-if="dropHistory && dropHistory.length > 0" class="table-responsive">
      <table class="table table-bordered table-hover">
        <thead class="table-light">
          <tr>
            <th>{{ $t('student.student_id') }}</th>
            <th>{{ $t('student.name') }}</th>
            <th>{{ $t('class.class_code') }}</th>
            <th>{{ $t('common.reason') }}</th>
            <th>{{ $t('enrollment.registered_date') }}</th>
            <th>{{ $t('enrollment.dropped_date') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in dropHistory" :key="entry._id">
            <td>{{ entry.student?.studentId || '-' }}</td>
            <td>{{ entry.student?.fullName || '-' }}</td>
            <td>{{ entry.class?.classCode || '-' }}</td>
            <td>{{ entry.dropReason || '-' }}</td>
            <td>{{ entry.enrollmentDate ? formatDate(entry.enrollmentDate) : '-' }}</td>
            <td>{{ entry.dropDate ? formatDate(entry.dropDate) : '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-muted">{{ $t('enrollment.drop.history.no_data') }}</div>

    <ConfirmModal :showModal="showConfirmModal" :title="$t('common.confirm_cancel')"
      :message="$t('enrollment.drop.confirmation', { studentId, classCode })" :reasonHtml="`<strong>${$t('common.reason')}:</strong> ${reason}`"
      @update:showModal="showConfirmModal = $event" @confirm="performDelete" />

    <SuccessModal :showModal="showSuccessModal" :title="$t('common.cancel_success')"
      :message="$t('enrollment.drop.confirm_success', { studentId, classCode })" @confirm="goBack"
      @update:showModal="showSuccess = $event" />

    <ErrorModal :showModal="showErrorModal" :title="$t('common.cancel_failed')" :message="dropError"
      @update:showModal="showErrorModal = $event" />
  </div>
</template>

<script>
import { ref, nextTick, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import SuccessModal from '@/components/layout/SuccessModal.vue'
import ErrorModal from '@/components/layout/ErrorModal.vue'
import ConfirmModal from '@/components/layout/ConfirmModal.vue'

export default {
  props: {
  },
  name: 'DropCourse',
  components: {
    SuccessModal,
    ErrorModal,
    ConfirmModal
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const { t } = useI18n()

    const studentId = ref('')
    const classCode = ref('')
    const reason = ref('')
    const dropError = ref('')

    // Modal control flags
    const showSuccessModal = ref(false)
    const showErrorModal = ref(false)
    const showConfirmModal = ref(false)

    const dropHistory = ref([])
    const searchMSSV = ref('')

    onMounted(async () => {
      await nextTick()
    })

    const confirmDelete = () => {
      dropError.value = ''
      if (!studentId.value.trim() || !classCode.value.trim() || !reason.value.trim()) {
        dropError.value = t('common.fill_all_required')
        showErrorModal.value = true
        showSuccessModal.value = false
        return
      }
      showConfirmModal.value = true
    }

    const loadHistory = async () => {
      try {
        await store.dispatch('enrollment/getDropHistory', searchMSSV.value)
        dropHistory.value = store.state.enrollment.history || []
        console.log(dropHistory.value)

        const error = store.state.enrollment.historyError

        if (error) {
          dropHistory.value = []
          dropError.value = error
          showErrorModal.value = true
          showSuccessModal.value = false
        } else {
          dropError.value = ''
        }

      } catch (err) {
        dropError.value = t('enrollment.drop.istory.loading_error')
        showErrorModal.value = true
        showSuccessModal.value = false
      }
    }

    const hideConfirmModal = () => {
      showConfirmModal.value = false
    }

    const goBack = () => {
      router.back()
    }

    const resetForm = () => {
      studentId.value = ''
      classCode.value = ''
      reason.value = ''
    }

    const performDelete = async () => {
      hideConfirmModal()
      try {
        await store.dispatch('enrollment/dropEnrollment', {
          studentId: studentId.value,
          classCode: classCode.value,
          dropReason: reason.value
        })

        const error = store.state.enrollment.error
        if (error) {
          dropError.value = error
          console.log("Error dropping enrollment:", error)
          showErrorModal.value = true
          showSuccessModal.value = false
        } else {
          resetForm()
          showErrorModal.value = false
          showSuccessModal.value = true
        }
      } catch (err) {
        dropError.value = err.message || t('common.undefined_error')
        showErrorModal.value = true
        showSuccessModal.value = false
      }
    }

    const formatDate = (isoString) => {
      const d = new Date(isoString)
      return d.toLocaleString('vi-VN')
    }

    return {
      studentId,
      classCode,
      reason,
      dropError,
      dropHistory,
      searchMSSV,
      confirmDelete,
      loadHistory,
      goBack,
      performDelete,
      formatDate,
      showSuccessModal,
      showErrorModal,
      showConfirmModal
    }
  }
}
</script>

<style scoped>
textarea {
  resize: none;
}
</style>