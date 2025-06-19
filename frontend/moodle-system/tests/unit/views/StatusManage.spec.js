import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import StatusManage from '@/views/StatusManage.vue'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      sidebar: {
        status_types: 'Status Types'
      },
      student: {
        status: {
          title: 'Status',
          enter: 'Enter status',
          no_data: 'No status data'
        }
      },
      common: {
        add: 'Add',
        edit: 'Edit',
        loading: 'Loading...',
        number: 'No.',
        action: 'Action',
        error: 'Error'
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
          loading: false,
          error: null,
          ...initialState.status
        },
        actions: {
          fetchStatusTypes: jest.fn(),
          createStatusType: jest.fn(),
          updateStatusType: jest.fn()
        }
      }
    }
  })
}

describe('StatusManage.vue', () => {
  let wrapper
  let store

  beforeEach(() => {
    store = createMockStore()
    wrapper = mount(StatusManage, {
      global: {
        plugins: [store, i18n]
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('should render correctly', () => {
    expect(wrapper.find('h2').text()).toBe('Status Types')
    expect(wrapper.find('button').text()).toContain('Add')
    expect(wrapper.find('table').exists()).toBe(true)
  })

  it('should show loading state', async () => {
    store.state.status.loading = true
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.spinner-border').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading...')
  })

  it('should show no data message when status types array is empty', async () => {
    store.state.status.statusTypes = []
    store.state.status.loading = false
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('No status data')
  })

  it('should display status types when available', async () => {
    const statusTypes = [
      { _id: '1', type: 'Active' },
      { _id: '2', type: 'Inactive' }
    ]
    
    store.state.status.statusTypes = statusTypes
    store.state.status.loading = false
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Active')
    expect(wrapper.text()).toContain('Inactive')
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
  })

  it('should open add modal when add button is clicked', async () => {
    const addButton = wrapper.find('button')
    await addButton.trigger('click')
    
    expect(wrapper.vm.isModalOpen).toBe(true)
    expect(wrapper.vm.editingStatusId).toBe(null)
    expect(wrapper.vm.statusType).toBe('')
  })

  it('should open edit modal when edit button is clicked', async () => {
    const statusType = { _id: '1', type: 'Active' }
    store.state.status.statusTypes = [statusType]
    await wrapper.vm.$nextTick()
    
    const editButton = wrapper.find('.btn-warning')
    await editButton.trigger('click')
    
    expect(wrapper.vm.isModalOpen).toBe(true)
    expect(wrapper.vm.editingStatusId).toBe('1')
    expect(wrapper.vm.statusType).toBe('Active')
  })

  it('should save new status type', async () => {
    const statusName = 'New Status'
    
    await wrapper.vm.saveStatus(statusName)
    
    expect(store._actions['status/createStatusType']).toHaveBeenCalledWith(
      expect.any(Object),
      { type: statusName },
      undefined
    )
  })

  it('should update existing status type', async () => {
    wrapper.vm.editingStatusId = '1'
    wrapper.vm.originalStatusType = 'Old Status'
    const newType = 'Updated Status'
    
    await wrapper.vm.saveStatus(newType)
    
    expect(store._actions['status/updateStatusType']).toHaveBeenCalledWith(
      expect.any(Object),
      { id: '1', statusType: { type: newType } },
      undefined
    )
  })

  it('should fetch status types on mount', () => {
    expect(store._actions['status/fetchStatusTypes']).toHaveBeenCalled()
  })
})