import { createStore } from 'vuex'
import storeConfig from '@/store/index.js'

describe('store index', () => {
  let store

  beforeEach(() => {
    store = createStore(storeConfig)
  })

  it('should have initial state', () => {
    expect(store.state.loading).toBe(false)
    expect(store.state.error).toBe(null)
  })

  it('should have all required modules', () => {
    expect(store.hasModule('student')).toBe(true)
    expect(store.hasModule('department')).toBe(true)
    expect(store.hasModule('program')).toBe(true)
    expect(store.hasModule('status')).toBe(true)
    expect(store.hasModule('course')).toBe(true)
    expect(store.hasModule('class')).toBe(true)
    expect(store.hasModule('enrollment')).toBe(true)
    expect(store.hasModule('transcript')).toBe(true)
  })

  it('should have root mutations', () => {
    expect(store._mutations).toHaveProperty('SET_LOADING')
    expect(store._mutations).toHaveProperty('SET_ERROR')
  })

  it('should set loading state', () => {
    store.commit('SET_LOADING', true)
    expect(store.state.loading).toBe(true)
    
    store.commit('SET_LOADING', false)
    expect(store.state.loading).toBe(false)
  })

  it('should set error state', () => {
    const error = 'Test error'
    store.commit('SET_ERROR', error)
    expect(store.state.error).toBe(error)
    
    store.commit('SET_ERROR', null)
    expect(store.state.error).toBe(null)
  })

  it('should have namespaced modules', () => {
    const moduleNames = ['student', 'department', 'program', 'status', 'course', 'class', 'enrollment', 'transcript']
    
    moduleNames.forEach(moduleName => {
      expect(store._modules.root._children[moduleName].namespaced).toBe(true)
    })
  })

  it('should have student module state', () => {
    expect(store.state.student).toHaveProperty('students')
    expect(store.state.student).toHaveProperty('loading')
    expect(store.state.student).toHaveProperty('error')
  })

  it('should have course module state', () => {
    expect(store.state.course).toHaveProperty('courses')
    expect(store.state.course).toHaveProperty('loading')
    expect(store.state.course).toHaveProperty('error')
  })

  it('should have class module state', () => {
    expect(store.state.class).toHaveProperty('classes')
    expect(store.state.class).toHaveProperty('loading')
    expect(store.state.class).toHaveProperty('error')
  })
})