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
    
    const internalMailingAddress = ref({...mailingAddress.value})
    const internalPermanentAddress = ref({...permanentAddress.value})
    const internalTemporaryAddress = ref({...temporaryAddress.value})
    
    const mailingProvinces = ref([])
    const mailingDistricts = ref([])
    const mailingWards = ref([])
    
    const permanentProvinces = ref([])
    const permanentDistricts = ref([])
    const permanentWards = ref([])
    
    const temporaryProvinces = ref([])
    const temporaryDistricts = ref([])
    const temporaryWards = ref([])
    
    const mailingProvincesDisabled = ref(true)
    const mailingDistrictsDisabled = ref(true)
    const mailingWardsDisabled = ref(true)
    
    const permanentProvincesDisabled = ref(true)
    const permanentDistrictsDisabled = ref(true)
    const permanentWardsDisabled = ref(true)
    
    const temporaryProvincesDisabled = ref(true)
    const temporaryDistrictsDisabled = ref(true)
    const temporaryWardsDisabled = ref(true)
    
    const getAddressTypeData = (type) => {
      switch (type) {
        case 'mailing':
          return {
            address: internalMailingAddress.value,
            provinces: mailingProvinces,
            districts: mailingDistricts,
            wards: mailingWards,
            provincesDisabled: mailingProvincesDisabled,
            districtsDisabled: mailingDistrictsDisabled,
            wardsDisabled: mailingWardsDisabled
          }
        case 'permanent':
          return {
            address: internalPermanentAddress.value,
            provinces: permanentProvinces,
            districts: permanentDistricts,
            wards: permanentWards,
            provincesDisabled: permanentProvincesDisabled,
            districtsDisabled: permanentDistrictsDisabled,
            wardsDisabled: permanentWardsDisabled
          }
        case 'temporary':
          return {
            address: internalTemporaryAddress.value,
            provinces: temporaryProvinces,
            districts: temporaryDistricts,
            wards: temporaryWards,
            provincesDisabled: temporaryProvincesDisabled,
            districtsDisabled: temporaryDistrictsDisabled,
            wardsDisabled: temporaryWardsDisabled
          }
      }
    }
    
    const updateAddressByType = (type) => {
      const events = {
        mailing: 'update:mailingAddress',
        permanent: 'update:permanentAddress',
        temporary: 'update:temporaryAddress'
      }
      
      const addresses = {
        mailing: internalMailingAddress.value,
        permanent: internalPermanentAddress.value,
        temporary: internalTemporaryAddress.value
      }
      
      emit(events[type], {...addresses[type]})
    }
    
    const resetLocationData = (type, level) => {
      const data = getAddressTypeData(type)
      
      if (level <= 1) {
        data.provinces.value = []
        data.address.provinceCity = ''
        data.provincesDisabled.value = true
      }
      
      if (level <= 2) {
        data.districts.value = []
        data.address.districtCounty = ''
        data.districtsDisabled.value = true
      }
      
      if (level <= 3) {
        data.wards.value = []
        data.address.wardCommune = ''
        data.wardsDisabled.value = true
      }
      
      updateAddressByType(type)
    }
    
    const setLocationData = (type, level, locationData) => {
      const data = getAddressTypeData(type)
      
      switch (level) {
        case 1:
          data.provinces.value = locationData
          break
        case 2:
          data.districts.value = locationData
          break
        case 3:
          data.wards.value = locationData
          break
      }
    }
    
    const enableDropdown = (type, level) => {
      const data = getAddressTypeData(type)
      
      switch (level) {
        case 1:
          data.provincesDisabled.value = false
          break
        case 2:
          data.districtsDisabled.value = false
          break
        case 3:
          data.wardsDisabled.value = false
          break
      }
    }
    
    const addCustomOption = (type, level, value) => {
      if (!value) return
      
      const data = getAddressTypeData(type)
      const customOption = { toponymName: value, name: value, geonameId: null }
      
      switch (level) {
        case 'province':
          if (!data.provinces.value.find(p => p.toponymName === value || p.name === value)) {
            data.provinces.value = [...data.provinces.value, customOption]
            data.provincesDisabled.value = false
          }
          break
        case 'district':
          if (!data.districts.value.find(d => d.toponymName === value || d.name === value)) {
            data.districts.value = [...data.districts.value, customOption]
            data.districtsDisabled.value = false
          }
          break
        case 'ward':
          if (!data.wards.value.find(w => w.toponymName === value || w.name === value)) {
            data.wards.value = [...data.wards.value, customOption]
            data.wardsDisabled.value = false
          }
          break
      }
    }
    
    const findLocationGeonameId = (type, locationName, level) => {
      const data = getAddressTypeData(type)
      let locationArray
      
      switch (level) {
        case 'country':
          locationArray = props.countries
          return locationArray.find(c => 
            c.countryName === locationName || 
            c.countryName.toLowerCase() === locationName.toLowerCase()
          )?.geonameId
        case 'province':
          locationArray = data.provinces.value
          break
        case 'district':
          locationArray = data.districts.value
          break
        default:
          return null
      }
      
      return locationArray?.find(location => 
        location.toponymName === locationName || 
        location.name === locationName
      )?.geonameId
    }
    
    const handleCountryChange = async (type) => {
      const data = getAddressTypeData(type)
      const countryName = data.address.country
      
      if (!countryName) return
      
      const geonameId = findLocationGeonameId(type, countryName, 'country')
      if (!geonameId) {
        console.error(`Could not find geonameId for country: ${countryName}`)
        return
      }
      
      resetLocationData(type, 1)
      
      try {
        const result = await props.fetchLocationData(geonameId)
        
        if (result && (result.geonames || Array.isArray(result))) {
          const provinces = result.geonames || result
          setLocationData(type, 1, provinces)
          enableDropdown(type, 1)
        }
      } catch (error) {
        console.error(`Error in handleCountryChange for ${type}:`, error)
      }
      
      updateAddressByType(type)
    }
    
    const handleProvinceChange = async (type) => {
      const data = getAddressTypeData(type)
      const provinceCity = data.address.provinceCity
      
      if (!provinceCity) return
      
      const geonameId = findLocationGeonameId(type, provinceCity, 'province')
      if (!geonameId) {
        console.error(`Could not find geonameId for province: ${provinceCity}`)
        return
      }
      
      resetLocationData(type, 2)
      
      try {
        const result = await props.fetchLocationData(geonameId)
        
        if (result && (result.geonames || Array.isArray(result))) {
          const districts = result.geonames || result
          setLocationData(type, 2, districts)
          enableDropdown(type, 2)
        }
      } catch (error) {
        console.error(`Error in handleProvinceChange for ${type}:`, error)
      }
      
      updateAddressByType(type)
    }
    
    const handleDistrictChange = async (type) => {
      const data = getAddressTypeData(type)
      const districtCounty = data.address.districtCounty
      
      if (!districtCounty) return
      
      const geonameId = findLocationGeonameId(type, districtCounty, 'district')
      if (!geonameId) {
        console.error(`Could not find geonameId for district: ${districtCounty}`)
        return
      }
      
      resetLocationData(type, 3)
      
      try {
        const result = await props.fetchLocationData(geonameId)
        
        if (result && (result.geonames || Array.isArray(result))) {
          const wards = result.geonames || result
          setLocationData(type, 3, wards)
          enableDropdown(type, 3)
        }
      } catch (error) {
        console.error(`Error in handleDistrictChange for ${type}:`, error)
      }
      
      updateAddressByType(type)
    }
    
    const initializeAddress = async (type) => {
      const data = getAddressTypeData(type)
      const address = data.address
      
      if (!address || !address.country) return
      
      const country = props.countries.find(c => 
        c.countryName === address.country || 
        c.countryName.toLowerCase() === address.country.toLowerCase()
      )
      
      if (!country?.geonameId) {
        if (address.country) {
          addCustomOption(type, 'country', address.country)
        }
        ensureExistingValuesVisible(type)
        return
      }
      
      try {
        enableDropdown(type, 1)
        
        const result = await props.fetchLocationData(country.geonameId)
        if (result && (result.geonames || Array.isArray(result))) {
          const provinces = result.geonames || result
          setLocationData(type, 1, provinces)
          
          if (address.provinceCity) {
            const province = provinces.find(p => 
              p.toponymName === address.provinceCity || 
              p.name === address.provinceCity
            )
            
            if (province?.geonameId) {
              enableDropdown(type, 2)
              
              const districtsResult = await props.fetchLocationData(province.geonameId)
              if (districtsResult && (districtsResult.geonames || Array.isArray(districtsResult))) {
                const districts = districtsResult.geonames || districtsResult
                setLocationData(type, 2, districts)
                
                if (address.districtCounty) {
                  const district = districts.find(d => 
                    d.toponymName === address.districtCounty || 
                    d.name === address.districtCounty
                  )
                  
                  if (district?.geonameId) {
                    enableDropdown(type, 3)
                    
                    const wardsResult = await props.fetchLocationData(district.geonameId)
                    if (wardsResult && (wardsResult.geonames || Array.isArray(wardsResult))) {
                      const wards = wardsResult.geonames || wardsResult
                      setLocationData(type, 3, wards)
                    }
                  } else if (address.districtCounty) {
                    addCustomOption(type, 'district', address.districtCounty)
                  }
                }
              }
            } else if (address.provinceCity) {
              addCustomOption(type, 'province', address.provinceCity)
            }
          }
        }
      } catch (error) {
        console.error(`Error initializing ${type} address:`, error)
      }
      
      ensureExistingValuesVisible(type)
    }
    
    const ensureExistingValuesVisible = (type) => {
      const data = getAddressTypeData(type)
      const address = data.address
      
      if (address.provinceCity) {
        addCustomOption(type, 'province', address.provinceCity)
      }
      
      if (address.districtCounty) {
        addCustomOption(type, 'district', address.districtCounty)
      }
      
      if (address.wardCommune) {
        addCustomOption(type, 'ward', address.wardCommune)
      }
      
      if (address.country) {
        data.provincesDisabled.value = false
      }
      
      if (address.provinceCity) {
        data.districtsDisabled.value = false
      }
      
      if (address.districtCounty) {
        data.wardsDisabled.value = false
      }
    }
    
    const setupWatchers = () => {
      watch(internalMailingAddress, () => {
        emit('update:mailingAddress', {...internalMailingAddress.value})
      }, { deep: true })

      watch(internalPermanentAddress, () => {
        emit('update:permanentAddress', {...internalPermanentAddress.value})
      }, { deep: true })

      watch(internalTemporaryAddress, () => {
        emit('update:temporaryAddress', {...internalTemporaryAddress.value})
      }, { deep: true })
      
      watch(mailingAddress, (newValue) => {
        if (JSON.stringify(internalMailingAddress.value) !== JSON.stringify(newValue)) {
          internalMailingAddress.value = {...newValue}
        }
      }, { deep: true })

      watch(permanentAddress, (newValue) => {
        if (JSON.stringify(internalPermanentAddress.value) !== JSON.stringify(newValue)) {
          internalPermanentAddress.value = {...newValue}
        }
      }, { deep: true })

      watch(temporaryAddress, (newValue) => {
        if (JSON.stringify(internalTemporaryAddress.value) !== JSON.stringify(newValue)) {
          internalTemporaryAddress.value = {...newValue}
        }
      }, { deep: true })
    }
    
    const initializeAllAddresses = async () => {
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
    }
    
    setupWatchers()
    
    onMounted(initializeAllAddresses)
    
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