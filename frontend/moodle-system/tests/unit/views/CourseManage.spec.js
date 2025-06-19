import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import CourseManage from '@/views/CourseManage.vue';
import { createStore } from 'vuex';
import { createRouter, createWebHistory } from 'vue-router';

// Mock child components
jest.mock('@/components/course/CourseForm.vue', () => ({
  name: 'CourseForm',
  template: '<form class="course-form-mock" @submit.prevent="$emit(\'submit\', mockData)"><button type="button" @click="$emit(\'cancel\')">Cancel</button></form>',
  props: ['courseData', 'isEditing'],
  emits: ['submit', 'cancel'],
  setup() {
    return {
      mockData: {
        courseCode: 'CS101',
        name: 'Computer Science',
        credits: 3,
        department: 'dept1',
        description: 'Course description'
      }
    };
  }
}));

jest.mock('@/components/course/CourseList.vue', () => ({
  name: 'CourseList',
  template: '<div class="course-list-mock"><button @click="$emit(\'add-course\')">Add</button><button @click="$emit(\'edit-course\', mockCourse)">Edit</button><button @click="$emit(\'delete-course\', mockCourse)">Delete</button><button @click="$emit(\'toggle-active-status\', mockCourse)">Toggle</button></div>',
  emits: ['add-course', 'edit-course', 'delete-course', 'toggle-active-status'],
  setup() {
    return {
      mockCourse: {
        courseCode: 'CS101',
        name: 'Computer Science',
        isActive: true
      }
    };
  }
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

describe('CourseManage.vue', () => {
  let wrapper;
  let store;
  let router;

  beforeEach(() => {
    store = createStore({
      modules: {
        course: {
          namespaced: true,
          state: {
            courses: []
          },
          actions: {
            fetchCourses: jest.fn(),
            createCourse: jest.fn(),
            updateCourse: jest.fn(),
            deleteCourse: jest.fn(),
            toggleCourseActiveStatus: jest.fn()
          }
        },
        department: {
          namespaced: true,
          actions: {
            fetchDepartments: jest.fn()
          }
        }
      }
    });

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/courses', component: { template: '<div>Courses</div>' } }
      ]
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('should render course management page with correct title', async () => {
    wrapper = mount(CourseManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    expect(wrapper.find('h2').text()).toBe('course.management');
  });

  it('should display course list when form is not shown', async () => {
    wrapper = mount(CourseManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    expect(wrapper.findComponent({ name: 'CourseList' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'CourseForm' }).exists()).toBe(false);
  });

  it('should show add form when add-course event emitted', async () => {
    wrapper = mount(CourseManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    const courseList = wrapper.findComponent({ name: 'CourseList' });
    await courseList.vm.$emit('add-course');

    expect(wrapper.vm.showForm).toBe(true);
    expect(wrapper.vm.isEditing).toBe(false);
    expect(wrapper.vm.selectedCourse).toEqual({});
    expect(wrapper.findComponent({ name: 'CourseForm' }).exists()).toBe(true);
  });

  it('should show edit form when edit-course event emitted', async () => {
    wrapper = mount(CourseManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    const mockCourse = {
      courseCode: 'CS101',
      name: 'Computer Science',
      credits: 3
    };

    const courseList = wrapper.findComponent({ name: 'CourseList' });
    await courseList.vm.$emit('edit-course', mockCourse);

    expect(wrapper.vm.showForm).toBe(true);
    expect(wrapper.vm.isEditing).toBe(true);
    expect(wrapper.vm.selectedCourse).toEqual(mockCourse);
  });

  it('should cancel form when cancel event emitted', async () => {
    wrapper = mount(CourseManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    // Show form first
    wrapper.vm.showForm = true;
    wrapper.vm.selectedCourse = { courseCode: 'TEST' };
    await nextTick();

    const courseForm = wrapper.findComponent({ name: 'CourseForm' });
    await courseForm.vm.$emit('cancel');

    expect(wrapper.vm.showForm).toBe(false);
    expect(wrapper.vm.selectedCourse).toEqual({});
  });

  it('should save new course when form submitted', async () => {
    const createCourseAction = jest.fn();
    const fetchCoursesAction = jest.fn();
    store._modules.root._children.course._rawModule.actions.createCourse = createCourseAction;
    store._modules.root._children.course._rawModule.actions.fetchCourses = fetchCoursesAction;

    wrapper = mount(CourseManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    // Show add form
    wrapper.vm.showForm = true;
    wrapper.vm.isEditing = false;
    await nextTick();

    const courseForm = wrapper.findComponent({ name: 'CourseForm' });
    const courseData = {
      courseCode: 'CS101',
      name: 'Computer Science',
      credits: 3,
      department: 'dept1',
      description: 'Course description'
    };

    await courseForm.vm.$emit('submit', courseData);

    expect(createCourseAction).toHaveBeenCalledWith(expect.any(Object), courseData);
    expect(fetchCoursesAction).toHaveBeenCalled();
    expect(wrapper.vm.showSuccessModal).toBe(true);
    expect(wrapper.vm.showForm).toBe(false);
  });

  it('should update existing course when form submitted in edit mode', async () => {
    const updateCourseAction = jest.fn();
    const fetchCoursesAction = jest.fn();
    store._modules.root._children.course._rawModule.actions.updateCourse = updateCourseAction;
    store._modules.root._children.course._rawModule.actions.fetchCourses = fetchCoursesAction;

    wrapper = mount(CourseManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    // Set up edit mode
    const existingCourse = {
      courseCode: 'CS101',
      name: 'Computer Science',
      credits: 3,
      department: { _id: 'dept1' },
      description: 'Old description'
    };

    wrapper.vm.showForm = true;
    wrapper.vm.isEditing = true;
    wrapper.vm.selectedCourse = existingCourse;
    await nextTick();

    const courseForm = wrapper.findComponent({ name: 'CourseForm' });
    const updatedData = {
      courseCode: 'CS101',
      name: 'Computer Science Updated',
      credits: 4,
      department: 'dept2',
      description: 'New description'
    };

    await courseForm.vm.$emit('submit', updatedData);

    expect(updateCourseAction).toHaveBeenCalledWith(
      expect.any(Object),
      {
        courseCode: 'CS101',
        data: expect.objectContaining({
          name: 'Computer Science Updated',
          credits: 4,
          department: 'dept2',
          description: 'New description'
        })
      }
    );
    expect(fetchCoursesAction).toHaveBeenCalled();
  });

  it('should delete course when delete-course event emitted', async () => {
    const deleteCourseAction = jest.fn().mockResolvedValue({
      success: true,
      message: 'Course deleted successfully'
    });
    const fetchCoursesAction = jest.fn();
    
    store._modules.root._children.course._rawModule.actions.deleteCourse = deleteCourseAction;
    store._modules.root._children.course._rawModule.actions.fetchCourses = fetchCoursesAction;

    wrapper = mount(CourseManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    const mockCourse = { courseCode: 'CS101', name: 'Computer Science' };
    const courseList = wrapper.findComponent({ name: 'CourseList' });
    await courseList.vm.$emit('delete-course', mockCourse);

    expect(deleteCourseAction).toHaveBeenCalledWith(expect.any(Object), 'CS101');
    expect(fetchCoursesAction).toHaveBeenCalled();
    expect(wrapper.vm.showSuccessModal).toBe(true);
  });

  it('should toggle course status when toggle-active-status event emitted', async () => {
    const toggleStatusAction = jest.fn().mockResolvedValue({
      success: true,
      message: 'Course status updated'
    });
    
    store._modules.root._children.course._rawModule.actions.toggleCourseActiveStatus = toggleStatusAction;

    wrapper = mount(CourseManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    const mockCourse = { courseCode: 'CS101', isActive: true };
    const courseList = wrapper.findComponent({ name: 'CourseList' });
    await courseList.vm.$emit('toggle-active-status', mockCourse);

    expect(toggleStatusAction).toHaveBeenCalledWith(
      expect.any(Object),
      {
        courseCode: 'CS101',
        isActive: false
      }
    );
  });

  it('should handle reopen course attempt', async () => {
    wrapper = mount(CourseManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    const mockCourse = { courseCode: 'CS101', isActive: false };
    const courseList = wrapper.findComponent({ name: 'CourseList' });
    await courseList.vm.$emit('toggle-active-status', mockCourse);

    expect(wrapper.vm.showErrorModal).toBe(true);
  });

  it('should build update data correctly for editing', () => {
    wrapper = mount(CourseManage, {
      global: {
        plugins: [store, router]
      }
    });

    const oldData = {
      name: 'Old Name',
      department: { _id: 'dept1' },
      description: 'Old description',
      credits: 3
    };

    const newData = {
      name: 'New Name',
      department: 'dept2',
      description: 'New description',
      credits: 4
    };

    const updateData = wrapper.vm.buildUpdateData(newData, oldData);

    expect(updateData).toEqual({
      name: 'New Name',
      department: 'dept2',
      description: 'New description',
      credits: 4
    });
  });

  it('should not include unchanged fields in update data', () => {
    wrapper = mount(CourseManage, {
      global: {
        plugins: [store, router]
      }
    });

    const oldData = {
      name: 'Same Name',
      department: { _id: 'dept1' },
      description: 'Same description',
      credits: 3
    };

    const newData = {
      name: 'Same Name',
      department: 'dept1',
      description: 'New description',
      credits: 3
    };

    const updateData = wrapper.vm.buildUpdateData(newData, oldData);

    expect(updateData).toEqual({
      description: 'New description'
    });
  });

  it('should handle errors when saving course', async () => {
    const createCourseAction = jest.fn().mockRejectedValue(new Error('Save failed'));
    store._modules.root._children.course._rawModule.actions.createCourse = createCourseAction;

    wrapper = mount(CourseManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    wrapper.vm.showForm = true;
    wrapper.vm.isEditing = false;
    await nextTick();

    const courseForm = wrapper.findComponent({ name: 'CourseForm' });
    await courseForm.vm.$emit('submit', { courseCode: 'TEST' });

    expect(wrapper.vm.showErrorModal).toBe(true);
  });

  it('should handle errors when deleting course', async () => {
    const deleteCourseAction = jest.fn().mockRejectedValue(new Error('Delete failed'));
    store._modules.root._children.course._rawModule.actions.deleteCourse = deleteCourseAction;

    wrapper = mount(CourseManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    const courseList = wrapper.findComponent({ name: 'CourseList' });
    await courseList.vm.$emit('delete-course', { courseCode: 'CS101' });

    expect(wrapper.vm.showErrorModal).toBe(true);
  });

  it('should handle errors when toggling course status', async () => {
    const toggleStatusAction = jest.fn().mockRejectedValue(new Error('Toggle failed'));
    store._modules.root._children.course._rawModule.actions.toggleCourseActiveStatus = toggleStatusAction;

    wrapper = mount(CourseManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    const courseList = wrapper.findComponent({ name: 'CourseList' });
    await courseList.vm.$emit('toggle-active-status', { courseCode: 'CS101', isActive: true });

    expect(wrapper.vm.showErrorModal).toBe(true);
  });

  it('should load departments and courses on mount', async () => {
    const fetchDepartmentsAction = jest.fn();
    const fetchCoursesAction = jest.fn();
    
    store._modules.root._children.department._rawModule.actions.fetchDepartments = fetchDepartmentsAction;
    store._modules.root._children.course._rawModule.actions.fetchCourses = fetchCoursesAction;

    wrapper = mount(CourseManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    expect(fetchDepartmentsAction).toHaveBeenCalled();
    expect(fetchCoursesAction).toHaveBeenCalled();
  });

  it('should retry fetching courses if initial fetch returns empty', async () => {
    const fetchCoursesAction = jest.fn();
    store._modules.root._children.course._rawModule.actions.fetchCourses = fetchCoursesAction;
    store.state.course.courses = [];

    wrapper = mount(CourseManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    // Wait for the setTimeout to trigger
    await new Promise(resolve => setTimeout(resolve, 1100));

    expect(fetchCoursesAction).toHaveBeenCalledTimes(2);
  });

  it('should handle loading error on mount', async () => {
    const fetchCoursesAction = jest.fn().mockRejectedValue(new Error('Load failed'));
    store._modules.root._children.course._rawModule.actions.fetchCourses = fetchCoursesAction;

    wrapper = mount(CourseManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    expect(wrapper.vm.showErrorModal).toBe(true);
  });
});