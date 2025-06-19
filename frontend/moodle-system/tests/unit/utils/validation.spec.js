import {
  vietnamesePhone,
  notFutureDate,
  vietnameseIdNumber,
  passportNumber,
  studentIdFormat,
  isValidStatusTransition
} from '@/utils/validation';

describe('Validation Utils', () => {
  describe('vietnamesePhone', () => {
    it('should validate correct Vietnamese phone numbers', () => {
      expect(vietnamesePhone.$validator('0123456789')).toBe(true);
      expect(vietnamesePhone.$validator('+84123456789')).toBe(true);
      expect(vietnamesePhone.$validator('0987654321')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(vietnamesePhone.$validator('123456789')).toBe(false);
      expect(vietnamesePhone.$validator('0123')).toBe(false);
      expect(vietnamesePhone.$validator('abc123456789')).toBe(false);
    });

    it('should accept empty values', () => {
      expect(vietnamesePhone.$validator('')).toBe(true);
      expect(vietnamesePhone.$validator(null)).toBe(true);
    });
  });

  describe('notFutureDate', () => {
    it('should accept past dates', () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      expect(notFutureDate.$validator(pastDate.toISOString().split('T')[0])).toBe(true);
    });

    it('should reject future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(notFutureDate.$validator(futureDate.toISOString().split('T')[0])).toBe(false);
    });

    it('should accept today', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(notFutureDate.$validator(today)).toBe(true);
    });

    it('should accept empty values', () => {
      expect(notFutureDate.$validator('')).toBe(true);
      expect(notFutureDate.$validator(null)).toBe(true);
    });
  });

  describe('vietnameseIdNumber', () => {
    it('should validate CMND numbers', () => {
      expect(vietnameseIdNumber.$validator('123456789')).toBe(true);
      expect(vietnameseIdNumber.$validator('123456789012')).toBe(true);
    });

    it('should validate CCCD numbers', () => {
      expect(vietnameseIdNumber.$validator('001123456789')).toBe(true);
      expect(vietnameseIdNumber.$validator('038123456789')).toBe(true);
    });

    it('should reject invalid ID numbers', () => {
      expect(vietnameseIdNumber.$validator('12345')).toBe(false);
      expect(vietnameseIdNumber.$validator('abc123456789')).toBe(false);
      expect(vietnameseIdNumber.$validator('999123456789')).toBe(false);
    });
  });

  describe('passportNumber', () => {
    it('should validate correct passport formats', () => {
      expect(passportNumber.$validator('A1234567')).toBe(true);
      expect(passportNumber.$validator('AB123456')).toBe(true);
      expect(passportNumber.$validator('C12345678')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(passportNumber.$validator('123456789')).toBe(false);
      expect(passportNumber.$validator('ABC123')).toBe(false);
      expect(passportNumber.$validator('A12')).toBe(false);
    });
  });

  describe('studentIdFormat', () => {
    it('should validate correct student ID formats', () => {
      expect(studentIdFormat.$validator('12345678')).toBe(true);
      expect(studentIdFormat.$validator('1234567890')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(studentIdFormat.$validator('1234567')).toBe(false);
      expect(studentIdFormat.$validator('12345678901')).toBe(false);
      expect(studentIdFormat.$validator('abc12345')).toBe(false);
    });
  });

  describe('isValidStatusTransition', () => {
    const mockTransitionRules = [
      {
        fromStatusId: 'status1',
        toStatus: [
          { _id: 'status2' },
          { _id: 'status3' }
        ]
      }
    ];

    it('should allow valid transitions', () => {
      expect(isValidStatusTransition('status1', 'status2', mockTransitionRules)).toBe(true);
      expect(isValidStatusTransition('status1', 'status3', mockTransitionRules)).toBe(true);
    });

    it('should allow same status transition', () => {
      expect(isValidStatusTransition('status1', 'status1', mockTransitionRules)).toBe(true);
    });

    it('should reject invalid transitions', () => {
      expect(isValidStatusTransition('status1', 'status4', mockTransitionRules)).toBe(false);
      expect(isValidStatusTransition('status2', 'status1', mockTransitionRules)).toBe(false);
    });

    it('should reject when no rules exist', () => {
      expect(isValidStatusTransition('unknown', 'status1', mockTransitionRules)).toBe(false);
    });
  });
});