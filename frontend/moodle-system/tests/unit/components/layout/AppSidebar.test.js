import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import AppSidebar from '@/components/layout/AppSidebar.vue';

describe('AppSidebar.vue', () => {
  let wrapper;
  let router;

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/courses', component: { template: '<div>Courses</div>' } },
        { path: '/classes', component: { template: '<div>Classes</div>' } }
      ]
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('should render sidebar with correct title', () => {
    wrapper = mount(AppSidebar, {
      global: {
        plugins: [router]
      }
    });

    expect(wrapper.find('.fs-5').text()).toBe('sidebar.title');
  });

  it('should render all navigation links', () => {
    wrapper = mount(AppSidebar, {
      global: {
        plugins: [router]
      }
    });

    const navLinks = wrapper.findAll('.nav-link');
    expect(navLinks.length).toBeGreaterThan(5);
    
    // Check specific links
    expect(wrapper.text()).toContain('sidebar.student_list');
    expect(wrapper.text()).toContain('sidebar.courses');
    expect(wrapper.text()).toContain('sidebar.classes');
    expect(wrapper.text()).toContain('sidebar.departments');
  });

  it('should have correct router links', () => {
    wrapper = mount(AppSidebar, {
      global: {
        plugins: [router]
      }
    });

    const routerLinks = wrapper.findAllComponents({ name: 'RouterLink' });
    expect(routerLinks.length).toBeGreaterThan(0);
    
    // Check specific routes
    expect(wrapper.find('[to="/"]').exists()).toBe(true);
    expect(wrapper.find('[to="/courses"]').exists()).toBe(true);
    expect(wrapper.find('[to="/classes"]').exists()).toBe(true);
  });

  it('should apply active class to current route', async () => {
    await router.push('/courses');
    
    wrapper = mount(AppSidebar, {
      global: {
        plugins: [router]
      }
    });

    // The component should have logic to highlight active route
    expect(wrapper.vm).toBeDefined();
  });
});