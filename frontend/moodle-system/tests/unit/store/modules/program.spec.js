import { describe, it, expect, beforeEach } from '@jest/globals'
import programModule from '@/store/modules/program'
import api from '@/services/index.js'

jest.mock('@/services/index.js')

describe('program store module', () => {
  let store
  let commit
  let dispatch

  beforeEach(() => {
    commit = jest.fn()
    dispatch = jest.fn()
    store = {
      state: {
        programs: [],
        loading: false,
        error: null
      },
      commit,
      dispatch
    }
    jest.clearAllMocks()
  })

  describe('mutations', () => {
    it('should set programs', () => {
      const programs = [{ _id: '1', name: 'Computer Science' }]
      programModule.mutations.SET_PROGRAMS(store.state, programs)
      expect(store.state.programs).toEqual(programs)
    })

    it('should set loading state', () => {
      programModule.mutations.SET_LOADING(store.state, true)
      expect(store.state.loading).toBe(true)
    })

    it('should set error', () => {
      const error = 'Test error'
      programModule.mutations.SET_ERROR(store.state, error)
      expect(store.state.error).toBe(error)
    })
  })

  describe('actions', () => {
    it('should fetch programs successfully', async () => {
      const mockResponse = {
        data: {
          metadata: {
            programs: [{ _id: '1', name: 'Computer Science' }]
          }
        }
      }
      api.program.getPrograms.mockResolvedValue(mockResponse)

      await programModule.actions.fetchPrograms({ commit })

      expect(commit).toHaveBeenCalledWith('SET_LOADING', true)
      expect(commit).toHaveBeenCalledWith('SET_PROGRAMS', mockResponse.data.metadata.programs)
      expect(commit).toHaveBeenCalledWith('SET_LOADING', false)
    })

    it('should handle fetch programs error', async () => {
      const error = new Error('Network error')
      api.program.getPrograms.mockRejectedValue(error)

      await programModule.actions.fetchPrograms({ commit })

      expect(commit).toHaveBeenCalledWith('SET_ERROR', 'Network error')
    })

    it('should create program successfully', async () => {
      api.program.createProgram.mockResolvedValue({})

      await programModule.actions.createProgram({ commit, dispatch }, { name: 'New Program' })

      expect(api.program.createProgram).toHaveBeenCalledWith({ name: 'New Program' })
      expect(dispatch).toHaveBeenCalledWith('fetchPrograms')
    })

    it('should update program successfully', async () => {
      api.program.updateProgram.mockResolvedValue({})

      await programModule.actions.updateProgram(
        { commit, dispatch },
        { id: '1', program: { name: 'Updated Program' } }
      )

      expect(api.program.updateProgram).toHaveBeenCalledWith('1', { name: 'Updated Program' })
      expect(dispatch).toHaveBeenCalledWith('fetchPrograms')
    })

    it('should delete program successfully', async () => {
      api.program.deleteProgram.mockResolvedValue({})

      await programModule.actions.deleteProgram({ commit, dispatch }, '1')

      expect(api.program.deleteProgram).toHaveBeenCalledWith('1')
      expect(dispatch).toHaveBeenCalledWith('fetchPrograms')
    })
  })

  describe('getters', () => {
    const mockState = {
      programs: [
        { _id: '1', name: 'Computer Science' },
        { _id: '2', name: 'Business Administration' }
      ]
    }

    it('should get program by id', () => {
      const program = programModule.getters.getProgramById(mockState)('1')
      expect(program).toEqual({ _id: '1', name: 'Computer Science' })
    })

    it('should get program name by id', () => {
      const name = programModule.getters.getProgramName(mockState)('2')
      expect(name).toBe('Business Administration')
    })

    it('should return empty string for non-existent program name', () => {
      const name = programModule.getters.getProgramName(mockState)('999')
      expect(name).toBe('')
    })
  })
})