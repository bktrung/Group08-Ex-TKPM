import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import DepartmentManage from '@/views/DepartmentManage.vue';
import { createStore } from 'vuex';
import { createRouter, createWebHistory } from 'vue-router';

// Mock child components
jest.mock('@/components/layout/BaseModal.vue', () => ({
  name: 'BaseModal',
  template: '<div class="base-modal-mock" v-if="showModal"><button @click="$emit(\'save\', \'New Department\')">Save</button><button @click="$emit(\'close\')">Close</button></div>',
  props: ['title', 'placeholderTitle', 'itemName', 'showModal'],
  emits: ['save', 'close']
}));

jest.mock('@/components/layout/ErrorModal.vue', () => ({
  name: 'ErrorModal',
  template: '<div class="error-modal-mock" v-if="showModal"></div>',
  props: ['showModal', 'title', 'message', 'isTranslated'],
  emits: ['update:showModal']
}));

describe('DepartmentManage.vue', () => {
  let wrapper;
  let store;
  let router;

  const mockDepartments = [
    { _id: 'dept1', name: 'Computer Science' },
    { _id: 'dept2', name: 'Mathematics' },
    { _id: 'dept3', name: 'Physics' }
  ];

  beforeEach(() => {
    store = createStore({
      modules: {
        department: {
          namespaced: true,
          state: {
            departments: mockDepartments,
            loading: false
          },
          actions: {
            fetchDepartments: jest.fn(),
            createDepartment: jest.fn(),
            updateDepartment: jest.fn()
          }
        }
      }
    });

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/departments', component: { template: '<div>Departments</div>' } }
      ]
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('should render department management page with correct title', async () => {
    wrapper = mount(DepartmentManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    expect(wrapper.find('h2').text()).toBe('department.management');
  });

  it('should display all departments in table', async () => {
    wrapper = mount(DepartmentManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    const tableRows = wrapper.findAll('tbody tr');
    expect(tableRows.length).toBe(3);
    
    expect(tableRows[0].text()).toContain('Computer Science');
    expect(tableRows[1].text()).toContain('Mathematics');
    expect(tableRows[2].text()).toContain('Physics');
  });

  it('should show add department modal when add button clicked', async () => {
    wrapper = mount(DepartmentManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    const addButton = wrapper.find('.btn-success');
    await addButton.trigger('click');

    expect(wrapper.vm.isModalOpen).toBe(true);
    expect(wrapper.vm.editingDepartmentId).toBe(null);
    expect(wrapper.vm.departmentName).toBe('');
    expect(wrapper.findComponent({ name: 'BaseModal' }).exists()).toBe(true);
  });

  it('should show edit department modal when edit button clicked', async () => {
    wrapper = mount(DepartmentManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    const editButton = wrapper.find('.btn-warning');
    await editButton.trigger('click');

    expect(wrapper.vm.isModalOpen).toBe(true);
    expect(wrapper.vm.editingDepartmentId).toBe('dept1');
    expect(wrapper.vm.departmentName).toBe('Computer Science');
    expect(wrapper.vm.originalDepartmentName).toBe('Computer Science');
  });

  it('should close modal when close event emitted', async () => {
    wrapper = mount(DepartmentManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    wrapper.vm.isModalOpen = true;
    await nextTick();

    const modal = wrapper.findComponent({ name: 'BaseModal' });
    await modal.vm.$emit('close');

    expect(wrapper.vm.isModalOpen).toBe(false);
  });

  it('should create new department when save event emitted', async () => {
    const createDepartmentAction = jest.fn();
    store._modules.root._children.department._rawModule.actions.createDepartment = createDepartmentAction;

    wrapper = mount(DepartmentManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    // Open add modal
    wrapper.vm.editingDepartmentId = null;
    wrapper.vm.isModalOpen = true;
    await nextTick();

    const modal = wrapper.findComponent({ name: 'BaseModal' });
    await modal.vm.$emit('save', 'New Department');

    expect(createDepartmentAction).toHaveBeenCalledWith(
      expect.any(Object),
      { name: 'New Department' }
    );
    expect(wrapper.vm.isModalOpen).toBe(false);
  });

  it('should update existing department when save event emitted in edit mode', async () => {
    const updateDepartmentAction = jest.fn();
    store._modules.root._children.department._rawModule.actions.updateDepartment = updateDepartmentAction;

    wrapper = mount(DepartmentManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    // Set up edit mode
    wrapper.vm.editingDepartmentId = 'dept1';
    wrapper.vm.originalDepartmentName = 'Computer Science';
    wrapper.vm.isModalOpen = true;
    await nextTick();

    const modal = wrapper.findComponent({ name: 'BaseModal' });
    await modal.vm.$emit('save', 'Updated Computer Science');

    expect(updateDepartmentAction).toHaveBeenCalledWith(
      expect.any(Object),
      {
        id: 'dept1',
        department: { name: 'Updated Computer Science' }
      }
    );
    expect(wrapper.vm.isModalOpen).toBe(false);
  });

  it('should not save when name is empty', async () => {
    const createDepartmentAction = jest.fn();
    store._modules.root._children.department._rawModule.actions.createDepartment = createDepartmentAction;

    wrapper = mount(DepartmentManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    wrapper.vm.editingDepartmentId = null;
    wrapper.vm.isModalOpen = true;
    await nextTick();

    const modal = wrapper.findComponent({ name: 'BaseModal' });
    await modal.vm.$emit('save', '   '); // Empty trimmed string

    expect(createDepartmentAction).not.toHaveBeenCalled();
    expect(wrapper.vm.isModalOpen).toBe(false);
  });

  it('should not save when name is unchanged in edit mode', async () => {
    const updateDepartmentAction = jest.fn();
    store._modules.root._children.department._rawModule.actions.updateDepartment = updateDepartmentAction;

    wrapper = mount(DepartmentManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    wrapper.vm.editingDepartmentId = 'dept1';
    wrapper.vm.originalDepartmentName = 'Computer Science';
    wrapper.vm.isModalOpen = true;
    await nextTick();

    const modal = wrapper.findComponent({ name: 'BaseModal' });
    await modal.vm.$emit('save', 'Computer Science'); // Same name

    expect(updateDepartmentAction).not.toHaveBeenCalled();
    expect(wrapper.vm.isModalOpen).toBe(false);
  });

  it('should show loading spinner when loading', async () => {
    store.state.department.loading = true;

    wrapper = mount(DepartmentManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    expect(wrapper.find('.spinner-border').exists()).toBe(true);
  });

  it('should show no data message when departments array is empty', async () => {
    store.state.department.departments = [];

    wrapper = mount(DepartmentManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    expect(wrapper.text()).toContain('department.no_data');
  });

  it('should display correct modal title for add mode', () => {
    wrapper = mount(DepartmentManage, {
      global: {
        plugins: [store, router]
      }
    });

    wrapper.vm.editingDepartmentId = null;
    expect(wrapper.vm.modalTitle).toBe('common.add');
  });

  it('should display correct modal title for edit mode', () => {
    wrapper = mount(DepartmentManage, {
      global: {
        plugins: [store, router]
      }
    });

    wrapper.vm.editingDepartmentId = 'dept1';
    expect(wrapper.vm.modalTitle).toBe('common.edit');
  });

  it('should determine editing state correctly', () => {
    wrapper = mount(DepartmentManage, {
      global: {
        plugins: [store, router]
      }
    });

    wrapper.vm.editingDepartmentId = null;
    expect(wrapper.vm.isEditing).toBe(false);

    wrapper.vm.editingDepartmentId = 'dept1';
    expect(wrapper.vm.isEditing).toBe(true);
  });

  it('should handle error when creating department', async () => {
    const createDepartmentAction = jest.fn().mockRejectedValue(new Error('Create failed'));
    store._modules.root._children.department._rawModule.actions.createDepartment = createDepartmentAction;

    wrapper = mount(DepartmentManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    wrapper.vm.editingDepartmentId = null;
    wrapper.vm.isModalOpen = true;
    await nextTick();

    const modal = wrapper.findComponent({ name: 'BaseModal' });
    await modal.vm.$emit('save', 'New Department');

    expect(wrapper.vm.showErrorModal).toBe(true);
  });

  it('should handle error when updating department', async () => {
    const updateDepartmentAction = jest.fn().mockRejectedValue(new Error('Update failed'));
    store._modules.root._children.department._rawModule.actions.updateDepartment = updateDepartmentAction;

    wrapper = mount(DepartmentManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    wrapper.vm.editingDepartmentId = 'dept1';
    wrapper.vm.originalDepartmentName = 'Computer Science';
    wrapper.vm.isModalOpen = true;
    await nextTick();

    const modal = wrapper.findComponent({ name: 'BaseModal' });
    await modal.vm.$emit('save', 'Updated Name');

    expect(wrapper.vm.showErrorModal).toBe(true);
  });

  it('should load departments on mount', async () => {
    const fetchDepartmentsAction = jest.fn();
    store._modules.root._children.department._rawModule.actions.fetchDepartments = fetchDepartmentsAction;

    wrapper = mount(DepartmentManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    expect(fetchDepartmentsAction).toHaveBeenCalled();
  });

  it('should handle error when loading departments', async () => {
    const fetchDepartmentsAction = jest.fn().mockRejectedValue(new Error('Load failed'));
    store._modules.root._children.department._rawModule.actions.fetchDepartments = fetchDepartmentsAction;

    wrapper = mount(DepartmentManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    expect(wrapper.vm.showErrorModal).toBe(true);
  });

  it('should display department numbers correctly', async () => {
    wrapper = mount(DepartmentManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    const tableRows = wrapper.findAll('tbody tr');
    expect(tableRows[0].find('td').text()).toBe('1');
    expect(tableRows[1].find('td').text()).toBe('2');
    expect(tableRows[2].find('td').text()).toBe('3');
  });

  it('should trim whitespace from department name before saving', async () => {
    const createDepartmentAction = jest.fn();
    store._modules.root._children.department._rawModule.actions.createDepartment = createDepartmentAction;

    wrapper = mount(DepartmentManage, {
      global: {
        plugins: [store, router]
      }
    });

    await nextTick();

    wrapper.vm.editingDepartmentId = null;
    wrapper.vm.isModalOpen = true;
    await nextTick();

    const modal = wrapper.findComponent({ name: 'BaseModal' });
    await modal.vm.$emit('save', '  New Department  ');

    expect(createDepartmentAction).toHaveBeenCalledWith(
      expect.any(Object),
      { name: 'New Department' }
    );
  });
});