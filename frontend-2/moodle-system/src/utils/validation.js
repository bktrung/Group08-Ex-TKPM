import { helpers } from '@vuelidate/validators'

/**
 * Validator for Vietnamese phone numbers
 * Supports formats: 0xx-xxx-xxxx, +84xx-xxx-xxxx
 */
export const vietnamesePhone = helpers.withMessage(
  'Số điện thoại không hợp lệ',
  (value) => {
    if (!value) return true
    return /^(\+84|0)[3|5|7|8|9][0-9]{8}$/.test(value.replace(/[-\s]/g, ''))
  }
)

/**
 * Validator to check if a date is not in the future
 */
export const notFutureDate = helpers.withMessage(
  'Ngày không được là ngày trong tương lai',
  (value) => {
    if (!value) return true
    
    const inputDate = new Date(value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return inputDate <= today
  }
)

/**
 * Validator to check if a year is not in the future
 */
export const notFutureYear = helpers.withMessage(
  (currentYear) => `Năm không thể vượt quá năm hiện tại (${currentYear})`,
  (value) => {
    const currentYear = new Date().getFullYear()
    if (!value) return true
    
    return parseInt(value) <= currentYear
  }
)

/**
 * Validator for Vietnamese identification numbers
 */
export const vietnameseIdNumber = helpers.withMessage(
  'Số CMND/CCCD không hợp lệ',
  (value) => {
    if (!value) return true
    
    // CMND (9 or 12 digits)
    if (/^\d{9}$/.test(value) || /^\d{12}$/.test(value)) {
      return true
    }
    
    // CCCD (12 digits starting with specific patterns)
    if (/^(001|002|004|006|008|010|011|012|014|015|017|019|020|022|024|025|026|027|030|031|033|034|035|036|037|038|040|042|044|045|046|048|049|051|052|054|056|058|060|062|064|066|067|068|070|072|074|075|077|079|080|082|083|084|086|087|089|091|092|093|094|095|096)\d{9}$/.test(value)) {
      return true
    }
    
    return false
  }
)

/**
 * Validator for passport numbers
 */
export const passportNumber = helpers.withMessage(
  'Số hộ chiếu không hợp lệ',
  (value) => {
    if (!value) return true
    
    // Common passport number format: 1-2 letters followed by 6-7 digits
    return /^[A-Za-z]{1,2}\d{6,7}$/.test(value)
  }
)

/**
 * Validator for student ID 
 */
export const studentIdFormat = helpers.withMessage(
  'Mã số sinh viên không hợp lệ',
  (value) => {
    if (!value) return true
    
    // Typical student ID format: 8-10 digits, might start with year
    return /^\d{8,10}$/.test(value)
  }
)

/**
 * Check if a status transition is valid
 */
export function isValidStatusTransition(fromStatusId, toStatusId, transitionRules) {
  if (fromStatusId === toStatusId) return true
  
  const transitionRule = transitionRules.find(rule => rule.fromStatusId === fromStatusId)
  if (!transitionRule) return false
  
  return transitionRule.toStatus.some(status => status._id === toStatusId)
}