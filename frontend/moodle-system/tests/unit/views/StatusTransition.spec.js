import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import StatusTransition from '@/views/StatusTransition.vue'
import { createI18n } from 'vue-i18n'

// Mock Bootstrap Toast
const mockToast = {
  show: jest.fn(),
  hide: jest.fn()
}

jest.mock('bootstrap', () => ({
  Toast: jest.fn().mockImplementation(() => mockToast)
}))

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      statusTransitionRule: {
        title: 'Status Transition Rule Management',
        addNew: 'Add New Status Transition Rule',
        fromStatus: 'From Status',
        toStatus: 'To Status',
        addRule: 'Add Rule',
        info: 'Status transition rules define which statuses a student can move to.',
        noRules: 'No status transition rules have been defined.',
        canTransitionTo: 'Can transition to',
        deleteConfirmText: 'Are you sure you want to delete this transition rule?',
        toast: {
          addSuccess: 'Successfully added status transition rule',
          addError: 'Failed to add rule: {error}',
          deleteSuccess: 'Successfully deleted status transition rule',
          deleteError: 'Failed to delete rule: {error}'
        }
      },
      student: {
        status: {
          title: 'Status'
        }
      },
      common: {
        choose: 'Choose',
        loading: 'Loading...',
        from: 'From',
        to_lowercase: 'to',
        success: 'Success',
        error: 'Error',
        notification: 'Notification',
        confirm_delete: 'Confirm Delete',
        close: 'Close'
      }
    }
  }
})

const createMockStore = (initialState = {}) => {
  return createStore({
    modules: {
      status: {
        namespaced: true,
        state: {
          statusTypes: [],
          statusTransitions: [],
          loading: false,
          error: null,
          ...initialState.status
        },
        actions: {
          fetchStatusTypes: jest.fn(),
          fetchStatusTransitions: jest.fn(),
          createStatusTransition: jest.fn(),
          deleteStatusTransition: jest.fn()
        }
      }
    }
  })
}

describe('StatusTransition.vue', () => {
  let wrapper
  let store

  beforeEach(() => {
    store = createMockStore()
    wrapper = mount(StatusTransition, {
      global: {
        plugins: [store, i18n]
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('should render correctly', () => {
    expect(wrapper.find('h2').text()).toBe('Status Transition Rule Management')
    expect(wrapper.find('.alert-info').text()).toContain('Status transition rules define')
    expect(wrapper.findAll('select')).toHaveLength(2)
  })

  it('should show loading state', async () => {
    store.state.status.loading = true
    store.state.status.statusTransitions = []
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.spinner-border').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading...')
  })

  it('should show no rules message when no transitions exist', async () => {
    store.state.status.statusTransitions = []
    store.state.status.loading = false
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.alert-warning').exists()).toBe(true)
    expect(wrapper.text()).toContain('No status transition rules have been defined')
  })

  it('should display status types in dropdowns', async () => {
    const statusTypes = [
      { _id: '1', type: 'Active' },
      { _id: '2', type: 'Inactive' }
    ]
    
    store.state.status.statusTypes = statusTypes
    await wrapper.vm.$nextTick()
    
    const selects = wrapper.findAll('select')
    expect(selects[0].findAll('option')).toHaveLength(3) // including default option
    expect(selects[1].findAll('option')).toHaveLength(3)
  })

  it('should display transition rules when available', async () => {
    const statusTransitions = [{
      fromStatusId: '1',
      fromStatus: 'Active',
      toStatus: [
        { _id: '2', type: 'Inactive' }
      ]
    }]
    
    store.state.status.statusTransitions = statusTransitions
    store.state.status.loading = false
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.transition-card').exists()).toBe(true)
    expect(wrapper.text()).toContain('From: Active')
    expect(wrapper.text()).toContain('Inactive')
  })

  it('should add transition rule when form is submitted', async () => {
    await wrapper.setData({
      fromStatusId: '1',
      toStatusId: '2'
    })
    
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    
    expect(store._actions['status/createStatusTransition']).toHaveBeenCalledWith(
      expect.any(Object),
      {
        fromStatus: '1',
        toStatus: '2'
      },
      undefined
    )
  })

  it('should not submit form when fields are empty', async () => {
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')
    
    expect(store._actions['status/createStatusTransition']).not.toHaveBeenCalled()
  })

  it('should disable submit button when no status selected', async () => {
    const button = wrapper.find('button[type="submit"]')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('should enable submit button when both statuses selected', async () => {
    await wrapper.setData({
      fromStatusId: '1',
      toStatusId: '2'
    })
    
    const button = wrapper.find('button[type="submit"]')
    expect(button.attributes('disabled')).toBeUndefined()
  })

  it('should show confirm modal when delete is clicked', async () => {
    const statusTransitions = [{
      fromStatusId: '1',
      fromStatus: 'Active',
      toStatus: [
        { _id: '2', type: 'Inactive' }
      ]
    }]
    
    store.state.status.statusTransitions = statusTransitions
    await wrapper.vm.$nextTick()
    
    const deleteButton = wrapper.find('.remove-btn')
    await deleteButton.trigger('click')
    
    expect(wrapper.vm.showConfirmModal).toBe(true)
    expect(wrapper.vm.deleteFromStatus).toBe('Active')
    expect(wrapper.vm.deleteToStatus).toBe('Inactive')
  })

  it('should delete transition when confirmed', async () => {
    await wrapper.setData({
      deleteTransitionData: {
        fromStatusId: '1',
        toStatusId: '2'
      }
    })
    
    await wrapper.vm.deleteTransition()
    
    expect(store._actions['status/deleteStatusTransition']).toHaveBeenCalledWith(
      expect.any(Object),
      {
        fromStatus: '1',
        toStatus: '2'
      },
      undefined
    )
  })

  it('should show toast notification', async () => {
    wrapper.vm.showToast('Test Title', 'Test Message', 'success')
    
    expect(wrapper.vm.toastTitle).toBe('Test Title')
    expect(wrapper.vm.toastMessage).toBe('Test Message')
    expect(wrapper.vm.toastType).toBe('success')
  })

  it('should reset form after successful addition', async () => {
    await wrapper.setData({
      fromStatusId: '1',
      toStatusId: '2'
    })
    
    await wrapper.vm.addTransition()
    
    expect(wrapper.vm.fromStatusId).toBe('')
    expect(wrapper.vm.toStatusId).toBe('')
  })

  it('should disable to-status options that match from-status', async () => {
    const statusTypes = [
      { _id: '1', type: 'Active' },
      { _id: '2', type: 'Inactive' }
    ]
    
    store.state.status.statusTypes = statusTypes
    await wrapper.setData({ fromStatusId: '1' })
    
    const toSelect = wrapper.findAll('select')[1]
    const options = toSelect.findAll('option')
    
    // Find the option with value '1' (should be disabled)
    const disabledOption = options.find(option => option.attributes('value') === '1')
    expect(disabledOption.attributes('disabled')).toBeDefined()
  })

  it('should fetch data on mount', () => {
    expect(store._actions['status/fetchStatusTypes']).toHaveBeenCalled()
    expect(store._actions['status/fetchStatusTransitions']).toHaveBeenCalled()
  })

  it('should compute toast classes correctly', async () => {
    await wrapper.setData({
      toastType: 'success',
      toastMessage: 'Test message'
    })
    
    expect(wrapper.vm.toastClass.show).toBe(true)
    expect(wrapper.vm.toastHeaderClass).toBe('bg-success text-white')
  })
})