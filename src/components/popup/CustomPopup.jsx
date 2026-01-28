import { Check, X } from "lucide-react"

const CustomPopup = ({ isOpenSuccess = false, setIsOpenSuccess = () => {} }) => {
  return (
    <div
      className={`${
        isOpenSuccess ? "flex" : "hidden"
      } w-full inset-0 z-100 custom-popup items-center justify-center fixed min-h-screen bg-black/40`}
    >
      <div className="space-y-6 animate-in slide-in-from-right duration-500 max-w-md w-full rounded-xl bg-white p-4">
        <div className="flex justify-between items-start">
          <h2 className="text-3xl font-extrabold text-black mb-2"></h2>
          {/* <button
            onClick={() => setIsOpenSuccess(false)}
            className="text-gray-400 hover:text-orange-600 cursor-pointer"
          >
            <X size={24} />
          </button> */}
        </div>
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in">
            <Check size={40} strokeWidth={3} />
          </div>
          <p className="text-green-600 font-medium text-xl/7 text-center">Thanks for your Order</p>
        </div>
      </div>
    </div>
  )
}

export default CustomPopup
