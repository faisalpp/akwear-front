import { useEffect, useState } from "react"
import { AppContext } from "../context/context"
import { fetchCategories } from "../api/categories"
import { fetchProducts } from "../api/products"

const Provider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [showHelp, setShowHelp] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [playListBackImg, setPlayListBackImg] = useState(null)
  const [file, setFile] = useState(null)
  const [isPending, setIsPending] = useState(true)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchCategories()
        console.log("Fetched categories:", res)
        if(res.status){
         setCategories(res.data.collections) 
         setProducts(res.data.products)
        }
        // setProducts(prods)
      } catch (e) {
        console.error(e)
      } finally {
        setIsPending(false)
      }
    }
    load()
  }, [])

  return (
    <AppContext.Provider
      value={{
        cart,
        setCart,
        showHelp,
        setShowHelp,
        uploadedFile,
        setUploadedFile,
        playListBackImg,
        setPlayListBackImg,
        file,
        setFile,
        isPending,
        CATEGORIES:categories
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export default Provider
