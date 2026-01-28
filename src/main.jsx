import { createRoot } from "react-dom/client"
import "./app.css"
import App from "./App.jsx"
import Provider from "./provider/Provider.jsx"

const Root = () => {
  return (
    <Provider>
      <App />
    </Provider>
  )
}

createRoot(document.getElementById("root")).render(<Root />)
