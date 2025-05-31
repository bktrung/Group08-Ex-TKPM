<template>
  <div>
    <div class="section-title">{{ $t('identity.sectionTitle') }}</div>
    <div class="mb-3">
      <div class="row mb-2">
        <div class="col-md-4">
          <label class="form-label">{{ $t('identity.type') }}</label>
          <select 
            id="identity-type" 
            v-model="internalDocument.type" 
            class="form-select" 
            :class="{ 'is-valid': isValid.type && touched.type, 'is-invalid': isInvalid.type && touched.type }"
            required 
            @change="handleTypeChange"
            @blur="onFieldTouched('type')"
          >
            <option value="CMND">{{ $t('identity.type_options.CMND') }}</option>
            <option value="CCCD">{{ $t('identity.type_options.CCCD') }}</option>
            <option value="PASSPORT">{{ $t('identity.type_options.PASSPORT') }}</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label">{{ $t('identity.number') }}</label>
          <input 
            type="text" 
            v-model="internalDocument.number" 
            class="form-control" 
            :class="{ 'is-valid': isValid.number && touched.number, 'is-invalid': isInvalid.number && touched.number }"
            required
            @blur="onFieldTouched('number')"
          >
          <div class="invalid-feedback" v-if="isInvalid.number && touched.number">
            <span v-if="internalDocument.type === 'CMND'">{{ $t('identity.number_error.CMND') }}</span>
            <span v-else-if="internalDocument.type === 'CCCD'">{{ $t('identity.number_error.CCCD') }}</span>
            <span v-else-if="internalDocument.type === 'PASSPORT'">{{ $t('identity.number_error.PASSPORT') }}</span>
          </div>
        </div>
        <div class="col-md-4" v-if="internalDocument.type === 'CCCD'">
          <label class="form-label">{{ $t('identity.hasChip') }}</label>
          <select 
            v-model="internalDocument.hasChip" 
            class="form-select"
            :class="{ 'is-valid': isValid.hasChip && touched.hasChip, 'is-invalid': isInvalid.hasChip && touched.hasChip }"
            @blur="onFieldTouched('hasChip')"
          >
            <option :value="true">{{ $t('common.yes') }}</option>
            <option :value="false">{{ $t('common.no') }}</option>
          </select>
          <div class="invalid-feedback" v-if="isInvalid.hasChip && touched.hasChip">
            {{ $t('identity.hasChip_required') }}
          </div>
        </div>
      </div>

      <div class="row mb-2">
        <div class="col-md-4">
          <label class="form-label">{{ $t('identity.issueDate') }}</label>
          <input 
            type="date" 
            v-model="internalDocument.issueDate" 
            class="form-control" 
            :class="{ 'is-valid': isValid.issueDate && touched.issueDate, 'is-invalid': isInvalid.issueDate && touched.issueDate }"
            required
            @blur="onFieldTouched('issueDate')"
          >
          <div class="invalid-feedback" v-if="isInvalid.issueDate && touched.issueDate">
            {{ $t('identity.issueDate_error') }}
          </div>
        </div>
        <div class="col-md-4">
          <label class="form-label">{{ $t('identity.expiryDate') }}</label>
          <input 
            type="date" 
            v-model="internalDocument.expiryDate" 
            class="form-control" 
            :class="{ 'is-valid': isValid.expiryDate && touched.expiryDate, 'is-invalid': isInvalid.expiryDate && touched.expiryDate }"
            required
            @blur="onFieldTouched('expiryDate')"
          >
          <div class="invalid-feedback" v-if="isInvalid.expiryDate && touched.expiryDate">
            {{ $t('identity.expiryDate.error') }}
          </div>
        </div>
        <div class="col-md-4">
          <label class="form-label">{{ $t('identity.issuedBy') }}</label>
          <input 
            type="text" 
            v-model="internalDocument.issuedBy" 
            class="form-control" 
            :class="{ 'is-valid': isValid.issuedBy && touched.issuedBy, 'is-invalid': isInvalid.issuedBy && touched.issuedBy }"
            required
            @blur="onFieldTouched('issuedBy')"
          >
          <div class="invalid-feedback" v-if="isInvalid.issuedBy && touched.issuedBy">
            {{ $t('identity.issuedBy_required') }}
          </div>
        </div>
      </div>

      <!-- Passport specific fields -->
      <div v-if="internalDocument.type === 'PASSPORT'">
        <div class="row mb-2">
          <div class="col-md-6">
            <label class="form-label">{{ $t('identity.issuedCountry') }}</label>
            <select 
              v-model="internalDocument.issuedCountry" 
              class="form-select"
              :class="{ 'is-valid': isValid.issuedCountry && touched.issuedCountry, 'is-invalid': isInvalid.issuedCountry && touched.issuedCountry }"
              required
              @blur="onFieldTouched('issuedCountry')"
            >
              <option value="">{{ $t('identity.issuedCountry_placeholder') }}</option>
              <option v-for="country in countries" :key="country.geonameId" :value="country.countryName">
                {{ country.countryName }}
              </option>
            </select>
            <div class="invalid-feedback" v-if="isInvalid.issuedCountry && touched.issuedCountry">
              {{ $t('identity.issuedCountry_required') }}
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label">{{ $t('identity.notes') }}</label>
            <input 
              type="text" 
              v-model="internalDocument.notes" 
              class="form-control"
              :class="{ 'is-valid': internalDocument.notes && internalDocument.notes.trim().length > 0 && touched.notes }"
              @blur="onFieldTouched('notes')"
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import { toRefs, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'IdentityDocumentFields',
  props: {
    identityDocument: {
      type: Object,
      required: true
    },
    countries: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:identityDocument'],
  setup(props, { emit }) {
    const { t } = useI18n()
    console.log(t)
    const { identityDocument } = toRefs(props)
    
    const internalDocument = ref({...identityDocument.value})
    
    // Track touched state for each field
    const touched = ref({
      type: false,
      number: false,
      issueDate: false,
      expiryDate: false,
      issuedBy: false,
      hasChip: false,
      issuedCountry: false,
      notes: false
    })
    
    // Function to mark a field as touched
    const onFieldTouched = (field) => {
      touched.value[field] = true
    }
    
    // Mark all fields as touched (useful when submitting the form)
    const markAllFieldsTouched = () => {
      Object.keys(touched.value).forEach(field => {
        touched.value[field] = true
      })
    }
    
    // Validation state
    const isValid = ref({
      type: false,
      number: false,
      issueDate: false,
      expiryDate: false,
      issuedBy: false,
      hasChip: false,
      issuedCountry: false
    })
    
    const isInvalid = ref({
      type: false,
      number: false,
      issueDate: false,
      expiryDate: false,
      issuedBy: false,
      hasChip: false,
      issuedCountry: false
    })
    
    const validateDocumentNumber = () => {
      const number = internalDocument.value.number
      if (!number) {
        isValid.value.number = false
        isInvalid.value.number = number !== ''
        return false
      }
      
      let isValidNumber = false
      
      if (internalDocument.value.type === 'CMND') {
        // CMND must be 9 digits
        isValidNumber = /^[0-9]{9}$/.test(number)
      } else if (internalDocument.value.type === 'CCCD') {
        // CCCD must be 12 digits
        isValidNumber = /^[0-9]{12}$/.test(number)
      } else if (internalDocument.value.type === 'PASSPORT') {
        // Passport must be 1 uppercase letter followed by 8 digits
        isValidNumber = /^[A-Z][0-9]{8}$/.test(number)
      }
      
      isValid.value.number = isValidNumber
      isInvalid.value.number = !isValidNumber && number.length > 0
      
      return isValidNumber
    }
    
    const validateIssueDate = () => {
      const issueDate = internalDocument.value.issueDate
      if (!issueDate) {
        isValid.value.issueDate = false
        isInvalid.value.issueDate = false
        return false
      }
      
      const isValidDate = new Date(issueDate) <= new Date()
      
      isValid.value.issueDate = isValidDate
      isInvalid.value.issueDate = !isValidDate
      
      return isValidDate
    }
    
    const validateExpiryDate = () => {
      const expiryDate = internalDocument.value.expiryDate
      if (!expiryDate) {
        isValid.value.expiryDate = false
        isInvalid.value.expiryDate = false
        return false
      }
      
      const isValidDate = new Date(expiryDate) > new Date()
      
      isValid.value.expiryDate = isValidDate
      isInvalid.value.expiryDate = !isValidDate
      
      return isValidDate
    }
    
    const validateIssuedBy = () => {
      const issuedBy = internalDocument.value.issuedBy
      const isValidIssuedBy = issuedBy && issuedBy.trim().length > 0
      
      isValid.value.issuedBy = isValidIssuedBy
      isInvalid.value.issuedBy = !isValidIssuedBy && issuedBy !== undefined && issuedBy !== null
      
      return isValidIssuedBy
    }
    
    const validateType = () => {
      const type = internalDocument.value.type
      const isValidType = ['CMND', 'CCCD', 'PASSPORT'].includes(type)
      
      isValid.value.type = isValidType
      isInvalid.value.type = !isValidType
      
      return isValidType
    }
    
    const validateHasChip = () => {
      if (internalDocument.value.type !== 'CCCD') {
        isValid.value.hasChip = true
        isInvalid.value.hasChip = false
        return true
      }
      
      const hasChip = internalDocument.value.hasChip
      const isValidHasChip = hasChip !== undefined && hasChip !== null
      
      isValid.value.hasChip = isValidHasChip
      isInvalid.value.hasChip = !isValidHasChip
      
      return isValidHasChip
    }
    
    const validateIssuedCountry = () => {
      if (internalDocument.value.type !== 'PASSPORT') {
        isValid.value.issuedCountry = true
        isInvalid.value.issuedCountry = false
        return true
      }
      
      const issuedCountry = internalDocument.value.issuedCountry
      const isValidIssuedCountry = issuedCountry && issuedCountry.trim().length > 0
      
      isValid.value.issuedCountry = isValidIssuedCountry
      isInvalid.value.issuedCountry = !isValidIssuedCountry && issuedCountry !== undefined
      
      return isValidIssuedCountry
    }
    
    const validateAll = () => {
      validateType()
      validateDocumentNumber()
      validateIssueDate()
      validateExpiryDate()
      validateIssuedBy()
      validateHasChip()
      validateIssuedCountry()
    }
    
    const handleTypeChange = () => {
      const docType = internalDocument.value.type
      
      if (docType === 'CCCD') {
        internalDocument.value.hasChip = internalDocument.value.hasChip !== undefined ? 
          internalDocument.value.hasChip : true
        
        const newDocument = {...internalDocument.value}
        delete newDocument.issuedCountry
        delete newDocument.notes
        internalDocument.value = newDocument
      } 
      else if (docType === 'PASSPORT') {
        const newDocument = {...internalDocument.value}
        delete newDocument.hasChip
        
        // Set defaults
        newDocument.issuedCountry = newDocument.issuedCountry || 'Vietnam'
        internalDocument.value = newDocument
      } 
      else {
        const newDocument = {...internalDocument.value}
        delete newDocument.hasChip
        delete newDocument.issuedCountry
        delete newDocument.notes
        internalDocument.value = newDocument
      }
      
      touched.value.type = true
      
      validateAll()
      
      emit('update:identityDocument', {...internalDocument.value})
    }
    
    watch(() => internalDocument.value.number, () => {
      validateDocumentNumber()
      emit('update:identityDocument', {...internalDocument.value})
    })
    
    watch(() => internalDocument.value.issueDate, () => {
      validateIssueDate()
      emit('update:identityDocument', {...internalDocument.value})
    })
    
    watch(() => internalDocument.value.expiryDate, () => {
      validateExpiryDate()
      emit('update:identityDocument', {...internalDocument.value})
    })
    
    watch(() => internalDocument.value.issuedBy, () => {
      validateIssuedBy()
      emit('update:identityDocument', {...internalDocument.value})
    })
    
    watch(() => internalDocument.value.hasChip, () => {
      validateHasChip()
      emit('update:identityDocument', {...internalDocument.value})
    })
    
    watch(() => internalDocument.value.issuedCountry, () => {
      validateIssuedCountry()
      emit('update:identityDocument', {...internalDocument.value})
    })
    
    // Watch for prop changes
    watch(identityDocument, (newValue) => {
      if (JSON.stringify(internalDocument.value) !== JSON.stringify(newValue)) {
        internalDocument.value = {...newValue}
        // Validate after updating from props, but don't mark as touched
        validateAll()
      }
    }, { deep: true })
    
    // Initial validation on setup
    validateAll()
    
    return {
      internalDocument,
      isValid,
      isInvalid,
      touched,
      handleTypeChange,
      onFieldTouched,
      markAllFieldsTouched
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