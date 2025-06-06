import apiClient from './client.js';

export default {

  getStudents(page = 1, limit = 10) {
    return apiClient.get(`/v1/api/students?page=${page}&limit=${limit}`);
  },

  async getStudent(id) {
    return apiClient.get(`/v1/api/students?page=1&limit=1000`)
      .then(response => {
        const student = response.data.metadata.students.find(s => s.studentId === id);
        if (student) {
          return { data: { metadata: student } };
        }
        throw new Error('Student not found');
      });
  },

  createStudent(student) {
    return apiClient.post('/v1/api/students', student);
  },

  updateStudent(id, student) {
    return apiClient.patch(`/v1/api/students/${id}`, student);
  },

  deleteStudent(id) {
    return apiClient.delete(`/v1/api/students/${id}`);
  },

  searchStudents(query, page = 1, limit = 10) {
    return apiClient.get(`/v1/api/students/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  },

  getStudentsByDepartment(departmentId, page = 1, limit = 10) {
    return apiClient.get(`/v1/api/students/department/${departmentId}?page=${page}&limit=${limit}`);
  },

  exportStudents(format) {
    window.open(`${apiClient.defaults.baseURL}/v1/api/export/students?format=${format}`, '_blank');
  },

  importStudents(formData) {
    return apiClient.post('/v1/api/import/students', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};