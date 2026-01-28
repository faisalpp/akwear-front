import React, { useState, useEffect, useMemo, useRef } from "react"
import PRODUCTS from "./constants/product"
import {ShoppingBag,Shirt,ArrowRight,ArrowLeft,Check,Upload,Music,Flag,Star,AlignJustify,MoveUp,MoveDown,Trash2,Plus,CreditCard,X,Palette,Edit3,Package,Scissors,ChevronLeft,Layers,ChevronDown,ChevronUp,Image as ImageIcon,AlertCircle,HelpCircle,Globe, GripVertical} from "lucide-react"
import Button from "./components/ui/Button"
import Card from "./components/ui/Card"
import Input from "./components/ui/Input"
import CartDetailsModal from "./components/modals/CartDetailsModal"
import { convertColorToHex, convertToBase64, formatPrice, getTierIndex } from "./utils/helpers"
import ProductConfigPanel from "./components/modals/ProductConfigPanel"
import PersoConfigModal from "./components/modals/PersoConfigModal"
import HelpModal from "./components/modals/HelpModal"
import DesignConfigModal from "./components/modals/DesignConfigModal"
import DesignSelectionUI from "./components/steps/step2/DesignSelectionUI"
import consumeContext from "./context/context"
import LightBox from "./components/lightbox/LightBox"
import CustomPopup from "./components/popup/CustomPopup"


// const PRICING_TIERS = {
//   TIER_1: { min: 1, max: 9, label: "Kleingruppe (1-9)", id: 0 },
//   TIER_2: { min: 10, max: 59, label: "Klasse/Stufe (10-59)", id: 1 },
//   TIER_3: { min: 60, max: 9999, label: "Großauftrag (60+)", id: 2 }
// }

// Kurze Erklärungen für jeden Schritt

// --- HELPER ---

const calculateAge = birthday => {
  const ageDifMs = Date.now() - new Date(birthday).getTime()
  const ageDate = new Date(ageDifMs) // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970)
}

// --- REUSABLE DESIGN SELECTOR COMPONENT ---

// --- BASE COMPONENTS ---

// --- INDIVIDUAL PERSONALIZATION MODAL (New Component) ---

// --- MAIN APP ---

