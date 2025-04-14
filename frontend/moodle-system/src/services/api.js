import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3456',
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
  },

  getCourses(params = {}) {
    let queryString = ''
    if (params.departmentId) {
      queryString += `departmentId=${params.departmentId}&`
    }
    if (params.page) {
      queryString += `page=${params.page}&`
    }
    if (params.limit) {
      queryString += `limit=${params.limit}&`
    }
    
    queryString = queryString ? `?${queryString.slice(0, -1)}` : ''
    console.log(`Fetching courses with URL: /v1/api/courses${queryString}`);
    return apiClient.get(`/v1/api/courses${queryString}`)
      .then(response => {
        console.log('Raw course API response:', response);
        return response;
      })
      .catch(error => {
        console.error('Error in API getCourses:', error);
        throw error;
      });
  },
  
  getCourse(courseCode) {
    return apiClient.get(`/v1/api/courses/${courseCode}`)
  },
  
  createCourse(courseData) {
    // Ensure courseData has the required structure
    const validatedData = {
      courseCode: courseData.courseCode,
      name: courseData.name,
      credits: Number(courseData.credits), // Ensure credits is a number
      department: courseData.department,
      description: courseData.description,
      prerequisites: Array.isArray(courseData.prerequisites) ? courseData.prerequisites : []
    }
    
    console.log('API Creating course with data:', validatedData)
    return apiClient.post('/v1/api/courses', validatedData)
  },
  
  updateCourse(courseCode, courseData) {
    // Make sure to only include fields allowed for update
    const allowedFields = ['name', 'credits', 'department', 'description'];
    
    // Filter out any fields that aren't allowed for updates
    const updateData = {};
    for (const field of allowedFields) {
      if (field in courseData) {
        updateData[field] = courseData[field];
      }
    }
    
    console.log(`API Updating course ${courseCode} with data:`, updateData);
    return apiClient.patch(`/v1/api/courses/${courseCode}`, updateData);
  },
  
  deleteCourse(courseCode) {
    console.log(`API Deleting course ${courseCode}`);
    return apiClient.delete(`/v1/api/courses/${courseCode}`)
      .catch(error => {
        console.error(`Error deleting course ${courseCode}:`, error.response || error);
        throw error;
      });
  },
  
  // Special method just for toggling course active status
  toggleCourseActiveStatus(courseCode, isActive) {
    console.log(`API Toggle course ${courseCode} active status to ${isActive}`);
    return apiClient.patch(`/v1/api/courses/${courseCode}`, { isActive })
      .catch(error => {
        console.error(`Error toggling course ${courseCode} status:`, error.response || error);
        throw error;
      });
  },
  
  // Class endpoints
  getClasses(params = {}) {
    let queryString = ''
    if (params.courseId) {
      queryString += `courseId=${params.courseId}&`
    }
    if (params.academicYear) {
      queryString += `academicYear=${params.academicYear}&`
    }
    if (params.semester) {
      queryString += `semester=${params.semester}&`
    }
    if (params.page) {
      queryString += `page=${params.page}&`
    }
    if (params.limit) {
      queryString += `limit=${params.limit}&`
    }
    
    queryString = queryString ? `?${queryString.slice(0, -1)}` : ''
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
  }
}