const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/collections`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    throw new Error(`Error fetching categories: ${error.message}`)
  }
}
