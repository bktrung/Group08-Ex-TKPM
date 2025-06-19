import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ClassTable from '@/components/class/ClassTable.vue';
import { createStore } from 'vuex';

// Mock child components
jest.mock('@/components/layout/DefaultPagination.vue', () => ({
  name: 'BasePagination',
  template: '<div class="pagination-mock"></div>',
  props: ['modelValue', 'pageSize', 'totalItems', 'currentItems'],
  emits: ['update:modelValue', 'update:pageSize']
}));

jest.mock('@/components/layout/ScheduleModal.vue', () => ({
  name: 'ScheduleModal',
  template: '<div class="schedule-modal-mock" v-if="visible"></div>',
  props: ['visible', 'selectedClass'],
  emits: ['update:visible']
}));

describe('ClassTable.vue', () => {
  let wrapper;
  let store;

  const mockClasses = [
    {
      _id: '1',
      classCode: 'CS101-01',
      course: {
        _id: 'course1',
        courseCode: 'CS101',
        name: 'Computer Science',
        credits: 3
      },
      academicYear: '2023-2024',
      semester: 1,
      instructor: 'Dr. Smith',
      enrolledStudents: 25,
      maxCapacity: 30,
      schedule: [
        {
          dayOfWeek: 2,
          startPeriod: 1,
          endPeriod: 2,
          classroom: 'A101'
        }
      ]
    }
  ];

  beforeEach(() => {
    store = createStore({
      modules: {
        class: {
          namespaced: true,
          state: {
            classes: mockClasses,
            loading: false
          },
          actions: {
            fetchClasses: jest.fn()
          }
        }
      }
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('should render class table with data', async () => {
    wrapper = mount(ClassTable, {
      props: {
        courseId: 'course1'
      },
      global: {
        plugins: [store]
      }
    });

    await nextTick();

    expect(wrapper.find('table').exists()).toBe(true);
    expect(wrapper.text()).toContain('CS101-01');
    expect(wrapper.text()).toContain('Dr. Smith');
  });

  it('should filter classes by course ID', async () => {
    wrapper = mount(ClassTable, {
      props: {
        courseId: 'course1'
      },
      global: {
        plugins: [store]
      }
    });

    await nextTick();

    expect(wrapper.vm.filteredClasses).toHaveLength(1);
    expect(wrapper.vm.filteredClasses[0].classCode).toBe('CS101-01');
  });

  it('should emit register event when register button clicked', async () => {
    wrapper = mount(ClassTable, {
      props: {
        courseId: 'course1'
      },
      global: {
        plugins: [store]
      }
    });

    await nextTick();

    const registerButton = wrapper.find('.btn-outline-success');
    await registerButton.trigger('click');

    expect(wrapper.emitted('register')).toBeTruthy();
    expect(wrapper.emitted('register')[0]).toEqual(['CS101-01']);
  });

  it('should show schedule modal when view schedule clicked', async () => {
    wrapper = mount(ClassTable, {
      props: {
        courseId: 'course1'
      },
      global: {
        plugins: [store]
      }
    });

    await nextTick();

    const scheduleButton = wrapper.find('.btn-outline-primary');
    await scheduleButton.trigger('click');

    expect(wrapper.vm.isScheduleModalVisible).toBe(true);
    expect(wrapper.vm.selectedClass).toEqual(mockClasses[0]);
  });

  it('should format semester correctly', () => {
    wrapper = mount(ClassTable, {
      props: {
        courseId: 'course1'
      },
      global: {
        plugins: [store]
      }
    });

    expect(wrapper.vm.formatSemester(1)).toBe('semester.regular');
    expect(wrapper.vm.formatSemester(3)).toBe('semester.summer');
  });

  it('should calculate progress bar class correctly', () => {
    wrapper = mount(ClassTable, {
      props: {
        courseId: 'course1'
      },
      global: {
        plugins: [store]
      }
    });

    // 90%+ capacity - danger
    expect(wrapper.vm.getProgressBarClass({ enrolledStudents: 27, maxCapacity: 30 })).toBe('bg-danger');
    
    // 75-89% capacity - warning
    expect(wrapper.vm.getProgressBarClass({ enrolledStudents: 24, maxCapacity: 30 })).toBe('bg-warning');
    
    // < 75% capacity - success
    expect(wrapper.vm.getProgressBarClass({ enrolledStudents: 20, maxCapacity: 30 })).toBe('bg-success');
  });

  it('should handle empty classes list', async () => {
    store.state.class.classes = [];

    wrapper = mount(ClassTable, {
      props: {
        courseId: 'course1'
      },
      global: {
        plugins: [store]
      }
    });

    await nextTick();

    expect(wrapper.text()).toContain('class.no_matching_classes');
  });
});