import classModule from '@/store/modules/class.js'
import api from '@/services/index.js'

// Mock the API
jest.mock('@/services/index.js', () => ({
  class: {
    getClasses: jest.fn(),
    createClass: jest.fn(),
    updateClass: jest.fn()
  }
}))

describe('class store module', () => {
  let store

  beforeEach(() => {
    store = {
      state: { ...classModule.state },
      commit: jest.fn(),
      dispatch: jest.fn()
    }
    jest.clearAllMocks()
  })

  describe('mutations', () => {
    it('should set classes', () => {
      const classes = [{ _id: '1', classCode: 'CS101' }]
      classModule.mutations.SET_CLASSES(store.state, classes)
      expect(store.state.classes).toEqual(classes)
    })

    it('should add class', () => {
      const newClass = { _id: '1', classCode: 'CS101' }
      classModule.mutations.ADD_CLASS(store.state, newClass)
      expect(store.state.classes).toContain(newClass)
    })

    it('should update class', () => {
      store.state.classes = [{ _id: '1', classCode: 'CS101', instructor: 'Old' }]
      const updatedClass = { _id: '1', classCode: 'CS101', instructor: 'New' }
      
      classModule.mutations.UPDATE_CLASS(store.state, updatedClass)
      expect(store.state.classes[0]).toEqual(updatedClass)
    })

    it('should set class active status', () => {
      store.state.classes = [{ classCode: 'CS101', isActive: true }]
      
      classModule.mutations.SET_CLASS_ACTIVE_STATUS(store.state, { 
        classCode: 'CS101', 
        isActive: false 
      })
      
      expect(store.state.classes[0].isActive).toBe(false)
    })

    it('should set loading state', () => {
      classModule.mutations.SET_LOADING(store.state, true)
      expect(store.state.loading).toBe(true)
    })

    it('should set error state', () => {
      const error = 'Test error'
      classModule.mutations.SET_ERROR(store.state, error)
      expect(store.state.error).toBe(error)
    })
  })

  describe('actions', () => {
    it('should fetch classes successfully', async () => {
      const mockClasses = [{ _id: '1', classCode: 'CS101' }]
      const mockResponse = {
        data: {
          metadata: {
            classes: mockClasses
          }
        }
      }
      
      api.class.getClasses.mockResolvedValue(mockResponse)
      
      await classModule.actions.fetchClasses(store)
      
      expect(store.commit).toHaveBeenCalledWith('SET_LOADING', true)
      expect(store.commit).toHaveBeenCalledWith('SET_CLASSES', mockClasses)
      expect(store.commit).toHaveBeenCalledWith('SET_LOADING', false)
    })

    it('should fetch classes with docs fallback', async () => {
      const mockClasses = [{ _id: '1', classCode: 'CS101' }]
      const mockResponse = {
        data: {
          metadata: {
            docs: mockClasses
          }
        }
      }
      
      api.class.getClasses.mockResolvedValue(mockResponse)
      
      await classModule.actions.fetchClasses(store)
      
      expect(store.commit).toHaveBeenCalledWith('SET_CLASSES', mockClasses)
    })

    it('should handle fetch classes error', async () => {
      const error = new Error('API Error')
      api.class.getClasses.mockRejectedValue(error)
      
      await expect(classModule.actions.fetchClasses(store)).rejects.toThrow()
      
      expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'API Error')
      expect(store.commit).toHaveBeenCalledWith('SET_CLASSES', [])
    })

    it('should add class successfully', async () => {
      const classData = { classCode: 'CS101', instructor: 'John Doe' }
      const mockResponse = {
        data: {
          metadata: {
            newClass: { _id: '1', ...classData }
          }
        }
      }
      
      api.class.createClass.mockResolvedValue(mockResponse)
      
      await classModule.actions.addClass(store, classData)
      
      expect(store.commit).toHaveBeenCalledWith('ADD_CLASS', mockResponse.data.metadata.newClass)
    })

    it('should handle add class error', async () => {
      const error = new Error('Create failed')
      api.class.createClass.mockRejectedValue(error)
      
      await expect(classModule.actions.addClass(store, {})).rejects.toThrow()
      
      expect(store.commit).toHaveBeenCalledWith('SET_ERROR', 'Create failed')
    })

    it('should update class successfully', async () => {
      const classCode = 'CS101'
      const data = { instructor: 'Jane Doe' }
      const mockResponse = {
        data: {
          metadata: {
            updatedClass: { classCode, ...data }
          }
        }
      }
      
      api.class.updateClass.mockResolvedValue(mockResponse)
      
      await classModule.actions.updateClass(store, { classCode, data })
      
      expect(store.commit).toHaveBeenCalledWith('UPDATE_CLASS', mockResponse.data.metadata.updatedClass)
    })

    it('should toggle class active status', async () => {
      const classCode = 'CS101'
      const isActive = false
      
      api.class.updateClass.mockResolvedValue({})
      
      await classModule.actions.toggleClassActiveStatus(store, { classCode, isActive })
      
      expect(store.commit).toHaveBeenCalledWith('SET_CLASS_ACTIVE_STATUS', { classCode, isActive })
    })
  })

  describe('getters', () => {
    beforeEach(() => {
      store.state.classes = [
        { classCode: 'CS101', isActive: true, course: 'course1', academicYear: '2023-2024', semester: 1 },
        { classCode: 'CS102', isActive: false, course: { _id: 'course2' }, academicYear: '2023-2024', semester: 2 }
      ]
    })

    it('should get class by code', () => {
      const classItem = classModule.getters.getClassByCode(store.state)('CS101')
      expect(classItem.classCode).toBe('CS101')
    })

    it('should get active classes', () => {
      const activeClasses = classModule.getters.getActiveClasses(store.state)
      expect(activeClasses).toHaveLength(1)
      expect(activeClasses[0].classCode).toBe('CS101')
    })

    it('should get classes by course', () => {
      const classes = classModule.getters.getClassesByCourse(store.state)('course1')
      expect(classes).toHaveLength(1)
      expect(classes[0].classCode).toBe('CS101')
    })

    it('should get classes by course with object course', () => {
      const classes = classModule.getters.getClassesByCourse(store.state)('course2')
      expect(classes).toHaveLength(1)
      expect(classes[0].classCode).toBe('CS102')
    })

    it('should get classes by term', () => {
      const classes = classModule.getters.getClassesByTerm(store.state)('2023-2024', 1)
      expect(classes).toHaveLength(1)
      expect(classes[0].classCode).toBe('CS101')
    })
  })
})