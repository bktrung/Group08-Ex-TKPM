import apiClient from './client.js';

export default {

    getCountries() {
        return apiClient.get('/v1/api/address/countries')
    },
    getNationalities() {
        return apiClient.get('/v1/api/address/nationalities')
    },
    getLocationChildren(geonameId) {
        return apiClient.get(`/v1/api/address/children/${geonameId}`)
    }

}