import apiClient from './client.js';

export default {

    getStatusTypes() {
        return apiClient.get('/v1/api/students/status-types')
    },

    createStatusType(statusType) {
        return apiClient.post('/v1/api/students/status-types', statusType)
    },

    updateStatusType(id, statusType) {
        return apiClient.put(`/v1/api/students/status-types/${id}`, statusType)
    },

    deleteStatusType(id) {
        return apiClient.delete(`/v1/api/students/status-types/${id}`)
    }

}