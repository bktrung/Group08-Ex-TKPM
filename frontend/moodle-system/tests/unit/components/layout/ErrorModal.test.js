import { mount } from '@vue/test-utils';
import ErrorModal from '@/components/layout/ErrorModal.vue';

describe('ErrorModal.vue', () => {
  let wrapper;

  const defaultProps = {
    showModal: false,
    title: 'Error Title',
    message: 'Error message',
    isTranslated: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('should render error modal with correct title', () => {
    wrapper = mount(ErrorModal, {
      props: { ...defaultProps, showModal: true }
    });

    expect(wrapper.find('.modal-title').text()).toBe('Error Title');
    expect(wrapper.find('.modal-header').classes()).toContain('bg-danger');
  });

  it('should display error message with emoji', () => {
    wrapper = mount(ErrorModal, {
      props: { ...defaultProps, showModal: true }
    });

    const modalBody = wrapper.find('.modal-body');
    expect(modalBody.text()).toContain('❌');
    expect(modalBody.text()).toContain('Error message');
  });

  it('should use translated message when isTranslated is true', () => {
    wrapper = mount(ErrorModal, {
      props: {
        ...defaultProps,
        showModal: true,
        message: 'Translated error message',
        isTranslated: true
      }
    });

    const modalBody = wrapper.find('.modal-body');
    expect(modalBody.text()).toContain('Translated error message');
  });

  it('should attempt to translate message when isTranslated is false', () => {
    wrapper = mount(ErrorModal, {
      props: {
        ...defaultProps,
        showModal: true,
        message: 'common.error',
        isTranslated: false
      }
    });

    // In our test setup, $t just returns the key, so it should display the key
    const modalBody = wrapper.find('.modal-body');
    expect(modalBody.text()).toContain('common.error');
  });

  it('should emit close event when OK button clicked', async () => {
    wrapper = mount(ErrorModal, {
      props: { ...defaultProps, showModal: true }
    });

    const okButton = wrapper.find('.btn-danger');
    await okButton.trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('update:showModal')).toBeTruthy();
    expect(wrapper.emitted('update:showModal')[0]).toEqual([false]);
  });

  it('should emit close event when X button clicked', async () => {
    wrapper = mount(ErrorModal, {
      props: { ...defaultProps, showModal: true }
    });

    const xButton = wrapper.find('.btn-close');
    await xButton.trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('update:showModal')).toBeTruthy();
  });
});