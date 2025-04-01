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
            id="permanent-country"
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
            id="permanent-province"
          >
            <option value="">-- Chọn tỉnh/thành phố --</option>
            <option 
              v-for="province in permanentProvinces" 
              :key="province.geonameId || province.toponymName" 
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
            id="permanent-district"
          >
            <option value="">-- Chọn quận/huyện --</option>
            <option 
              v-for="district in permanentDistricts" 
              :key="district.geonameId || district.toponymName" 
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
            id="permanent-wardcommune"
          >
            <option value="">-- Chọn phường/xã --</option>
            <option 
              v-for="ward in permanentWards" 
              :key="ward.geonameId || ward.toponymName" 
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
            id="temporary-country"
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
            id="temporary-province"
          >
            <option value="">-- Chọn tỉnh/thành phố --</option>
            <option 
              v-for="province in temporaryProvinces" 
              :key="province.geonameId || province.toponymName" 
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
            id="temporary-district"
          >
            <option value="">-- Chọn quận/huyện --</option>
            <option 
              v-for="district in temporaryDistricts" 
              :key="district.geonameId || district.toponymName" 
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
            id="temporary-wardcommune"
          >
            <option value="">-- Chọn phường/xã --</option>
            <option 
              v-for="ward in temporaryWards" 
              :key="ward.geonameId || ward.toponymName" 
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
            id="mailing-country"
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
            id="mailing-province"
          >
            <option value="">-- Chọn tỉnh/thành phố --</option>
            <option 
              v-for="province in mailingProvinces" 
              :key="province.geonameId || province.toponymName" 
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
            id="mailing-district"
          >
            <option value="">-- Chọn quận/huyện --</option>
            <option 
              v-for="district in mailingDistricts" 
              :key="district.geonameId || district.toponymName" 
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
            id="mailing-wardcommune"
          >
            <option value="">-- Chọn phường/xã --</option>
            <option 
              v-for="ward in mailingWards" 
              :key="ward.geonameId || ward.toponymName" 
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
import { ref, toRefs, watch, onMounted } from 'vue'

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
    
    // For existing addresses, initialize dropdowns
    const initializeAddress = async (type) => {
      const addressObj = type === 'mailing' ? internalMailingAddress.value : 
                       type === 'permanent' ? internalPermanentAddress.value :
                       internalTemporaryAddress.value
      
      if (addressObj && addressObj.country) {
        // Get country ID from the countries array
        const country = props.countries.find(c => 
          c.countryName === addressObj.country || 
          c.countryName.toLowerCase() === addressObj.country.toLowerCase()
        )
        
        if (country && country.geonameId) {
          try {
            // Enable province dropdown
            if (type === 'mailing') mailingProvincesDisabled.value = false
            else if (type === 'permanent') permanentProvincesDisabled.value = false
            else temporaryProvincesDisabled.value = false
            
            // Fetch and populate provinces
            const result = await props.fetchLocationData(country.geonameId)
            if (result && (result.geonames || Array.isArray(result))) {
              const provinces = result.geonames || result
              setProvincesByType(type, provinces)
              
              // If provinceCity exists, try to find matching province and fetch districts
              if (addressObj.provinceCity) {
                const province = provinces.find(p => 
                  p.toponymName === addressObj.provinceCity || 
                  p.name === addressObj.provinceCity
                )
                
                if (province && province.geonameId) {
                  // Enable district dropdown
                  if (type === 'mailing') mailingDistrictsDisabled.value = false
                  else if (type === 'permanent') permanentDistrictsDisabled.value = false
                  else temporaryDistrictsDisabled.value = false
                  
                  // Fetch and populate districts
                  const districtsResult = await props.fetchLocationData(province.geonameId)
                  if (districtsResult && (districtsResult.geonames || Array.isArray(districtsResult))) {
                    const districts = districtsResult.geonames || districtsResult
                    setDistrictsByType(type, districts)
                    
                    // If districtCounty exists, try to find matching district and fetch wards
                    if (addressObj.districtCounty) {
                      const district = districts.find(d => 
                        d.toponymName === addressObj.districtCounty || 
                        d.name === addressObj.districtCounty
                      )
                      
                      if (district && district.geonameId) {
                        // Enable ward dropdown
                        if (type === 'mailing') mailingWardsDisabled.value = false
                        else if (type === 'permanent') permanentWardsDisabled.value = false
                        else temporaryWardsDisabled.value = false
                        
                        // Fetch and populate wards
                        const wardsResult = await props.fetchLocationData(district.geonameId)
                        if (wardsResult && (wardsResult.geonames || Array.isArray(wardsResult))) {
                          const wards = wardsResult.geonames || wardsResult
                          setWardsByType(type, wards)
                        }
                      } else {
                        // If no matching district is found, add existing district as option
                        if (addressObj.districtCounty) {
                          addCustomOption(type, 'district', addressObj.districtCounty)
                        }
                      }
                    }
                  }
                } else {
                  // If no matching province is found, add existing province as option
                  if (addressObj.provinceCity) {
                    addCustomOption(type, 'province', addressObj.provinceCity)
                  }
                }
              }
            }
          } catch (error) {
            console.error(`Error initializing ${type} address:`, error)
          }
        } else {
          // If country not found in the list, add it as a custom option
          if (addressObj.country) {
            addCustomOption(type, 'country', addressObj.country)
          }
        }
      }
      
      // As a fallback, if we have address values but couldn't initialize the dropdowns properly,
      // add them as custom options to ensure they're visible
      ensureExistingValuesVisible(type)
    }
    
    // Ensure existing values are visible in the dropdowns
    const ensureExistingValuesVisible = (type) => {
      const addressObj = type === 'mailing' ? internalMailingAddress.value : 
                       type === 'permanent' ? internalPermanentAddress.value :
                       internalTemporaryAddress.value
      
      // Add each existing value as a custom option if needed
      if (addressObj.provinceCity) {
        addCustomOption(type, 'province', addressObj.provinceCity)
      }
      
      if (addressObj.districtCounty) {
        addCustomOption(type, 'district', addressObj.districtCounty)
      }
      
      if (addressObj.wardCommune) {
        addCustomOption(type, 'ward', addressObj.wardCommune)
      }
      
      // Enable dropdowns if we have values for them
      if (addressObj.country) {
        if (type === 'mailing') mailingProvincesDisabled.value = false
        else if (type === 'permanent') permanentProvincesDisabled.value = false
        else temporaryProvincesDisabled.value = false
      }
      
      if (addressObj.provinceCity) {
        if (type === 'mailing') mailingDistrictsDisabled.value = false
        else if (type === 'permanent') permanentDistrictsDisabled.value = false
        else temporaryDistrictsDisabled.value = false
      }
      
      if (addressObj.districtCounty) {
        if (type === 'mailing') mailingWardsDisabled.value = false
        else if (type === 'permanent') permanentWardsDisabled.value = false
        else temporaryWardsDisabled.value = false
      }
    }
    
    // Add a custom option to a dropdown if value is not in the list
    const addCustomOption = (type, level, value) => {
      if (!value) return
      
      if (level === 'province') {
        // For province dropdown
        if (type === 'mailing' && !mailingProvinces.value.find(p => p.toponymName === value || p.name === value)) {
          mailingProvinces.value = [...mailingProvinces.value, { toponymName: value, name: value, geonameId: null }]
          mailingProvincesDisabled.value = false
        } else if (type === 'permanent' && !permanentProvinces.value.find(p => p.toponymName === value || p.name === value)) {
          permanentProvinces.value = [...permanentProvinces.value, { toponymName: value, name: value, geonameId: null }]
          permanentProvincesDisabled.value = false
        } else if (type === 'temporary' && !temporaryProvinces.value.find(p => p.toponymName === value || p.name === value)) {
          temporaryProvinces.value = [...temporaryProvinces.value, { toponymName: value, name: value, geonameId: null }]
          temporaryProvincesDisabled.value = false
        }
      } else if (level === 'district') {
        // For district dropdown
        if (type === 'mailing' && !mailingDistricts.value.find(d => d.toponymName === value || d.name === value)) {
          mailingDistricts.value = [...mailingDistricts.value, { toponymName: value, name: value, geonameId: null }]
          mailingDistrictsDisabled.value = false
        } else if (type === 'permanent' && !permanentDistricts.value.find(d => d.toponymName === value || d.name === value)) {
          permanentDistricts.value = [...permanentDistricts.value, { toponymName: value, name: value, geonameId: null }]
          permanentDistrictsDisabled.value = false
        } else if (type === 'temporary' && !temporaryDistricts.value.find(d => d.toponymName === value || d.name === value)) {
          temporaryDistricts.value = [...temporaryDistricts.value, { toponymName: value, name: value, geonameId: null }]
          temporaryDistrictsDisabled.value = false
        }
      } else if (level === 'ward') {
        // For ward dropdown
        if (type === 'mailing' && !mailingWards.value.find(w => w.toponymName === value || w.name === value)) {
          mailingWards.value = [...mailingWards.value, { toponymName: value, name: value, geonameId: null }]
          mailingWardsDisabled.value = false
        } else if (type === 'permanent' && !permanentWards.value.find(w => w.toponymName === value || w.name === value)) {
          permanentWards.value = [...permanentWards.value, { toponymName: value, name: value, geonameId: null }]
          permanentWardsDisabled.value = false
        } else if (type === 'temporary' && !temporaryWards.value.find(w => w.toponymName === value || w.name === value)) {
          temporaryWards.value = [...temporaryWards.value, { toponymName: value, name: value, geonameId: null }]
          temporaryWardsDisabled.value = false
        }
      }
    }

    // Event handlers
    const handleCountryChange = async (type) => {
      // Get the internal address object for this type
      const addressObj = type === 'mailing' ? internalMailingAddress.value : 
                       type === 'permanent' ? internalPermanentAddress.value :
                       internalTemporaryAddress.value
                       
      // Find the country name from the address
      const countryName = addressObj.country
      
      if (!countryName) {
        return
      }
      
      // Find the country object from the countries prop
      const country = props.countries.find(c => 
        c.countryName === countryName || 
        c.countryName.toLowerCase() === countryName.toLowerCase()
      )
      
      // Get the geonameId from the country object
      const geonameId = country ? country.geonameId : null
      
      if (!geonameId) {
        console.error(`Could not find geonameId for country: ${countryName}`)
        return
      }
      
      // Reset dependent dropdowns
      resetProvincesByType(type)
      resetDistrictsByType(type)
      resetWardsByType(type)
      
      try {
        // Use the fetchLocationData prop function to get the data directly
        const result = await props.fetchLocationData(geonameId)
        
        if (result && (result.geonames || Array.isArray(result))) {
          const provinces = result.geonames || result
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
      
      if (!provinceCity) {
        return
      }
      
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
      
      // Reset dependent dropdowns
      resetDistrictsByType(type)
      resetWardsByType(type)
      
      try {
        // Use the fetchLocationData prop function to get the data directly
        const result = await props.fetchLocationData(geonameId)
        
        if (result && (result.geonames || Array.isArray(result))) {
          const districts = result.geonames || result
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
      
      if (!districtCounty) {
        return
      }
      
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
      
      // Reset ward dropdown
      resetWardsByType(type)
      
      try {
        // Use the fetchLocationData prop function to get the data directly
        const result = await props.fetchLocationData(geonameId)
        
        if (result && (result.geonames || Array.isArray(result))) {
          const wards = result.geonames || result
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
          if (JSON.stringify(internalMailingAddress.value) !== JSON.stringify(mailingAddress.value)) {
            emit('update:mailingAddress', {...internalMailingAddress.value})
          }
          break
        case 'Permanent':
          if (JSON.stringify(internalPermanentAddress.value) !== JSON.stringify(permanentAddress.value)) {
            emit('update:permanentAddress', {...internalPermanentAddress.value})
          }
          break
        case 'Temporary':
          if (JSON.stringify(internalTemporaryAddress.value) !== JSON.stringify(temporaryAddress.value)) {
            emit('update:temporaryAddress', {...internalTemporaryAddress.value})
          }
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
    
    watch(mailingAddress, (newValue) => {
      internalMailingAddress.value = {...newValue}
    }, { deep: true })

    watch(permanentAddress, (newValue) => {
      internalPermanentAddress.value = {...newValue}
    }, { deep: true })

    watch(temporaryAddress, (newValue) => {
      internalTemporaryAddress.value = {...newValue}
    }, { deep: true })
    
    onMounted(async () => {
      if (mailingAddress.value && mailingAddress.value.country) {
        await initializeAddress('mailing')
      }
      
      setTimeout(async () => {
        if (permanentAddress.value && permanentAddress.value.country) {
          await initializeAddress('permanent')
        }
      }, 100)
      
      setTimeout(async () => {
        if (temporaryAddress.value && temporaryAddress.value.country) {
          await initializeAddress('temporary')
        }
      }, 200)
    })
    
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
      handleDistrictChange,
      initializeAddress,
      updateAddressByType,
      ensureExistingValuesVisible
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