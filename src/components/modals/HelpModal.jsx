import { HelpCircle, X } from "lucide-react"
import STEP_HELP_TEXTS from "../../constants/stepHeltTexts"

const HelpModal = ({ isOpen, onClose, step }) => {
  if (!isOpen) return null
  const content = STEP_HELP_TEXTS[step] || { title: "Hilfe", text: "Keine Information verfügbar." }

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full relative z-10 animate-in zoom-in-95">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        <div className="flex items-center gap-3 mb-4 text-orange-600">
          <HelpCircle size={24} />
          <h3 className="font-bold text-lg">{content.title}</h3>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">{content.text}</p>
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-700 transition-colors"
        >
          Verstanden
        </button>
      </div>
    </div>
  )
}

export default HelpModal
