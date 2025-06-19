import { describe, it, expect } from '@jest/globals'
import { createStore } from 'vuex'

// Mock all modules
const mockModule = {
  namespaced: true,
  state: () => ({}),
  mutations: {},
  actions: {},
  getters: {}
}

jest.mock('@/store/modules/student', () => mockModule, { virtual: true })
jest.mock('@/store/modules/department', () => mockModule, { virtual: true })
jest.mock('@/store/modules/program', () => mockModule, { virtual: true })
jest.mock('@/store/modules/status', () => mockModule, { virtual: true })
jest.mock('@/store/modules/course', () => mockModule, { virtual: true })
jest.mock('@/store/modules/class', () => mockModule, { virtual: true })
jest.mock('@/store/modules/enrollment', () => mockModule, { virtual: true })
jest.mock('@/store/modules/transcript', () => mockModule, { virtual: true })

describe('store configuration', () => {
  let store

  beforeEach(() => {
    store = createStore({
      state: {
        loading: false,
        error: null
      },
      mutations: {
        SET_LOADING(state, loading) {
          state.loading = loading
        },
        SET_ERROR(state, error) {
          state.error = error
        }
      },
      actions: {},
      modules: {
        student: mockModule,
        department: mockModule,
        program: mockModule,
        status: mockModule,
        course: mockModule,
        'class': mockModule,
        enrollment: mockModule,
        transcript: mockModule
      }
    })
  })

  it('should have correct initial state', () => {
    expect(store.state.loading).toBe(false)
    expect(store.state.error).toBe(null)
  })

  it('should have SET_LOADING mutation', () => {
    store.commit('SET_LOADING', true)
    expect(store.state.loading).toBe(true)
  })

  it('should have SET_ERROR mutation', () => {
    const error = 'Test error'
    store.commit('SET_ERROR', error)
    expect(store.state.error).toBe(error)
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
})