import enrollmentModule from '@/store/modules/enrollment.js'
import api from '@/services/index.js'

// Mock the API
jest.mock('@/services/index.js', () => ({
  enrollment: {
    enrollCourse: jest.fn(),
    dropCourse: jest.fn(),
    getDropCourseHistory: jest.fn()
  }
}))

describe('enrollment store module', () => {
  let store

  beforeEach(() => {
    store = {
      state: { ...enrollmentModule.state },
      commit: jest.fn()
    }
    jest.clearAllMocks()
  })

  describe('mutations', () => {
    it('should set enrollments', () => {
      const enrollments = [{ _id: '1', studentId: '123' }]
      enrollmentModule.mutations.SET_ENROLLMENTS(store.state, enrollments)
      expect(store.state.enrollments).toEqual(enrollments)
    })

    it('should set history', () => {
      const history = [{ _id: '1', dropReason: 'Test' }]
      enrollmentModule.mutations.SET_HISTORY(store.state, history)
      expect(store.state.history).toEqual(history)
    })

    it('should set loading state', () => {
      enrollmentModule.mutations.SET_LOADING(store.state, true)
      expect(store.state.loading).toBe(true)
    })

    it('should set error state', () => {
      const error = 'Test error'
      enrollmentModule.mutations.SET_ERROR(store.state, error)
      expect(store.state.error).toBe(error)
    })

    it('should set history error state', () => {
      const error = 'History error'
      enrollmentModule.mutations.SET_HISTORY_ERROR(store.state, error)
      expect(store.state.historyError).toBe(error)
    })
  })

  describe('actions', () => {
    it('should post enrollment successfully', async () => {
      const enrollment = { studentId: '123', classCode: 'CS101' }
      
      api.enrollment.enrollCourse.mockResolvedValue({})
      
      await enrollmentModule.actions.postEnrollment(store, enrollment)
      
      expect(store.commit).toHaveBeenCalledWith('SET_LOADING', true)
      expect(api.enrollment.enrollCourse).toHaveBeenCalledWith(enrollment)
      expect(store.commit).toHaveBeenCalledWith('SET_LOADING', false)
    })

    it('should handle post enrollment error', async () => {
      const error = new Error('Enrollment failed')
      api.enrollment.enrollCourse.mockRejectedValue(error)
      
      await enrollmentModule.actions.postEnrollment(store, {})
      
      expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Enrollment failed')
    })

    it('should drop enrollment successfully', async () => {
      const enrollment = { studentId: '123', classCode: 'CS101', reason: 'Test' }
      
      api.enrollment.dropCourse.mockResolvedValue({})
      
      await enrollmentModule.actions.dropEnrollment(store, enrollment)
      
      expect(store.commit).toHaveBeenCalledWith('SET_LOADING', true)
      expect(api.enrollment.dropCourse).toHaveBeenCalledWith(enrollment)
      expect(store.commit).toHaveBeenCalledWith('SET_LOADING', false)
    })

    it('should handle drop enrollment error', async () => {
      const error = new Error('Drop failed')
      api.enrollment.dropCourse.mockRejectedValue(error)
      
      await enrollmentModule.actions.dropEnrollment(store, {})
      
      expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Drop failed')
    })

    it('should get drop history successfully', async () => {
      const studentId = '123'
      const history = [{ _id: '1', dropReason: 'Test' }]
      const mockResponse = {
        data: {
          metadata: {
            dropHistory: history
          }
        }
      }
      
      api.enrollment.getDropCourseHistory.mockResolvedValue(mockResponse)
      
      await enrollmentModule.actions.getDropHistory(store, studentId)
      
      expect(store.commit).toHaveBeenCalledWith('SET_HISTORY', history)
      expect(store.commit).toHaveBeenCalledWith('SET_HISTORY_ERROR', null)
    })

    it('should handle get drop history error', async () => {
      const error = new Error('History failed')
      api.enrollment.getDropCourseHistory.mockRejectedValue(error)
      
      await enrollmentModule.actions.getDropHistory(store, '123')
      
      expect(store.commit).toHaveBeenCalledWith('SET_HISTORY_ERROR', 'History failed')
    })
  })
})