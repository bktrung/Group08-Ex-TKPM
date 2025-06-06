import apiClient from './client.js';

export default {
    getDepartments() {
        return apiClient.get('/v1/api/departments')
    },

    createDepartment(department) {
        return apiClient.post('/v1/api/departments', department)
    },

    updateDepartment(id, department) {
        return apiClient.patch(`/v1/api/departments/${id}`, department)
    },

    deleteDepartment(id) {
        return apiClient.delete(`/v1/api/departments/${id}`)
    }
}