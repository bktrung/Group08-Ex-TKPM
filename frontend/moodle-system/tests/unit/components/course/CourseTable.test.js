import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import CourseTable from '@/components/course/CourseTable.vue';
import { createStore } from 'vuex';

// Mock child components
jest.mock('@/components/layout/DefaultPagination.vue', () => ({
  name: 'BasePagination',
  template: '<div class="pagination-mock"></div>',
  props: ['modelValue', 'pageSize', 'totalItems', 'currentItems'],
  emits: ['update:modelValue', 'update:pageSize']
}));

describe('CourseTable.vue', () => {
  let wrapper;
  let store;

  const mockCourses = [
    {
      _id: 'course1',
      courseCode: 'CS101',
      name: 'Computer Science',
      department: {
        _id: 'dept1',
        name: 'Computer Science Department'
      },
      credits: 3,
      prerequisites: [],
      isActive: true
    },
    {
      _id: 'course2',
      courseCode: 'MATH101',
      name: 'Mathematics',
      department: 'dept2',
      credits: 4,
      prerequisites: [
        {
          _id: 'course1',
          courseCode: 'CS101',
          name: 'Computer Science'
        }
      ],
      isActive: true
    }
  ];

  beforeEach(() => {
    store = createStore({
      modules: {
        course: {
          namespaced: true,
          state: {
            courses: mockCourses,
            loading: false
          }
        },
        department: {
          namespaced: true,
          getters: {
            getDepartmentById: () => (id) => ({
              _id: id,
              name: id === 'dept2' ? 'Mathematics Department' : 'Unknown'
            })
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

  it('should render course table with data', async () => {
    wrapper = mount(CourseTable, {
      global: {
        plugins: [store]
      }
    });

    await nextTick();

    expect(wrapper.find('table').exists()).toBe(true);
    expect(wrapper.text()).toContain('CS101');
    expect(wrapper.text()).toContain('Computer Science');
  });

  it('should search courses correctly', async () => {
    wrapper = mount(CourseTable, {
      global: {
        plugins: [store]
      }
    });

    await nextTick();

    const searchInput = wrapper.find('input[type="text"]');
    await searchInput.setValue('CS101');

    const searchButton = wrapper.find('.btn-primary');
    await searchButton.trigger('click');

    expect(wrapper.vm.filteredCourses).toHaveLength(1);
    expect(wrapper.vm.filteredCourses[0].courseCode).toBe('CS101');
  });

  it('should reset search correctly', async () => {
    wrapper = mount(CourseTable, {
      global: {
        plugins: [store]
      }
    });

    await nextTick();

    // Set search query
    wrapper.vm.searchQuery = 'CS101';
    wrapper.vm.currentPage = 2;

    const resetButton = wrapper.find('.btn-secondary');
    await resetButton.trigger('click');

    expect(wrapper.vm.searchQuery).toBe('');
    expect(wrapper.vm.currentPage).toBe(1);
  });

  it('should emit select-course when view class button clicked', async () => {
    wrapper = mount(CourseTable, {
      global: {
        plugins: [store]
      }
    });

    await nextTick();

    const viewClassButton = wrapper.find('.btn-info');
    await viewClassButton.trigger('click');

    expect(wrapper.emitted('select-course')).toBeTruthy();
    expect(wrapper.emitted('select-course')[0]).toEqual([mockCourses[0]]);
  });

  it('should get department name correctly', () => {
    wrapper = mount(CourseTable, {
      global: {
        plugins: [store]
      }
    });

    // Test with object department
    expect(wrapper.vm.getDepartmentName({
      _id: 'dept1',
      name: 'Computer Science Department'
    })).toBe('Computer Science Department');

    // Test with string department ID
    expect(wrapper.vm.getDepartmentName('dept2')).toBe('Mathematics Department');

    // Test with null
    expect(wrapper.vm.getDepartmentName(null)).toBe('N/A');
  });

  it('should get prerequisite names correctly', () => {
    wrapper = mount(CourseTable, {
      global: {
        plugins: [store]
      }
    });

    // Test with prerequisite objects
    const prerequisites = [
      {
        courseCode: 'CS101',
        name: 'Computer Science'
      }
    ];
    
    const result = wrapper.vm.getPrerequisiteNames(prerequisites);
    expect(result).toEqual(['CS101 - Computer Science']);

    // Test with empty array
    expect(wrapper.vm.getPrerequisiteNames([])).toEqual([]);

    // Test with null
    expect(wrapper.vm.getPrerequisiteNames(null)).toEqual([]);
  });

  it('should handle loading state', async () => {
    store.state.course.loading = true;

    wrapper = mount(CourseTable, {
      global: {
        plugins: [store]
      }
    });

    await nextTick();

    expect(wrapper.find('.spinner-border').exists()).toBe(true);
  });

  it('should handle empty search results', async () => {
    wrapper = mount(CourseTable, {
      global: {
        plugins: [store]
      }
    });

    await nextTick();

    wrapper.vm.searchQuery = 'NonExistentCourse';
    await nextTick();

    expect(wrapper.text()).toContain('course.no_search_result');
  });
});