export default function App() {
  const {cart,setCart,showHelp,setShowHelp,uploadedFile,setUploadedFile,playListBackImg,setPlayListBackImg,isPending,CATEGORIES} = consumeContext()
  
  // -- STATE: GENERAL --
  const [step, setStep] = useState(1)
  const [subStep, setSubStep] = useState("A")
  const [showCommaWarning, setShowCommaWarning] = useState(false)

  // -- STATE: DESIGN --
  const [category, setCategory] = useState(null)
  const [designMode, setDesignMode] = useState("same")
  const [frontDesignType, setFrontDesignType] = useState(null)
  const [selectedDesign, setSelectedDesign] = useState(null)
  const [designNote, setDesignNote] = useState("")
  const [individualDesigns, setIndividualDesigns] = useState({})
  const [editingDesignId, setEditingDesignId] = useState(null)

  // -- STATE: PRODUCTS --
  const [productCategory, setProductCategory] = useState(null)
  const [isChoosingMore, setIsChoosingMore] = useState(false)
  const [backImage, setBackImage] = useState(null)

  // -- STATE: CART --

  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [activeProduct, setActiveProduct] = useState(null)
  const [showCartDetails, setShowCartDetails] = useState(false)
  const [showCheckoutDetails, setShowCheckoutDetails] = useState(false)

  // -- STATE: BACK & PERSO --
  const [backType, setBackType] = useState(null)
  const [backList, setBackList] = useState([])
  const dragItemBackIndex = useRef(null);
  const [backInput, setBackInput] = useState("")
  const [specialBackInput, setSpecialBackInput] = useState({name: "",song: "",cover: null,flag: null,zodiac: null})
  const [backDetails, setBackDetails] = useState({ class: "", teacher: "", school: "" })
  const [backNote, setBackNote] = useState("")

  const [hasPerso, setHasPerso] = useState(null)
  const [persoPositions, setPersoPositions] = useState([])
  // NEU: Zustand zur Steuerung der Positions-Kompaktansicht
  const [showPositionSelection, setShowPositionSelection] = useState(true)

  const [persoData, setPersoData] = useState({})
  const [discountError, setDiscountError] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState(null)

  // Checkout form
  const [checkoutData, setCheckoutData] = useState({firstName: "",lastName: "",email: "",confirmEmail: "",sendWhatsappPreview: false,phone: "",confirmPhone: ""})

  // -- STATE: USER --
  const [userData, setUserData] = useState({name: "",street: "",city: "",email: "",dob: "",legal: false,guardian: false})
  const [discountCode, setDiscountCode] = useState("")

  // NEUER STATE FÜR PERSO MODAL
  const [isPersoModalOpen, setIsPersoModalOpen] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [saveStatus, setSaveStatus] = useState("")
  const [isOpenSuccess, setIsOpenSuccess] = useState(false)

  const bottomRef = useRef(null)
  const autoScroll = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    }, 150)
  }

  const [allCollections,setAllCollections] = useState([]);
 
  // Get Collections
  useEffect(() => {
    // Fetch collections or any other initial data here if needed
   async function  fetchCollections() {
    const r = await fetch("https://dev.hamzadeveloper.com/api/abschlussklamotten/collections", {
        headers: {"Content-Type": "application/json" },
      });
      const data = await r.json();
      if(data.status){
        setAllCollections(data.collections);
      }else{
        setAllCollections([]);
      }
      console.log("Raw collections data from Shopify API:", allCollections);
   }
   fetchCollections()
  }, [])
  // Get Collections


  // ============================================
  // STORAGE FUNCTIONS
  // ============================================

  const saveToStorage = () => {
    try {
      const dataToSave = {
        step,
        subStep,
        category,
        designMode,
        frontDesignType,
        selectedDesign,
        designNote,
        individualDesigns,
        productCategory,
        backType,
        backList,
        backInput,
        specialBackInput,
        backDetails,
        backNote,
        hasPerso,
        persoPositions,
        showPositionSelection,
        persoData,
        userData,
        discountCode,
        cart,
        isChoosingMore,
        timestamp: Date.now(),
        allCollections
      }
      localStorage.setItem("abschlussklamotten_data", JSON.stringify(dataToSave))
      console.log("✅ Daten gespeichert:", dataToSave)
      setSaveStatus("Gespeichert")
      setTimeout(() => setSaveStatus(""), 2000)
    } catch (error) {
      console.error("❌ Fehler beim Speichern:", error)
      setSaveStatus("Fehler!")
    }
  }

  const loadFromStorage = () => {
    try {
      const savedDataStr = localStorage.getItem("abschlussklamotten_data")
      if (savedDataStr) {
        const savedData = JSON.parse(savedDataStr)
        console.log("✅ Daten geladen:", savedData)

        // Restore all state
        if ( 'allCollections' in savedData) setAllCollections(savedData.allCollections)
        if ( 'step' in savedData) setStep(savedData.step)
        if ( 'subStep' in savedData) setSubStep(savedData.subStep)
        if ( 'category' in savedData) setCategory(savedData.category)
        if ( 'designMode' in savedData) setDesignMode(savedData.designMode)
        if ( 'frontDesignType' in savedData) setFrontDesignType(savedData.frontDesignType)
        if ( 'selectedDesign' in savedData) setSelectedDesign(savedData.selectedDesign)
        if ( 'designNote' in savedData) setDesignNote(savedData.designNote)
        if ( 'individualDesigns' in savedData) setIndividualDesigns(savedData.individualDesigns)
        if ( 'productCategory' in savedData) setProductCategory(savedData.productCategory)
        if ( 'backType' in savedData) setBackType(savedData.backType)
        if ( 'backList' in savedData) setBackList(savedData.backList)
        if ( 'backInput' in savedData) setBackInput(savedData.backInput)
        if ( 'specialBackInput' in savedData) setSpecialBackInput(savedData.specialBackInput)
        if ( 'backDetails' in savedData) setBackDetails(savedData.backDetails)
        if ( 'backNote' in savedData) setBackNote(savedData.backNote)
        if ( 'hasPerso' in savedData) setHasPerso(savedData.hasPerso)
        if ( 'persoPositions' in savedData) setPersoPositions(savedData.persoPositions)
        if ( 'showPositionSelecion' in savedData) setShowPositionSelection(savedData.showPositionSelection)
        if ( 'persoData' in savedData) setPersoData(savedData.persoData)
        if ( 'userData' in savedData) setUserData(savedData.userData)
        if ( 'discountCode' in savedData) setDiscountCode(savedData.discountCode)
        if ( 'cart' in savedData) setCart(savedData.cart)
        if ( 'isChoosingMore' in savedData) setIsChoosingMore(savedData.isChoosingMore)

        console.log("✅ Warenkorb wiederhergestellt:", savedData.cart)
      } else {
        console.log("ℹ️ Keine gespeicherten Daten gefunden")
      }
    } catch (error) {
      console.log("ℹ️ Keine Daten oder Fehler beim Laden:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const clearAllData = () => {
    try {
      localStorage.removeItem("abschlussklamotten_data")

      // Reset all state to initial values
      setStep(1)
      setSubStep("A")
      setCategory(null)
      setDesignMode("same")
      setFrontDesignType(null)
      setSelectedDesign(null)
      setDesignNote("")
      setIndividualDesigns({})
      setProductCategory(null)
      setBackType(null)
      setBackList([])
      setBackInput("")
      setSpecialBackInput({ name: "", song: "", cover: null, flag: null, zodiac: null })
      setBackDetails({ class: "", teacher: "", school: "" })
      setBackNote("")
      setHasPerso(null)
      setPersoPositions([])
      setShowPositionSelection(true)
      setPersoData({})
      setUserData({ name: "", street: "", city: "", email: "", dob: "", legal: false, guardian: false })
      setDiscountCode("")
      setCart([])
      setIsChoosingMore(false)
    } catch (error) {
      console.error("❌ Fehler beim Löschen:", error)
      alert("❌ Fehler beim Löschen der Daten.")
    }
  }

  const DISCOUNT_CODES = {
    SAVE10: 0.1,
    WELCOME20: 0.2
  }

  const applyDiscount = () => {
    const rate = DISCOUNT_CODES[discountCode.toUpperCase()]
    if (!rate) {
      setDiscountError("Ungültiger Rabattcode")
      setAppliedDiscount(null)
      return
    }
    setDiscountError("")
    setAppliedDiscount({
      code: discountCode.toUpperCase(),
      amount: financials.grossTotal * rate
    })
  }

  // Load data on mount
  useEffect(() => {
    loadFromStorage()
  }, [])

  // Auto-save whenever important state changes (with debounce)
  useEffect(() => {
    if (!isLoadingData && step > 0) {
      const timer = setTimeout(() => {
        saveToStorage()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [
    step,
    cart,
    category,
    productCategory,
    designMode,
    frontDesignType,
    selectedDesign,
    individualDesigns,
    backType,
    backList,
    hasPerso,
    persoPositions,
    persoData,
    userData,
    backDetails,
    backNote,
    designNote,
    backInput,
    specialBackInput,
    isChoosingMore
  ])

  // ============================================
  // END STORAGE FUNCTIONS
  // ============================================

  useEffect(() => {
    if (subStep === "B") autoScroll()
  }, [subStep])
  useEffect(() => {
    if (frontDesignType) autoScroll()
  }, [frontDesignType])
  useEffect(() => {
    if (productCategory) autoScroll()
  }, [productCategory])
  useEffect(() => {
    if (backType) autoScroll()
  }, [backType])
  useEffect(() => {
    if (hasPerso !== null) autoScroll()
  }, [hasPerso])

  const productCounts = useMemo(() => {
    const counts = {}
    cart.forEach(item => {
      const qty = item.sizes
        ? Object.values(item.sizes).reduce((a, b) => a + b, 0)
        : Object.values(item.bundleSizes?.hoodie || {}).reduce((a, b) => a + b, 0)
      counts[item.productId] = (counts[item.productId] || 0) + qty
    })
    return counts
  }, [cart])

  const totalQty = useMemo(() => Object.values(productCounts).reduce((a, b) => a + b, 0), [productCounts])
  const isUnderage = userData.dob ? calculateAge(userData.dob) < 18 : false

  const financials = useMemo(() => {
   let subtotal = 0
   let frontDesignCost = 0
   
   cart.forEach(item => {
     let qty = 0
     if (item.sizes) {
       qty = Object.values(item.sizes).reduce((a, b) => a + b, 0)
     } else if (item.bundleSizes) {
       qty = Object.values(item.bundleSizes.hoodie).reduce((a, b) => a + b, 0)
     }
     
     // Use the stored productPrice instead of looking it up
     subtotal += qty * parseFloat(item.productPrice)
     
     if (designMode === "mixed") {
       frontDesignCost += qty * 2.0
     }
   })
   
   let totalPersoNames = 0
   Object.values(persoData).forEach(names => (totalPersoNames += names.length))
   const persoCost = hasPerso ? totalPersoNames * 2.0 : 0
   const backCost = 0
   
   return {
     subtotal,
     frontDesignCost,
     backCost,
     persoCost,
     grossTotal: subtotal + frontDesignCost + backCost + persoCost
   }
 }, [cart, designMode, hasPerso, persoData])

  const addCartItem = (product, color, productPrice, sizes, bundleSizes = null) => {
    const newItem = { id: Date.now().toString(), productId: product.id, productPrice, color, sizes, bundleSizes,product }
    setCart([...cart, newItem])
    setIsPanelOpen(false)
    setProductCategory(null)
    setIsChoosingMore(false)
  }

  // WARNING HELPER
  const triggerCommaWarning = () => {
    setShowCommaWarning(true)
    setTimeout(() => setShowCommaWarning(false), 5000)
  }

  const handleBackInputChange = val => {
    if (val.includes(",")) {
      triggerCommaWarning()
      return
    }
    setBackInput(val)
  }

  const handlePlayListBackImgUpload = e => {
    const file = e.target.files[0]
    console.log("Uploaded file:", file)
    const fileExt = file ? `.${file.name.split(".").pop().toLowerCase()}` : ""
    if (file && [".png", ".jpg", ".jpeg", ".webp"].includes(fileExt)) {
      convertToBase64(file)
        .then(imgBase64 => {
          if (imgBase64) {
            setPlayListBackImg({ name: file.name, data: imgBase64 })
          }
        })
        .catch(err => {
          console.error("Fehler beim Konvertieren der Datei:", err)
        })
    } else {
      alert("Bitte eine gültige Bilddatei hochladen (png, jpg, jpeg, webp).")
    }
  }

  const handleBackAdd = () => {
    if (backType === "names") {
      if (!backInput.trim()) return
      setBackList([...backList, { id: Date.now(), text: backInput, subtext: "Name" }])
      setBackInput("")
    } else {
      if (!specialBackInput.name) return
      let text = specialBackInput.name
      let subtext =
        backType === "playlist"
          ? `${specialBackInput.song}`
          : backType === "flags"
          ? `${specialBackInput.flag?.label}`
          : `${specialBackInput.zodiac?.name}`
      setBackList([...backList, { id: Date.now(), text, subtext }])
      setSpecialBackInput({ name: "", song: "", cover: null, flag: null, zodiac: null })
    }
  }

  const moveBackItem = (idx, dir) => {
    const copy = [...backList]
    if (dir === -1 && idx > 0) [copy[idx], copy[idx - 1]] = [copy[idx - 1], copy[idx]]
    if (dir === 1 && idx < copy.length - 1) [copy[idx], copy[idx + 1]] = [copy[idx + 1], copy[idx]]
    setBackList(copy)
  }

  const handleModeChange = mode => {
    setDesignMode(mode)
    if (mode === "mixed") {
      const isEmpty = Object.keys(individualDesigns).length === 0
      if (isEmpty && frontDesignType) {
        const newIndividual = {}
        cart.forEach(item => {
          newIndividual[item.productId] = {
            type: frontDesignType,
            design: selectedDesign,
            file: uploadedFile,
            note: designNote
          }
        })
        setIndividualDesigns(newIndividual)
      }
    }
  }

  const handleSaveIndividualDesign = data => {
    if (editingDesignId) {
      setIndividualDesigns(prev => ({ ...prev, [editingDesignId]: data }))
      setTimeout(() => {
        console.log("artwork saved for item:", individualDesigns)
      }, 1000)
    }
  }

  // Funktion für Positions-Toggle (Exklusive Auswahl)
  const handleTogglePosition = pos => {
    setPersoPositions(prevPositions => {
      // Wenn die Position bereits ausgewählt ist, alles leeren (Abwählen)
      if (prevPositions.includes(pos)) {
        return []
      } else {
        // Andernfalls nur diese Position auswählen
        return [pos]
      }
    })
  }

  const finalTotal = financials.grossTotal - (appliedDiscount?.amount || 0)

  const isCheckoutValid =
    checkoutData.firstName &&
    checkoutData.lastName &&
    checkoutData.email &&
    checkoutData.email === checkoutData.confirmEmail &&
    (!checkoutData.sendWhatsappPreview || (checkoutData.phone && checkoutData.phone === checkoutData.confirmPhone))

  const handleCheckoutSubmit = async () => {
    const meta = {
      timestamp: new Date().toISOString(),
      customer: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone || null,
        sendWhatsappPreview: userData.sendWhatsappPreview
      },
      products: cart.map(item => {
        return {
          product_id: item.productId,
          quantity: Object.values(item.sizes || item.bundleSizes?.hoodie || {}).reduce((a, b) => a + b, 0),
          color: item.color,
          sizes: item.sizes || item.bundleSizes,
        }
      }),
      design: {
        category: category,
        mode: designMode,
        frontDesignType: frontDesignType,
        selectedDesign: selectedDesign,
        designNote: designNote,
        individualDesigns: designMode === "mixed" ? individualDesigns : null
      },
      back: {
        type: backType,
        list: backList,
        details: backDetails,
        note: backNote,
        image: backImage?.name || playListBackImg?.data || null
      },
      personalization: {
        enabled: hasPerso,
        positions: persoPositions,
        data: persoData
      },
      pricing: {
        subtotal: financials.subtotal,
        frontDesignCost: financials.frontDesignCost,
        backCost: financials.backCost,
        persoCost: financials.persoCost,
        grossTotal: financials.grossTotal,
        discount: appliedDiscount,
        finalTotal: financials.grossTotal - (appliedDiscount?.amount || 0)
      },
      totalQuantity: totalQty
    }

    const items = cart.map(item => {
        return {
          product_id: item.productId,
          quantity: Object.values(item.sizes || item.bundleSizes?.hoodie || {}).reduce((a, b) => a + b, 0),
          color: item.color,
          sizes: item.sizes || item.bundleSizes,
        }
      })
      
    try {
      const response = await fetch(import.meta.env.VITE_API_BASE_URL + "/api/v1/orders/create", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          customer_name: userData.firstName + " " + userData.lastName,
          customer_email: userData.email,
          customer_phone: userData.phone ?? 'N/A',
          billing_address: 'N/A',
          shipping_address: userData.address+' '+userData.houseNumber+' '+userData.city+','+userData.postalCode,
          payment_method: 'Pending',
          items: items,
          meta: meta
        })
      })

      const data = await response.json()
      console.log("Order submission response:", data)
      
      if (response.ok) {
        setIsOpenSuccess(true)

        setTimeout(() => {
          clearAllData()
          setIsOpenSuccess(false)
        }, 2000)
      }
    } catch (error) {
      console.error("Error submitting order:", error)
    }
  }

  const renderStep1 = () => {
    const showDecisionView = totalQty > 0 && !productCategory && !isChoosingMore
    if (showDecisionView) {
      return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-10">
          <div className="flex justify-between items-start">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Produkte gewählt!</h2>
            <button onClick={() => setShowHelp(1)} className="text-gray-400 hover:text-orange-600">
              <HelpCircle size={24} />
            </button>
          </div>
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in">
              <Check size={40} strokeWidth={3} />
            </div>
            <p className="text-gray-500 mb-8">Aktuell {totalQty} Teile im Warenkorb.</p>
            <div className="flex flex-col gap-4 max-w-md mx-auto">
              <Button onClick={() => setIsChoosingMore(true)} variant="secondary" className="py-4 text-lg">
                <Plus size={20} /> Weiteres Produkt / Farbe hinzufügen
              </Button>
              <Button onClick={() => setStep(2)} className="py-4 text-lg shadow-xl shadow-orange-200">
                Weiter zum Design <ArrowRight size={20} />
              </Button>
            </div>
          </div>
        </div>
      )
    }

const filteredProducts = productCategory
  ? CATEGORIES.find(c => c.id === productCategory)?.products || []
  : []

    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-10">
        {/* {<CustomPopup isOpenSuccess={isOpenSuccess} setIsOpenSuccess={setIsOpenSuccess} />} */}
        <div
          className={`transition-all duration-500 overflow-hidden ${
            !productCategory ? "max-h-24 opacity-100 mb-6" : "max-h-0 opacity-0 mb-0"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                {totalQty > 0 ? "Weitere Artikel?" : "1. Produkte wählen"}
              </h2>
              <p className="text-gray-500 mt-1">Wähle zuerst deine Textilien aus.</p>
            </div>
            <button onClick={() => setShowHelp(1)} className="text-gray-400 hover:text-orange-600">
              <HelpCircle size={24} />
            </button>
          </div>
        </div>
        <div
          className={`grid gap-4 transition-all duration-700 ease-in-out ${
            !productCategory ? "lg:grid-cols-2 grid-cols-4" : "lg:grid-cols-6 grid-cols-4"
          }`}
        >
          {CATEGORIES.map(cat => {
            if(cat.slug === 'all-products') return;
            const isSelected = productCategory === cat.id
            return (
              <Card
                key={cat.id}
                selected={isSelected}
                onClick={() => setProductCategory(cat.id)}
                className={`transition-all duration-500 ${!productCategory ? "p-0" : "p-1 h-16"} ${
                  productCategory && !isSelected ? "opacity-40 hover:opacity-100 scale-95" : "opacity-100"
                }`}
              >
                {!productCategory ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-center h-32">
                    <div className={`p-4 rounded-full bg-orange-50 text-orange-600`}>{cat?.icon ? cat.icon : <Shirt/>  }</div>
                    <div className="font-bold text-lg">{cat.title}</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 h-full py-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {React.cloneElement(cat?.icon ? cat.icon : <Shirt/>, { size: 16 })}
                    </div>
                    <div className="text-[9px] font-bold truncate w-full text-center hidden md:block">{cat.title}</div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
        {productCategory && (
          <div className="animate-in slide-in-from-bottom-10 fade-in">
            <button
              onClick={() => setProductCategory(null)}
              className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-600 transition-colors"
            >
              <ChevronLeft size={16} /> Zurück zur Übersicht
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-24">
              {filteredProducts.map(product => {
                const existingQty = productCounts[product.id] || 0
                return (
                  <Card
                    key={product.id}
                    onClick={() => {
                      setActiveProduct(product)
                      setIsPanelOpen(true)
                    }}
                    className={`h-full flex flex-col justify-between group hover:border-orange-300 ${
                      existingQty > 0 ? "border-orange-500 bg-orange-50/20" : ""
                    }`}
                  >
                    <div>
                      {/* <div className="flex justify-between items-start mb-2">
                        {product.type.includes("bundle") && (
                          <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded uppercase">
                            Deal
                          </span>
                        )}
                      </div> */}
                      <img className="rounded-md mb-2" src={product?.primary_image ? 'https://akwearadmin.hamzadeveloper.com/public/'+product.primary_image.image_url : 'https://placehold.co/435x550'} />
                      <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1">{product.title}</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {product.description?.length > 120 ? product.description.slice(0, 120) + "..." : product.description}</p>
                    </div>
                    <div>
                      {existingQty > 0 ? (
                        <div className="mb-3 flex items-center gap-2 text-orange-700 bg-orange-100 p-2 rounded-lg">
                          <Check size={16} />
                          <span className="text-xs font-bold">{existingQty}x im Warenkorb</span>
                        </div>
                      ) : (
                        ''
                      )}
                      <div
                        className={`w-full py-2 rounded-lg text-center font-bold text-sm transition-colors ${
                          existingQty > 0
                            ? "bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50"
                            : "bg-gray-50 group-hover:bg-orange-600 group-hover:text-white"
                        }`}
                      >
                        {existingQty > 0 ? (
                          <span className="flex items-center justify-center gap-2">
                            <Plus size={14} /> Mehr hinzufügen
                          </span>
                        ) : (
                          "Farbe & Größen wählen"
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderStep2 = () => {
    const categories = ["Abitur", "Abschluss", "LK-Kurs", "Grundschule"]
    const showMixedOption = cart.length > 1 // Zeige Mixed Mode nur, wenn mehr als 1 Artikel im Warenkorb ist

    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-10">
        <div
          className={`transition-all duration-500 overflow-hidden ${
            !category ? "max-h-24 opacity-100 mb-6" : "max-h-0 opacity-0 mb-0"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">2. Design wählen</h2>
              <p className="text-gray-500 mt-1">Für wen ist das Merch?</p>
            </div>
            <button onClick={() => setShowHelp(2)} className="text-gray-400 hover:text-orange-600">
              <HelpCircle size={24} />
            </button>
          </div>
        </div>
        <div
          className={`grid gap-4 transition-all duration-700 ease-in-out ${
            !category ? "grid-cols-2" : "sm:grid-cols-2 md:grid-cols-4 grid-cols-2"
          }`}
        >
          {categories.map(cat => {
            const isSelected = category === cat
            return (
              <Card
                key={cat}
                selected={isSelected}
                onClick={() => {
                  setCategory(cat)
                  setSubStep("B")
                }}
                className={`transition-all duration-500 w-full h-full${
                  !category ? "flex-col gap-2" : "flex-row gap-2 p-2"
                } flex items-center justify-center ${
                  category && !isSelected ? "opacity-40 hover:opacity-100 scale-95" : "opacity-100"
                }`}
              >
                <div
                  className={`rounded-full flex items-center justify-center ${
                    !category ? "bg-orange-100 text-orange-600 w-12 h-12" : "bg-orange-50 text-orange-600 w-8 h-8"
                  }`}
                >
                  <Star size={!category ? 24 : 14} />
                </div>
                <span className={`font-bold text-gray-800 ${!category ? "text-xl" : "text-xs"}`}>{cat}</span>
              </Card>
            )
          })}
        </div>
        {category && (
          <div className="animate-in slide-in-from-bottom-10 fade-in duration-700 mt-8">
            {showMixedOption && (
              <div className="bg-gray-100 p-1 rounded-xl flex mb-8">
                <button
                  onClick={() => handleModeChange("same")}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    designMode === "same" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Alle gleicher Druck (Standard)
                </button>
                <button
                  onClick={() => handleModeChange("mixed")}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    designMode === "mixed" ? "bg-white shadow text-indigo-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Verschiedene Motive (+2,00€/Teil)
                </button>
              </div>
            )}

            {designMode === "same" && (
              <div className="mb-8 animate-in fade-in">
                {!showMixedOption && (
                  <div className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Dein Design</div>
                )}
                <DesignSelectionUI
                  category={category}
                  currentType={frontDesignType}
                  setType={setFrontDesignType}
                  currentDesign={selectedDesign}
                  setDesign={setSelectedDesign}
                  currentFile={uploadedFile}
                  setFile={setUploadedFile}
                  currentNote={designNote}
                  setNote={setDesignNote}
                  allCollections={allCollections}
                  step={step}
                /> 
              </div>
            )}
            {designMode === "mixed" && (
              <div className="mt-8 pt-8 border-t border-gray-200 animate-in slide-in-from-bottom-10">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Individuelle Anpassungen</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Hier kannst du für jeden Artikel ein abweichendes Motiv wählen.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {cart.map((item, idx) => {
                    console.log()
                    // const prod = PRODUCTS.find(p => p.id === item.productId)
                    const sizeStr = Object.entries(item.sizes || item.bundleSizes?.hoodie || {})
                      .filter(([_, q]) => q > 0)
                      .map(([s, q]) => `${q}x ${s}`)
                      .join(", ")
                    const individual = individualDesigns[item.productId]
                    let display = "Nicht gewählt"
                    if (individual) {
                      if (individual.type === "Motiv") display = individual.design?.title ? individual.design.title : individual || "Motiv aus Katalog"
                      else if (individual.type === "Special") display = individual.design?.title ? individual.design.title : individual || "Special Style"
                      else if (individual.type === "Upload") display = "Eigener Upload"
                      else if (individual.type === "None") display = "Unbedruckt"
                    }
                    const color = item.color.split(' - ').length > 1 ? item.color.split(' - ')[0] : item.color;
                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div style={{background: color}} className={`w-10 h-10 rounded-md shadow-inner shrink-0`}></div>
                          <div>
                            <div className="font-bold text-sm">{item.product.title}</div>
                            <div className="text-xs text-gray-500">{sizeStr}</div>
                          </div>
                        </div>
                        <div
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg border flex-1 ${
                            individual
                              ? "bg-indigo-50 border-indigo-100 text-indigo-900"
                              : "bg-gray-50 border-gray-200 text-gray-400"
                          }`}
                        >
                          <Palette size={16} className={individual ? "text-indigo-500" : "text-gray-300"} />
                          <div className="text-sm font-medium truncate">{display}</div>
                        </div>
                        <button
                          onClick={() => setEditingDesignId(item.productId)}
                          className="px-4 py-2 bg-white border-2 border-indigo-100 text-indigo-700 font-bold text-sm rounded-lg hover:bg-indigo-50 transition-colors whitespace-nowrap"
                        >
                          Design wählen
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderStep3 = () => {
    const backOptions = [
      { id: "names", label: "Namensliste", icon: <AlignJustify />, sub: "Klassisch" },
      { id: "playlist", label: "Playlist", icon: <Music />, sub: "+ 2,00 €" },
      { id: "flags", label: "Flaggen", icon: <Flag />, sub: "+ 2,00 €" },
      { id: "zodiac", label: "Sternzeichen", icon: <Star />, sub: "+ 2,00 €" },
      { id: "upload", label: "Eigenes Bild", icon: <Upload />, sub: "+ 3,00 €" },
      { id: "none", label: "Ohne Druck", icon: <X />, sub: "Leer" }
    ]

    const handleBackImageUpload = e => {
      const file = e.target.files[0]
      const fileExt = file ? `.${file.name.split(".").pop().toLowerCase()}` : ""
      const validImgFile = [".png", ".jpg", ".jpeg", ".webp"]

      if (file && validImgFile.includes(fileExt)) {
        setBackImage(file)
      } else {
        alert("Bitte eine gültige Bilddatei hochladen (png, jpg, jpeg, webp).")
      }
    }

    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-10">
        <div
          className={`transition-all duration-500 overflow-hidden ${
            !backType ? "max-h-24 opacity-100 mb-6" : "max-h-0 opacity-0 mb-0"
          }`}
        >
          <div className="flex justify-between items-start">
            <h2 className="text-3xl font-extrabold text-gray-900">3. Rückseite gestalten</h2>
            <button onClick={() => setShowHelp(3)} className="text-gray-400 hover:text-orange-600">
              <HelpCircle size={24} />
            </button>
          </div>
        </div>

        <div
          className={`grid gap-4 transition-all duration-700 ease-in-out ${
            !backType ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-6" : "lg:grid-cols-6 grid-cols-4"
          }`}
        >
          {backOptions.map(opt => (
            <Card
              key={opt.id}
              selected={backType === opt.id}
              onClick={() => {
                setBackType(opt.id)
                if (opt.id !== "upload") {
                  setBackImage(null)
                }
              }}
              className={`transition-all duration-500 ${!backType ? "h-40 py-6" : "h-20 p-2"} ${
                backType && backType !== opt.id ? "opacity-40 scale-95" : "opacity-100"
              }`}
            >
              {!backType ? (
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <div
                    className={`p-3 rounded-full bg-gray-100 ${
                      backType === opt.id ? "bg-orange-100 text-orange-600" : "text-gray-500"
                    }`}
                  >
                    {opt.icon}
                  </div>
                  <div>
                    <div className="font-bold">{opt.label}</div>
                    <div className="text-xs text-gray-400">{opt.sub}</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1">
                  <div
                    className={`p-1.5 rounded-lg ${
                      backType === opt.id ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {React.cloneElement(opt.icon, { size: 16 })}
                  </div>
                  <div className="text-[9px] font-bold truncate">{opt.label}</div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Hauptcontainer für ALLE Rückseiten-Informationen */}
        {backType !== null && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 bg-white border border-gray-200 rounded-2xl p-3 lg:p-6 shadow-sm">
            {backType !== "none" && backType !== "upload" && (
              <>
                {/* NAMENSLISTE / HAUPTEINTRÄGE */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    Namensliste{" "}
                    <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {backList.length} Namen eingetragen
                    </span>
                  </h3>
                </div>

                {showCommaWarning && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 font-bold text-sm rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle size={18} /> Bitte alle Namen einzeln hinzufügen.
                  </div>
                )}

                {backType === "names" && (
                  <div className="flex flex-col md:flex-row gap-2 mb-6 p-4 bg-gray-50 rounded-xl">
                    <input
                      className="flex-1 bg-white p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="1. Namen eintragen"
                      value={backInput}
                      onChange={e => handleBackInputChange(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleBackAdd()}
                    />
                    <button onClick={handleBackAdd} className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold">
                      Hinzufügen
                    </button>
                  </div>
                )}

                {backType === "playlist" && (
                  <>
                    <div className="bg-gray-50 p-4 rounded-xl mb-6 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Dein Name"
                          value={specialBackInput.name}
                          onChange={e => setSpecialBackInput({ ...specialBackInput, name: e.target.value })}
                        />
                        <Input
                          placeholder="Songtitel & Interpret"
                          value={specialBackInput.song}
                          onChange={e => setSpecialBackInput({ ...specialBackInput, song: e.target.value })}
                        />
                      </div>
                      <input
                        onChange={handlePlayListBackImgUpload}
                        type="file"
                        id="back-file"
                        hidden
                        accept=".jpg, .jpeg, .png, .webp"
                      />
                      <label
                        htmlFor="back-file"
                        className="border-2 w-full h-full flex gap-1 justify-center items-center border-dashed border-gray-300 bg-white p-4 rounded-xl text-center text-sm text-gray-500 cursor-pointer hover:border-orange-400"
                      >
                        <Upload className="mx-auto mb-1 size-5 min-w-5 max-w-5" /> <p>Cover hochladen (Optional)</p>
                      </label>
                      {/* <LightBox /> */}
                      <button
                        onClick={handleBackAdd}
                        className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold"
                      >
                        Hinzufügen
                      </button>
                    </div>
                    <div className="flex" >
                     {playListBackImg?.data ? 
                     <img src={playListBackImg?.data} alt="Uploaded" className="lg:w-32 w-[130px] rounded-lg" />
                     :null
                     } 
                     <div className="flex flex-col" >
                      <span className="text-6xl font-bold" >{specialBackInput.name}</span>
                      <span className="text-6xl font-semibold" >{specialBackInput.song}</span>
                     </div>
                    </div>
                    <br />
                  </>
                )}

                {backType === "flags" && (
                  <div className="bg-gray-50 p-4 rounded-xl mb-6 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Dein Name"
                        value={specialBackInput.name}
                        onChange={e => setSpecialBackInput({ ...specialBackInput, name: e.target.value })}
                      />
                      <div className="relative">
                        <select
                          className="w-full p-3 bg-white border border-gray-300 rounded-xl appearance-none outline-none"
                          onChange={e => setSpecialBackInput({ ...specialBackInput, flag: { label: e.target.value } })}
                        >
                          <option>Flagge wählen...</option>
                          <option>Deutschland</option>
                          <option>Türkei</option>
                          <option>Italien</option>
                          <option>Polen</option>
                        </select>
                        <Globe size={16} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <button
                      onClick={handleBackAdd}
                      className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold"
                    >
                      Hinzufügen
                    </button>
                  </div>
                )}

                {backType === "zodiac" && (
                  <div className="bg-gray-50 p-4 rounded-xl mb-6 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Dein Name"
                        value={specialBackInput.name}
                        onChange={e => setSpecialBackInput({ ...specialBackInput, name: e.target.value })}
                      />
                      <Input
                        placeholder="Geburtsdatum oder Sternzeichen"
                        value={specialBackInput.zodiac}
                        onChange={e => setSpecialBackInput({ ...specialBackInput, zodiac: { name: e.target.value } })}
                      />
                    </div>
                    <button
                      onClick={handleBackAdd}
                      className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold"
                    >
                      Hinzufügen
                    </button>
                  </div>
                )}

                {/* THE LIST ITSELF NAMES */}
                <div className="flex flex-wrap gap-2 max-h-[30vh] overflow-y-auto mb-8 pb-2">
                  {backList.length === 0 && (
                    <div className="text-center text-gray-400 py-4 italic">Noch keine Namen eingetragen</div>
                  )}
                  {backList.map((item, idx) => (
                  <div key={item.id} draggable onDragStart={() => (dragItemBackIndex.current = idx)} onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      const from = dragItemBackIndex.current;
                      const to = idx;
                      if (from === to) return;                  
                      setBackList((prev) => {                  
                        const updated = [...prev];
                        const moved = updated.splice(from, 1)[0];
                        updated.splice(to, 0, moved);
                        return updated;
                      });
                    }}
                    className="flex items-center gap-3 bg-white py-2 pr-3 pl-2 rounded-3xl border border-gray-100 shadow-sm w-fit"
                  >
                    {/* HANDLE */}
                    <span className="cursor-grab active:cursor-grabbing">
                      <GripVertical size={20} color="gray" />
                    </span>                  
                    <div className="flex-1 font-bold text-gray-500">
                      {item.text}
                      {item.subtext !== "Name" && (
                        <span className="font-normal text-xs ml-2 text-gray-500">
                          {item.subtext}
                        </span>
                      )}
                    </div>                  
                    <button
                      className="font-semibold text-gray-500"
                      onClick={() =>
                        setBackList(backList.filter((x) => x.id !== item.id))
                      }
                    >
                      X
                    </button>
                  </div>
                  ))}
                  {/* {backList.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm"
                    >
                      <div className="flex-1 font-bold">
                        {item.text}{" "}
                        <span className="font-normal text-gray-500 text-xs ml-2">
                          {item.subtext !== "Name" ? item.subtext : ""}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveBackItem(idx, -1)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-500"
                        >
                          <MoveUp size={14} />
                        </button>
                        <button
                          onClick={() => moveBackItem(idx, 1)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-500"
                        >
                          <MoveDown size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => setBackList(backList.filter(x => x.id !== item.id))}
                        className="text-red-400 hover:bg-red-50 p-2 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))} */}
                </div>
              </>
            )}

            {/* CUSTOM IMAGE UPLOAD SECTION */}
            {backType === "upload" && (
              <div className="mb-8">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Upload size={20} className="text-orange-600" />
                  Eigenes Bild für die Rückseite
                </h3>

                {!backImage ? (
                  <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 transition-colors relative group">
                    <Upload size={32} className="text-gray-400 mb-3 group-hover:text-orange-500" />
                    <span className="font-bold text-gray-700 group-hover:text-orange-600">
                      Bild für Rückseite hochladen
                    </span>
                    <span className="text-sm text-gray-500 mt-1">PNG, JPG, JPEG, WEBP</span>
                    <input
                      type="file"
                      id="backImageUpload"
                      accept=".png, .jpg, .jpeg, .webp"
                      hidden
                      onChange={handleBackImageUpload}
                    />
                    <label htmlFor="backImageUpload" className="absolute inset-0 cursor-pointer"></label>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 border-2 border-green-200 bg-green-50 rounded-xl">
                    <div className="w-20 h-20 bg-white rounded-lg border border-green-200 flex items-center justify-center shadow-sm overflow-hidden">
                      <ImageIcon className="text-green-500" size={32} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-lg">{backImage.name}</div>
                      <div className="text-sm text-green-700 font-medium">Erfolgreich hochgeladen</div>
                      <div className="text-xs text-gray-500 mt-1">Dieses Bild wird auf der Rückseite gedruckt</div>
                    </div>
                    <button
                      onClick={() => setBackImage(null)}
                      className="text-sm font-bold text-gray-500 hover:text-red-500 bg-white px-4 py-2 rounded-lg border border-gray-200 hover:border-red-200 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <strong>Hinweis:</strong> Das Bild sollte mindestens 1500x1500 Pixel haben für beste
                      Druckqualität. Es wird auf die gesamte Rückseite gedruckt.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {backType === "none" && (
              <div className="p-6 bg-gray-50 text-center text-sm text-gray-500 mb-6 rounded-xl border border-gray-200">
                <div className="inline-block p-3 bg-gray-100 rounded-full mb-2">
                  <X size={24} className="text-gray-400" />
                </div>
                <div>Der Rücken bleibt unbedruckt.</div>
              </div>
            )}

            {/* DETAILS & HINWEISE - Visible for all types */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">Details & Hinweise</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Input
                  label="Klasse (Optional)"
                  placeholder="z.B. 10b"
                  value={backDetails.class}
                  onChange={e => setBackDetails({ ...backDetails, class: e.target.value })}
                />
                <Input
                  label="Lehrer (Optional)"
                  placeholder="z.B. Herr Müller"
                  value={backDetails.teacher}
                  onChange={e => setBackDetails({ ...backDetails, teacher: e.target.value })}
                />
                <Input
                  label="Schule (Optional)"
                  placeholder="z.B. Goethe Gymnasium"
                  value={backDetails.school}
                  onChange={e => setBackDetails({ ...backDetails, school: e.target.value })}
                />
              </div>

              {/* FREE TEXT FIELD FOR NOTES */}
              <div className="space-y-2">
                <label className="block font-bold text-sm text-gray-700">
                  Anmerkungen & Änderungswünsche zum Rückendruck
                </label>
                <textarea
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px] resize-y"
                  placeholder="Hier können Sie weitere Wünsche, Änderungen oder besondere Anweisungen für den Rückendruck eintragen..."
                  value={backNote}
                  onChange={e => setBackNote(e.target.value)}
                />
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  Beispiel: "Bitte Namen in alphabetischer Reihenfolge", "Größere Schrift verwenden", etc.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderStep4 = () => (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-10">
      <div
        className={`transition-all duration-500 overflow-hidden ${
          hasPerso === null ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex justify-between items-start">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">4. Namen auf jedem Hoodie?</h2>
          <button onClick={() => setShowHelp(4)} className="text-gray-400 hover:text-orange-600">
            <HelpCircle size={24} />
          </button>
        </div>
      </div>
      <div
        className={`grid gap-4 transition-all duration-700 ease-in-out ${
          hasPerso === null ? "grid-cols-2 max-w-lg mx-auto" : "grid-cols-2"
        }`}
      >
        <Card
          selected={hasPerso === false}
          onClick={() => {
            setHasPerso(false)
            setPersoPositions([])
          }}
          className="h-32 flex flex-col items-center justify-center font-bold"
        >
          Nein, danke
        </Card>
        <Card
          selected={hasPerso === true}
          onClick={() => {
            setHasPerso(true)
            setShowPositionSelection(true)
          }}
          className="h-32 flex flex-col items-center justify-center font-bold"
        >
          Ja, bitte
        </Card>
      </div>
      {hasPerso === true && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 animate-in fade-in">
          <h3 className="font-bold text-xl mb-4">1. Position wählen</h3>

          {/* Kompakte Anzeige / Expand-Button */}
          {persoPositions.length > 0 && !showPositionSelection ? (
            <div
              onClick={() => setShowPositionSelection(true)}
              className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border-2 border-orange-600 shadow-md cursor-pointer transition-all hover:bg-orange-100 mb-8"
            >
              <div className="flex items-center gap-3">
                <Layers size={20} className="text-orange-600" />
                <span className="font-bold text-gray-800">{persoPositions[0]}</span>
              </div>
              <button type="button" className="text-sm text-orange-600 font-bold flex items-center gap-1">
                <Edit3 size={16} /> Ändern
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {["Ärmel L", "Ärmel R", "Brust L", "Brust R", "Kapuze", "Rücken unten"].map(pos => (
                <div
                  key={pos}
                  onClick={() => {
                    // EXKLUSIVE Auswahl: Wenn die Position bereits gewählt ist, wähle alles ab, sonst nur diese.
                    setPersoPositions(prev => (prev.includes(pos) ? [] : [pos]))

                    // Verkleinere die Auswahl, wenn eine Position NEU gewählt wurde
                    if (!persoPositions.includes(pos)) {
                      setTimeout(() => setShowPositionSelection(false), 100)
                    }
                  }}
                  className={`p-3 rounded-xl border text-center text-sm font-bold cursor-pointer transition-all 
                                        ${persoPositions.includes(pos) ? "bg-orange-600 text-white" : "bg-gray-50"}`}
                >
                  {pos}
                </div>
              ))}
            </div>
          )}

          <h3 className="font-bold text-xl mb-4">2. Namen zuordnen</h3>
          <p className="text-sm text-gray-500 mb-4">Wählen Sie zuerst die Position(en) oben aus.</p>
          <Button onClick={() => setIsPersoModalOpen(true)} className="w-full" disabled={persoPositions.length === 0}>
            Namen eintragen (
            {Object.values(persoData).flatMap(arr => arr.filter(name => name.trim().length > 0)).length} Namen)
          </Button>
        </div>
      )}
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-10">
      {<CustomPopup isOpenSuccess={isOpenSuccess} setIsOpenSuccess={setIsOpenSuccess} />}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900">Zusammenfassung</h2>
        <button onClick={() => setShowHelp(5)} className="text-gray-400 hover:text-orange-600">
          <HelpCircle size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN (UNCHANGED STRUCTURE) */}
        <div className="lg:col-span-2 space-y-6">
          {/* ORDER SUMMARY */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div
              className="bg-gray-50 p-4 border-b border-gray-100 font-bold flex justify-between cursor-pointer hover:bg-gray-100"
              onClick={() => setShowCheckoutDetails(!showCheckoutDetails)}
            >
              <div className="flex items-center gap-2">
                <span>Deine Bestellung</span>
                {showCheckoutDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              <span className="text-orange-600">Gesamtmenge: {totalQty}</span>
            </div>

            {showCheckoutDetails && (
              <div className="p-6 space-y-6 bg-white animate-in slide-in-from-top-2">
                <div className="border-b border-gray-100 pb-4">
                  <div className="text-xs font-bold text-gray-400 uppercase mb-2">Details</div>

                  {cart.map((item, i) => {
                    const qty = Object.values(item.sizes || item.bundleSizes?.hoodie || {}).reduce((a, b) => a + b, 0)

                    const individual = individualDesigns[item.productId]
                    let designTxt = "Standard"

                    if (designMode === "mixed") {
                      designTxt = individual ? individual.design?.title ? individual.design.title : individual.design || individual.type : "Nicht gewählt"
                    } else {
                      designTxt = selectedDesign?.title ? selectedDesign.title : selectedDesign || frontDesignType || "Standard"
                    }

                    return (
                      <div
                        key={i}
                        className="flex justify-between text-sm mb-2 border-b border-dashed border-gray-100 pb-2"
                      >
                        <div>
                          <span className="font-bold">
                            {qty}x {item.product.title}
                          </span>
                          <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                            <div style={{background: item.color.split(' - ')[0]}} className={`h-10 w-10 rounded-full`}></div> – Design: {designTxt}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* DATEN (EXTENDED – SAME CARD) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-bold mb-4">Daten</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Vorname"
                value={userData.firstName}
                onChange={e => setUserData({ ...userData, firstName: e.target.value })}
              />
              <Input
                placeholder="Nachname"
                value={userData.lastName}
                onChange={e => setUserData({ ...userData, lastName: e.target.value })}
              />
              <Input
                placeholder="E-Mail"
                type="email"
                value={userData.email}
                onChange={e => setUserData({ ...userData, email: e.target.value })}
              />
              <Input
                placeholder="E-Mail bestätigen"
                type="email"
                value={userData.confirmEmail}
                onChange={e =>
                  setUserData({
                    ...userData,
                    confirmEmail: e.target.value
                  })
                }
              />
              <Input
                placeholder="Hausnummer"
                type="text"
                value={userData.houseNumber}
                onChange={e => setUserData({ ...userData, houseNumber: e.target.value })}
              />
              <Input
                placeholder="Stadt"
                type="text"
                value={userData.city}
                onChange={e => setUserData({ ...userData, city: e.target.value })}
              />
              <Input
                placeholder="Postleitzahl"
                type="text"
                value={userData.postalCode}
                onChange={e => setUserData({ ...userData, postalCode: e.target.value })}
              />
            </div>
              <Input
                placeholder="Address"
                type="text"
                value={userData.address}
                onChange={e => setUserData({ ...userData, address: e.target.value })}
              />

            {/* WHATSAPP TOGGLE (INLINE, SAME CARD) */}
            <div className="pt-4 space-y-3">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={userData.sendWhatsappPreview}
                  onChange={e =>
                    setUserData({
                      ...userData,
                      sendWhatsappPreview: e.target.checked
                    })
                  }
                />
                Digitale Vorschau per WhatsApp senden
              </label>

              {userData.sendWhatsappPreview && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Telefonnummer"
                    value={userData.phone}
                    onChange={e => setUserData({ ...userData, phone: e.target.value })}
                  />
                  <Input
                    placeholder="Telefonnummer bestätigen"
                    value={userData.confirmPhone}
                    onChange={e =>
                      setUserData({
                        ...userData,
                        confirmPhone: e.target.value
                      })
                    }
                  />
                </div>
              )}
<label className="flex items-start gap-3 text-xs">
                <input
                  type="checkbox"
                  checked={userData.underAge}
                  onChange={e =>
                    setUserData({
                      ...userData,
                      underAge: e.target.checked
                    })
                  }
                  className="mt-2"
                />
                <span className="text-black" >Ich bestätige, dass ich mindestens 18 Jahre alt bin oder die Einwilligung meines gesetzlichen Vertreters habe,
dass es sich um ein individuell angefertigtes Produkt handelt, für das kein Widerrufsrecht besteht, es sei denn, es liegt ein Fehler seitens Abschlussklamotten.de vor,
dass alle angegebenen Informationen (z. B. Namen, Designs, Größen) von mir abschließend geprüft und freigegeben wurden,
und dass ich die <a href="#" className="text-orange-500 underline" >Allgemeinen Geschäftsbedingungen</a>, die <a href="#" className="text-orange-500 underline" >Datenschutzerklärung</a> und die <a href="#" className="text-orange-500 underline" >Widerrufsbelehrung akzeptiere</a>.</span>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (EXTENDED ONLY) */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-xl sticky top-6">
            {/* DISCOUNT */}
            <div className="mb-6 space-y-3">
              <div className="flex gap-2">
                <Input placeholder="Rabattcode" value={discountCode} onChange={e => setDiscountCode(e.target.value)} />
                <Button onClick={applyDiscount}>OK</Button>
              </div>

              {discountError && <div className="text-red-400 text-sm">{discountError}</div>}

              {appliedDiscount && (
                <div className="text-green-400 text-sm">Rabatt {appliedDiscount.code} angewendet</div>
              )}
            </div>

            {/* COSTS */}
            <div className="space-y-3 text-sm text-gray-300 mb-6 pb-6 border-b border-gray-700">
              <div className="flex justify-between">
                <span>Produkte</span>
                <span className="text-white">{formatPrice(financials.subtotal)}</span>
              </div>

              {financials.frontDesignCost > 0 && (
                <div className="flex justify-between">
                  <span>Individuelle Designs</span>
                  <span className="text-white">{formatPrice(financials.frontDesignCost)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Rückseite</span>
                <span className="text-white">{formatPrice(financials.backCost)}</span>
              </div>

              <div className="flex justify-between">
                <span>Personalisierung</span>
                <span className="text-white">{formatPrice(financials.persoCost)}</span>
              </div>

              {appliedDiscount && (
                <div className="flex justify-between text-green-400">
                  <span>Rabatt</span>
                  <span>-{formatPrice(appliedDiscount.amount)}</span>
                </div>
              )}
            </div>

            {/* TOTAL */}
            <div className="flex justify-between items-end mb-8">
              <div>
                <div className="text-sm text-gray-400">Gesamtsumme (Brutto)</div>
                <div className="text-3xl font-extrabold text-orange-400">
                  {formatPrice(financials.grossTotal - (appliedDiscount?.amount || 0))}
                </div>
              </div>
            </div>

            {/* SUBMIT */}
            <Button
              variant="success"
              className="w-full h-auto py-4 flex-col items-center gap-1"
              disabled={
                !userData.firstName ||
                !userData.lastName ||
                !userData.city ||
                !userData.address ||
                !userData.underAge ||
                !userData.postalCode ||
                !userData.houseNumber ||
                userData.email !== userData.confirmEmail ||
                (userData.sendWhatsappPreview && userData.phone !== userData.confirmPhone)
              }
              onClick={handleCheckoutSubmit}
            >
              <div className="flex items-center gap-2 text-lg">
                <CreditCard size={20} /> Jetzt bestellen
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  if (isPending) {
    return (
      <div className="min-h-screen fixed inset-0 bg-[#00000066] flex items-center justify-center z-100 text-white">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-8 h-8 animate-spin"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background circle */}
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="#E5E7EB" // Tailwind gray-200
            />

            {/* Moving arc */}
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="#000000" // BLACK spinner
            />
          </svg>

          <span className="sr-only">Loading...</span>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 pb-24 md:pb-0 overflow-x-hidden">
      {/* <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-xl tracking-tighter">
            <div className="bg-orange-600 text-white p-1.5 rounded-lg">
              <Shirt size={20} />
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              Abschlussklamotten<span className="text-orange-600">.de</span>
            </span>
          </div>
          <div className="hidden md:flex gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`flex items-center gap-2 text-sm font-bold ${step >= i ? "text-orange-600" : "text-gray-300"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step >= i ? "border-orange-600 bg-orange-50" : "border-gray-200"}`}>
                  {step > i ? <Check size={12} /> : i}
                </div>
                {i === 1 && "Produkte"}{i === 2 && "Design"}{i === 3 && "Rückseite"}{i === 4 && "Perso"}{i === 5 && "Checkout"}
              </div>
            ))}
          </div>
          <div className="w-8"></div>
        </div>
      </nav> */}

      <main className="max-w-5xl mx-auto px-4 py-8 overflow-y-auto">
        <div className="flex justify-between bg-white/90 backdrop-blur-md border-b border-gray-100 p-3 mb-6 sticky top-0 z-20 shadow-sm rounded-xl -mx-2 sm:mx-0">
          <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-600">
            {totalQty > 0 && (
              <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-2.5 py-1.5 rounded-full border border-orange-100">
                <ShoppingBag size={12} /> {totalQty} Teile
              </div>
            )}
            {category && (
              <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1.5 rounded-full">
                <Star size={12} className="text-orange-500" /> {category}
              </div>
            )}
            {frontDesignType && (
              <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1.5 rounded-full">
                <Palette size={12} className="text-orange-500" />{" "}
                {designMode === "mixed"
                  ? "Verschiedene Motive"
                  : selectedDesign?.title ? selectedDesign.title : selectedDesign || (frontDesignType === "Upload" ? "Eigener Upload" : "Design")}
              </div>
            )}
          </div>

          <div className="hidden md:flex gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`flex items-center gap-2 text-sm font-bold ${step >= i ? "text-orange-600" : "text-gray-300"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step >= i ? "border-orange-600 bg-orange-50" : "border-gray-200"}`}>
                  {step > i ? <Check size={12} /> : i}
                </div>
                {i === 1 && "Produkte"}{i === 2 && "Design"}{i === 3 && "Rückseite"}{i === 4 && "Perso"}{i === 5 && "Checkout"}
              </div>
            ))}
          </div>

        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
        <div ref={bottomRef} />
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-40 flex items-center justify-between md:max-w-5xl md:mx-auto md:left-1/2 md:-translate-x-1/2 md:bottom-6 md:rounded-2xl md:shadow-2xl md:border-none">
        <div
          className="flex flex-col cursor-pointer hover:opacity-70 transition-opacity group"
          onClick={() => setShowCartDetails(true)}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold uppercase">Gesamtpreis</span>
            <span className="text-[10px] text-orange-600 font-bold cursor-pointer hover:underline">
              Details anzeigen
            </span>
          </div>
          <span className="text-xl font-black text-gray-900">{formatPrice(financials.grossTotal)}</span>
        </div>
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          {step < 5 && (
            <button
              onClick={() => {
                if (step === 1 && totalQty > 0) setStep(2)
                else if (step !== 1) setStep(step + 1)
              }}
              disabled={step === 1 && totalQty === 0}
              className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-200"
            >
              Weiter <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
       {activeProduct ? 
      <ProductConfigPanel
        activeProduct={activeProduct}
        isPanelOpen={isPanelOpen}
        setIsPanelOpen={setIsPanelOpen}
        addCartItem={addCartItem}
        productTotalQtyInCart={activeProduct ? productCounts[activeProduct.id] || 0 : 0}
        currentTotalQty={totalQty}
      />:null}
      <CartDetailsModal
        show={showCartDetails}
        onClose={setShowCartDetails}
        cart={cart}
        totalQty={totalQty}
        productCounts={productCounts}
        config={{
          category,
          frontDesignType,
          selectedDesign,
          designNote,
          designMode,
          individualDesigns,
          backType,
          backList,
          hasPerso,
          persoPositions,
          uploadedFile,
          backDetails,
          backNote
        }}
        onClearData={clearAllData}
      />
      <HelpModal isOpen={showHelp !== null} onClose={() => setShowHelp(null)} step={showHelp} />

      {/* Individual Design Modal */}
      <DesignConfigModal
        isOpen={editingDesignId}
        onClose={() => setEditingDesignId(null)}
        product={
          editingDesignId ? cart.find(c => c.productId === editingDesignId)?.productId : null
        }
        initialData={editingDesignId ? individualDesigns[editingDesignId] : null}
        onSave={handleSaveIndividualDesign}
        category={category}
      />

      {/* Personalization Config Modal (for Step 4) */}
      <PersoConfigModal
        isOpen={isPersoModalOpen}
        onClose={() => setIsPersoModalOpen(false)}
        positions={persoPositions}
        cart={cart}
        initialPersoData={persoData}
        onSavePerso={setPersoData}
      />
    </div>
  )
}
