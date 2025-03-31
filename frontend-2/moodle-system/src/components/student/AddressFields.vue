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
            :disabled="permanentProvincesDisabled"
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
            :disabled="permanentDistrictsDisabled"
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
            :disabled="permanentWardsDisabled"
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
            :disabled="temporaryProvincesDisabled"
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
            :disabled="temporaryDistrictsDisabled"
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
            :disabled="temporaryWardsDisabled"
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
            :disabled="mailingProvincesDisabled"
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
            :disabled="mailingDistrictsDisabled"
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
            :disabled="mailingWardsDisabled"
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
    },
    fetchLocationData: {
      type: Function,
      required: true
    }
  },
  emits: [
    'update:mailingAddress',
    'update:permanentAddress',
    'update:temporaryAddress'
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
    
    // State for controlling disabled status of dropdowns
    const mailingProvincesDisabled = ref(true)
    const mailingDistrictsDisabled = ref(true)
    const mailingWardsDisabled = ref(true)
    
    const permanentProvincesDisabled = ref(true)
    const permanentDistrictsDisabled = ref(true)
    const permanentWardsDisabled = ref(true)
    
    const temporaryProvincesDisabled = ref(true)
    const temporaryDistrictsDisabled = ref(true)
    const temporaryWardsDisabled = ref(true)
    
    // Event handlers
    const handleCountryChange = async (type) => {
      // Get the internal address object for this type
      const addressObj = type === 'mailing' ? internalMailingAddress.value : 
                       type === 'permanent' ? internalPermanentAddress.value :
                       internalTemporaryAddress.value
                       
      // Find the country name from the address
      const countryName = addressObj.country
      
      // Find the country object from the countries prop
      const country = props.countries.find(c => c.countryName === countryName)
      
      // Get the geonameId from the country object
      const geonameId = country ? country.geonameId : null
      
      if (!geonameId) {
        console.error(`Could not find geonameId for country: ${countryName}`)
        return
      }
      
      console.log(`Found geonameId ${geonameId} for country ${countryName}`)
      
      // Reset dependent dropdowns
      resetProvincesByType(type)
      resetDistrictsByType(type)
      resetWardsByType(type)
      
      try {
        // Use the fetchLocationData prop function to get the data directly
        const result = await props.fetchLocationData(geonameId)
        console.log(`Received children for ${type}:`, result)
        
        if (result && (result.geonames || Array.isArray(result))) {
          const provinces = result.geonames || result
          console.log(`Setting ${provinces.length} provinces for ${type}`)
          setProvincesByType(type, provinces)
          enableProvincesByType(type)
        } else {
          console.error(`No valid province data received for ${type}`)
        }
      } catch (error) {
        console.error(`Error in handleCountryChange for ${type}:`, error)
      }
      
      // Update parent after all changes
      updateAddressByType(type)
    }
    
    const handleProvinceChange = async (type) => {
      // Get the selected province element and its geonameId
      const addressObj = type === 'mailing' ? internalMailingAddress.value : 
                       type === 'permanent' ? internalPermanentAddress.value :
                       internalTemporaryAddress.value
      
      const provinceCity = addressObj.provinceCity
      
      // Find the province in the provinces array for this type
      let provinces = []
      if (type === 'mailing') provinces = mailingProvinces.value
      else if (type === 'permanent') provinces = permanentProvinces.value
      else provinces = temporaryProvinces.value
      
      const province = provinces.find(p => 
        (p.toponymName === provinceCity || p.name === provinceCity)
      )
      
      const geonameId = province ? province.geonameId : null
      
      if (!geonameId) {
        console.error(`Could not find geonameId for province: ${provinceCity}`)
        return
      }
      
      console.log(`Found geonameId ${geonameId} for province ${provinceCity}`)
      
      // Reset dependent dropdowns
      resetDistrictsByType(type)
      resetWardsByType(type)
      
      try {
        // Use the fetchLocationData prop function to get the data directly
        const result = await props.fetchLocationData(geonameId)
        console.log(`Received districts for ${type}:`, result)
        
        if (result && (result.geonames || Array.isArray(result))) {
          const districts = result.geonames || result
          console.log(`Setting ${districts.length} districts for ${type}`)
          setDistrictsByType(type, districts)
          enableDistrictsByType(type)
        } else {
          console.error(`No valid district data received for ${type}`)
        }
      } catch (error) {
        console.error(`Error in handleProvinceChange for ${type}:`, error)
      }
      
      // Update parent after all changes
      updateAddressByType(type)
    }
    
    const handleDistrictChange = async (type) => {
      // Get the selected district element and its geonameId
      const addressObj = type === 'mailing' ? internalMailingAddress.value : 
                       type === 'permanent' ? internalPermanentAddress.value :
                       internalTemporaryAddress.value
      
      const districtCounty = addressObj.districtCounty
      
      // Find the district in the districts array for this type
      let districts = []
      if (type === 'mailing') districts = mailingDistricts.value
      else if (type === 'permanent') districts = permanentDistricts.value
      else districts = temporaryDistricts.value
      
      const district = districts.find(d => 
        (d.toponymName === districtCounty || d.name === districtCounty)
      )
      
      const geonameId = district ? district.geonameId : null
      
      if (!geonameId) {
        console.error(`Could not find geonameId for district: ${districtCounty}`)
        return
      }
      
      console.log(`Found geonameId ${geonameId} for district ${districtCounty}`)
      
      // Reset ward dropdown
      resetWardsByType(type)
      
      try {
        // Use the fetchLocationData prop function to get the data directly
        const result = await props.fetchLocationData(geonameId)
        console.log(`Received wards for ${type}:`, result)
        
        if (result && (result.geonames || Array.isArray(result))) {
          const wards = result.geonames || result
          console.log(`Setting ${wards.length} wards for ${type}`)
          setWardsByType(type, wards)
          enableWardsByType(type)
        } else {
          console.error(`No valid ward data received for ${type}`)
        }
      } catch (error) {
        console.error(`Error in handleDistrictChange for ${type}:`, error)
      }
      
      // Update parent after all changes
      updateAddressByType(type)
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
          mailingProvincesDisabled.value = true
          break
        case 'Permanent':
          permanentProvinces.value = []
          internalPermanentAddress.value.provinceCity = ''
          permanentProvincesDisabled.value = true
          break
        case 'Temporary':
          temporaryProvinces.value = []
          internalTemporaryAddress.value.provinceCity = ''
          temporaryProvincesDisabled.value = true
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
          mailingDistrictsDisabled.value = true
          break
        case 'Permanent':
          permanentDistricts.value = []
          internalPermanentAddress.value.districtCounty = ''
          permanentDistrictsDisabled.value = true
          break
        case 'Temporary':
          temporaryDistricts.value = []
          internalTemporaryAddress.value.districtCounty = ''
          temporaryDistrictsDisabled.value = true
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
          mailingWardsDisabled.value = true
          break
        case 'Permanent':
          permanentWards.value = []
          internalPermanentAddress.value.wardCommune = ''
          permanentWardsDisabled.value = true
          break
        case 'Temporary':
          temporaryWards.value = []
          internalTemporaryAddress.value.wardCommune = ''
          temporaryWardsDisabled.value = true
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
    
    const enableProvincesByType = (type) => {
      const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1)
      switch (capitalizedType) {
        case 'Mailing':
          mailingProvincesDisabled.value = false
          break
        case 'Permanent':
          permanentProvincesDisabled.value = false
          break
        case 'Temporary':
          temporaryProvincesDisabled.value = false
          break
      }
    }
    
    const enableDistrictsByType = (type) => {
      const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1)
      switch (capitalizedType) {
        case 'Mailing':
          mailingDistrictsDisabled.value = false
          break
        case 'Permanent':
          permanentDistrictsDisabled.value = false
          break
        case 'Temporary':
          temporaryDistrictsDisabled.value = false
          break
      }
    }
    
    const enableWardsByType = (type) => {
      const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1)
      switch (capitalizedType) {
        case 'Mailing':
          mailingWardsDisabled.value = false
          break
        case 'Permanent':
          permanentWardsDisabled.value = false
          break
        case 'Temporary':
          temporaryWardsDisabled.value = false
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
    
    // Remove the watchers that were causing circular dependencies
    // Don't need to watch internal state to emit updates, as we're now doing that in specific methods
    
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
      mailingProvincesDisabled,
      mailingDistrictsDisabled,
      mailingWardsDisabled,
      permanentProvincesDisabled,
      permanentDistrictsDisabled,
      permanentWardsDisabled,
      temporaryProvincesDisabled,
      temporaryDistrictsDisabled,
      temporaryWardsDisabled,
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