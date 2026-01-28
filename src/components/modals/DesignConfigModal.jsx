import { X } from "lucide-react"
import { useEffect, useState } from "react"
import DesignSelectionUI from "../steps/step2/DesignSelectionUI"
import Button from "../ui/Button"
import consumeContext from "../../context/context"

const DesignConfigModal = ({ isOpen, onClose, product, initialData, onSave, category }) => {
  const { file, setFile } = consumeContext();
  // Local state for the modal
  const [type, setType] = useState(initialData?.type || null)
  const [design, setDesign] = useState(initialData?.design || null)
  const [note, setNote] = useState(initialData?.note || "")

  useEffect(() => {
    if (isOpen) {
      setType(initialData?.type || null)
      setDesign(initialData?.design || null)
      setFile(initialData?.file || null)
      setNote(initialData?.note || "")
    }
  }, [isOpen, initialData])

  const handleSave = () => {
    onSave({ type, design, file, note })
    onClose()
  }

  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 z-70 flex justify-end transition-opacity duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
          <div>
            <h3 className="font-bold text-xl text-gray-900">Design anpassen</h3>
            <div className="text-sm text-gray-500">{product.name}</div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-sm text-indigo-800">
            Hier wählst du das Motiv speziell für diesen Artikel aus.
          </div>

          <DesignSelectionUI
            category={category}
            currentType={type}
            setType={setType}
            currentDesign={design}
            setDesign={setDesign}
            currentFile={file}
            setFile={setFile}
            currentNote={note}
            setNote={setNote}
          />
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <Button onClick={handleSave} className="w-full">
            Speichern
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DesignConfigModal
