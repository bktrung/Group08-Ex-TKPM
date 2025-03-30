<template>
    <div>
      <div class="section-title">Thông tin địa chỉ</div>
  
      <!-- Permanent Address -->
      <div class="mb-3">
        <label class="form-label fw-bold">Địa chỉ thường trú</label>
        <div class="row g-2">
          <div class="col-md-12">
            <input 
              type="text" 
              v-model="permanentAddress.houseNumberStreet" 
              class="form-control"
              placeholder="Số nhà, Tên đường"
            >
          </div>
        </div>
        <div class="row g-2 mt-1">
          <div class="col-md-4">
            <select 
              v-model="permanentAddress.country" 
              class="form-select"
              @change="handleCountryChange('permanent')"
            >
              <option value="">-- Chọn quốc gia --</option>
              <option 
                v-for="country in countries" 
                :key="country.geonameId" 
                :value="country.countryName"
                :data-geonameid="country.geonameId"
              >
                {{ country.countryName }}
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <select 
              v-model="permanentAddress.provinceCity" 
              class="form-select" 
              :disabled="!permanentProvinces.length"
              @change="handleProvinceChange('permanent')"
            >
              <option value="">-- Chọn tỉnh/thành phố --</option>
              <option 
                v-for="province in permanentProvinces" 
                :key="province.geonameId" 
                :value="province.toponymName || province.name"
                :data-geonameid="province.geonameId"
              >
                {{ province.toponymName || province.name }}
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <select 
              v-model="permanentAddress.districtCounty" 
              class="form-select" 
              :disabled="!permanentDistricts.length"
              @change="handleDistrictChange('permanent')"
            >
              <option value="">-- Chọn quận/huyện --</option>
              <option 
                v-for="district in permanentDistricts" 
                :key="district.geonameId" 
                :value="district.toponymName || district.name"
                :data-geonameid="district.geonameId"
              >
                {{ district.toponymName || district.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="row g-2 mt-1">
          <div class="col-md-12">
            <select 
              v-model="permanentAddress.wardCommune" 
              class="form-select" 
              :disabled="!permanentWards.length"
            >
              <option value="">-- Chọn phường/xã --</option>
              <option 
                v-for="ward in permanentWards" 
                :key="ward.geonameId" 
                :value="ward.toponymName || ward.name"
              >
                {{ ward.toponymName || ward.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
  
      <!-- Temporary Address -->
      <div class="mb-3">
        <label class="form-label fw-bold">Địa chỉ tạm trú</label>
        <div class="row g-2">
          <div class="col-md-12">
            <input 
              type="text" 
              v-model="temporaryAddress.houseNumberStreet" 
              class="form-control"
              placeholder="Số nhà, Tên đường"
            >
          </div>
        </div>
        <div class="row g-2 mt-1">
          <div class="col-md-4">
            <select 
              v-model="temporaryAddress.country" 
              class="form-select"
              @change="handleCountryChange('temporary')"
            >
              <option value="">-- Chọn quốc gia --</option>
              <option 
                v-for="country in countries" 
                :key="country.geonameId" 
                :value="country.countryName"
                :data-geonameid="country.geonameId"
              >
                {{ country.countryName }}
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <select 
              v-model="temporaryAddress.provinceCity" 
              class="form-select" 
              :disabled="!temporaryProvinces.length"
              @change="handleProvinceChange('temporary')"
            >
              <option value="">-- Chọn tỉnh/thành phố --</option>
              <option 
                v-for="province in temporaryProvinces" 
                :key="province.geonameId" 
                :value="province.toponymName || province.name"
                :data-geonameid="province.geonameId"
              >
                {{ province.toponymName || province.name }}
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <select 
              v-model="temporaryAddress.districtCounty" 
              class="form-select" 
              :disabled="!temporaryDistricts.length"
              @change="handleDistrictChange('temporary')"
            >
              <option value="">-- Chọn quận/huyện --</option>
              <option 
                v-for="district in temporaryDistricts" 
                :key="district.geonameId" 
                :value="district.toponymName || district.name"
                :data-geonameid="district.geonameId"
              >
                {{ district.toponymName || district.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="row g-2 mt-1">
          <div class="col-md-12">
            <select 
              v-model="temporaryAddress.wardCommune" 
              class="form-select" 
              :disabled="!temporaryWards.length"
            >
              <option value="">-- Chọn phường/xã --</option>
              <option 
                v-for="ward in temporaryWards" 
                :key="ward.geonameId" 
                :value="ward.toponymName || ward.name"
              >
                {{ ward.toponymName || ward.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
  
      <!-- Mailing Address -->
      <div class="mb-3">
        <label class="form-label fw-bold">Địa chỉ nhận thư <span class="text-danger">*</span></label>
        <div class="row g-2">
          <div class="col-md-12">
            <input 
              type="text" 
              v-model="mailingAddress.houseNumberStreet" 
              class="form-control"
              placeholder="Số nhà, Tên đường"
              required
            >
          </div>
        </div>
        <div class="row g-2 mt-1">
          <div class="col-md-4">
            <select 
              v-model="mailingAddress.country" 
              class="form-select"
              @change="handleCountryChange('mailing')"
              required
            >
              <option value="">-- Chọn quốc gia --</option>
              <option 
                v-for="country in countries" 
                :key="country.geonameId" 
                :value="country.countryName"
                :data-geonameid="country.geonameId"
              >
                {{ country.countryName }}
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <select 
              v-model="mailingAddress.provinceCity" 
              class="form-select" 
              :disabled="!mailingProvinces.length"
              @change="handleProvinceChange('mailing')"
              required
            >
              <option value="">-- Chọn tỉnh/thành phố --</option>
              <option 
                v-for="province in mailingProvinces" 
                :key="province.geonameId" 
                :value="province.toponymName || province.name"
                :data-geonameid="province.geonameId"
              >
                {{ province.toponymName || province.name }}
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <select 
              v-model="mailingAddress.districtCounty" 
              class="form-select" 
              :disabled="!mailingDistricts.length"
              @change="handleDistrictChange('mailing')"
              required
            >
              <option value="">-- Chọn quận/huyện --</option>
              <option 
                v-for="district in mailingDistricts" 
                :key="district.geonameId" 
                :value="district.toponymName || district.name"
                :data-geonameid="district.geonameId"
              >
                {{ district.toponymName || district.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="row g-2 mt-1">
          <div class="col-md-12">
            <select 
              v-model="mailingAddress.wardCommune" 
              class="form-select" 
              :disabled="!mailingWards.length"
            >
              <option value="">-- Chọn phường/xã --</option>
              <option 
                v-for="ward in mailingWards" 
                :key="ward.geonameId" 
                :value="ward.toponymName || ward.name"
              >
                {{ ward.toponymName || ward.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, toRefs, computed, watch } from 'vue'
  
  export default {
    name: 'AddressFields',
    props: {
      mailingAddress: {
        type: Object,
        required: true
      },
      permanentAddress: {
        type: Object,
        required: true
      },
      temporaryAddress: {
        type: Object,
        required: true
      },
      countries: {
        type: Array,
        default: () => []
      },
      loading: {
        type: Boolean,
        default: false
      }
    },
    emits: [
      'update:mailingAddress',
      'update:permanentAddress',
      'update:temporaryAddress',
      'loadChildren'
    ],
    setup(props, { emit }) {
      const { mailingAddress, permanentAddress, temporaryAddress } = toRefs(props)
      
      // State for location data
      const mailingProvinces = ref([])
      const mailingDistricts = ref([])
      const mailingWards = ref([])
      
      const permanentProvinces = ref([])
      const permanentDistricts = ref([])
      const permanentWards = ref([])
      
      const temporaryProvinces = ref([])
      const temporaryDistricts = ref([])
      const temporaryWards = ref([])
      
      // Helper function to get geonameId from select element
      const getGeonameId = (type, field) => {
        const selectElement = document.querySelector(`select[v-model="${type}Address.${field}"]`)
        if (!selectElement) return null
        
        const selectedOption = selectElement.options[selectElement.selectedIndex]
        return selectedOption ? selectedOption.getAttribute('data-geonameid') : null
      }
      
      // Event handlers
      const handleCountryChange = async (type) => {
        const address = getAddressByType(type)
        const geonameId = getGeonameIdFromElement(`select[v-model="${type}Address.country"]`)
        
        if (!geonameId) return
        
        // Reset dependent dropdowns
        resetProvinces(type)
        resetDistricts(type)
        resetWards(type)
        
        // Load provinces
        const children = await emit('loadChildren', geonameId, type, 'province')
        if (!children) return
        
        const provinces = children.geonames || children
        setProvincesByType(type, provinces)
      }
      
      const handleProvinceChange = async (type) => {
        const address = getAddressByType(type)
        const geonameId = getGeonameIdFromElement(`select[v-model="${type}Address.provinceCity"]`)
        
        if (!geonameId) return
        
        // Reset dependent dropdowns
        resetDistricts(type)
        resetWards(type)
        
        // Load districts
        const children = await emit('loadChildren', geonameId, type, 'district')
        if (!children) return
        
        const districts = children.geonames || children
        setDistrictsByType(type, districts)
      }
      
      const handleDistrictChange = async (type) => {
        const address = getAddressByType(type)
        const geonameId = getGeonameIdFromElement(`select[v-model="${type}Address.districtCounty"]`)
        
        if (!geonameId) return
        
        // Reset ward dropdown
        resetWards(type)
        
        // Load wards
        const children = await emit('loadChildren', geonameId, type, 'ward')
        if (!children) return
        
        const wards = children.geonames || children
        setWardsByType(type, wards)
      }
      
      // Helper functions
      const getAddressByType = (type) => {
        switch (type) {
          case 'mailing': return mailingAddress.value
          case 'permanent': return permanentAddress.value
          case 'temporary': return temporaryAddress.value
          default: return null
        }
      }
      
      const getGeonameIdFromElement = (selector) => {
        const element = document.querySelector(selector)
        if (!element) return null
        
        const selectedOption = element.options[element.selectedIndex]
        return selectedOption ? selectedOption.getAttribute('data-geonameid') : null
      }
      
      const resetProvinces = (type) => {
        switch (type) {
          case 'mailing':
            mailingProvinces.value = []
            mailingAddress.value.provinceCity = ''
            break
          case 'permanent':
            permanentProvinces.value = []
            permanentAddress.value.provinceCity = ''
            break
          case 'temporary':
            temporaryProvinces.value = []
            temporaryAddress.value.provinceCity = ''
            break
        }
      }
      
      const resetDistricts = (type) => {
        switch (type) {
          case 'mailing':
            mailingDistricts.value = []
            mailingAddress.value.districtCounty = ''
            break
          case 'permanent':
            permanentDistricts.value = []
            permanentAddress.value.districtCounty = ''
            break
          case 'temporary':
            temporaryDistricts.value = []
            temporaryAddress.value.districtCounty = ''
            break
        }
      }
      
      const resetWards = (type) => {
        switch (type) {
          case 'mailing':
            mailingWards.value = []
            mailingAddress.value.wardCommune = ''
            break
          case 'permanent':
            permanentWards.value = []
            permanentAddress.value.wardCommune = ''
            break
          case 'temporary':
            temporaryWards.value = []
            temporaryAddress.value.wardCommune = ''
            break
        }
      }
      
      const setProvincesByType = (type, provinces) => {
        switch (type) {
          case 'mailing':
            mailingProvinces.value = provinces
            break
          case 'permanent':
            permanentProvinces.value = provinces
            break
          case 'temporary':
            temporaryProvinces.value = provinces
            break
        }
      }
      
      const setDistrictsByType = (type, districts) => {
        switch (type) {
          case 'mailing':
            mailingDistricts.value = districts
            break
          case 'permanent':
            permanentDistricts.value = districts
            break
          case 'temporary':
            temporaryDistricts.value = districts
            break
        }
      }
      
      const setWardsByType = (type, wards) => {
        switch (type) {
          case 'mailing':
            mailingWards.value = wards
            break
          case 'permanent':
            permanentWards.value = wards
            break
          case 'temporary':
            temporaryWards.value = wards
            break
        }
      }
      
      // Watch for changes in addresses
      watch(mailingAddress, (newValue) => {
        emit('update:mailingAddress', newValue)
      }, { deep: true })
      
      watch(permanentAddress, (newValue) => {
        emit('update:permanentAddress', newValue)
      }, { deep: true })
      
      watch(temporaryAddress, (newValue) => {
        emit('update:temporaryAddress', newValue)
      }, { deep: true })
      
      return {
        mailingProvinces,
        mailingDistricts,
        mailingWards,
        permanentProvinces,
        permanentDistricts,
        permanentWards,
        temporaryProvinces,
        temporaryDistricts,
        temporaryWards,
        handleCountryChange,
        handleProvinceChange,
        handleDistrictChange
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