import programModule from '@/store/modules/program.js'
import api from '@/services/index.js'

// Mock the API
jest.mock('@/services/index.js', () => ({
  program: {
    getPrograms: jest.fn(),
    createProgram: jest.fn(),
    updateProgram: jest.fn(),
    deleteProgram: jest.fn()
  }
}))

describe('program store module', () => {
  let store

  beforeEach(() => {
    store = {
      state: { ...programModule.state },
      commit: jest.fn(),
      dispatch: jest.fn()
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

    it('should set error state', () => {
      const error = 'Test error'
      programModule.mutations.SET_ERROR(store.state, error)
      expect(store.state.error).toBe(error)
    })
  })

  describe('actions', () => {
    it('should fetch programs successfully', async () => {
      const programs = [{ _id: '1', name: 'Computer Science' }]
      const mockResponse = {
        data: {
          metadata: {
            programs
          }
        }
      }
      
      api.program.getPrograms.mockResolvedValue(mockResponse)
      
      await programModule.actions.fetchPrograms(store)
      
      expect(store.commit).toHaveBeenCalledWith('SET_LOADING', true)
      expect(store.commit).toHaveBeenCalledWith('SET_PROGRAMS', programs)
      expect(store.commit).toHaveBeenCalledWith('SET_LOADING', false)
    })

    it('should handle fetch programs error', async () => {
      const error = new Error('Fetch failed')
      api.program.getPrograms.mockRejectedValue(error)
      
      await programModule.actions.fetchPrograms(store)
      
      expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Fetch failed')
    })

    it('should create program successfully', async () => {
      const program = { name: 'New Program' }
      
      api.program.createProgram.mockResolvedValue({})
      
      await programModule.actions.createProgram(store, program)
      
      expect(api.program.createProgram).toHaveBeenCalledWith(program)
      expect(store.dispatch).toHaveBeenCalledWith('fetchPrograms')
    })

    it('should handle create program error', async () => {
      const error = new Error('Create failed')
      api.program.createProgram.mockRejectedValue(error)
      
      await expect(programModule.actions.createProgram(store, {})).rejects.toThrow()
      
      expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Create failed')
    })

    it('should update program successfully', async () => {
      const id = '1'
      const program = { name: 'Updated Program' }
      
      api.program.updateProgram.mockResolvedValue({})
      
      await programModule.actions.updateProgram(store, { id, program })
      
      expect(api.program.updateProgram).toHaveBeenCalledWith(id, program)
      expect(store.dispatch).toHaveBeenCalledWith('fetchPrograms')
    })

    it('should handle update program error', async () => {
      const error = new Error('Update failed')
      api.program.updateProgram.mockRejectedValue(error)
      
      await expect(programModule.actions.updateProgram(store, { id: '1', program: {} })).rejects.toThrow()
      
      expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Update failed')
    })

    it('should delete program successfully', async () => {
      const id = '1'
      
      api.program.deleteProgram.mockResolvedValue({})
      
      await programModule.actions.deleteProgram(store, id)
      
      expect(api.program.deleteProgram).toHaveBeenCalledWith(id)
      expect(store.dispatch).toHaveBeenCalledWith('fetchPrograms')
    })

    it('should handle delete program error', async () => {
      const error = new Error('Delete failed')
      api.program.deleteProgram.mockRejectedValue(error)
      
      await expect(programModule.actions.deleteProgram(store, '1')).rejects.toThrow()
      
      expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Delete failed')
    })
  })

  describe('getters', () => {
    beforeEach(() => {
      store.state.programs = [
        { _id: '1', name: 'Computer Science' },
        { _id: '2', name: 'Mathematics' }
      ]
    })

    it('should get program by ID', () => {
      const program = programModule.getters.getProgramById(store.state)('1')
      expect(program.name).toBe('Computer Science')
    })

    it('should get program name by ID', () => {
      const name = programModule.getters.getProgramName(store.state)('2')
      expect(name).toBe('Mathematics')
    })

    it('should return empty string for non-existent program', () => {
      const name = programModule.getters.getProgramName(store.state)('999')
      expect(name).toBe('')
    })
  })
})