<template>
    <div>
      <div class="section-title">Giấy tờ chứng minh nhân thân</div>
      <div class="mb-3">
        <div class="row mb-2">
          <div class="col-md-4">
            <label class="form-label">Loại giấy tờ</label>
            <select id="identity-type" v-model="identityDocument.type" class="form-select" required @change="handleTypeChange">
              <option value="CMND">Chứng minh nhân dân (CMND)</option>
              <option value="CCCD">Căn cước công dân (CCCD)</option>
              <option value="PASSPORT">Hộ chiếu (Passport)</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Số giấy tờ</label>
            <input type="text" v-model="identityDocument.number" class="form-control" required>
          </div>
          <div class="col-md-4" v-if="identityDocument.type === 'CCCD'">
            <label class="form-label">Có gắn chip</label>
            <select v-model="identityDocument.hasChip" class="form-select">
              <option :value="true">Có</option>
              <option :value="false">Không</option>
            </select>
          </div>
        </div>
  
        <div class="row mb-2">
          <div class="col-md-4">
            <label class="form-label">Ngày cấp</label>
            <input type="date" v-model="identityDocument.issueDate" class="form-control" required>
          </div>
          <div class="col-md-4">
            <label class="form-label">Ngày hết hạn</label>
            <input type="date" v-model="identityDocument.expiryDate" class="form-control" required>
          </div>
          <div class="col-md-4">
            <label class="form-label">Nơi cấp</label>
            <input type="text" v-model="identityDocument.issuedBy" class="form-control" required>
          </div>
        </div>
  
        <!-- Passport specific fields -->
        <div v-if="identityDocument.type === 'PASSPORT'">
          <div class="row mb-2">
            <div class="col-md-6">
              <label class="form-label">Quốc gia cấp</label>
              <select v-model="identityDocument.issuedCountry" class="form-select">
                <option value="">-- Chọn quốc gia --</option>
                <option v-for="country in countries" :key="country.geonameId" :value="country.countryName">
                  {{ country.countryName }}
                </option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Ghi chú (nếu có)</label>
              <input type="text" v-model="identityDocument.notes" class="form-control">
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { toRefs, watch } from 'vue'
  
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
      
      const handleTypeChange = () => {
        if (identityDocument.value.type === 'CCCD') {
          identityDocument.value.hasChip = true
          if (identityDocument.value.issuedCountry || identityDocument.value.notes) {
            delete identityDocument.value.issuedCountry
            delete identityDocument.value.notes
          }
        } else if (identityDocument.value.type === 'PASSPORT') {
          if ('hasChip' in identityDocument.value) {
            delete identityDocument.value.hasChip
          }
          identityDocument.value.issuedCountry = identityDocument.value.issuedCountry || 'Vietnam'
        } else {
          if ('hasChip' in identityDocument.value) {
            delete identityDocument.value.hasChip
          }
          if (identityDocument.value.issuedCountry || identityDocument.value.notes) {
            delete identityDocument.value.issuedCountry
            delete identityDocument.value.notes
          }
        }
      }
      
      watch(identityDocument, (newValue) => {
        emit('update:identityDocument', newValue)
      }, { deep: true })
      
      return {
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