import apiClient from './client.js';

export default {

    getStatusTransitions() {
        return apiClient.get('/v1/api/students/status-transitions')
    },

    createStatusTransition(transition) {
        return apiClient.post('/v1/api/students/status-transitions', transition)
    },

    deleteStatusTransition(transition) {
        return apiClient.delete('/v1/api/students/status-transitions', { data: transition })
    }

}