import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:3456',
  headers: {
    'Content-Type': 'application/json'
  }
})

export default {
  // Students
  getStudents(page = 1, limit = 10) {
    return apiClient.get(`/v1/api/students?page=${page}&limit=${limit}`)
  },
  getStudent(id) {
    return apiClient.get(`/v1/api/students?page=1&limit=1000`).then(response => {
      const student = response.data.metadata.students.find(s => s.studentId === id);
      if (student) {
        return {
          data: {
            metadata: student
          }
        };
      }
      throw new Error('Student not found');
    });
  },
  createStudent(student) {
    return apiClient.post('/v1/api/students', student)
  },
  updateStudent(id, student) {
    return apiClient.patch(`/v1/api/students/${id}`, student)
  },
  deleteStudent(id) {
    return apiClient.delete(`/v1/api/students/${id}`)
  },
  searchStudents(query, page = 1, limit = 10) {
    return apiClient.get(`/v1/api/students/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
  },
  getStudentsByDepartment(departmentId, page = 1, limit = 10) {
    return apiClient.get(`/v1/api/students/department/${departmentId}?page=${page}&limit=${limit}`)
  },
  exportStudents(format) {
    window.open(`${apiClient.defaults.baseURL}/v1/api/export/students?format=${format}`, '_blank')
  },
  importStudents(formData) {
    return apiClient.post('/v1/api/import/students', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Departments
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
  },

  // Programs
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
  },

  // Status Types
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
  },

  // Status Transitions
  getStatusTransitions() {
    return apiClient.get('/v1/api/students/status-transitions')
  },
  createStatusTransition(transition) {
    return apiClient.post('/v1/api/students/status-transitions', transition)
  },
  deleteStatusTransition(transition) {
    return apiClient.delete('/v1/api/students/status-transitions', { data: transition })
  },

  // Geography data
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