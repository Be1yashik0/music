const CACHE_DURATION = 60 * 60 * 1000 // 1 час в миллисекундах

export const setCache = (key, value) => {
  const data = {
    value,
    expiry: Date.now() + CACHE_DURATION,
  }
  localStorage.setItem(key, JSON.stringify(data))
}

export const getCache = (key) => {
  const data = localStorage.getItem(key)
  if (!data) return null
  try {
    const parsed = JSON.parse(data)
    if (Date.now() > parsed.expiry) {
      localStorage.removeItem(key)
      return null
    }
    return parsed.value
  } catch (error) {
    console.error(`Error parsing cache for key "${key}":`, error.message)
    localStorage.removeItem(key) // Очищаем некорректные данные
    return null
  }
}
export const clearCache = (key) => {
  localStorage.removeItem(key)
}