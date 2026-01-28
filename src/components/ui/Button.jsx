const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const base = "px-6 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm";
  const styles = {
    primary: "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-200",
    secondary: "bg-white text-gray-900 border-2 border-gray-100 hover:border-gray-300 hover:bg-gray-50",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100",
    success: "bg-green-500 text-white hover:bg-green-600"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {children}
    </button>
  );
};

export default Button;