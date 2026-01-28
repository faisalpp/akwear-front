import { createContext, useContext } from "react"

export const AppContext = createContext(undefined)

const consumeContext = () => {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error("Context not found")
  }
  return ctx
}

export default consumeContext
