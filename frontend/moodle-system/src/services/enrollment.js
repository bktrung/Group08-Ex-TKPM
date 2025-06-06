import apiClient from './client.js';

export default {

    enrollCourse(enrollment) {
        return apiClient.post('/v1/api/enrollment', enrollment)
    },

    dropCourse(enrollment) {
        return apiClient.post('/v1/api/enrollment/drop', enrollment)
    },

    getTranscript(studentId) {
        return apiClient.get(`/v1/api/transcript/${studentId}`)
    },

    getDropCourseHistory(studentId) {
        return apiClient.get(`/v1/api/enrollment/drop-history/${studentId}`)
    }
    
}