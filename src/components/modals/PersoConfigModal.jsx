import { AlertCircle, Info, Plus, Trash2, X } from "lucide-react"
import { formatPrice } from "../../utils/helpers"
import Button from "../ui/Button"
import { useEffect, useMemo, useState } from "react"
import Input from "../ui/Input"

const PersoConfigModal = ({ isOpen, onClose, positions, cart, initialPersoData, onSavePerso }) => {
  // Calculate available slots per product/size combo
  const availableSlots = useMemo(() => {
    const slots = {}
    cart.forEach(item => {
      // Get product info directly from cart item instead of PRODUCTS array
      const productName = item.title || "Unbekanntes Produkt"
      const itemSizes = item.sizes || {}

      Object.entries(itemSizes)
        .filter(([_, qty]) => qty > 0)
        .forEach(([size, qty]) => {
          const key = `${item.id}-${size}`
          const existingCount = initialPersoData[key]?.length || 0

          if (qty > existingCount) {
            slots[key] = {
              cartId: item.id,
              size: size, 
              maxQty: qty,
              usedQty: existingCount,
              productName: productName,
              color: item.color,
              displayLabel: `${productName} (${size}) [Noch ${qty - existingCount} frei]`
            }
          }
        })
    })

    // Sort keys for predictable dropdown order
    return Object.fromEntries(Object.entries(slots).sort((a, b) => a[0].localeCompare(b[0])))
  }, [cart, initialPersoData])

  const [nameInput, setNameInput] = useState("")
  // Initialize selectedSizeKey to the first available slot key
  const [selectedSizeKey, setSelectedSizeKey] = useState(Object.keys(availableSlots)[0] || "")

  // Calculate total names currently stored globally
  const totalPersoCount = useMemo(() => {
    return Object.values(initialPersoData).flatMap(arr => arr.filter(name => name.trim().length > 0)).length
  }, [initialPersoData])

  // Flatten and sort the list of currently entered names for display
  const currentList = useMemo(() => {
    return Object.entries(initialPersoData)
      .flatMap(([key, names]) => {
        const [cartId, size] = key.split("-")
        const item = cart.find(c => c.id === cartId)
        
        // Get product name from cart item instead of PRODUCTS
        const productName = item?.productTitle || item?.title || "Unbekanntes Produkt"

        return names.map((name, index) => ({
          id: `${key}-${index}`,
          name,
          size,
          productName: productName,
          key: key,
          index: index
        }))
      })
      .sort((a, b) => a.productName.localeCompare(b.productName) || a.size.localeCompare(b.size))
  }, [initialPersoData, cart])

  // --- HANDLERS ---

  useEffect(() => {
    // Update dropdown value if previous slot became full
    if (isOpen && !availableSlots[selectedSizeKey] && Object.keys(availableSlots).length > 0) {
      setSelectedSizeKey(Object.keys(availableSlots)[0])
    } else if (isOpen && !selectedSizeKey && Object.keys(availableSlots).length > 0) {
      setSelectedSizeKey(Object.keys(availableSlots)[0])
    }
  }, [isOpen, availableSlots, selectedSizeKey])

  const handleAddName = () => {
    const name = nameInput.trim()
    const key = selectedSizeKey

    if (!name || !key) return

    const targetDetail = availableSlots[key]

    if (!targetDetail) return

    const currentNames = initialPersoData[key] || []

    if (currentNames.length < targetDetail.maxQty) {
      const newNames = [...currentNames, name]

      // Create a new version of the initialPersoData state map
      const newPersoData = {
        ...initialPersoData,
        [key]: newNames
      }

      onSavePerso(newPersoData)
      setNameInput("")
    }
  }

  const handleDeleteName = (key, indexToDelete) => {
    const currentNames = initialPersoData[key] || []
    const newNames = currentNames.filter((_, index) => index !== indexToDelete)

    const newPersoData = { ...initialPersoData }
    if (newNames.length === 0) {
      delete newPersoData[key]
    } else {
      newPersoData[key] = newNames
    }

    onSavePerso(newPersoData)
    // After deletion, the slot should appear in dropdown again
    if (newNames.length < (availableSlots[key]?.maxQty || Infinity) && !selectedSizeKey) {
      setSelectedSizeKey(key)
    }
  }

  if (!isOpen) return null

  // Determine if the currently selected size slot is full
  const selectedItemInfo = selectedSizeKey ? availableSlots[selectedSizeKey] : null
  const isSlotFull = selectedItemInfo ? selectedItemInfo.maxQty <= selectedItemInfo.usedQty : false
  const isAnySlotAvailable = Object.keys(availableSlots).length > 0

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col z-10 animate-in zoom-in-95">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-xl text-gray-900">Namen pro Artikel eintragen</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl flex items-start gap-3">
            <Info className="text-orange-600 shrink-0 mt-1" size={18} />
            <div className="text-sm text-orange-800">
              Fügen Sie Namen einzeln hinzu, indem Sie das Produkt und die Größe auswählen. Kosten: {formatPrice(2.0)}{" "}
              pro Namen.
            </div>
          </div>

          {positions.length === 0 && (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 font-medium">
              <AlertCircle size={16} className="inline mr-2" /> **Achtung:** Bitte wählen Sie zuerst eine Position im
              Hauptmenü (z.B. "Ärmel L") aus.
            </div>
          )}

          <div className="bg-gray-100 p-4 rounded-xl space-y-4 shadow-inner">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Input Feld */}
              <div className="md:col-span-1">
                <Input
                  label="Name oder Spitzname"
                  placeholder="z.B. Maxi Mustermann"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  disabled={!isAnySlotAvailable || !selectedSizeKey || isSlotFull}
                />
              </div>

              {/* Select Feld */}
              <div className="flex flex-col gap-1.5 w-full md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Produkt & Größe</label>
                <select
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 disabled:bg-gray-200"
                  value={selectedSizeKey}
                  onChange={e => setSelectedSizeKey(e.target.value)}
                  disabled={!isAnySlotAvailable}
                >
                  <option value="" disabled>
                    {isAnySlotAvailable ? "--- Größe & Produkt wählen ---" : "Alle Slots belegt"}
                  </option>
                  {Object.entries(availableSlots).map(([stableKey, detail]) => (
                    <option key={stableKey} value={stableKey}>
                      {detail.productName} ({detail.size}) [Noch {detail.maxQty - detail.usedQty} frei]
                    </option>
                  ))}
                </select>

                {selectedItemInfo && selectedItemInfo.maxQty <= selectedItemInfo.usedQty && (
                  <p className="text-xs text-red-600 font-bold ml-1 mt-1">
                    Maximal {selectedItemInfo.maxQty} Namen für diesen Slot ({selectedItemInfo.size}) erreicht.
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={handleAddName}
              className="w-full"
              variant="primary"
              disabled={!nameInput.trim() || !selectedSizeKey || isSlotFull || !isAnySlotAvailable}
            >
              <Plus size={20} /> Namen zur Liste hinzufügen
            </Button>

            {Object.keys(availableSlots).length === 0 && currentList.length > 0 && (
              <p className="text-sm text-green-600 text-center font-bold">
                Alle {currentList.length} Personaliserungs-Slots sind belegt.
              </p>
            )}
            {currentList.length === 0 && !isAnySlotAvailable && (
              <p className="text-sm text-gray-500 text-center">
                Keine Artikel im Warenkorb, die personalisiert werden können.
              </p>
            )}
          </div>

          {/* Liste der eingetragenen Namen */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <h4 className="font-bold text-md text-gray-700">Eingetragene Namen ({currentList.length}):</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {currentList.length === 0 && (
                <div className="text-center text-gray-400 italic py-4">
                  Noch keine Namen zur Personalisierung eingetragen.
                </div>
              )}
              {currentList.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm"
                >
                  <div className="flex-1">
                    <div className="font-bold">{item.name}</div>
                    <div className="text-xs text-gray-500">
                      {item.productName} ({item.size})
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteName(item.key, item.index)}
                    className="text-red-500 hover:text-red-700 p-1 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-white">
          <div className="flex justify-between items-center text-lg font-bold mb-4">
            <span>Gesamt ({totalPersoCount} Namen):</span>
            <span className="text-orange-600">{formatPrice(totalPersoCount * 2.0)}</span>
          </div>
          <Button onClick={onClose} className="w-full" variant="secondary">
            Fertig
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PersoConfigModal