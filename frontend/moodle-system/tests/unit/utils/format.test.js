import {
  formatDate,
  formatAddress,
  formatPhoneNumber,
  formatCurrency,
  formatDateForInput,
  getNameFromObjectOrId
} from '@/utils/format';

describe('Format Utils', () => {
  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const date = '2023-12-25T10:30:00Z';
      const result = formatDate(date, 'en-US');
      expect(result).toMatch(/12\/25\/2023/);
    });

    it('should return empty string for null/undefined', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate('')).toBe('');
    });

    it('should handle invalid dates gracefully', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('invalid-date');
    });
  });

  describe('formatAddress', () => {
    it('should format complete address', () => {
      const address = {
        houseNumberStreet: '123 Main St',
        wardCommune: 'Ward 1',
        districtCounty: 'District 1',
        provinceCity: 'Ho Chi Minh City',
        country: 'Vietnam'
      };
      const result = formatAddress(address);
      expect(result).toBe('123 Main St, Ward 1, District 1, Ho Chi Minh City, Vietnam');
    });

    it('should handle partial address', () => {
      const address = {
        houseNumberStreet: '123 Main St',
        provinceCity: 'Ho Chi Minh City'
      };
      const result = formatAddress(address);
      expect(result).toBe('123 Main St, Ho Chi Minh City');
    });

    it('should return empty string for null/undefined', () => {
      expect(formatAddress(null)).toBe('');
      expect(formatAddress(undefined)).toBe('');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format Vietnamese phone number', () => {
      const result = formatPhoneNumber('0123456789');
      expect(result).toBe('0123 456 789');
    });

    it('should return original for non-Vietnamese format', () => {
      const result = formatPhoneNumber('+84123456789');
      expect(result).toBe('+84123456789');
    });

    it('should return empty string for null/undefined', () => {
      expect(formatPhoneNumber(null)).toBe('');
      expect(formatPhoneNumber(undefined)).toBe('');
      expect(formatPhoneNumber('')).toBe('');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      const result = formatCurrency(1000000, 'VND', 'vi-VN');
      expect(result).toContain('1.000.000');
      expect(result).toContain('₫');
    });

    it('should handle null/undefined amounts', () => {
      expect(formatCurrency(null)).toBe('');
      expect(formatCurrency(undefined)).toBe('');
    });

    it('should handle formatting errors gracefully', () => {
      const result = formatCurrency(1000, 'INVALID');
      expect(result).toBe('1000 INVALID');
    });
  });

  describe('formatDateForInput', () => {
    it('should format date for input field', () => {
      const date = '2023-12-25T10:30:00Z';
      const result = formatDateForInput(date);
      expect(result).toBe('2023-12-25');
    });

    it('should return empty string for invalid input', () => {
      expect(formatDateForInput(null)).toBe('');
      expect(formatDateForInput('invalid')).toBe('');
    });
  });

  describe('getNameFromObjectOrId', () => {
    it('should extract name from object', () => {
      const obj = { name: 'Test Name', id: '123' };
      const result = getNameFromObjectOrId(obj);
      expect(result).toBe('Test Name');
    });

    it('should use custom property name', () => {
      const obj = { title: 'Test Title', id: '123' };
      const result = getNameFromObjectOrId(obj, 'title');
      expect(result).toBe('Test Title');
    });

    it('should use getter function for ID', () => {
      const getter = jest.fn().mockReturnValue('Resolved Name');
      const result = getNameFromObjectOrId('123', 'name', getter);
      expect(result).toBe('Resolved Name');
      expect(getter).toHaveBeenCalledWith('123');
    });

    it('should return ID as string if no getter', () => {
      const result = getNameFromObjectOrId('123');
      expect(result).toBe('123');
    });

    it('should return empty string for null/undefined', () => {
      expect(getNameFromObjectOrId(null)).toBe('');
      expect(getNameFromObjectOrId(undefined)).toBe('');
    });
  });
});