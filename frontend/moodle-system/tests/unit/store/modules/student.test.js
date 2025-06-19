import studentModule from '@/store/modules/student';
import api from '@/services/index';

jest.mock('@/services/index');

describe('Student Store Module', () => {
  let state;

  beforeEach(() => {
    state = {
      students: [],
      currentPage: 1,
      totalPages: 1,
      selectedStudent: null,
      isSearchMode: false,
      searchQuery: '',
      selectedDepartment: '',
      loading: false,
      error: null
    };
    jest.clearAllMocks();
  });

  describe('mutations', () => {
    it('should set search query', () => {
      studentModule.mutations.SET_SEARCH_QUERY(state, 'john');
      expect(state.searchQuery).toBe('john');
    });

    it('should set selected department', () => {
      studentModule.mutations.SET_SELECTED_DEPARTMENT(state, 'dept1');
      expect(state.selectedDepartment).toBe('dept1');
    });

    it('should set loading state', () => {
      studentModule.mutations.SET_LOADING(state, true);
      expect(state.loading).toBe(true);
    });

    it('should set error', () => {
      studentModule.mutations.SET_ERROR(state, 'Error message');
      expect(state.error).toBe('Error message');
    });
  });

  describe('actions', () => {
    let commit, dispatch;

    beforeEach(() => {
      commit = jest.fn();
      dispatch = jest.fn();
    });

    describe('fetchStudents', () => {
      it('should fetch students successfully', async () => {
        const mockResponse = {
          data: {
            metadata: {
              students: [{ id: 1, name: 'John' }],
              pagination: { totalPages: 2 }
            }
          }
        };
        api.student.getStudents.mockResolvedValue(mockResponse);

        await studentModule.actions.fetchStudents({ commit }, { page: 1, limit: 10 });

        expect(commit).toHaveBeenCalledWith('SET_LOADING', true);
        expect(api.student.getStudents).toHaveBeenCalledWith(1, 10);
        expect(commit).toHaveBeenCalledWith('SET_STUDENTS', mockResponse.data.metadata.students);
        expect(commit).toHaveBeenCalledWith('SET_PAGINATION', { currentPage: 1, totalPages: 2 });
        expect(commit).toHaveBeenCalledWith('SET_SEARCH_MODE', false);
        expect(commit).toHaveBeenCalledWith('SET_LOADING', false);
      });

      it('should handle fetch error', async () => {
        const error = new Error('API Error');
        api.student.getStudents.mockRejectedValue(error);

        await studentModule.actions.fetchStudents({ commit }, { page: 1, limit: 10 });

        expect(commit).toHaveBeenCalledWith('SET_LOADING', true);
        expect(commit).toHaveBeenCalledWith('SET_ERROR', 'API Error');
        expect(commit).toHaveBeenCalledWith('SET_LOADING', false);
      });
    });

    describe('fetchStudent', () => {
      it('should fetch single student successfully', async () => {
        const mockResponse = {
          data: { metadata: { id: 1, name: 'John' } }
        };
        api.student.getStudent.mockResolvedValue(mockResponse);

        await studentModule.actions.fetchStudent({ commit }, '123');

        expect(commit).toHaveBeenCalledWith('SET_LOADING', true);
        expect(api.student.getStudent).toHaveBeenCalledWith('123');
        expect(commit).toHaveBeenCalledWith('SET_SELECTED_STUDENT', mockResponse.data.metadata);
        expect(commit).toHaveBeenCalledWith('SET_LOADING', false);
      });

      it('should handle fetch student error', async () => {
        const error = new Error('Student not found');
        api.student.getStudent.mockRejectedValue(error);

        await expect(studentModule.actions.fetchStudent({ commit }, '123')).rejects.toThrow('Student not found');

        expect(commit).toHaveBeenCalledWith('SET_LOADING', true);
        expect(commit).toHaveBeenCalledWith('SET_ERROR', 'Student not found');
        expect(commit).toHaveBeenCalledWith('SET_LOADING', false);
      });
    });

    describe('createStudent', () => {
      it('should create student successfully', async () => {
        const studentData = { name: 'John', email: 'john@example.com' };
        api.student.createStudent.mockResolvedValue({ data: { success: true } });

        await studentModule.actions.createStudent({ commit }, studentData);

        expect(commit).toHaveBeenCalledWith('SET_LOADING', true);
        expect(api.student.createStudent).toHaveBeenCalledWith(studentData);
        expect(commit).toHaveBeenCalledWith('SET_LOADING', false);
      });

      it('should handle create error', async () => {
        const error = new Error('Validation error');
        const studentData = { name: 'John' };
        api.student.createStudent.mockRejectedValue(error);

        await expect(studentModule.actions.createStudent({ commit }, studentData)).rejects.toThrow('Validation error');

        expect(commit).toHaveBeenCalledWith('SET_LOADING', true);
        expect(commit).toHaveBeenCalledWith('SET_ERROR', 'Validation error');
        expect(commit).toHaveBeenCalledWith('SET_LOADING', false);
      });
    });

    describe('updateStudent', () => {
      it('should update student successfully', async () => {
        const studentData = { name: 'John Updated' };
        api.student.updateStudent.mockResolvedValue({ data: { success: true } });

        await studentModule.actions.updateStudent({ commit }, { id: '123', student: studentData });

        expect(commit).toHaveBeenCalledWith('SET_LOADING', true);
        expect(api.student.updateStudent).toHaveBeenCalledWith('123', studentData);
        expect(commit).toHaveBeenCalledWith('SET_LOADING', false);
      });
    });

    describe('deleteStudent', () => {
      it('should delete student successfully', async () => {
        api.student.deleteStudent.mockResolvedValue({ data: { success: true } });

        await studentModule.actions.deleteStudent({ commit }, '123');

        expect(commit).toHaveBeenCalledWith('SET_LOADING', true);
        expect(api.student.deleteStudent).toHaveBeenCalledWith('123');
        expect(commit).toHaveBeenCalledWith('SET_LOADING', false);
      });
    });

    describe('searchStudents', () => {
      it('should search students by query only', async () => {
        const mockResponse = {
          data: {
            metadata: {
              students: [{ id: 1, name: 'John' }],
              pagination: { totalPages: 1 }
            }
          }
        };
        api.student.searchStudents.mockResolvedValue(mockResponse);

        await studentModule.actions.searchStudents({ commit }, { query: 'john', page: 1, limit: 10 });

        expect(commit).toHaveBeenCalledWith('SET_SEARCH_QUERY', 'john');
        expect(api.student.searchStudents).toHaveBeenCalledWith('john', 1, 10);
        expect(commit).toHaveBeenCalledWith('SET_SEARCH_MODE', true);
      });

      it('should search students by department only', async () => {
        const mockResponse = {
          data: {
            metadata: {
              students: [{ id: 1, name: 'John' }],
              pagination: { totalPages: 1 }
            }
          }
        };
        api.student.getStudentsByDepartment.mockResolvedValue(mockResponse);

        await studentModule.actions.searchStudents({ commit }, { departmentId: 'dept1', page: 1, limit: 10 });

        expect(commit).toHaveBeenCalledWith('SET_SELECTED_DEPARTMENT', 'dept1');
        expect(api.student.getStudentsByDepartment).toHaveBeenCalledWith('dept1', 1, 10);
      });
    });

    describe('exportStudents', () => {
      it('should call export API', () => {
        studentModule.actions.exportStudents({}, 'csv');
        expect(api.student.exportStudents).toHaveBeenCalledWith('csv');
      });
    });

    describe('importStudents', () => {
      it('should import students successfully', async () => {
        const formData = new FormData();
        api.student.importStudents.mockResolvedValue({ data: { success: true } });

        await studentModule.actions.importStudents({ commit }, formData);

        expect(commit).toHaveBeenCalledWith('SET_LOADING', true);
        expect(api.student.importStudents).toHaveBeenCalledWith(formData);
        expect(commit).toHaveBeenCalledWith('SET_LOADING', false);
      });
    });
  });

  describe('getters', () => {
    it('should get student by id', () => {
      const students = [
        { studentId: '123', name: 'John' },
        { studentId: '456', name: 'Jane' }
      ];
      const state = { students };

      const result = studentModule.getters.getStudentById(state)('123');
      expect(result).toEqual({ studentId: '123', name: 'John' });
    });

    it('should return undefined for non-existent student', () => {
      const state = { students: [] };
      const result = studentModule.getters.getStudentById(state)('999');
      expect(result).toBeUndefined();
    });
  });
});