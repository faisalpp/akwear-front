const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const fetchProducts = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    throw new Error(`Error fetching products: ${error.message}`)
  }
}
