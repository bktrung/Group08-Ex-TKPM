import { mount } from '@vue/test-utils';
import BaseModal from '@/components/layout/BaseModal.vue';

// Mock Bootstrap Modal
const mockModalShow = jest.fn();
const mockModalHide = jest.fn();
jest.mock('bootstrap', () => ({
  Modal: jest.fn().mockImplementation(() => ({
    show: mockModalShow,
    hide: mockModalHide
  }))
}));

describe('BaseModal.vue', () => {
  let wrapper;

  const defaultProps = {
    title: 'Test Modal',
    placeholderTitle: 'Enter name',
    itemName: '',
    showModal: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('should render modal with correct title', () => {
    wrapper = mount(BaseModal, {
      props: defaultProps
    });

    expect(wrapper.find('.modal-title').text()).toBe('Test Modal');
  });

  it('should render input with correct placeholder', () => {
    wrapper = mount(BaseModal, {
      props: defaultProps
    });

    const input = wrapper.find('input.form-control');
    expect(input.attributes('placeholder')).toBe('Enter name');
  });

  it('should update input value when itemName prop changes', async () => {
    wrapper = mount(BaseModal, {
      props: defaultProps
    });

    await wrapper.setProps({ itemName: 'Test Value' });
    
    const input = wrapper.find('input.form-control');
    expect(input.element.value).toBe('Test Value');
  });

  it('should emit save event with input value when save button clicked', async () => {
    wrapper = mount(BaseModal, {
      props: { ...defaultProps, itemName: 'Test Input' }
    });

    const input = wrapper.find('input.form-control');
    await input.setValue('New Value');

    const saveButton = wrapper.find('.btn-primary');
    await saveButton.trigger('click');

    expect(wrapper.emitted('save')).toBeTruthy();
    expect(wrapper.emitted('save')[0]).toEqual(['New Value']);
  });

  it('should not emit save event when input is empty', async () => {
    wrapper = mount(BaseModal, {
      props: defaultProps
    });

    const saveButton = wrapper.find('.btn-primary');
    await saveButton.trigger('click');

    expect(wrapper.emitted('save')).toBeFalsy();
  });

  it('should emit close event when close button clicked', async () => {
    wrapper = mount(BaseModal, {
      props: defaultProps
    });

    const closeButton = wrapper.find('.btn-secondary');
    await closeButton.trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(mockModalHide).toHaveBeenCalled();
  });

  it('should emit close event when X button clicked', async () => {
    wrapper = mount(BaseModal, {
      props: defaultProps
    });

    const xButton = wrapper.find('.btn-close');
    await xButton.trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('should trim whitespace from input value before saving', async () => {
    wrapper = mount(BaseModal, {
      props: defaultProps
    });

    const input = wrapper.find('input.form-control');
    await input.setValue('  Test Value  ');

    const saveButton = wrapper.find('.btn-primary');
    await saveButton.trigger('click');

    expect(wrapper.emitted('save')[0]).toEqual(['Test Value']);
  });
});