import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import AddStudent from '@/views/AddStudent.vue';
import { createStore } from 'vuex';
import { createRouter, createWebHistory } from 'vue-router';

// Mock child components
jest.mock('@/components/student/StudentForm.vue', () => ({
  name: 'StudentForm',
  template: '<form class="student-form-mock" @submit.prevent="$emit(\'submit\', mockData)"></form>',
  emits: ['submit'],
  setup() {
    return {
      mockData: {
        studentId: '12345678',
        fullName: 'John Doe',
        email: 'john@example.com'
      }
    };
  }
}));

jest.mock('@/components/layout/ErrorModal.vue', () => ({
  name: 'ErrorModal',
  template: '<div class="error-modal-mock" v-if="showModal"></div>',
  props: ['showModal', 'title', 'message', 'isTranslated'],
  emits: ['update:showModal']
}));

jest.mock('@/components/layout/SuccessModal.vue', () => ({
  name: 'SuccessModal',
  template: '<div class="success-modal-mock" v-if="showModal"></div>',
  props: ['showModal', 'title', 'message'],
  emits: ['update:showModal', 'confirm']
}));

describe('AddStudent.vue', () => {
  let wrapper;
  let store;
  let router;

  beforeEach(() => {
    store = createStore({
      modules: {
        department: {
          namespaced: true,
          actions: { fetchDepartments: jest.fn() }
        },
        program: {
          namespaced: true,
          actions: { fetchPrograms: jest.fn() }
        },
        status: {
          namespaced: true,
          actions: {
            fetchStatusTypes: jest.fn(),
            fetchStatusTransitions: jest.fn(),
            fetchCountries: jest.fn(),
            fetchNationalities: jest.fn()
          }
        },
        student: {
          namespaced: true,
          actions: {
            createStudent: jest.fn()
          }
        }
      }
    });

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/students/add', component: { template: '<div>Add</div>' } }
      ]
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('should render add student page with correct title', async () => {
    wrapper = mount(AddStudent, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    expect(wrapper.find('h2').text()).toBe('student.add_student');
  });

  it('should show loading spinner initially', async () => {
    wrapper = mount(AddStudent, {
      global: {
        plugins: [store, router]
      }
    });

    // Before nextTick, loading should be true
    expect(wrapper.vm.loading).toBe(true);
    expect(wrapper.find('.spinner-border').exists()).toBe(true);
  });

  it('should load reference data on mount', async () => {
    const departmentAction = jest.fn();
    const programAction = jest.fn();
    const statusTypesAction = jest.fn();
    const statusTransitionsAction = jest.fn();
    const countriesAction = jest.fn();
    const nationalitiesAction = jest.fn();

    store = createStore({
      modules: {
        department: {
          namespaced: true,
          actions: { fetchDepartments: departmentAction }
        },
        program: {
          namespaced: true,
          actions: { fetchPrograms: programAction }
        },
        status: {
          namespaced: true,
          actions: {
            fetchStatusTypes: statusTypesAction,
            fetchStatusTransitions: statusTransitionsAction,
            fetchCountries: countriesAction,
            fetchNationalities: nationalitiesAction
          }
        },
        student: {
          namespaced: true,
          actions: { createStudent: jest.fn() }
        }
      }
    });

    wrapper = mount(AddStudent, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    expect(departmentAction).toHaveBeenCalled();
    expect(programAction).toHaveBeenCalled();
    expect(statusTypesAction).toHaveBeenCalled();
    expect(statusTransitionsAction).toHaveBeenCalled();
    expect(countriesAction).toHaveBeenCalled();
    expect(nationalitiesAction).toHaveBeenCalled();
  });

  it('should render student form when not loading', async () => {
    wrapper = mount(AddStudent, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    wrapper.vm.loading = false;
    await nextTick();

    expect(wrapper.findComponent({ name: 'StudentForm' }).exists()).toBe(true);
  });

  it('should handle form submission successfully', async () => {
    const createStudentAction = jest.fn();
    store._modules.root._children.student._rawModule.actions.createStudent = createStudentAction;

    wrapper = mount(AddStudent, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();
    wrapper.vm.loading = false;
    await nextTick();

    const studentForm = wrapper.findComponent({ name: 'StudentForm' });
    
    const mockStudentData = {
      studentId: '12345678',
      fullName: 'John Doe',
      dateOfBirth: '2000-01-01',
      email: 'john@example.com',
      department: 'dept1',
      program: 'prog1',
      status: 'status1',
      identityDocument: {
        type: 'CCCD',
        issueDate: '2020-01-01',
        expiryDate: '2030-01-01',
        hasChip: true
      }
    };

    await studentForm.vm.$emit('submit', mockStudentData);

    expect(createStudentAction).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        studentId: '12345678',
        fullName: 'John Doe',
        email: 'john@example.com'
      })
    );
    expect(wrapper.vm.showSuccessModal).toBe(true);
  });

  it('should handle form submission error', async () => {
    const createStudentAction = jest.fn().mockRejectedValue(new Error('Validation failed'));
    store._modules.root._children.student._rawModule.actions.createStudent = createStudentAction;

    wrapper = mount(AddStudent, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();
    wrapper.vm.loading = false;
    await nextTick();

    const studentForm = wrapper.findComponent({ name: 'StudentForm' });
    
    const mockStudentData = { studentId: '12345678' };
    await studentForm.vm.$emit('submit', mockStudentData);

    expect(wrapper.vm.showErrorModal).toBe(true);
    expect(wrapper.vm.errorMessage).toContain('Validation failed');
  });

  it('should clean and transform data before submission', async () => {
    const createStudentAction = jest.fn();
    store._modules.root._children.student._rawModule.actions.createStudent = createStudentAction;

    wrapper = mount(AddStudent, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();
    wrapper.vm.loading = false;
    await nextTick();

    const studentForm = wrapper.findComponent({ name: 'StudentForm' });
    
    const mockStudentData = {
      studentId: '12345678',
      fullName: 'John Doe',
      dateOfBirth: '2000-01-01',
      department: { _id: 'dept1' }, // Object should be converted to ID
      identityDocument: {
        type: 'CCCD',
        issueDate: '2020-01-01',
        expiryDate: '2030-01-01',
        hasChip: 'true' // String should be converted to boolean
      },
      mailingAddress: {
        houseNumberStreet: '123 Main St',
        country: 'Vietnam'
      },
      permanentAddress: {
        houseNumberStreet: '', // Empty address should be excluded
        country: ''
      }
    };

    await studentForm.vm.$emit('submit', mockStudentData);

    const submittedData = createStudentAction.mock.calls[0][1];
    
    expect(submittedData.department).toBe('dept1');
    expect(submittedData.identityDocument.hasChip).toBe(true);
    expect(submittedData.dateOfBirth).toMatch(/\d{4}-\d{2}-\d{2}T/); // Should be ISO string
    expect(submittedData.mailingAddress).toBeDefined();
    expect(submittedData.permanentAddress).toBeUndefined(); // Empty address excluded
  });

  it('should redirect to home page after successful submission', async () => {
    const routerPush = jest.spyOn(router, 'push').mockImplementation(() => Promise.resolve());

    wrapper = mount(AddStudent, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    wrapper.vm.showSuccessModal = true;
    await wrapper.vm.redirectToList();

    // Use setTimeout to simulate the delay in the actual method
    setTimeout(() => {
      expect(routerPush).toHaveBeenCalledWith('/');
    }, 300);
  });

  it('should show error when loading reference data fails', async () => {
    const departmentAction = jest.fn().mockRejectedValue(new Error('Network error'));

    store = createStore({
      modules: {
        department: {
          namespaced: true,
          actions: { fetchDepartments: departmentAction }
        },
        program: {
          namespaced: true,
          actions: { fetchPrograms: jest.fn() }
        },
        status: {
          namespaced: true,
          actions: {
            fetchStatusTypes: jest.fn(),
            fetchStatusTransitions: jest.fn(),
            fetchCountries: jest.fn(),
            fetchNationalities: jest.fn()
          }
        },
        student: {
          namespaced: true,
          actions: { createStudent: jest.fn() }
        }
      }
    });

    wrapper = mount(AddStudent, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    expect(wrapper.vm.error).toContain('Network error');
    expect(wrapper.find('.alert-danger').exists()).toBe(true);
  });
});