import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ClassManage from '@/views/ClassManage.vue';
import { createStore } from 'vuex';
import { createRouter, createWebHistory } from 'vue-router';

// Mock child components
jest.mock('@/components/class/ClassForm.vue', () => ({
  name: 'ClassForm',
  template: '<form class="class-form-mock" @submit.prevent="$emit(\'submit\', mockData)"><button type="button" @click="$emit(\'cancel\')">Cancel</button></form>',
  props: ['classData', 'isEditing'],
  emits: ['submit', 'cancel'],
  setup() {
    return {
      mockData: {
        classCode: 'CS101-01',
        course: 'course1',
        academicYear: '2023-2024',
        semester: 1,
        instructor: 'Dr. Smith',
        maxCapacity: 30,
        schedule: []
      }
    };
  }
}));

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

describe('ClassManage.vue', () => {
  let wrapper;
  let store;
  let router;

  const mockClasses = [
    {
      _id: 'class1',
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
    },
    {
      _id: 'class2',
      classCode: 'MATH101-01',
      course: {
        _id: 'course2',
        courseCode: 'MATH101',
        name: 'Mathematics',
        credits: 4
      },
      academicYear: '2023-2024',
      semester: 2,
      instructor: 'Dr. Johnson',
      enrolledStudents: 20,
      maxCapacity: 25,
      schedule: []
    }
  ];

  const mockCourses = [
    {
      _id: 'course1',
      courseCode: 'CS101',
      name: 'Computer Science',
      credits: 3
    },
    {
      _id: 'course2',
      courseCode: 'MATH101',
      name: 'Mathematics',
      credits: 4
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
            fetchClasses: jest.fn(),
            addClass: jest.fn(),
            updateClass: jest.fn()
          }
        },
        course: {
          namespaced: true,
          state: {
            courses: mockCourses
          },
          actions: {
            fetchCourses: jest.fn()
          }
        }
      }
    });

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/classes', component: { template: '<div>Classes</div>' } }
      ]
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('should render class management page with correct title', async () => {
    wrapper = mount(ClassManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    expect(wrapper.find('h2').text()).toBe('class.management');
  });

  it('should display class table when form is not shown', async () => {
    wrapper = mount(ClassManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    expect(wrapper.find('table').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'ClassForm' }).exists()).toBe(false);
  });

  it('should display all classes in table', async () => {
    wrapper = mount(ClassManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    const tableRows = wrapper.findAll('tbody tr');
    expect(tableRows.length).toBe(2);
    expect(tableRows[0].text()).toContain('CS101-01');
    expect(tableRows[0].text()).toContain('Dr. Smith');
    expect(tableRows[1].text()).toContain('MATH101-01');
    expect(tableRows[1].text()).toContain('Dr. Johnson');
  });

  it('should show add form when add button clicked', async () => {
    wrapper = mount(ClassManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    const addButton = wrapper.find('.btn-success');
    await addButton.trigger('click');

    expect(wrapper.vm.showForm).toBe(true);
    expect(wrapper.vm.isEditing).toBe(false);
    expect(wrapper.findComponent({ name: 'ClassForm' }).exists()).toBe(true);
  });

  it('should show edit form when edit button clicked', async () => {
    wrapper = mount(ClassManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    const editButton = wrapper.find('.btn-warning');
    await editButton.trigger('click');

    expect(wrapper.vm.showForm).toBe(true);
    expect(wrapper.vm.isEditing).toBe(true);
    expect(wrapper.vm.selectedClass).toEqual(mockClasses[0]);
  });

  it('should cancel form when cancel is emitted', async () => {
    wrapper = mount(ClassManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    // Show form first
    wrapper.vm.showForm = true;
    await nextTick();

    const form = wrapper.findComponent({ name: 'ClassForm' });
    await form.vm.$emit('cancel');

    expect(wrapper.vm.showForm).toBe(false);
    expect(wrapper.vm.selectedClass).toEqual({});
  });

  it('should save new class when form submitted', async () => {
    const addClassAction = jest.fn();
    const fetchClassesAction = jest.fn();
    store._modules.root._children.class._rawModule.actions.addClass = addClassAction;
    store._modules.root._children.class._rawModule.actions.fetchClasses = fetchClassesAction;

    wrapper = mount(ClassManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    // Show add form
    wrapper.vm.showForm = true;
    wrapper.vm.isEditing = false;
    await nextTick();

    const form = wrapper.findComponent({ name: 'ClassForm' });
    const classData = {
      classCode: 'CS102-01',
      course: 'course1',
      academicYear: '2023-2024',
      semester: 1,
      instructor: 'Dr. Brown',
      maxCapacity: 30,
      schedule: []
    };

    await form.vm.$emit('submit', classData);

    expect(addClassAction).toHaveBeenCalledWith(expect.any(Object), classData);
    expect(fetchClassesAction).toHaveBeenCalled();
    expect(wrapper.vm.showSuccessModal).toBe(true);
  });

  it('should search classes by query', async () => {
    wrapper = mount(ClassManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    const searchInput = wrapper.find('input[type="text"]');
    await searchInput.setValue('CS101');

    const searchButton = wrapper.find('.btn-primary');
    await searchButton.trigger('click');

    expect(wrapper.vm.searchQuery).toBe('CS101');
    expect(wrapper.vm.currentPage).toBe(1);
  });

  it('should show schedule modal when view schedule clicked', async () => {
    wrapper = mount(ClassManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    const scheduleButton = wrapper.find('.btn-outline-primary');
    await scheduleButton.trigger('click');

    expect(wrapper.vm.isScheduleModalVisible).toBe(true);
    expect(wrapper.vm.selectedClass).toEqual(mockClasses[0]);
  });

  it('should format semester correctly', () => {
    wrapper = mount(ClassManage, {
      global: {
        plugins: [store, router]
      }
    });

    expect(wrapper.vm.formatSemester(1)).toBe('semester.regular');
    expect(wrapper.vm.formatSemester(2)).toBe('semester.regular');
    expect(wrapper.vm.formatSemester(3)).toBe('semester.summer');
  });

  it('should get course info correctly', () => {
    wrapper = mount(ClassManage, {
      global: {
        plugins: [store, router]
      }
    });

    const courseInfo = wrapper.vm.getCourseInfo('course1');
    expect(courseInfo).toBe('CS101 - Computer Science (3 TC)');

    const invalidCourseInfo = wrapper.vm.getCourseInfo('invalid');
    expect(invalidCourseInfo).toBe('N/A');
  });

  it('should calculate progress bar class correctly', () => {
    wrapper = mount(ClassManage, {
      global: {
        plugins: [store, router]
      }
    });

    // Test danger (90%+)
    expect(wrapper.vm.getProgressBarClass({ enrolledStudents: 27, maxCapacity: 30 })).toBe('bg-danger');
    
    // Test warning (75-89%)
    expect(wrapper.vm.getProgressBarClass({ enrolledStudents: 24, maxCapacity: 30 })).toBe('bg-warning');
    
    // Test success (<75%)
    expect(wrapper.vm.getProgressBarClass({ enrolledStudents: 20, maxCapacity: 30 })).toBe('bg-success');
  });

  it('should show loading spinner when loading', async () => {
    store.state.class.loading = true;

    wrapper = mount(ClassManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    expect(wrapper.find('.spinner-border').exists()).toBe(true);
  });

  it('should show no data message when no classes', async () => {
    store.state.class.classes = [];

    wrapper = mount(ClassManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    expect(wrapper.text()).toContain('class.no_data');
  });

  it('should generate academic years correctly', () => {
    wrapper = mount(ClassManage, {
      global: {
        plugins: [store, router]
      }
    });

    const academicYears = wrapper.vm.academicYears;
    expect(academicYears).toHaveLength(4);
    expect(academicYears[0]).toMatch(/\d{4}-\d{4}/);
  });

  it('should paginate classes correctly', () => {
    wrapper = mount(ClassManage, {
      global: {
        plugins: [store, router]
      }
    });

    wrapper.vm.pageSize = 1;
    wrapper.vm.currentPage = 1;

    const paginatedClasses = wrapper.vm.paginatedClasses;
    expect(paginatedClasses).toHaveLength(1);
    expect(paginatedClasses[0].classCode).toBe('CS101-01');
  });
});