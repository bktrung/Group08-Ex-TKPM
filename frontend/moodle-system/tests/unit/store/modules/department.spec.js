import { describe, it, expect, beforeEach } from '@jest/globals'
import departmentModule from '@/store/modules/department'
import api from '@/services/index.js'

jest.mock('@/services/index.js')

describe('department store module', () => {
  let store
  let commit
  let dispatch

  beforeEach(() => {
    commit = jest.fn()
    dispatch = jest.fn()
    store = {
      state: {
        departments: [],
        loading: false,
        error: null
      },
      commit,
      dispatch
    }
    jest.clearAllMocks()
  })

  describe('mutations', () => {
    it('should set departments', () => {
      const departments = [{ _id: '1', name: 'IT' }]
      departmentModule.mutations.SET_DEPARTMENTS(store.state, departments)
      expect(store.state.departments).toEqual(departments)
    })

    it('should set loading state', () => {
      departmentModule.mutations.SET_LOADING(store.state, true)
      expect(store.state.loading).toBe(true)
    })

    it('should set error', () => {
      const error = 'Test error'
      departmentModule.mutations.SET_ERROR(store.state, error)
      expect(store.state.error).toBe(error)
    })
  })

  describe('actions', () => {
    it('should fetch departments successfully', async () => {
      const mockResponse = {
        data: {
          metadata: {
            departments: [{ _id: '1', name: 'IT' }]
          }
        }
      }
      api.department.getDepartments.mockResolvedValue(mockResponse)

      await departmentModule.actions.fetchDepartments({ commit })

      expect(commit).toHaveBeenCalledWith('SET_LOADING', true)
      expect(commit).toHaveBeenCalledWith('SET_DEPARTMENTS', mockResponse.data.metadata.departments)
      expect(commit).toHaveBeenCalledWith('SET_LOADING', false)
    })

    it('should handle fetch departments error', async () => {
      const error = new Error('Network error')
      api.department.getDepartments.mockRejectedValue(error)

      await departmentModule.actions.fetchDepartments({ commit })

      expect(commit).toHaveBeenCalledWith('SET_LOADING', true)
      expect(commit).toHaveBeenCalledWith('SET_ERROR', 'Network error')
      expect(commit).toHaveBeenCalledWith('SET_LOADING', false)
    })

    it('should create department successfully', async () => {
      api.department.createDepartment.mockResolvedValue({})

      await departmentModule.actions.createDepartment({ commit, dispatch }, { name: 'New Dept' })

      expect(commit).toHaveBeenCalledWith('SET_LOADING', true)
      expect(api.department.createDepartment).toHaveBeenCalledWith({ name: 'New Dept' })
      expect(dispatch).toHaveBeenCalledWith('fetchDepartments')
      expect(commit).toHaveBeenCalledWith('SET_LOADING', false)
    })

    it('should handle create department error', async () => {
      const error = new Error('Create error')
      api.department.createDepartment.mockRejectedValue(error)

      await expect(
        departmentModule.actions.createDepartment({ commit, dispatch }, { name: 'New Dept' })
      ).rejects.toThrow('Create error')

      expect(commit).toHaveBeenCalledWith('SET_ERROR', 'Create error')
    })

    it('should update department successfully', async () => {
      api.department.updateDepartment.mockResolvedValue({})

      await departmentModule.actions.updateDepartment(
        { commit, dispatch },
        { id: '1', department: { name: 'Updated Dept' } }
      )

      expect(api.department.updateDepartment).toHaveBeenCalledWith('1', { name: 'Updated Dept' })
      expect(dispatch).toHaveBeenCalledWith('fetchDepartments')
    })

    it('should delete department successfully', async () => {
      api.department.deleteDepartment.mockResolvedValue({})

      await departmentModule.actions.deleteDepartment({ commit, dispatch }, '1')

      expect(api.department.deleteDepartment).toHaveBeenCalledWith('1')
      expect(dispatch).toHaveBeenCalledWith('fetchDepartments')
    })
  })

  describe('getters', () => {
    const mockState = {
      departments: [
        { _id: '1', name: 'IT' },
        { _id: '2', name: 'Business' }
      ]
    }

    it('should get department by id', () => {
      const department = departmentModule.getters.getDepartmentById(mockState)('1')
      expect(department).toEqual({ _id: '1', name: 'IT' })
    })

    it('should return undefined for non-existent department id', () => {
      const department = departmentModule.getters.getDepartmentById(mockState)('999')
      expect(department).toBeUndefined()
    })

    it('should get department name by id', () => {
      const name = departmentModule.getters.getDepartmentName(mockState)('2')
      expect(name).toBe('Business')
    })

    it('should return empty string for non-existent department name', () => {
      const name = departmentModule.getters.getDepartmentName(mockState)('999')
      expect(name).toBe('')
    })
  })
})