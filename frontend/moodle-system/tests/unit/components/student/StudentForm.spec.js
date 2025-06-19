import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import StudentForm from '@/components/student/StudentForm.vue';
import { createStore } from 'vuex';

// Mock child components
jest.mock('@/components/student/AddressFields.vue', () => ({
  name: 'AddressFields',
  template: '<div class="address-fields-mock"></div>',
  emits: ['update:mailingAddress', 'update:permanentAddress', 'update:temporaryAddress']
}));

jest.mock('@/components/student/IdentityDocumentFields.vue', () => ({
  name: 'IdentityDocumentFields', 
  template: '<div class="identity-fields-mock"></div>',
  emits: ['update:identityDocument']
}));

describe('StudentForm.vue', () => {
  let wrapper;
  let store;

  const mockDepartments = [
    { _id: 'dept1', name: 'Computer Science' },
    { _id: 'dept2', name: 'Mathematics' }
  ];

  const mockPrograms = [
    { _id: 'prog1', name: 'Bachelor' },
    { _id: 'prog2', name: 'Master' }
  ];

  const mockStatusTypes = [
    { _id: 'status1', type: 'Active' },
    { _id: 'status2', type: 'Inactive' }
  ];

  beforeEach(() => {
    store = createStore({
      modules: {
        department: {
          namespaced: true,
          state: { departments: mockDepartments },
          actions: { fetchDepartments: jest.fn() }
        },
        program: {
          namespaced: true,
          state: { programs: mockPrograms },
          actions: { fetchPrograms: jest.fn() }
        },
        status: {
          namespaced: true,
          state: {
            statusTypes: mockStatusTypes,
            countries: [],
            nationalities: []
          },
          actions: {
            fetchStatusTypes: jest.fn(),
            fetchStatusTransitions: jest.fn(),
            fetchCountries: jest.fn(),
            fetchNationalities: jest.fn(),
            fetchLocationChildren: jest.fn()
          },
          getters: {
            getValidTransitionsForStatus: () => () => [],
            isValidStatusTransition: () => () => true
          }
        },
        student: {
          namespaced: true,
          state: { loading: false }
        }
      }
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('should render form with all required fields', async () => {
    wrapper = mount(StudentForm, {
      props: {
        studentData: {},
        isEditing: false
      },
      global: {
        plugins: [store]
      }
    });

    await nextTick();

    expect(wrapper.find('#student-id').exists()).toBe(true);
    expect(wrapper.find('#student-name').exists()).toBe(true);
    expect(wrapper.find('#student-dob').exists()).toBe(true);
    expect(wrapper.find('#student-gender').exists()).toBe(true);
    expect(wrapper.find('#student-nationality').exists()).toBe(true);
    expect(wrapper.find('#student-faculty').exists()).toBe(true);
    expect(wrapper.find('#student-course').exists()).toBe(true);
    expect(wrapper.find('#student-program').exists()).toBe(true);
    expect(wrapper.find('#student-email').exists()).toBe(true);
    expect(wrapper.find('#student-phone').exists()).toBe(true);
    expect(wrapper.find('#student-status').exists()).toBe(true);
  });

  it('should populate form when studentData prop is provided', async () => {
    const studentData = {
      studentId: '12345678',
      fullName: 'John Doe',
      dateOfBirth: '2000-01-01',
      gender: 'Nam',
      nationality: 'Vietnamese',
      department: 'dept1',
      schoolYear: 2020,
      program: 'prog1',
      email: 'john@example.com',
      phoneNumber: '0123456789',
      status: 'status1',
      mailingAddress: {
        houseNumberStreet: '123 Main St',
        country: 'Vietnam'
      },
      identityDocument: {
        type: 'CCCD',
        number: '123456789012'
      }
    };

    wrapper = mount(StudentForm, {
      props: {
        studentData,
        isEditing: false
      },
      global: {
        plugins: [store]
      }
    });

    await nextTick();

    expect(wrapper.find('#student-id').element.value).toBe('12345678');
    expect(wrapper.find('#student-name').element.value).toBe('John Doe');
    expect(wrapper.find('#student-email').element.value).toBe('john@example.com');
  });

  it('should make student ID readonly when editing', async () => {
    wrapper = mount(StudentForm, {
      props: {
        studentData: { studentId: '12345678' },
        isEditing: true
      },
      global: {
        plugins: [store]
      }
    });

    await nextTick();

    const studentIdInput = wrapper.find('#student-id');
    expect(studentIdInput.attributes('readonly')).toBeDefined();
  });

  it('should populate department dropdown with correct options', async () => {
    wrapper = mount(StudentForm, {
      props: {
        studentData: {},
        isEditing: false
      },
      global: {
        plugins: [store]
      }
    });

    await nextTick();

    const departmentSelect = wrapper.find('#student-faculty');
    const options = departmentSelect.findAll('option');
    
    expect(options.length).toBe(3); // 1 default + 2 departments
    expect(options[1].text()).toContain('Computer Science');
    expect(options[2].text()).toContain('Mathematics');
  });

  it('should emit submit event with form data when form is submitted', async () => {
    wrapper = mount(StudentForm, {
      props: {
        studentData: {},
        isEditing: false
      },
      global: {
        plugins: [store]
      }
    });

    await nextTick();

    // Fill required fields
    await wrapper.find('#student-id').setValue('12345678');
    await wrapper.find('#student-name').setValue('John Doe');
    await wrapper.find('#student-dob').setValue('2000-01-01');
    await wrapper.find('#student-nationality').setValue('Vietnamese');
    await wrapper.find('#student-faculty').setValue('dept1');
    await wrapper.find('#student-course').setValue('2020');
    await wrapper.find('#student-program').setValue('prog1');
    await wrapper.find('#student-email').setValue('john@example.com');
    await wrapper.find('#student-phone').setValue('0123456789');
    await wrapper.find('#student-status').setValue('status1');

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    expect(wrapper.emitted('submit')).toBeTruthy();
    const emittedData = wrapper.emitted('submit')[0][0];
    expect(emittedData.studentId).toBe('12345678');
    expect(emittedData.fullName).toBe('John Doe');
    expect(emittedData.email).toBe('john@example.com');
  });

  it('should show validation errors for required fields', async () => {
    wrapper = mount(StudentForm, {
      props: {
        studentData: {},
        isEditing: false
      },
      global: {
        plugins: [store]
      }
    });

    await nextTick();

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');

    // Should not emit submit when validation fails
    expect(wrapper.emitted('submit')).toBeFalsy();
  });

  it('should handle address updates correctly', async () => {
    wrapper = mount(StudentForm, {
      props: {
        studentData: {},
        isEditing: false
      },
      global: {
        plugins: [store]
      }
    });

    await nextTick();

    const addressFields = wrapper.findComponent({ name: 'AddressFields' });
    expect(addressFields.exists()).toBe(true);

    // Simulate address update
    const newAddress = {
      houseNumberStreet: '456 New St',
      country: 'Vietnam'
    };

    await addressFields.vm.$emit('update:mailingAddress', newAddress);

    // Check if the form data is updated
    expect(wrapper.vm.form.mailingAddress).toEqual(newAddress);
  });

  it('should validate phone number format', async () => {
    wrapper = mount(StudentForm, {
      props: {
        studentData: {},
        isEditing: false
      },
      global: {
        plugins: [store]
      }
    });

    await nextTick();

    const phoneInput = wrapper.find('#student-phone');
    await phoneInput.setValue('invalid-phone');
    await phoneInput.trigger('blur');

    // Should show validation error
    expect(wrapper.find('.invalid-feedback').exists()).toBe(true);
  });

  it('should validate email format', async () => {
    wrapper = mount(StudentForm, {
      props: {
        studentData: {},
        isEditing: false
      },
      global: {
        plugins: [store]
      }
    });

    await nextTick();

    const emailInput = wrapper.find('#student-email');
    await emailInput.setValue('invalid-email');
    await emailInput.trigger('blur');

    // Should show validation error
    expect(wrapper.find('.invalid-feedback').exists()).toBe(true);
  });

  it('should validate date of birth is not in future', async () => {
    wrapper = mount(StudentForm, {
      props: {
        studentData: {},
        isEditing: false
      },
      global: {
        plugins: [store]
      }
    });

    await nextTick();

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];

    const dobInput = wrapper.find('#student-dob');
    await dobInput.setValue(futureDateString);
    await dobInput.trigger('blur');

    // Should show validation error
    expect(wrapper.find('.invalid-feedback').exists()).toBe(true);
  });
});