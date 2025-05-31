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
        <StudentForm 
          :student-data="enhancedStudentData" 
          :is-editing="true" 
          @submit="handleSubmit" 
        />
      </div>
    </div>

    <!-- Success Modal -->
    <div class="modal fade" id="successModal" tabindex="-1" aria-hidden="true" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title">{{ $t('common.success') }}!</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" :aria-label="$t('common.close')"></button>
          </div>
          <div class="modal-body">
            {{ $t('student.update_success') }}!
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="redirectToList">OK</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Modal -->
    <div class="modal fade" id="errorModal" tabindex="-1" aria-hidden="true" ref="errorModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">{{ $t('common.error') }}!</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" :aria-label="$t('common.close')"></button>
          </div>
          <div class="modal-body">
            {{ errorMessage }}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ $t('common.close') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { Modal } from 'bootstrap'
import StudentForm from '@/components/student/StudentForm.vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'EditStudent',
  components: {
    StudentForm
  },
  setup() {
    const { t } = useI18n()
    console.log(t)
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const studentId = route.params.id
    
    const studentData = ref({})
    const loading = ref(true)
    const error = ref(null)
    const modalRef = ref(null)
    const errorModalRef = ref(null)
    const errorMessage = ref('Có lỗi xảy ra. Vui lòng thử lại!')
    let successModal = null
    let errorModal = null
    
    // This computed property enhances the student data for proper form initialization
    const enhancedStudentData = computed(() => {
      if (!studentData.value || Object.keys(studentData.value).length === 0) {
        return {}
      }
      
      // Create a deep copy to avoid modifying the original data
      const enhancedData = JSON.parse(JSON.stringify(studentData.value))
      
      // Ensure addresses are properly initialized
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
      
      // Pre-fix the address dropdowns by ensuring the properties are set properly
      const addressTypes = ['mailingAddress', 'permanentAddress', 'temporaryAddress']
      addressTypes.forEach(type => {
        if (enhancedData[type]) {
          // Ensure each address has all required fields
          enhancedData[type].houseNumberStreet = enhancedData[type].houseNumberStreet || ''
          enhancedData[type].wardCommune = enhancedData[type].wardCommune || ''
          enhancedData[type].districtCounty = enhancedData[type].districtCounty || ''
          enhancedData[type].provinceCity = enhancedData[type].provinceCity || ''
          enhancedData[type].country = enhancedData[type].country || ''
        }
      })
      
      // Format dates properly
      if (enhancedData.dateOfBirth) {
        enhancedData.dateOfBirth = new Date(enhancedData.dateOfBirth).toISOString().split('T')[0]
      }
      
      // Process identity document
      if (enhancedData.identityDocument) {
        if (enhancedData.identityDocument.issueDate) {
          enhancedData.identityDocument.issueDate = new Date(enhancedData.identityDocument.issueDate).toISOString().split('T')[0]
        }
        if (enhancedData.identityDocument.expiryDate) {
          enhancedData.identityDocument.expiryDate = new Date(enhancedData.identityDocument.expiryDate).toISOString().split('T')[0]
        }
        
        // Set hasChip to boolean value if the identity type is CCCD
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
        // First load the necessary reference data
        await Promise.all([
          store.dispatch('department/fetchDepartments'),
          store.dispatch('program/fetchPrograms'),
          store.dispatch('status/fetchStatusTypes'),
          store.dispatch('status/fetchStatusTransitions'),
          store.dispatch('status/fetchCountries'),
          store.dispatch('status/fetchNationalities')
        ])
        
        // Try to find the student in the current store state first
        let student = store.getters['student/getStudentById'](studentId)
        
        if (!student) {
          // If not found in store, fetch from API
          student = await store.dispatch('student/fetchStudent', studentId)
        }
        
        if (student) {
          studentData.value = student
          
          // Pre-fetch geographic data for the student's addresses to enable dropdowns
          await preloadAddressData(student)
        } else {
          error.value = t('student.no_exist')
        }
      } catch (err) {
        console.error('Error fetching student:', err)
        error.value = err.message || t('common.loading_error')
      } finally {
        loading.value = false
      }
    }
    
    const preloadAddressData = async (student) => {
      // Try to pre-fetch location data for addresses
      const addressTypes = ['mailingAddress', 'permanentAddress', 'temporaryAddress']
      
      for (const type of addressTypes) {
        if (student[type] && student[type].country) {
          try {
            // Find the country in the list of countries
            const countries = store.state.status.countries
            const country = countries.find(c => 
              c.countryName === student[type].country || 
              c.countryName.toLowerCase() === student[type].country.toLowerCase()
            )
            
            if (country && country.geonameId) {
              // Fetch the provinces for this country
              await store.dispatch('status/fetchLocationChildren', country.geonameId)
              
              // Note: We could further fetch districts and wards here,
              // but that would require us to know the geonameId of the province/district
              // which we don't have in the original data
            }
          } catch (err) {
            console.error(`Error pre-fetching location data for ${type}:`, err)
          }
        }
      }
    }
    
    const handleSubmit = async (updatedStudentData) => {
      try {
        console.log('Received updated student data:', JSON.stringify(updatedStudentData, null, 2));
        
        // Create a clean copy of the data to send to the API
        const cleanData = {};
        
        // Handle special fields that need conversion
        const originalStatus = studentData.value && studentData.value.status ? 
          (typeof studentData.value.status === 'object' ? 
            studentData.value.status._id : studentData.value.status) : null;
            
        const updatedStatus = updatedStudentData.status ? 
          (typeof updatedStudentData.status === 'object' ? 
            updatedStudentData.status._id : updatedStudentData.status) : null;
        
        const shouldIncludeStatus = originalStatus !== updatedStatus;
        
        // Process all fields
        for (const [key, value] of Object.entries(updatedStudentData)) {
          // Skip the status field if it hasn't changed
          if (key === 'status' && !shouldIncludeStatus) {
            continue;
          }
          
          // Handle reference fields
          if (key === 'department' || key === 'program' || key === 'status') {
            cleanData[key] = typeof value === 'object' ? value._id : value;
          } 
          // Handle date fields
          else if (key === 'dateOfBirth') {
            cleanData[key] = new Date(value).toISOString();
          }
          // Handle identity document
          else if (key === 'identityDocument') {
            const docCopy = {...value};
            
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
          // Handle address fields - copy these directly
          else if (key === 'mailingAddress' || key === 'permanentAddress' || key === 'temporaryAddress') {
            cleanData[key] = {...value};
          }
          // Handle all other fields
          else {
            cleanData[key] = value;
          }
        }
        
        console.log('Prepared data for API:', JSON.stringify(cleanData, null, 2));
        
        // Send the data to the API
        await store.dispatch('student/updateStudent', {
          id: studentId,
          student: cleanData
        });
        
        if (successModal) {
          successModal.show();
        }
      } catch (err) {
        console.error('Error updating student:', err);
        errorMessage.value = err.message || t('common.error');
        
        if (errorModal) {
          errorModal.show();
        }
      }
    };
    
    const redirectToList = () => {
      if (successModal) {
        successModal.hide();
      }
      
      setTimeout(() => {
        router.push('/');
      }, 300);
    };
    
    onMounted(async () => {
      await fetchStudentData();
      
      const successModalElement = document.getElementById('successModal');
      if (successModalElement) {
        successModal = new Modal(successModalElement);
      }
      
      const errorModalElement = document.getElementById('errorModal');
      if (errorModalElement) {
        errorModal = new Modal(errorModalElement);
      }
    });
    
    return {
      studentData,
      enhancedStudentData,
      loading,
      error,
      errorMessage,
      modalRef,
      errorModalRef,
      handleSubmit,
      redirectToList
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 900px;
}
</style>