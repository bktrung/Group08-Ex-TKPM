import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import ProgramManage from '@/views/ProgramManage.vue'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      program: {
        management: 'Program Management',
        name: 'Program Name',
        no_data: 'No programs available',
        enter: 'Enter program name'
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
      program: {
        namespaced: true,
        state: {
          programs: [],
          loading: false,
          error: null,
          ...initialState.program
        },
        actions: {
          fetchPrograms: jest.fn(),
          createProgram: jest.fn(),
          updateProgram: jest.fn()
        }
      }
    }
  })
}

describe('ProgramManage.vue', () => {
  let wrapper
  let store

  beforeEach(() => {
    store = createMockStore()
    wrapper = mount(ProgramManage, {
      global: {
        plugins: [store, i18n]
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('should render correctly', () => {
    expect(wrapper.find('h2').text()).toBe('Program Management')
    expect(wrapper.find('button').text()).toContain('Add')
    expect(wrapper.find('table').exists()).toBe(true)
  })

  it('should show loading state', async () => {
    store.state.program.loading = true
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.spinner-border').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading...')
  })

  it('should show no data message when programs array is empty', async () => {
    store.state.program.programs = []
    store.state.program.loading = false
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('No programs available')
  })

  it('should display programs when available', async () => {
    const programs = [
      { _id: '1', name: 'Computer Science' },
      { _id: '2', name: 'Mathematics' }
    ]
    
    store.state.program.programs = programs
    store.state.program.loading = false
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Computer Science')
    expect(wrapper.text()).toContain('Mathematics')
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
  })

  it('should open add modal when add button is clicked', async () => {
    const addButton = wrapper.find('button')
    await addButton.trigger('click')
    
    expect(wrapper.vm.isModalOpen).toBe(true)
    expect(wrapper.vm.editingProgramId).toBe(null)
    expect(wrapper.vm.programName).toBe('')
  })

  it('should open edit modal when edit button is clicked', async () => {
    const program = { _id: '1', name: 'Computer Science' }
    store.state.program.programs = [program]
    await wrapper.vm.$nextTick()
    
    const editButton = wrapper.find('.btn-warning')
    await editButton.trigger('click')
    
    expect(wrapper.vm.isModalOpen).toBe(true)
    expect(wrapper.vm.editingProgramId).toBe('1')
    expect(wrapper.vm.programName).toBe('Computer Science')
  })

  it('should save new program', async () => {
    const programName = 'New Program'
    
    await wrapper.vm.saveProgram(programName)
    
    expect(store._actions['program/createProgram']).toHaveBeenCalledWith(
      expect.any(Object),
      { name: programName },
      undefined
    )
  })

  it('should update existing program', async () => {
    wrapper.vm.editingProgramId = '1'
    wrapper.vm.originalProgramName = 'Old Name'
    const newName = 'Updated Program'
    
    await wrapper.vm.saveProgram(newName)
    
    expect(store._actions['program/updateProgram']).toHaveBeenCalledWith(
      expect.any(Object),
      { id: '1', program: { name: newName } },
      undefined
    )
  })

  it('should not save if name is unchanged', async () => {
    wrapper.vm.editingProgramId = '1'
    wrapper.vm.originalProgramName = 'Same Name'
    
    await wrapper.vm.saveProgram('Same Name')
    
    expect(store._actions['program/createProgram']).not.toHaveBeenCalled()
    expect(store._actions['program/updateProgram']).not.toHaveBeenCalled()
    expect(wrapper.vm.isModalOpen).toBe(false)
  })

  it('should fetch programs on mount', () => {
    expect(store._actions['program/fetchPrograms']).toHaveBeenCalled()
  })
})