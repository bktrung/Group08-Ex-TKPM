import { mount } from '@vue/test-utils'
import AcademicAffairsRegistration from '@/views/AcademicAffairsRegistration.vue'
import { createI18n } from 'vue-i18n'
import { createRouter, createWebHistory } from 'vue-router'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      enrollment: {
        management_title: 'Course Enrollment Management',
        register: {
          title: 'Course Registration',
          description: 'Add students to a class.'
        },
        drop: {
          title: 'Course Drop',
          description: 'Drop a class for a student'
        }
      },
      common: {
        error: 'Error'
      }
    }
  }
})

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/register-course', component: { template: '<div>Register</div>' } },
    { path: '/drop-course', component: { template: '<div>Drop</div>' } }
  ]
})

describe('AcademicAffairsRegistration.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(AcademicAffairsRegistration, {
      global: {
        plugins: [i18n, router]
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('should navigate to register page when register card is clicked', async () => {
    const registerCard = wrapper.findAll('.card')[0]
    
    const pushSpy = jest.spyOn(router, 'push')
    await registerCard.trigger('click')
    
    expect(pushSpy).toHaveBeenCalledWith('/register-course')
  })

  it('should navigate to drop page when drop card is clicked', async () => {
    const dropCard = wrapper.findAll('.card')[1]
    
    const pushSpy = jest.spyOn(router, 'push')
    await dropCard.trigger('click')
    
    expect(pushSpy).toHaveBeenCalledWith('/drop-course')
  })

  it('should have proper styling classes', () => {
    const cards = wrapper.findAll('.card')
    
    expect(cards[0].classes()).toContain('card')
    expect(cards[1].classes()).toContain('card')
    expect(cards[1].classes()).toContain('danger')
  })
})