import apiClient from './client.js';

export default {

    getClasses(params = {}) {
        const searchParams = new URLSearchParams()

        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== '') {
                searchParams.append(key, value)
            }
        }

        const queryString = searchParams.toString() ? `?${searchParams}` : ''

        return apiClient.get(`/v1/api/classes${queryString}`)
    },

    getClass(classCode) {
        return apiClient.get(`/v1/api/classes/${classCode}`)
    },

    createClass(classData) {
        return apiClient.post('/v1/api/classes', classData)
    },

    updateClass(classCode, classData) {
        return apiClient.patch(`/v1/api/classes/${classCode}`, classData)
    },

    getClassByCourseId(courseId) {
        return apiClient.get(`/v1/api/classes${courseId}`)
    },

    deleteClass(classCode) {
        return apiClient.delete(`/v1/api/classes/${classCode}`)
    },

}