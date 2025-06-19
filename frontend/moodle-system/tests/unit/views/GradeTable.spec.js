import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import GradeTable from '@/views/GradeTable.vue'
import { createI18n } from 'vue-i18n'

// Mock jsPDF and html2canvas
jest.mock('jspdf', () => ({
  jsPDF: jest.fn().mockImplementation(() => ({
    internal: {
      pageSize: {
        getWidth: () => 210
      }
    },
    getImageProperties: () => ({ width: 100, height: 100 }),
    addImage: jest.fn(),
    save: jest.fn()
  }))
}))

jest.mock('html2canvas', () => jest.fn(() => Promise.resolve({
  toDataURL: () => 'data:image/png;base64,test'
})))

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      student: {
        grade: {
          table: 'Grade Table',
          create: 'Create Grade Table',
          title: 'Grade',
          summary: {
            title: 'Summary',
            totalCredits: 'Total Credits',
            gpaOutOf10: 'GPA (10-scale)',
            gpaOutOf4: 'GPA (4-scale)'
          }
        },
        enter_student_id: 'Enter student ID',
        student_info: 'Student Info',
        student_id: 'Student ID',
        name: 'Name',
        department: 'Department',
        program: 'Program',
        subject: 'Subject'
      },
      common: {
        download: 'Download',
        error: 'Error'
      }
    }
  }
})

const createMockStore = (initialState = {}) => {
  return createStore({
    modules: {
      transcript: {
        namespaced: true,
        state: {
          transcript: null,
          loading: false,
          error: null,
          ...initialState.transcript
        },
        actions: {
          getTranscript: jest.fn()
        }
      }
    }
  })
}

describe('GradeTable.vue', () => {
  let wrapper
  let store

  beforeEach(() => {
    store = createMockStore()
    wrapper = mount(GradeTable, {
      global: {
        plugins: [store, i18n]
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('should render correctly', () => {
    expect(wrapper.find('h2').text()).toBe('Grade Table')
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('button').text()).toContain('Create Grade Table')
  })

  it('should show error when student ID is empty', async () => {
    const button = wrapper.find('button')
    await button.trigger('click')
    
    expect(wrapper.vm.showErrorModal).toBe(true)
  })

  it('should call getTranscript when student ID is provided', async () => {
    await wrapper.find('input').setValue('123456')
    const button = wrapper.find('button')
    await button.trigger('click')
    
    expect(store._actions['transcript/getTranscript']).toHaveBeenCalledWith(
      expect.any(Object),
      '123456',
      undefined
    )
  })

  it('should display transcript data when available', async () => {
    const transcriptData = {
      metadata: {
        transcript: {
          studentInfo: {
            studentId: '123456',
            fullName: 'John Doe',
            department: 'Computer Science',
            program: 'Bachelor'
          },
          courses: [
            { courseName: 'Math', totalScore: 85 }
          ],
          summary: {
            totalCredits: 120,
            gpaOutOf10: 8.5,
            gpaOutOf4: 3.4
          }
        }
      }
    }
    
    await wrapper.setData({ transcriptData })
    
    expect(wrapper.text()).toContain('123456')
    expect(wrapper.text()).toContain('John Doe')
    expect(wrapper.text()).toContain('Computer Science')
    expect(wrapper.text()).toContain('Math')
  })

  it('should show download button when PDF is generated', async () => {
    await wrapper.setData({ pdfGenerated: true })
    
    const downloadButton = wrapper.findAll('button')[1]
    expect(downloadButton.text()).toContain('Download')
  })

  it('should show loading state', async () => {
    store.state.transcript.loading = true
    await wrapper.vm.$nextTick()
    
    const button = wrapper.find('button')
    expect(button.find('.spinner-border').exists()).toBe(true)
  })
})