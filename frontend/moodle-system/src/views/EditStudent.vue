<template>
  <div class="container mt-5 mb-5">
    <h2 class="mb-4 text-center">{{ $t('student.edit_student') }}</h2>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">{{ $t('common.loading') }}...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else class="card bg-light">
      <div class="card-body">
        <StudentForm :student-data="enhancedStudentData" :is-editing="true" @submit="handleSubmit" />
      </div>
    </div>

    <SuccessModal :showModal="showSuccessModal" :title="$t('common.success') + '!'"
      :message="$t('student.update_success') + '!'" @confirm="redirectToList"
      @update:showModal="showSuccess = $event" />

    <ErrorModal :showModal="showErrorModal" :title="$t('common.error') + '!'" :message="errorMessage"
      @update:showModal="showErrorModal = $event" />

  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import StudentForm from '@/components/student/StudentForm.vue'
import { useI18n } from 'vue-i18n'
import SuccessModal from '@/components/layout/SuccessModal.vue'
import ErrorModal from '@/components/layout/ErrorModal.vue'

export default {
  name: 'EditStudent',
  components: {
    StudentForm,
    SuccessModal,
    ErrorModal
  },
  setup() {
    const { t } = useI18n()
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const studentId = route.params.id

    const studentData = ref({})
    const loading = ref(true)
    const error = ref(null)
    const modalRef = ref(null)
    const errorMessage = ref(`${t('common.undefined_error')}`)

    const showSuccessModal = ref(false)
    const showErrorModal = ref(false)

    const enhancedStudentData = computed(() => {
      if (!studentData.value || Object.keys(studentData.value).length === 0) {
        return {}
      }

      const enhancedData = JSON.parse(JSON.stringify(studentData.value))

      if (!enhancedData.mailingAddress) {
        enhancedData.mailingAddress = {
          houseNumberStreet: '',
          wardCommune: '',
          districtCounty: '',
          provinceCity: '',
          country: ''
        }
      }

      if (!enhancedData.permanentAddress) {
        enhancedData.permanentAddress = {
          houseNumberStreet: '',
          wardCommune: '',
          districtCounty: '',
          provinceCity: '',
          country: ''
        }
      }

      if (!enhancedData.temporaryAddress) {
        enhancedData.temporaryAddress = {
          houseNumberStreet: '',
          wardCommune: '',
          districtCounty: '',
          provinceCity: '',
          country: ''
        }
      }

      const addressTypes = ['mailingAddress', 'permanentAddress', 'temporaryAddress']
      addressTypes.forEach(type => {
        if (enhancedData[type]) {
          enhancedData[type].houseNumberStreet = enhancedData[type].houseNumberStreet || ''
          enhancedData[type].wardCommune = enhancedData[type].wardCommune || ''
          enhancedData[type].districtCounty = enhancedData[type].districtCounty || ''
          enhancedData[type].provinceCity = enhancedData[type].provinceCity || ''
          enhancedData[type].country = enhancedData[type].country || ''
        }
      })

      if (enhancedData.dateOfBirth) {
        enhancedData.dateOfBirth = new Date(enhancedData.dateOfBirth).toISOString().split('T')[0]
      }

      if (enhancedData.identityDocument) {
        if (enhancedData.identityDocument.issueDate) {
          enhancedData.identityDocument.issueDate = new Date(enhancedData.identityDocument.issueDate).toISOString().split('T')[0]
        }
        if (enhancedData.identityDocument.expiryDate) {
          enhancedData.identityDocument.expiryDate = new Date(enhancedData.identityDocument.expiryDate).toISOString().split('T')[0]
        }

        if (enhancedData.identityDocument.type === 'CCCD') {
          enhancedData.identityDocument.hasChip =
            enhancedData.identityDocument.hasChip === true ||
            enhancedData.identityDocument.hasChip === 'true'
        }
      }

      return enhancedData
    })

    const fetchStudentData = async () => {
      loading.value = true
      error.value = null

      try {
        await Promise.all([
          store.dispatch('department/fetchDepartments'),
          store.dispatch('program/fetchPrograms'),
          store.dispatch('status/fetchStatusTypes'),
          store.dispatch('status/fetchStatusTransitions'),
          store.dispatch('status/fetchCountries'),
          store.dispatch('status/fetchNationalities')
        ])

        let student = store.getters['student/getStudentById'](studentId)

        if (!student) {
          student = await store.dispatch('student/fetchStudent', studentId)
        }

        if (student) {
          studentData.value = student

          await preloadAddressData(student)
        } else {
          error.value = t('student.no_exist')
        }
      } catch (err) {
        error.value = err.message || t('common.loading_error')
      } finally {
        loading.value = false
      }
    }

    const preloadAddressData = async (student) => {
      const addressTypes = ['mailingAddress', 'permanentAddress', 'temporaryAddress']

      for (const type of addressTypes) {
        if (student[type] && student[type].country) {
          try {
            const countries = store.state.status.countries
            const country = countries.find(c =>
              c.countryName === student[type].country ||
              c.countryName.toLowerCase() === student[type].country.toLowerCase()
            )

            if (country && country.geonameId) {
              await store.dispatch('status/fetchLocationChildren', country.geonameId)
            }
          } catch (err) {
            console.error(`Error pre-fetching location data for ${type}:`, err)
          }
        }
      }
    }

    const handleSubmit = async (updatedStudentData) => {
      try {
        const cleanData = {};

        const originalStatus = studentData.value && studentData.value.status ?
          (typeof studentData.value.status === 'object' ?
            studentData.value.status._id : studentData.value.status) : null;

        const updatedStatus = updatedStudentData.status ?
          (typeof updatedStudentData.status === 'object' ?
            updatedStudentData.status._id : updatedStudentData.status) : null;

        const shouldIncludeStatus = originalStatus !== updatedStatus;

        for (const [key, value] of Object.entries(updatedStudentData)) {
          if (key === 'status' && !shouldIncludeStatus) {
            continue;
          }

          if (key === 'department' || key === 'program' || key === 'status') {
            cleanData[key] = typeof value === 'object' ? value._id : value;
          }
          else if (key === 'dateOfBirth') {
            cleanData[key] = new Date(value).toISOString();
          }
          else if (key === 'identityDocument') {
            const docCopy = { ...value };

            if (docCopy.issueDate) {
              docCopy.issueDate = new Date(docCopy.issueDate).toISOString();
            }

            if (docCopy.expiryDate) {
              docCopy.expiryDate = new Date(docCopy.expiryDate).toISOString();
            }

            if (docCopy.type === 'CCCD') {
              docCopy.hasChip = Boolean(docCopy.hasChip);
            }

            cleanData[key] = docCopy;
          }
          else if (key === 'mailingAddress' || key === 'permanentAddress' || key === 'temporaryAddress') {
            cleanData[key] = { ...value };
          }
          else {
            cleanData[key] = value;
          }
        } 

        delete cleanData.studentId;

        await store.dispatch('student/updateStudent', {
          id: studentId,
          student: cleanData
        });

        showSuccessModal.value = true
      } catch (err) {
        errorMessage.value = err.response.data.message || t('common.error');
        showErrorModal.value = true
      }
    };

    const redirectToList = () => {
      showSuccessModal.value = false

      setTimeout(() => {
        router.push('/');
      }, 300);
    };

    onMounted(async () => {
      await fetchStudentData();
    });

    return {
      studentData,
      enhancedStudentData,
      loading,
      error,
      errorMessage,
      modalRef,
      handleSubmit,
      redirectToList,
      showSuccessModal,
      showErrorModal
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 900px;
}
</style>