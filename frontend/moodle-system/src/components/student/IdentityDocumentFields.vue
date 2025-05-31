<template>
  <div>
    <div class="section-title">Giấy tờ chứng minh nhân thân</div>
    <div class="mb-3">
      <div class="row mb-2">
        <div class="col-md-4">
          <label class="form-label">Loại giấy tờ</label>
          <select 
            id="identity-type" 
            v-model="internalDocument.type" 
            class="form-select" 
            :class="{ 'is-valid': isValid.type && touched.type, 'is-invalid': isInvalid.type && touched.type }"
            required 
            @change="handleTypeChange"
            @blur="onFieldTouched('type')"
          >
            <option value="CMND">Chứng minh nhân dân (CMND)</option>
            <option value="CCCD">Căn cước công dân (CCCD)</option>
            <option value="PASSPORT">Hộ chiếu (Passport)</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label">Số giấy tờ</label>
          <input 
            type="text" 
            v-model="internalDocument.number" 
            class="form-control" 
            :class="{ 'is-valid': isValid.number && touched.number, 'is-invalid': isInvalid.number && touched.number }"
            required
            @blur="onFieldTouched('number')"
          >
          <div class="invalid-feedback" v-if="isInvalid.number && touched.number">
            <span v-if="internalDocument.type === 'CMND'">Số CMND phải có đúng 9 chữ số</span>
            <span v-else-if="internalDocument.type === 'CCCD'">Số CCCD phải có đúng 12 chữ số</span>
            <span v-else-if="internalDocument.type === 'PASSPORT'">Số hộ chiếu phải có 1 chữ cái viết hoa và 8 chữ số</span>
          </div>
        </div>
        <div class="col-md-4" v-if="internalDocument.type === 'CCCD'">
          <label class="form-label">Có gắn chip</label>
          <select 
            v-model="internalDocument.hasChip" 
            class="form-select"
            :class="{ 'is-valid': isValid.hasChip && touched.hasChip, 'is-invalid': isInvalid.hasChip && touched.hasChip }"
            @blur="onFieldTouched('hasChip')"
          >
            <option :value="true">Có</option>
            <option :value="false">Không</option>
          </select>
          <div class="invalid-feedback" v-if="isInvalid.hasChip && touched.hasChip">
            Thông tin về chip là trường bắt buộc
          </div>
        </div>
      </div>

      <div class="row mb-2">
        <div class="col-md-4">
          <label class="form-label">Ngày cấp</label>
          <input 
            type="date" 
            v-model="internalDocument.issueDate" 
            class="form-control" 
            :class="{ 'is-valid': isValid.issueDate && touched.issueDate, 'is-invalid': isInvalid.issueDate && touched.issueDate }"
            required
            @blur="onFieldTouched('issueDate')"
          >
          <div class="invalid-feedback" v-if="isInvalid.issueDate && touched.issueDate">
            Ngày cấp không thể trong tương lai
          </div>
        </div>
        <div class="col-md-4">
          <label class="form-label">Ngày hết hạn</label>
          <input 
            type="date" 
            v-model="internalDocument.expiryDate" 
            class="form-control" 
            :class="{ 'is-valid': isValid.expiryDate && touched.expiryDate, 'is-invalid': isInvalid.expiryDate && touched.expiryDate }"
            required
            @blur="onFieldTouched('expiryDate')"
          >
          <div class="invalid-feedback" v-if="isInvalid.expiryDate && touched.expiryDate">
            Ngày hết hạn phải sau ngày hiện tại
          </div>
        </div>
        <div class="col-md-4">
          <label class="form-label">Nơi cấp</label>
          <input 
            type="text" 
            v-model="internalDocument.issuedBy" 
            class="form-control" 
            :class="{ 'is-valid': isValid.issuedBy && touched.issuedBy, 'is-invalid': isInvalid.issuedBy && touched.issuedBy }"
            required
            @blur="onFieldTouched('issuedBy')"
          >
          <div class="invalid-feedback" v-if="isInvalid.issuedBy && touched.issuedBy">
            Nơi cấp không được để trống
          </div>
        </div>
      </div>

      <!-- Passport specific fields -->
      <div v-if="internalDocument.type === 'PASSPORT'">
        <div class="row mb-2">
          <div class="col-md-6">
            <label class="form-label">Quốc gia cấp</label>
            <select 
              v-model="internalDocument.issuedCountry" 
              class="form-select"
              :class="{ 'is-valid': isValid.issuedCountry && touched.issuedCountry, 'is-invalid': isInvalid.issuedCountry && touched.issuedCountry }"
              required
              @blur="onFieldTouched('issuedCountry')"
            >
              <option value="">-- Chọn quốc gia --</option>
              <option v-for="country in countries" :key="country.geonameId" :value="country.countryName">
                {{ country.countryName }}
              </option>
            </select>
            <div class="invalid-feedback" v-if="isInvalid.issuedCountry && touched.issuedCountry">
              Quốc gia cấp không được để trống
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label">Ghi chú (nếu có)</label>
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
    const { identityDocument } = toRefs(props)
    
    const internalDocument = ref({...identityDocument.value})
    
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
    
    const validationRules = {
      CMND: /^[0-9]{9}$/,
      CCCD: /^[0-9]{12}$/,
      PASSPORT: /^[A-Z][0-9]{8}$/
    }
    
    const onFieldTouched = (field) => {
      touched.value[field] = true
    }
    
    const markAllFieldsTouched = () => {
      Object.keys(touched.value).forEach(field => {
        touched.value[field] = true
      })
    }
    
    const validateField = (field, value) => {
      let isFieldValid = false
      let isFieldInvalid = false
      
      switch (field) {
        case 'type':
          isFieldValid = ['CMND', 'CCCD', 'PASSPORT'].includes(value)
          isFieldInvalid = !isFieldValid
          break
          
        case 'number':
          if (!value) {
            isFieldValid = false
            isFieldInvalid = value !== ''
          } else {
            const rule = validationRules[internalDocument.value.type]
            isFieldValid = rule ? rule.test(value) : false
            isFieldInvalid = !isFieldValid && value.length > 0
          }
          break
          
        case 'issueDate':
          if (!value) {
            isFieldValid = false
            isFieldInvalid = false
          } else {
            isFieldValid = new Date(value) <= new Date()
            isFieldInvalid = !isFieldValid
          }
          break
          
        case 'expiryDate':
          if (!value) {
            isFieldValid = false
            isFieldInvalid = false
          } else {
            isFieldValid = new Date(value) > new Date()
            isFieldInvalid = !isFieldValid
          }
          break
          
        case 'issuedBy':
          isFieldValid = value && value.trim().length > 0
          isFieldInvalid = !isFieldValid && value !== undefined && value !== null
          break
          
        case 'hasChip':
          if (internalDocument.value.type !== 'CCCD') {
            isFieldValid = true
            isFieldInvalid = false
          } else {
            isFieldValid = value !== undefined && value !== null
            isFieldInvalid = !isFieldValid
          }
          break
          
        case 'issuedCountry':
          if (internalDocument.value.type !== 'PASSPORT') {
            isFieldValid = true
            isFieldInvalid = false
          } else {
            isFieldValid = value && value.trim().length > 0
            isFieldInvalid = !isFieldValid && value !== undefined
          }
          break
      }
      
      isValid.value[field] = isFieldValid
      isInvalid.value[field] = isFieldInvalid
      
      return isFieldValid
    }
    
    const validateAllFields = () => {
      const fields = ['type', 'number', 'issueDate', 'expiryDate', 'issuedBy', 'hasChip', 'issuedCountry']
      fields.forEach(field => {
        validateField(field, internalDocument.value[field])
      })
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
      validateAllFields()
      emit('update:identityDocument', {...internalDocument.value})
    }
    
    const setupFieldWatchers = () => {
      const fieldWatchers = [
        'number', 'issueDate', 'expiryDate', 'issuedBy', 'hasChip', 'issuedCountry'
      ]
      
      fieldWatchers.forEach(field => {
        watch(() => internalDocument.value[field], (newValue) => {
          validateField(field, newValue)
          emit('update:identityDocument', {...internalDocument.value})
        })
      })
    }
    
    const setupPropsWatcher = () => {
      watch(identityDocument, (newValue) => {
        if (JSON.stringify(internalDocument.value) !== JSON.stringify(newValue)) {
          internalDocument.value = {...newValue}
          validateAllFields()
        }
      }, { deep: true })
    }
    
    setupFieldWatchers()
    setupPropsWatcher()
    validateAllFields()
    
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