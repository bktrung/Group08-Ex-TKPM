<template>
  <div>
    <div class="section-title">Giấy tờ chứng minh nhân thân</div>
    <div class="mb-3">
      <div class="row mb-2">
        <div class="col-md-4">
          <label class="form-label">Loại giấy tờ</label>
          <select id="identity-type" v-model="internalDocument.type" class="form-select" required @change="handleTypeChange">
            <option value="CMND">Chứng minh nhân dân (CMND)</option>
            <option value="CCCD">Căn cước công dân (CCCD)</option>
            <option value="PASSPORT">Hộ chiếu (Passport)</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label">Số giấy tờ</label>
          <input type="text" v-model="internalDocument.number" class="form-control" required>
        </div>
        <div class="col-md-4" v-if="internalDocument.type === 'CCCD'">
          <label class="form-label">Có gắn chip</label>
          <select v-model="internalDocument.hasChip" class="form-select">
            <option :value="true">Có</option>
            <option :value="false">Không</option>
          </select>
        </div>
      </div>

      <div class="row mb-2">
        <div class="col-md-4">
          <label class="form-label">Ngày cấp</label>
          <input type="date" v-model="internalDocument.issueDate" class="form-control" required>
        </div>
        <div class="col-md-4">
          <label class="form-label">Ngày hết hạn</label>
          <input type="date" v-model="internalDocument.expiryDate" class="form-control" required>
        </div>
        <div class="col-md-4">
          <label class="form-label">Nơi cấp</label>
          <input type="text" v-model="internalDocument.issuedBy" class="form-control" required>
        </div>
      </div>

      <!-- Passport specific fields -->
      <div v-if="internalDocument.type === 'PASSPORT'">
        <div class="row mb-2">
          <div class="col-md-6">
            <label class="form-label">Quốc gia cấp</label>
            <select v-model="internalDocument.issuedCountry" class="form-select">
              <option value="">-- Chọn quốc gia --</option>
              <option v-for="country in countries" :key="country.geonameId" :value="country.countryName">
                {{ country.countryName }}
              </option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Ghi chú (nếu có)</label>
            <input type="text" v-model="internalDocument.notes" class="form-control">
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
    
    const handleTypeChange = () => {
      const docType = internalDocument.value.type
      
      if (docType === 'CCCD') {
        internalDocument.value.hasChip = true
        
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
      
      emit('update:identityDocument', {...internalDocument.value})
    }
    
    watch(identityDocument, (newValue) => {
      if (JSON.stringify(internalDocument.value) !== JSON.stringify(newValue)) {
        internalDocument.value = {...newValue}
      }
    }, { deep: true })

    watch(internalDocument, (newValue) => {
      if (JSON.stringify(identityDocument.value) !== JSON.stringify(newValue)) {
        emit('update:identityDocument', {...newValue})
      }
    }, { deep: true })
    
    return {
      internalDocument,
      handleTypeChange
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