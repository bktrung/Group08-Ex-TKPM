export const getCurrentLanguage = () => {
  return localStorage.getItem('language') || 'vi'
}

export const addLanguageParam = (url) => {
  const lang = getCurrentLanguage()
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}lang=${lang}`
}