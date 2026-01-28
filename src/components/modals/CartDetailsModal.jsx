import { ChevronLeft, EyeIcon, X, Trash2, AlertTriangle } from "lucide-react"
import PRODUCTS from "../../constants/product"
import { formatPrice } from "../../utils/helpers"
import { useState } from "react"

const CartDetailsModal = ({ show, onClose, cart, totalQty, config, productCounts, onClearData }) => {
  const [previewImage, setPreviewImage] = useState(null)
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  
  if (!show) return null
  
  const handleResetClick = () => {
    setShowConfirmReset(true)
  }
  
  const handleConfirmReset = () => {
    onClearData()
    setShowConfirmReset(false)
    onClose(false)
  }
  
  return (
    <>
      {/* Confirmation Dialog for Reset */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-80 flex items-center justify-center p-4 animate-in fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowConfirmReset(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Alle Daten löschen?</h3>
                <p className="text-sm text-gray-600">
                  Diese Aktion löscht alle gespeicherten Daten einschließlich Warenkorb, Designs und Konfigurationen. 
                  Dies kann nicht rückgängig gemacht werden.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
              >
                Ja, alles löschen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 animate-in fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setPreviewImage(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-lg">Artwork Vorschau</h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-2 hover:bg-gray-100 cursor-pointer rounded-full transition-colors"
              >
                <ChevronLeft size={20} title="back" className="cursor-pointer"/>
              </button>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
              <img src={previewImage} alt="Artwork Preview" className="w-full max-h-53.75 object-contain rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Main Cart Details Modal */}
      <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-4 sm:p-0">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onClose(false)}></div>
        <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-lg">Deine Konfiguration</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleResetClick}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors group cursor-pointer"
                title="Alle Daten löschen"
              >
                <Trash2 size={18} className="text-gray-400 group-hover:text-red-600" />
              </button>
              <button onClick={() => onClose(false)} className="p-2 hover:bg-gray-200 rounded-full">
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="p-6 overflow-y-auto space-y-6">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Produkte ({totalQty})</h4>
              {cart.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Leer</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, i) => {
                    const prod = PRODUCTS.find(p => p.id === item.productId)
                    const sizeObj = item.sizes || item.bundleSizes?.hoodie || {}
                    const sizeStr = Object.entries(sizeObj)
                      .filter(([_, q]) => q > 0)
                      .map(([s, q]) => `${q}x ${s}`)
                      .join(", ")

                    // Resolve Design Display Text
                    const individual = config.individualDesigns[item.id]
                    let designDisplay = "Standard (Alle gleich)"

                    if (config.designMode === "mixed") {
                      if (individual) {
                        if (individual.type === "Motiv") designDisplay = individual.design?.title ? individual.design.title : individual.design
                        else if (individual.type === "Special") designDisplay = individual.design?.title ? individual.design.title : individual.design
                        else if (individual.type === "Upload") designDisplay = "Eigener Upload"
                        else if (individual.type === "None") designDisplay = "Unbedruckt"
                        else designDisplay = "Nicht gewählt"

                        if (individual.note) designDisplay += ` (${individual.note})`
                      } else {
                        designDisplay = "Nicht gewählt"
                      }
                    } else {
                      const globalType = config.frontDesignType
                      const globalDesign = config.selectedDesign?.title ? config.selectedDesign.title : config.selectedDesign
                      designDisplay = `${globalDesign || globalType || "Standard"}`
                    }

                    return (
                      <div key={i} className="bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                        <div className="flex gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-md ${item.color} shadow-inner shrink-0`}></div>
                          <div>
                            <div className="font-bold text-sm">{prod.name}</div>
                            <div className="flex items-center justify-between gap-4 mt-1">
                              <div className="flex items-center gap-5">
                                <div className="text-xs text-gray-500">{sizeStr}</div>
                                <span className="text-xs/5 font-medium text-red-600">
                                  Price: {formatPrice(item.productPrice)}
                                </span>
                              </div>
                              {individual?.file?.data && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage(individual.file.data)}
                                  className="text-xs/5 flex items-center gap-1 cursor-pointer font-medium border-0 outline-0 ring-0 text-black px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                  <EyeIcon className="size-4 text-black" /> Preview Artwork
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs bg-gray-50 p-2 rounded border border-gray-200">
                          <span className="font-bold text-gray-600">Druck: </span>
                          <span className={config.designMode === "mixed" ? "text-indigo-600 font-bold" : ""}>
                            {designDisplay} {config.designMode === "mixed" && "(+2€)"}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Back details display */}
            {config.backType && (
              <div className="mt-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Rückseite Extras</h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                  <div>
                    <span className="font-bold">Typ:</span>{" "}
                    {config.backType === "none" ? "Ohne Druck" : config.backType}
                  </div>
                  {config.backDetails?.class && (
                    <div>
                      <span className="font-bold">Klasse:</span> {config.backDetails.class}
                    </div>
                  )}
                  {config.backDetails?.teacher && (
                    <div>
                      <span className="font-bold">Lehrer:</span> {config.backDetails.teacher}
                    </div>
                  )}
                  {config.backDetails?.school && (
                    <div>
                      <span className="font-bold">Schule:</span> {config.backDetails.school}
                    </div>
                  )}
                  {config.backNote && (
                    <div>
                      <span className="font-bold">Anmerkung:</span> {config.backNote}
                    </div>
                  )}
                  {!config.backDetails?.class &&
                    !config.backDetails?.teacher &&
                    !config.backDetails?.school &&
                    !config.backNote && <div className="text-gray-400 italic">Keine Zusatzinfos</div>}
                </div>
              </div>
            )}

            {/* Data Management Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Datenverwaltung</h4>
              <button
                onClick={handleResetClick}
                className="w-full flex items-center justify-center cursor-pointer gap-2 px-4 py-3 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors border border-red-200"
              >
                <Trash2 size={18} />
                Alle gespeicherten Daten löschen
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Löscht Warenkorb, Designs und alle Konfigurationen
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CartDetailsModal