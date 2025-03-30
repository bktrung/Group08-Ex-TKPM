<template>
  <form @submit.prevent="handleSubmit" id="student-form">
    <!-- Basic Information -->
    <div class="section-title">Thông tin cơ bản</div>
    <div class="row mb-2">
      <div class="col-md-6">
        <label class="form-label">Mã số sinh viên</label>
        <input 
          type="text" 
          id="student-id" 
          v-model="form.studentId" 
          class="form-control" 
          :class="{ 'is-invalid': v$.studentId.$error, 'is-valid': !v$.studentId.$invalid && v$.studentId.$dirty }" 
          :readonly="isEditing"
          required
        >
        <div class="invalid-feedback" v-if="v$.studentId.$error">
          {{ v$.studentId.$errors[0].$message }}
        </div>
      </div>
      <div class="col-md-6">
        <label class="form-label">Họ tên</label>
        <input 
          type="text" 
          id="student-name" 
          v-model="form.fullName" 
          class="form-control" 
          :class="{ 'is-invalid': v$.fullName.$error, 'is-valid': !v$.fullName.$invalid && v$.fullName.$dirty }" 
          required
        >
        <div class="invalid-feedback" v-if="v$.fullName.$error">
          {{ v$.fullName.$errors[0].$message }}
        </div>
      </div>
    </div>

    <div class="row mb-2">
      <div class="col-md-4">
        <label class="form-label">Ngày sinh</label>
        <input 
          type="date" 
          id="student-dob" 
          v-model="form.dateOfBirth" 
          class="form-control"
          :class="{ 'is-invalid': v$.dateOfBirth.$error, 'is-valid': !v$.dateOfBirth.$invalid && v$.dateOfBirth.$dirty }"
          required
        >
        <div class="invalid-feedback" v-if="v$.dateOfBirth.$error">
          Ngày sinh không được là ngày trong tương lai
        </div>
      </div>
      <div class="col-md-4">
        <label class="form-label">Giới tính</label>
        <select id="student-gender" v-model="form.gender" class="form-select" required>
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
        </select>
      </div>
      <div class="col-md-4">
        <label class="form-label">Quốc tịch</label>
        <select 
          id="student-nationality" 
          v-model="form.nationality" 
          class="form-select"
          :class="{ 'is-invalid': v$.nationality.$error, 'is-valid': !v$.nationality.$invalid && v$.nationality.$dirty }"
          required
        >
          <option value="">-- Chọn quốc tịch --</option>
          <option v-for="nationality in nationalities" :key="nationality" :value="nationality">
            {{ nationality }}
          </option>
        </select>
        <div class="invalid-feedback" v-if="v$.nationality.$error">
          Vui lòng chọn quốc tịch
        </div>
      </div>
    </div>

    <div class="row mb-2">
      <div class="col-md-4">
        <label class="form-label">Khoa</label>
        <select 
          id="student-faculty" 
          v-model="form.department" 
          class="form-select"
          :class="{ 'is-invalid': v$.department.$error, 'is-valid': !v$.department.$invalid && v$.department.$dirty }"
          required
        >
          <option value="">-- Chọn khoa --</option>
          <option v-for="dept in departments" :key="dept._id" :value="dept._id">
            {{ dept.name }}
          </option>
        </select>
        <div class="invalid-feedback" v-if="v$.department.$error">
          Vui lòng chọn khoa
        </div>
      </div>
      <div class="col-md-4">
        <label class="form-label">Khóa</label>
        <input 
          type="number" 
          id="student-course" 
          v-model.number="form.schoolYear" 
          class="form-control"
          :class="{ 'is-invalid': v$.schoolYear.$error, 'is-valid': !v$.schoolYear.$invalid && v$.schoolYear.$dirty }"
          required
        >
        <div class="invalid-feedback" v-if="v$.schoolYear.$error">
          Khóa học không thể vượt quá năm hiện tại ({{ currentYear }})
        </div>
      </div>
      <div class="col-md-4">
        <label class="form-label">Chương trình đào tạo</label>
        <select 
          id="student-program" 
          v-model="form.program" 
          class="form-select"
          :class="{ 'is-invalid': v$.program.$error, 'is-valid': !v$.program.$invalid && v$.program.$dirty }"
          required
        >
          <option value="">-- Chọn chương trình --</option>
          <option v-for="prog in programs" :key="prog._id" :value="prog._id">
            {{ prog.name }}
          </option>
        </select>
        <div class="invalid-feedback" v-if="v$.program.$error">
          Vui lòng chọn chương trình đào tạo
        </div>
      </div>
    </div>

    <div class="row mb-2">
      <div class="col-md-6">
        <label class="form-label">Email</label>
        <input 
          type="email" 
          id="student-email" 
          v-model="form.email" 
          class="form-control"
          :class="{ 'is-invalid': v$.email.$error, 'is-valid': !v$.email.$invalid && v$.email.$dirty }"
          required
        >
        <div class="invalid-feedback" v-if="v$.email.$error">
          Email phải có định dạng hợp lệ
        </div>
      </div>
      <div class="col-md-6">
        <label class="form-label">Số điện thoại</label>
        <input 
          type="text" 
          id="student-phone" 
          v-model="form.phoneNumber" 
          class="form-control"
          :class="{ 'is-invalid': v$.phoneNumber.$error, 'is-valid': !v$.phoneNumber.$invalid && v$.phoneNumber.$dirty }"
          required
        >
        <div class="invalid-feedback" v-if="v$.phoneNumber.$error">
          Số điện thoại không hợp lệ
        </div>
      </div>
    </div>

    <div class="mb-2">
      <label class="form-label">Tình trạng</label>
      <select 
        id="student-status" 
        v-model="form.status" 
        class="form-select"
        :class="{ 'is-invalid': v$.status.$error, 'is-valid': !v$.status.$invalid && v$.status.$dirty }"
        required
      >
        <option value="">-- Chọn tình trạng --</option>
        <option 
          v-for="status in availableStatusTypes" 
          :key="status._id" 
          :value="status._id"
          :disabled="isEditing && !isValidStatusTransition(currentStatusId, status._id)"
        >
          {{ status.type }}
        </option>
      </select>
      <div class="invalid-feedback" v-if="v$.status.$error">
        Vui lòng chọn tình trạng
      </div>
      <small v-if="isEditing" class="form-text text-muted">
        Một số trạng thái bị vô hiệu hóa vì không thể chuyển từ trạng thái hiện tại sang trạng thái đó.
      </small>
    </div>

    <!-- Address Information -->
    <AddressFields 
      v-model:mailingAddress="form.mailingAddress"
      v-model:permanentAddress="form.permanentAddress"
      v-model:temporaryAddress="form.temporaryAddress"
      :countries="countries" 
      :loading="loading"
      @loadChildren="loadLocationChildren"
    />

    <!-- Identity Document -->
    <IdentityDocumentFields 
      v-model:identityDocument="form.identityDocument"
      :countries="countries"
    />

    <div class="mt-4">
      <button type="submit" class="btn btn-primary mt-3 w-100" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        {{ isEditing ? 'Cập nhật Sinh Viên' : 'Thêm Sinh Viên' }}
      </button>
      <router-link to="/" class="btn btn-secondary mt-2 w-100">Hủy</router-link>
    </div>
  </form>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useVuelidate } from '@vuelidate/core'
