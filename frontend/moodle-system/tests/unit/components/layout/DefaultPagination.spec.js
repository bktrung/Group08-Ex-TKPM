import { mount } from '@vue/test-utils';
import DefaultPagination from '@/components/layout/DefaultPagination.vue';

describe('DefaultPagination.vue', () => {
  let wrapper;

  const defaultProps = {
    modelValue: 1,
    pageSize: 10,
    totalItems: 100,
    currentItems: 10,
    maxVisible: 5
  };

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('should render pagination with correct page numbers', () => {
    wrapper = mount(DefaultPagination, {
      props: defaultProps
    });

    const pageItems = wrapper.findAll('.page-item');
    expect(pageItems.length).toBeGreaterThan(2); // At least prev, current, next

    const pageLinks = wrapper.findAll('.page-link');
    expect(pageLinks.some(link => link.text() === '1')).toBe(true);
  });

  it('should display correct item count', () => {
    wrapper = mount(DefaultPagination, {
      props: defaultProps
    });

    const displayText = wrapper.text();
    expect(displayText).toContain('10');
    expect(displayText).toContain('100');
  });

  it('should disable previous button on first page', () => {
    wrapper = mount(DefaultPagination, {
      props: { ...defaultProps, modelValue: 1 }
    });

    const prevButton = wrapper.find('.page-item');
    expect(prevButton.classes()).toContain('disabled');
  });

  it('should disable next button on last page', () => {
    wrapper = mount(DefaultPagination, {
      props: { ...defaultProps, modelValue: 10, totalItems: 100 }
    });

    const pageItems = wrapper.findAll('.page-item');
    const nextButton = pageItems[pageItems.length - 1];
    expect(nextButton.classes()).toContain('disabled');
  });

  it('should emit update:modelValue when page clicked', async () => {
    wrapper = mount(DefaultPagination, {
      props: defaultProps
    });

    // Find a page link (not prev/next)
    const pageLinks = wrapper.findAll('.page-link');
    const pageTwo = pageLinks.find(link => link.text() === '2');
    
    if (pageTwo) {
      await pageTwo.trigger('click');
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([2]);
    }
  });

  it('should emit update:pageSize when page size changed', async () => {
    wrapper = mount(DefaultPagination, {
      props: defaultProps
    });

    const select = wrapper.find('select.form-select');
    await select.setValue('20');

    expect(wrapper.emitted('update:pageSize')).toBeTruthy();
    expect(wrapper.emitted('update:pageSize')[0]).toEqual([20]);
  });

  it('should not emit when clicking current page', async () => {
    wrapper = mount(DefaultPagination, {
      props: defaultProps
    });

    const currentPageLink = wrapper.find('.page-item.active .page-link');
    await currentPageLink.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('should handle pagination with few total pages', () => {
    wrapper = mount(DefaultPagination, {
      props: { ...defaultProps, totalItems: 25 }
    });

    const pageItems = wrapper.findAll('.page-item');
    // Should have prev, 1, 2, 3, next = 5 items
    expect(pageItems.length).toBe(5);
  });
});