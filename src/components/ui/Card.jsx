import { Check } from "lucide-react"

const Card = ({ selected, onClick, children, className = "" }) => (
  // console.log("Rendering Card:", { selected, className }),
  <div
    onClick={onClick}
    className={`
      cursor-pointer rounded-2xl p-5 transition-all duration-300 relative overflow-hidden group
      ${
        selected
          ? "ring-4 ring-orange-500/20 border-orange-600 bg-orange-50/50 shadow-xl scale-[1.01]"
          : "border border-gray-100 bg-white shadow-md hover:shadow-lg hover:-translate-y-1"
      }
      ${className}
    `}
  >
    {selected && (
      <div className="absolute top-3 right-3 bg-orange-600 text-white rounded-full p-1 shadow-sm z-10 animate-in fade-in zoom-in">
        <Check size={14} strokeWidth={3} />
      </div>
    )}
    {children}
  </div>
)

export default Card
