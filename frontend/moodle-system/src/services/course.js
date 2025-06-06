import apiClient from './client.js';

export default {

    async getCourses(params = {}) {
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
        return apiClient.get(`/v1/api/courses${queryString}`)
            .then(response => {
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
        const validatedData = {
            courseCode: courseData.courseCode,
            name: courseData.name,
            credits: Number(courseData.credits),
            department: courseData.department,
            description: courseData.description,
            prerequisites: Array.isArray(courseData.prerequisites) ? courseData.prerequisites : []
        }

        return apiClient.post('/v1/api/courses', validatedData)
    },

    updateCourse(courseCode, courseData) {
        const allowedFields = ['name', 'credits', 'department', 'description'];
        const allowedData = allowedFields.reduce((obj, field) => {
            if (field in courseData) {
                obj[field] = courseData[field];
            }
            return obj;
        }, {});

        return apiClient.patch(`/v1/api/courses/${courseCode}`, allowedData);
    },

    deleteCourse(courseCode) {
        return apiClient.delete(`/v1/api/courses/${courseCode}`)
    },

    async toggleCourseStatus(courseCode, isActive) {
        if (!isActive) {
            return await this.deleteCourse(courseCode);
        }
        throw new Error('Activating course is not supported yet');
    }

}