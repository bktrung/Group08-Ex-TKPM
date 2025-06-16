import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3456',
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use(
  (config) => {
    const lang = localStorage.getItem('language') || 'vi'
    
    if (config.params) {
      config.params.lang = lang
    } else {
      config.params = { lang }
    }

    console.log('API Request:', config.method?.toUpperCase(), config.url)
    console.log('Parameters:', config.params)
    console.log('Language from localStorage:', localStorage.getItem('language'))
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data?.message)
    return Promise.reject(error)
  }
)

export default apiClient