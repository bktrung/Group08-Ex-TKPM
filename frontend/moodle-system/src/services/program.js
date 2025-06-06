import apiClient from './client.js';

export default {

    getPrograms() {
        return apiClient.get('/v1/api/programs')
    },

    createProgram(program) {
        return apiClient.post('/v1/api/programs', program)
    },

    updateProgram(id, program) {
        return apiClient.patch(`/v1/api/programs/${id}`, program)
    },

    deleteProgram(id) {
        return apiClient.delete(`/v1/api/programs/${id}`)
    }

}