import { required, email, helpers } from '@vuelidate/validators'
import AddressFields from './AddressFields.vue'
import IdentityDocumentFields from './IdentityDocumentFields.vue'

export default {
  name: 'StudentForm',
  components: {
    AddressFields,
    IdentityDocumentFields
  },
  props: {
    studentData: {
      type: Object,
      default: () => ({})
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  emits: ['submit'],
  setup(props, { emit }) {
    const store = useStore()
    const currentYear = new Date().getFullYear()
    const currentStatusId = ref(null)
    
    // Form data
    const form = ref({
      studentId: '',
      fullName: '',
      dateOfBirth: '',
      gender: 'Nam',
      nationality: '',
      department: '',
      schoolYear: currentYear,
      program: '',
      email: '',
      phoneNumber: '',
      status: '',
      mailingAddress: {
        houseNumberStreet: '',
        wardCommune: '',
        districtCounty: '',
        provinceCity: '',
        country: ''
      },
      permanentAddress: {
        houseNumberStreet: '',
        wardCommune: '',
        districtCounty: '',
        provinceCity: '',
        country: ''
      },
      temporaryAddress: {
        houseNumberStreet: '',
        wardCommune: '',
        districtCounty: '',
        provinceCity: '',
        country: ''
      },
      identityDocument: {
        type: 'CCCD',
        number: '',
        issueDate: '',
        issuedBy: '',
        expiryDate: '',
        hasChip: true
      }
    })
    
    // Validation rules
    const rules = computed(() => {
      return {
        studentId: { 
          required: helpers.withMessage('Mã số sinh viên là bắt buộc', required) 
        },
        fullName: { 
          required: helpers.withMessage('Họ tên là bắt buộc', required) 
        },
        dateOfBirth: { 
          required: helpers.withMessage('Ngày sinh là bắt buộc', required),
          notFuture: helpers.withMessage(
            'Ngày sinh không được là ngày trong tương lai', 
            (value) => new Date(value) <= new Date()
          )
        },
        nationality: { 
          required: helpers.withMessage('Quốc tịch là bắt buộc', required) 
        },
        department: { 
          required: helpers.withMessage('Khoa là bắt buộc', required) 
        },
        schoolYear: { 
          required: helpers.withMessage('Khóa học là bắt buộc', required),
          notFutureYear: helpers.withMessage(
            `Khóa học không thể vượt quá năm hiện tại (${currentYear})`,
            (value) => value <= currentYear
          )
        },
        program: { 
          required: helpers.withMessage('Chương trình đào tạo là bắt buộc', required) 
        },
        email: { 
          required: helpers.withMessage('Email là bắt buộc', required),
          email: helpers.withMessage('Email phải có định dạng hợp lệ', email)
        },
        phoneNumber: { 
          required: helpers.withMessage('Số điện thoại là bắt buộc', required),
          phoneFormat: helpers.withMessage(
            'Số điện thoại không hợp lệ',
            (value) => /^(\+84|0)[3|5|7|8|9][0-9]{8}$/.test(value)
          )
        },
        status: { 
          required: helpers.withMessage('Tình trạng là bắt buộc', required) 
        }
      }
    })
    
    const v$ = useVuelidate(rules, form)
    
    // Computed properties
    const departments = computed(() => store.state.department.departments)
    const programs = computed(() => store.state.program.programs)
    const statusTypes = computed(() => store.state.status.statusTypes)
    const countries = computed(() => store.state.status.countries)
    const nationalities = computed(() => store.state.status.nationalities)
    const loading = computed(() => store.state.student.loading)
    
    const availableStatusTypes = computed(() => {
      if (!props.isEditing || !currentStatusId.value) {
        return statusTypes.value
      }
      
      // Filter status types based on transition rules
      const validTransitions = store.getters['status/getValidTransitionsForStatus'](currentStatusId.value)
      
      // Include current status in the list
      const currentStatus = statusTypes.value.find(status => status._id === currentStatusId.value)
      return [currentStatus, ...validTransitions].filter(Boolean)
    })
    
    // Methods
    const loadData = async () => {
      await Promise.all([
        store.dispatch('department/fetchDepartments'),
        store.dispatch('program/fetchPrograms'),
        store.dispatch('status/fetchStatusTypes'),
        store.dispatch('status/fetchStatusTransitions'),
        store.dispatch('status/fetchCountries'),
        store.dispatch('status/fetchNationalities')
      ])
    }
    
    const loadLocationChildren = async (geonameId, addressType, level) => {
      try {
        const children = await store.dispatch('status/fetchLocationChildren', geonameId)
        return children
      } catch (error) {
        console.error(`Error loading ${level} for ${addressType}:`, error)
        return []
      }
    }
    
    const isValidStatusTransition = (fromStatusId, toStatusId) => {
      return store.getters['status/isValidStatusTransition'](fromStatusId, toStatusId)
    }
    
    const handleSubmit = async () => {
      const isValid = await v$.value.$validate()
      if (!isValid) return
      
      const studentData = { ...form.value }
      
      // Only include addresses that have at least a street name
      if (!studentData.permanentAddress.houseNumberStreet) {
        delete studentData.permanentAddress
      }
      
      if (!studentData.temporaryAddress.houseNumberStreet) {
        delete studentData.temporaryAddress
      }
      
      emit('submit', studentData)
    }
    
    // Watch for changes in props
    watch(() => props.studentData, (newValue) => {
      if (newValue && Object.keys(newValue).length > 0) {
        // Populate form with student data
        form.value = { ...form.value, ...JSON.parse(JSON.stringify(newValue)) }
        
        // Format date
        if (newValue.dateOfBirth) {
          form.value.dateOfBirth = new Date(newValue.dateOfBirth).toISOString().split('T')[0]
        }
        
        // Handle status for transitions
        if (newValue.status) {
          if (typeof newValue.status === 'object') {
            currentStatusId.value = newValue.status._id
            form.value.status = newValue.status._id
          } else {
            currentStatusId.value = newValue.status
            form.value.status = newValue.status
          }
        }
      }
    }, { immediate: true, deep: true })
    
    // Lifecycle hooks
    onMounted(async () => {
      await loadData()
    })
    
    return {
      form,
      v$,
      departments,
      programs,
      statusTypes,
      availableStatusTypes,
      countries,
      nationalities,
      loading,
      currentYear,
      currentStatusId,
      handleSubmit,
      loadLocationChildren,
      isValidStatusTransition
    }
  }
}
</script>

<style scoped>
.section-title {
  background-color: #e9ecef;
  padding: 8px 12px;
  margin-top: 15px;
  margin-bottom: 15px;
  border-radius: 5px;
  font-weight: bold;
}
</style>