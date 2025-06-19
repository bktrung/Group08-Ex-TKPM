import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import StudentList from '@/views/StudentList.vue';
import { createStore } from 'vuex';
import { createRouter, createWebHistory } from 'vue-router';

// Mock child components
jest.mock('@/components/student/ImportExport.vue', () => ({
  name: 'StudentImportExport',
  template: '<div class="import-export-mock"></div>'
}));

jest.mock('@/components/layout/ConfirmModal.vue', () => ({
  name: 'ConfirmModal',
  template: '<div class="confirm-modal-mock" v-if="showModal"></div>',
  props: ['showModal', 'title', 'message'],
  emits: ['update:showModal', 'confirm']
}));

jest.mock('@/components/layout/BasePagination.vue', () => ({
  name: 'BasePagination',
  template: '<div class="pagination-mock"></div>',
  props: ['currentPage', 'totalPages', 'maxVisible'],
  emits: ['change']
}));

jest.mock('@/components/layout/SuccessModal.vue', () => ({
  name: 'SuccessModal',
  template: '<div class="success-modal-mock" v-if="showModal"></div>',
  props: ['showModal', 'title', 'message'],
  emits: ['update:showModal']
}));

jest.mock('@/components/layout/ErrorModal.vue', () => ({
  name: 'ErrorModal',
  template: '<div class="error-modal-mock" v-if="showModal"></div>',
  props: ['showModal', 'title', 'message', 'isTranslated'],
  emits: ['update:showModal']
}));

