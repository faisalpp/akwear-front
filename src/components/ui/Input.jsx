const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">{label}</label>}
    <input 
      className="w-full p-3 text-black bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white focus:border-orange-500 transition-all outline-none font-medium shadow-sm disabled:bg-gray-100 disabled:text-gray-400" 
      {...props} 
    />
  </div>
);

export default Input;