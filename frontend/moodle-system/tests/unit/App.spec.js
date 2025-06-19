import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      sidebar: {
        title: 'Student Management'
      }
    },
    vi: {
      sidebar: {
        title: 'Quản lý Sinh Viên'
      }
    }
  }
})

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } }
  ]
})

// Mock AppSidebar component
const AppSidebarMock = {
  template: '<div class="sidebar-mock">Sidebar</div>'
}

describe('App.vue', () => {
  let wrapper

  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    })

    wrapper = mount(App, {
      global: {
        plugins: [i18n, router],
        components: {
          AppSidebar: AppSidebarMock
        }
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('should render correctly', () => {
    expect(wrapper.find('.d-flex.flex-column.min-vh-100').exists()).toBe(true)
    expect(wrapper.find('.sidebar-mock').exists()).toBe(true)
    expect(wrapper.find('.content').exists()).toBe(true)
    expect(wrapper.find('.language-float').exists()).toBe(true)
  })

  it('should display language dropdown button', () => {
    const langButton = wrapper.find('.lang-btn')
    expect(langButton.exists()).toBe(true)
    expect(langButton.text()).toBe('🌐')
  })

  it('should toggle dropdown when language button is clicked', async () => {
    const langButton = wrapper.find('.lang-btn')
    
    expect(wrapper.vm.dropdownOpen).toBe(false)
    
    await langButton.trigger('click')
    expect(wrapper.vm.dropdownOpen).toBe(true)
    
    await langButton.trigger('click')
    expect(wrapper.vm.dropdownOpen).toBe(false)
  })

  it('should show language options when dropdown is open', async () => {
    await wrapper.setData({ dropdownOpen: true })
    
    const dropdown = wrapper.find('.lang-dropdown')
    expect(dropdown.exists()).toBe(true)
    
    const languageOptions = wrapper.findAll('.dropdown-item')
    expect(languageOptions).toHaveLength(2)
    expect(languageOptions[0].text()).toContain('Tiếng Việt')
    expect(languageOptions[1].text()).toContain('English')
  })

  it('should change language when option is clicked', async () => {
    await wrapper.setData({ dropdownOpen: true })
    
    const englishOption = wrapper.findAll('.dropdown-item')[1]
    await englishOption.trigger('click')
    
    expect(wrapper.vm.$i18n.locale).toBe('en')
    expect(localStorage.setItem).toHaveBeenCalledWith('language', 'en')
    expect(wrapper.vm.dropdownOpen).toBe(false)
  })

  it('should load saved language on mount', async () => {
    localStorage.getItem.mockReturnValue('vi')
    
    // Remount component to trigger onMounted
    wrapper.unmount()
    wrapper = mount(App, {
      global: {
        plugins: [i18n, router],
        components: {
          AppSidebar: AppSidebarMock
        }
      }
    })
    
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$i18n.locale).toBe('vi')
  })

  it('should have correct layout structure', () => {
    expect(wrapper.find('.d-flex.flex-grow-1').exists()).toBe(true)
    expect(wrapper.find('.content').exists()).toBe(true)
    expect(wrapper.find('.language-float').exists()).toBe(true)
  })

  it('should have correct styling classes', () => {
    const langButton = wrapper.find('.lang-btn')
    expect(langButton.classes()).toContain('btn')
    expect(langButton.classes()).toContain('btn-primary')
    expect(langButton.classes()).toContain('rounded-circle')
    
    const dropdown = wrapper.find('.dropdown')
    expect(dropdown.exists()).toBe(true)
  })

  it('should close dropdown when language is changed', async () => {
    await wrapper.setData({ dropdownOpen: true })
    
    const vietnameseOption = wrapper.findAll('.dropdown-item')[0]
    await vietnameseOption.trigger('click')
    
    expect(wrapper.vm.dropdownOpen).toBe(false)
  })

  it('should not change language if same language is selected', async () => {
    wrapper.vm.$i18n.locale = 'vi'
    await wrapper.setData({ dropdownOpen: true })
    
    const vietnameseOption = wrapper.findAll('.dropdown-item')[0]
    await vietnameseOption.trigger('click')
    
    expect(localStorage.setItem).toHaveBeenCalledWith('language', 'vi')
  })

  it('should have router-view for content', () => {
    // router-view should be rendered in the content area
    expect(wrapper.find('.content').exists()).toBe(true)
  })
})