describe('StudentList.vue', () => {
  let wrapper;
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
      mailingAddress: {
        houseNumberStreet: '123 Main St',
        wardCommune: 'Ward 1',
        districtCounty: 'District 1',
        provinceCity: 'Ho Chi Minh City'
      },
      email: 'john@example.com',
      phoneNumber: '0123456789',
      status: { _id: 'status1', type: 'Active' }
    },
    {
      studentId: '87654321',
      fullName: 'Jane Smith',
      dateOfBirth: '1999-05-15',
      gender: 'Nữ',
      department: 'dept2',
      schoolYear: 2019,
      program: 'prog2',
      mailingAddress: {
        houseNumberStreet: '456 Oak St'
      },
      email: 'jane@example.com',
      phoneNumber: '0987654321',
      status: 'status2'
    }
  ];

  const mockDepartments = [
    { _id: 'dept1', name: 'Computer Science' },
    { _id: 'dept2', name: 'Mathematics' }
  ];

  beforeEach(() => {
    store = createStore({
      modules: {
        student: {
          namespaced: true,
          state: {
            students: mockStudents,
            loading: false,
            currentPage: 1,
            totalPages: 1,
            isSearchMode: false
          },
          actions: {
            fetchStudents: jest.fn(),
            searchStudents: jest.fn(),
            deleteStudent: jest.fn()
          },
          getters: {
            getStudentById: (state) => (id) => state.students.find(s => s.studentId === id)
          }
        },
        department: {
          namespaced: true,
          state: {
            departments: mockDepartments
          },
          actions: {
            fetchDepartments: jest.fn()
          },
          getters: {
            getDepartmentName: () => (id) => {
              const dept = mockDepartments.find(d => d._id === id);
              return dept ? dept.name : '';
            }
          }
        },
        program: {
          namespaced: true,
          getters: {
            getProgramName: () => (id) => {
              const programs = { prog1: 'Bachelor', prog2: 'Master' };
              return programs[id] || '';
            }
          }
        },
        status: {
          namespaced: true,
          getters: {
            getStatusTypeName: () => (id) => {
              const statuses = { status1: 'Active', status2: 'Inactive' };
              return statuses[id] || '';
            }
          }
        }
      }
    });

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/students/edit/:id', component: { template: '<div>Edit</div>' } }
      ]
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('should render student list with correct data', async () => {
    wrapper = mount(StudentList, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    // Check if students are displayed
    const tableRows = wrapper.findAll('tbody tr');
    expect(tableRows.length).toBe(2);

    // Check first student data
    const firstRow = tableRows[0];
    expect(firstRow.text()).toContain('12345678');
    expect(firstRow.text()).toContain('John Doe');
    expect(firstRow.text()).toContain('john@example.com');
    expect(firstRow.text()).toContain('Computer Science');
  });

  it('should display loading spinner when loading', async () => {
    store.state.student.loading = true;
    
    wrapper = mount(StudentList, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    expect(wrapper.find('.spinner-border').exists()).toBe(true);
  });

  it('should display no data message when students array is empty', async () => {
    store.state.student.students = [];
    store.state.student.loading = false;

    wrapper = mount(StudentList, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    expect(wrapper.text()).toContain('student.no_data');
  });

  it('should filter by department when department selected', async () => {
    const mockSearchAction = jest.fn();
    store._modules.root._children.student._rawModule.actions.searchStudents = mockSearchAction;

    wrapper = mount(StudentList, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    const departmentSelect = wrapper.find('select');
    await departmentSelect.setValue('dept1');
    await departmentSelect.trigger('change');

    expect(mockSearchAction).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        departmentId: 'dept1',
        query: '',
        page: 1
      })
    );
  });

  it('should search students when search input used', async () => {
    const mockSearchAction = jest.fn();
    store._modules.root._children.student._rawModule.actions.searchStudents = mockSearchAction;

    wrapper = mount(StudentList, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    const searchInput = wrapper.find('input[type="text"]');
    await searchInput.setValue('John');

    const searchButton = wrapper.find('.btn-primary');
    await searchButton.trigger('click');

    expect(mockSearchAction).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        query: 'John',
        departmentId: '',
        page: 1
      })
    );
  });

  it('should trigger search on Enter key press', async () => {
    const mockSearchAction = jest.fn();
    store._modules.root._children.student._rawModule.actions.searchStudents = mockSearchAction;

    wrapper = mount(StudentList, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    const searchInput = wrapper.find('input[type="text"]');
    await searchInput.setValue('John');
    await searchInput.trigger('keyup.enter');

    expect(mockSearchAction).toHaveBeenCalled();
  });

  it('should reset search when reset button clicked', async () => {
    const mockFetchAction = jest.fn();
    store._modules.root._children.student._rawModule.actions.fetchStudents = mockFetchAction;

    wrapper = mount(StudentList, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    // Set some search values
    const searchInput = wrapper.find('input[type="text"]');
    await searchInput.setValue('John');

    const departmentSelect = wrapper.find('select');
    await departmentSelect.setValue('dept1');

    // Click reset button
    const resetButton = wrapper.find('.btn-secondary');
    await resetButton.trigger('click');

    expect(wrapper.vm.searchQuery).toBe('');
    expect(wrapper.vm.selectedDepartment).toBe('');
    expect(mockFetchAction).toHaveBeenCalled();
  });

  it('should show confirm modal when delete button clicked', async () => {
    wrapper = mount(StudentList, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    const deleteButton = wrapper.find('.btn-danger');
    await deleteButton.trigger('click');

    expect(wrapper.vm.showConfirmModal).toBe(true);
    expect(wrapper.vm.studentToDelete).toEqual(mockStudents[0]);
  });

  it('should delete student when confirmed', async () => {
    const mockDeleteAction = jest.fn();
    store._modules.root._children.student._rawModule.actions.deleteStudent = mockDeleteAction;

    wrapper = mount(StudentList, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    // Set student to delete
    wrapper.vm.studentToDelete = mockStudents[0];
    wrapper.vm.showConfirmModal = true;

    await wrapper.vm.deleteStudent();

    expect(mockDeleteAction).toHaveBeenCalledWith(expect.any(Object), '12345678');
    expect(wrapper.vm.showConfirmModal).toBe(false);
    expect(wrapper.vm.showSuccessModal).toBe(true);
  });

  it('should format date correctly', () => {
    wrapper = mount(StudentList, {
      global: {
        plugins: [store, router]
      }
    });

    const result = wrapper.vm.formatDate('2000-01-01T00:00:00Z');
    expect(result).toMatch(/1\/1\/2000/);
  });

  it('should format address correctly', () => {
    wrapper = mount(StudentList, {
      global: {
        plugins: [store, router]
      }
    });

    const address = {
      houseNumberStreet: '123 Main St',
      wardCommune: 'Ward 1',
      districtCounty: 'District 1',
      provinceCity: 'Ho Chi Minh City'
    };

    const result = wrapper.vm.formatAddress(address);
    expect(result).toBe('123 Main St, Ward 1, District 1, Ho Chi Minh City');
  });

  it('should handle empty address', () => {
    wrapper = mount(StudentList, {
      global: {
        plugins: [store, router]
      }
    });

    expect(wrapper.vm.formatAddress(null)).toBe('');
    expect(wrapper.vm.formatAddress({})).toBe('');
  });

  it('should get department name from object or ID', () => {
    wrapper = mount(StudentList, {
      global: {
        plugins: [store, router]
      }
    });

    // Test with object
    const deptObject = { name: 'Computer Science' };
    expect(wrapper.vm.getDepartmentName(deptObject)).toBe('Computer Science');

    // Test with ID
    expect(wrapper.vm.getDepartmentName('dept1')).toBe('Computer Science');

    // Test with null
    expect(wrapper.vm.getDepartmentName(null)).toBe('');
  });

  it('should navigate to edit page when edit button clicked', async () => {
    const routerPush = jest.spyOn(router, 'push').mockImplementation(() => Promise.resolve());

    wrapper = mount(StudentList, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    const editButton = wrapper.find('.btn-warning');
    await editButton.trigger('click');

    expect(routerPush).toHaveBeenCalledWith('/students/edit/12345678');
  });
});