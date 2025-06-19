import transcriptModule from '@/store/modules/transcript.js'
import api from '@/services/index.js'

// Mock the API
jest.mock('@/services/index.js', () => ({
  enrollment: {
    getTranscript: jest.fn()
  }
}))

describe('transcript store module', () => {
  let store

  beforeEach(() => {
    store = {
      state: { ...transcriptModule.state },
      commit: jest.fn()
    }
    jest.clearAllMocks()
  })

  describe('mutations', () => {
    it('should set transcript', () => {
      const transcript = { studentId: '123', courses: [] }
      transcriptModule.mutations.SET_TRANSCRIPT(store.state, transcript)
      expect(store.state.transcript).toEqual(transcript)
    })

    it('should set loading state', () => {
      transcriptModule.mutations.SET_LOADING(store.state, true)
      expect(store.state.loading).toBe(true)
    })

    it('should set error state', () => {
      const error = 'Test error'
      transcriptModule.mutations.SET_ERROR(store.state, error)
      expect(store.state.error).toBe(error)
    })
  })

  describe('actions', () => {
    it('should get transcript successfully', async () => {
      const studentId = '123'
      const transcriptData = { studentId, courses: [] }
      const mockResponse = {
        data: transcriptData
      }
      
      api.enrollment.getTranscript.mockResolvedValue(mockResponse)
      
      await transcriptModule.actions.getTranscript(store, studentId)
      
      expect(store.commit).toHaveBeenCalledWith('SET_LOADING', true)
      expect(store.commit).toHaveBeenCalledWith('SET_TRANSCRIPT', transcriptData)
      expect(store.commit).toHaveBeenCalledWith('SET_ERROR', null)
      expect(store.commit).toHaveBeenCalledWith('SET_LOADING', false)
    })

    it('should handle get transcript error', async () => {
      const error = new Error('Transcript not found')
      api.enrollment.getTranscript.mockRejectedValue(error)
      
      await transcriptModule.actions.getTranscript(store, '123')
      
      expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Transcript not found')
    })

    it('should handle response error with message', async () => {
      const error = {
        response: {
          data: {
            message: 'Custom error message'
          }
        }
      }
      api.enrollment.getTranscript.mockRejectedValue(error)
      
      await transcriptModule.actions.getTranscript(store, '123')
      
      expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Custom error message')
    })

    it('should handle error with fallback message', async () => {
      const error = {}
      api.enrollment.getTranscript.mockRejectedValue(error)
      
      await transcriptModule.actions.getTranscript(store, '123')
      
      expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Fetching transcript failed')
    })
  })
})