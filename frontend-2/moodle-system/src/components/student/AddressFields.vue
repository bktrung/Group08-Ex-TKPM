<template>
  <div>
    <div class="section-title">Thông tin địa chỉ</div>

    <div class="mb-3">
      <label class="form-label fw-bold">Địa chỉ thường trú</label>
      <div class="row g-2">
        <div class="col-md-12">
          <input 
            type="text" 
            v-model="internalPermanentAddress.houseNumberStreet" 
            class="form-control"
            placeholder="Số nhà, Tên đường"
          >
        </div>
      </div>
      <div class="row g-2 mt-1">
        <div class="col-md-4">
          <select 
            v-model="internalPermanentAddress.country" 
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
            v-model="internalPermanentAddress.provinceCity" 
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
            v-model="internalPermanentAddress.districtCounty" 
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
            v-model="internalPermanentAddress.wardCommune" 
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

    <div class="mb-3">
      <label class="form-label fw-bold">Địa chỉ tạm trú</label>
      <div class="row g-2">
        <div class="col-md-12">
          <input 
            type="text" 
            v-model="internalTemporaryAddress.houseNumberStreet" 
            class="form-control"
            placeholder="Số nhà, Tên đường"
          >
        </div>
      </div>
      <div class="row g-2 mt-1">
        <div class="col-md-4">
          <select 
            v-model="internalTemporaryAddress.country" 
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
            v-model="internalTemporaryAddress.provinceCity" 
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
            v-model="internalTemporaryAddress.districtCounty" 
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
            v-model="internalTemporaryAddress.wardCommune" 
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

    <div class="mb-3">
      <label class="form-label fw-bold">Địa chỉ nhận thư <span class="text-danger">*</span></label>
      <div class="row g-2">
        <div class="col-md-12">
          <input 
            type="text" 
            v-model="internalMailingAddress.houseNumberStreet" 
            class="form-control"
            placeholder="Số nhà, Tên đường"
            required
          >
        </div>
      </div>
      <div class="row g-2 mt-1">
        <div class="col-md-4">
          <select 
            v-model="internalMailingAddress.country" 
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
            v-model="internalMailingAddress.provinceCity" 
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
            v-model="internalMailingAddress.districtCounty" 
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
            v-model="internalMailingAddress.wardCommune" 
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
  import { ref, toRefs, watch } from 'vue'

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
      
      // Create internal copies of the addresses to avoid direct prop mutation
      const internalMailingAddress = ref({...mailingAddress.value})
      const internalPermanentAddress = ref({...permanentAddress.value})
      const internalTemporaryAddress = ref({...temporaryAddress.value})
      
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
      
      // Event handlers
      const handleCountryChange = async (type) => {
        const geonameId = getGeonameIdFromElement(`select[v-model="internal${type}Address.country"]`)
        
        if (!geonameId) return
        
        // Reset dependent dropdowns
        resetProvincesByType(type)
        resetDistrictsByType(type)
        resetWardsByType(type)
        
        // Load provinces
        const children = await emit('loadChildren', geonameId, type, 'province')
        if (!children) return
        
        const provinces = children.geonames || children
        setProvincesByType(type, provinces)
        
        // Update the parent
        updateAddressByType(type)
      }
      
      const handleProvinceChange = async (type) => {
        const geonameId = getGeonameIdFromElement(`select[v-model="internal${type}Address.provinceCity"]`)
        
        if (!geonameId) return
        
        // Reset dependent dropdowns
        resetDistrictsByType(type)
        resetWardsByType(type)
        
        // Load districts
        const children = await emit('loadChildren', geonameId, type, 'district')
        if (!children) return
        
        const districts = children.geonames || children
        setDistrictsByType(type, districts)
        
        // Update the parent
        updateAddressByType(type)
      }
      
      const handleDistrictChange = async (type) => {
        const geonameId = getGeonameIdFromElement(`select[v-model="internal${type}Address.districtCounty"]`)
        
        if (!geonameId) return
        
        // Reset ward dropdown
        resetWardsByType(type)
        
        const children = await emit('loadChildren', geonameId, type, 'ward')
        if (!children) return
        
        const wards = children.geonames || children
        setWardsByType(type, wards)
        
        // Update the parent
        updateAddressByType(type)
      }
      
      const getGeonameIdFromElement = (selector) => {
        const element = document.querySelector(selector)
        if (!element) return null
        
        const selectedOption = element.options[element.selectedIndex]
        return selectedOption ? selectedOption.getAttribute('data-geonameid') : null
      }
      
      const updateAddressByType = (type) => {
        const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1)
        switch (capitalizedType) {
          case 'Mailing':
            emit('update:mailingAddress', {...internalMailingAddress.value})
            break
          case 'Permanent':
            emit('update:permanentAddress', {...internalPermanentAddress.value})
            break
          case 'Temporary':
            emit('update:temporaryAddress', {...internalTemporaryAddress.value})
            break
        }
      }
      
      const resetProvincesByType = (type) => {
        const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1)
        switch (capitalizedType) {
          case 'Mailing':
            mailingProvinces.value = []
            internalMailingAddress.value.provinceCity = ''
            break
          case 'Permanent':
            permanentProvinces.value = []
            internalPermanentAddress.value.provinceCity = ''
            break
          case 'Temporary':
            temporaryProvinces.value = []
            internalTemporaryAddress.value.provinceCity = ''
            break
        }
        updateAddressByType(type)
      }
      
      const resetDistrictsByType = (type) => {
        const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1)
        switch (capitalizedType) {
          case 'Mailing':
            mailingDistricts.value = []
            internalMailingAddress.value.districtCounty = ''
            break
          case 'Permanent':
            permanentDistricts.value = []
            internalPermanentAddress.value.districtCounty = ''
            break
          case 'Temporary':
            temporaryDistricts.value = []
            internalTemporaryAddress.value.districtCounty = ''
            break
        }
        updateAddressByType(type)
      }
      
      const resetWardsByType = (type) => {
        const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1)
        switch (capitalizedType) {
          case 'Mailing':
            mailingWards.value = []
            internalMailingAddress.value.wardCommune = ''
            break
          case 'Permanent':
            permanentWards.value = []
            internalPermanentAddress.value.wardCommune = ''
            break
          case 'Temporary':
            temporaryWards.value = []
            internalTemporaryAddress.value.wardCommune = ''
            break
        }
        updateAddressByType(type)
      }
      
      const setProvincesByType = (type, provinces) => {
        const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1)
        switch (capitalizedType) {
          case 'Mailing':
            mailingProvinces.value = provinces
            break
          case 'Permanent':
            permanentProvinces.value = provinces
            break
          case 'Temporary':
            temporaryProvinces.value = provinces
            break
        }
      }
      
      const setDistrictsByType = (type, districts) => {
        const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1)
        switch (capitalizedType) {
          case 'Mailing':
            mailingDistricts.value = districts
            break
          case 'Permanent':
            permanentDistricts.value = districts
            break
          case 'Temporary':
            temporaryDistricts.value = districts
            break
        }
      }
      
      const setWardsByType = (type, wards) => {
        const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1)
        switch (capitalizedType) {
          case 'Mailing':
            mailingWards.value = wards
            break
          case 'Permanent':
            permanentWards.value = wards
            break
          case 'Temporary':
            temporaryWards.value = wards
            break
        }
      }
      
      // Watch for changes in props to sync internal state
      watch(mailingAddress, (newValue) => {
        internalMailingAddress.value = {...newValue}
      }, { deep: true })
      
      watch(permanentAddress, (newValue) => {
        internalPermanentAddress.value = {...newValue}
      }, { deep: true })
      
      watch(temporaryAddress, (newValue) => {
        internalTemporaryAddress.value = {...newValue}
      }, { deep: true })
      
      // Watch for changes in internal state to emit updates
      watch(internalMailingAddress, (newValue) => {
        emit('update:mailingAddress', {...newValue})
      }, { deep: true })
      
      watch(internalPermanentAddress, (newValue) => {
        emit('update:permanentAddress', {...newValue})
      }, { deep: true })
      
      watch(internalTemporaryAddress, (newValue) => {
        emit('update:temporaryAddress', {...newValue})
      }, { deep: true })
      
      return {
        internalMailingAddress,
        internalPermanentAddress,
        internalTemporaryAddress,
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