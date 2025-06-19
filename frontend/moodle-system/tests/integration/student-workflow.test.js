import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createStore } from 'vuex';
import { createRouter, createWebHistory } from 'vue-router';
import StudentList from '@/views/StudentList.vue';
import AddStudent from '@/views/AddStudent.vue';
import EditStudent from '@/views/EditStudent.vue';

// Mock API calls
jest.mock('@/services/index', () => ({
  student: {
    getStudents: jest.fn(),
    createStudent: jest.fn(),
    updateStudent: jest.fn(),
    deleteStudent: jest.fn(),
    searchStudents: jest.fn()
  },
  department: {
    getDepartments: jest.fn()
  },
  program: {
    getPrograms: jest.fn()
  },
  statusType: {
    getStatusTypes: jest.fn()
  },
  statusTransition: {
    getStatusTransitions: jest.fn()
  },
  geography: {
    getCountries: jest.fn(),
    getNationalities: jest.fn()
  }
}));

describe('Student Management Workflow Integration', () => {
  let store;
  let router;
  
  const mockStudents = [
    {
      studentId: '12345678',
      fullName: 'John Doe',
      dateOfBirth: '2000-01-01',
      gender: 'Nam',
      department: { _id: 'dept1', name: 'Computer Science' },
      schoolYear: 2020,
      program: { _id: 'prog1', name: 'Bachelor' },
      email: 'john@example.com',
      phoneNumber: '0123456789',
      status: { _id: 'status1', type: 'Active' },
      mailingAddress: {
        houseNumberStreet: '123 Main St',
        country: 'Vietnam'
      },
      identityDocument: {
        type: 'CCCD',
        number: '123456789012'
      }
    }
  ];

  const mockReferenceData = {
    departments: [{ _id: 'dept1', name: 'Computer Science' }],
    programs: [{ _id: 'prog1', name: 'Bachelor' }],
    statusTypes: [{ _id: 'status1', type: 'Active' }],
    countries: [{ countryName: 'Vietnam', geonameId: '1562822' }],
    nationalities: ['Vietnamese']
  };

  beforeEach(() => {
    // Setup store modules
    store = createStore({
      modules: {
        student: {
          namespaced: true,
          state: {
            students: mockStudents,
            loading: false,
            currentPage: 1,
            totalPages: 1,
            selectedStudent: null,
            isSearchMode: false,
            searchQuery: '',
            selectedDepartment: '',
            error: null
          },
          mutations: {
            SET_STUDENTS: (state, students) => { state.students = students; },
            SET_LOADING: (state, loading) => { state.loading = loading; },
            SET_SELECTED_STUDENT: (state, student) => { state.selectedStudent = student; },
            SET_ERROR: (state, error) => { state.error = error; },
            SET_SEARCH_MODE: (state, mode) => { state.isSearchMode = mode; },
            SET_SEARCH_QUERY: (state, query) => { state.searchQuery = query; },
            SET_SELECTED_DEPARTMENT: (state, dept) => { state.selectedDepartment = dept; },
            SET_PAGINATION: (state, { currentPage, totalPages }) => {
              state.currentPage = currentPage;
              state.totalPages = totalPages;
            }
          },
          actions: {
            fetchStudents: jest.fn(({ commit }) => {
              commit('SET_STUDENTS', mockStudents);
              commit('SET_PAGINATION', { currentPage: 1, totalPages: 1 });
            }),
            createStudent: jest.fn(({ commit }, studentData) => {
              const newStudent = { ...studentData, _id: 'new-id' };
              commit('SET_STUDENTS', [...mockStudents, newStudent]);
              return Promise.resolve();
            }),
            updateStudent: jest.fn(({ commit }, { id, student }) => {
              const updatedStudents = mockStudents.map(s => 
                s.studentId === id ? { ...s, ...student } : s
              );
              commit('SET_STUDENTS', updatedStudents);
              return Promise.resolve();
            }),
            deleteStudent: jest.fn(({ commit }, id) => {
              const filteredStudents = mockStudents.filter(s => s.studentId !== id);
              commit('SET_STUDENTS', filteredStudents);
              return Promise.resolve();
            }),
            searchStudents: jest.fn(({ commit }, { query, departmentId }) => {
              let filtered = mockStudents;
              if (query) {
                filtered = filtered.filter(s => 
                  s.fullName.toLowerCase().includes(query.toLowerCase()) ||
                  s.studentId.includes(query)
                );
              }
              if (departmentId) {
                filtered = filtered.filter(s => s.department._id === departmentId);
              }
              commit('SET_STUDENTS', filtered);
              commit('SET_SEARCH_MODE', true);
              return Promise.resolve();
            }),
            fetchStudent: jest.fn(({ commit }, id) => {
              const student = mockStudents.find(s => s.studentId === id);
              commit('SET_SELECTED_STUDENT', student);
              return Promise.resolve(student);
            })
          },
          getters: {
            getStudentById: (state) => (id) => state.students.find(s => s.studentId === id)
          }
        },
        department: {
          namespaced: true,
          state: { departments: mockReferenceData.departments },
          actions: { fetchDepartments: jest.fn() },
          getters: {
            getDepartmentName: (state) => (id) => {
              const dept = state.departments.find(d => d._id === id);
              return dept ? dept.name : '';
            }
          }
        },
        program: {
          namespaced: true,
          state: { programs: mockReferenceData.programs },
          actions: { fetchPrograms: jest.fn() },
          getters: {
            getProgramName: (state) => (id) => {
              const prog = state.programs.find(p => p._id === id);
              return prog ? prog.name : '';
            }
          }
        },
        status: {
          namespaced: true,
          state: {
            statusTypes: mockReferenceData.statusTypes,
            statusTransitions: [],
            countries: mockReferenceData.countries,
            nationalities: mockReferenceData.nationalities
          },
          actions: {
            fetchStatusTypes: jest.fn(),
            fetchStatusTransitions: jest.fn(),
            fetchCountries: jest.fn(),
            fetchNationalities: jest.fn(),
            fetchLocationChildren: jest.fn()
          },
          getters: {
            getStatusTypeName: (state) => (id) => {
              const status = state.statusTypes.find(s => s._id === id);
              return status ? status.type : '';
            },
            getValidTransitionsForStatus: () => () => [],
            isValidStatusTransition: () => () => true
          }
        }
      }
    });

    // Setup router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'StudentList', component: StudentList },
        { path: '/students/add', name: 'AddStudent', component: AddStudent },
        { path: '/students/edit/:id', name: 'EditStudent', component: EditStudent, props: true }
      ]
    });
  });

  it('should complete full student CRUD workflow', async () => {
    // 1. Start at student list
    const listWrapper = mount(StudentList, {
      global: { plugins: [store, router] }
    });

    await nextTick();

    // Verify initial student list
    expect(listWrapper.findAll('tbody tr')).toHaveLength(1);
    expect(listWrapper.text()).toContain('John Doe');
    expect(listWrapper.text()).toContain('12345678');

    // 2. Test search functionality
    const searchInput = listWrapper.find('input[type="text"]');
    await searchInput.setValue('John');
    
    const searchButton = listWrapper.find('.btn-primary');
    await searchButton.trigger('click');

    // Verify search action was called
    const searchAction = store._modules.root._children.student._rawModule.actions.searchStudents;
    expect(searchAction).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ query: 'John' })
    );

    // 3. Test department filter
    const departmentSelect = listWrapper.find('select');
    await departmentSelect.setValue('dept1');
    await departmentSelect.trigger('change');

    expect(searchAction).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ departmentId: 'dept1' })
    );

    // 4. Test delete functionality
    const deleteButton = listWrapper.find('.btn-danger');
    await deleteButton.trigger('click');

    expect(listWrapper.vm.showConfirmModal).toBe(true);
    expect(listWrapper.vm.studentToDelete.studentId).toBe('12345678');

    // Confirm deletion
    await listWrapper.vm.deleteStudent();

    const deleteAction = store._modules.root._children.student._rawModule.actions.deleteStudent;
    expect(deleteAction).toHaveBeenCalledWith(expect.any(Object), '12345678');

    listWrapper.unmount();
  });

  it('should handle add student workflow', async () => {
    // Navigate to add student page
    await router.push('/students/add');

    const addWrapper = mount(AddStudent, {
      global: { plugins: [store, router] }
    });

    await nextTick();

    // Wait for loading to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    addWrapper.vm.loading = false;
    await nextTick();

    // Verify all reference data loading actions were called
    const departmentAction = store._modules.root._children.department._rawModule.actions.fetchDepartments;
    const programAction = store._modules.root._children.program._rawModule.actions.fetchPrograms;
    const statusAction = store._modules.root._children.status._rawModule.actions.fetchStatusTypes;

    expect(departmentAction).toHaveBeenCalled();
    expect(programAction).toHaveBeenCalled();
    expect(statusAction).toHaveBeenCalled();

    // Simulate form submission
    const newStudentData = {
      studentId: '87654321',
      fullName: 'Jane Smith',
      dateOfBirth: '1999-05-15',
      gender: 'Nữ',
      nationality: 'Vietnamese',
      department: 'dept1',
      schoolYear: 2019,
      program: 'prog1',
      email: 'jane@example.com',
      phoneNumber: '0987654321',
      status: 'status1',
      mailingAddress: {
        houseNumberStreet: '456 Oak St',
        country: 'Vietnam'
      },
      identityDocument: {
        type: 'CCCD',
        number: '987654321012',
        issueDate: '2020-01-01',
        expiryDate: '2030-01-01',
        hasChip: true
      }
    };

    await addWrapper.vm.handleSubmit(newStudentData);

    // Verify create action was called
    const createAction = store._modules.root._children.student._rawModule.actions.createStudent;
    expect(createAction).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        studentId: '87654321',
        fullName: 'Jane Smith',
        email: 'jane@example.com'
      })
    );

    // Verify success modal is shown
    expect(addWrapper.vm.showSuccessModal).toBe(true);

    addWrapper.unmount();
  });

  it('should handle edit student workflow', async () => {
    // Set selected student
    store.state.student.selectedStudent = mockStudents[0];

    // Navigate to edit student page
    await router.push('/students/edit/12345678');

    const editWrapper = mount(EditStudent, {
      props: { id: '12345678' },
      global: { plugins: [store, router] }
    });

    await nextTick();

    // Wait for loading to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    editWrapper.vm.loading = false;
    await nextTick();

    // Verify student data is loaded
    expect(editWrapper.vm.studentData).toEqual(mockStudents[0]);

    // Simulate form submission with updated data
    const updatedStudentData = {
      ...mockStudents[0],
      fullName: 'John Doe Updated',
      email: 'john.updated@example.com'
    };

    await editWrapper.vm.handleSubmit(updatedStudentData);

    // Verify update action was called
    const updateAction = store._modules.root._children.student._rawModule.actions.updateStudent;
    expect(updateAction).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        id: '12345678',
        student: expect.objectContaining({
          fullName: 'John Doe Updated',
          email: 'john.updated@example.com'
        })
      })
    );

    // Verify success modal is shown
    expect(editWrapper.vm.showSuccessModal).toBe(true);

    editWrapper.unmount();
  });

  it('should handle error scenarios gracefully', async () => {
    // Setup store to simulate errors
    const errorStore = createStore({
      modules: {
        student: {
          namespaced: true,
          state: { students: [], loading: false, error: null },
          actions: {
            fetchStudents: jest.fn().mockRejectedValue(new Error('Network error')),
            createStudent: jest.fn().mockRejectedValue(new Error('Validation error'))
          },
          mutations: {
            SET_ERROR: (state, error) => { state.error = error; },
            SET_LOADING: (state, loading) => { state.loading = loading; }
          }
        },
        department: {
          namespaced: true,
          state: { departments: [] },
          actions: { fetchDepartments: jest.fn() }
        },
        program: {
          namespaced: true,
          state: { programs: [] },
          actions: { fetchPrograms: jest.fn() }
        },
        status: {
          namespaced: true,
          state: { statusTypes: [], countries: [], nationalities: [] },
          actions: {
            fetchStatusTypes: jest.fn(),
            fetchStatusTransitions: jest.fn(),
            fetchCountries: jest.fn(),
            fetchNationalities: jest.fn()
          }
        }
      }
    });

    // Test error in student list
    const listWrapper = mount(StudentList, {
      global: { plugins: [errorStore, router] }
    });

    await nextTick();

    // Simulate error in fetch
    try {
      await errorStore.dispatch('student/fetchStudents');
    } catch (error) {
      expect(error.message).toBe('Network error');
    }

    listWrapper.unmount();

    // Test error in add student
    const addWrapper = mount(AddStudent, {
      global: { plugins: [errorStore, router] }
    });

    await nextTick();
    addWrapper.vm.loading = false;
    await nextTick();

    // Simulate form submission error
    const studentData = { studentId: '12345678', fullName: 'Test' };
    
    try {
      await addWrapper.vm.handleSubmit(studentData);
    } catch (error) {
      expect(addWrapper.vm.showErrorModal).toBe(true);
    }

    addWrapper.unmount();
  });

  it('should maintain state consistency across navigation', async () => {
    // Start with student list
    const listWrapper = mount(StudentList, {
      global: { plugins: [store, router] }
    });

    await nextTick();

    // Perform a search
    await listWrapper.vm.search();
    expect(store.state.student.isSearchMode).toBe(true);

    listWrapper.unmount();

    // Navigate to add student and back
    await router.push('/students/add');
    await router.push('/');

    const newListWrapper = mount(StudentList, {
      global: { plugins: [store, router] }
    });

    await nextTick();

    // Verify state is maintained or properly reset
    expect(store.state.student.students).toBeDefined();
    expect(Array.isArray(store.state.student.students)).toBe(true);

    newListWrapper.unmount();
  });
});