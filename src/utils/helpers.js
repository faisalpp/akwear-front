const APP_BASE_URL = document.location.origin

const formatPrice = price => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(price)
const getTierIndex = qty => {
  if (qty >= 60) return 2
  if (qty >= 10) return 1
  return 0
}
const convertToBase64 = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

// Color mapping object
const TAILWIND_TO_HEX = {
  'bg-black': '#000000',
  'bg-white': '#ffffff',
  'bg-gray-200': '#e5e7eb',
  'bg-gray-400': '#9ca3af',
  'bg-gray-500': '#6b7280',
  'bg-gray-800': '#1f2937',
  'bg-gray-900': '#111827',
  'bg-stone-200': '#e7e5e4',
  'bg-stone-400': '#a8a29e',
  'bg-stone-500': '#78716c',
  'bg-slate-700': '#334155',
  'bg-slate-800': '#1e293b',
  'bg-red-800': '#991b1b',
  'bg-blue-400': '#60a5fa',
  'bg-blue-900': '#1e3a8a',
  'bg-indigo-900': '#312e81',
  'bg-green-800': '#166534',
  'bg-emerald-900': '#064e3b',
  'bg-pink-400': '#f472b6',
  'bg-yellow-400': '#facc15',
  'bg-navy-900': '#001f3f',
  'bg-maroon-800': '#7f1d1d'
};

const convertColorToHex = (tailwindColor) => {
  return TAILWIND_TO_HEX[tailwindColor] || tailwindColor;
};

export { APP_BASE_URL, formatPrice, getTierIndex, convertToBase64 , TAILWIND_TO_HEX, convertColorToHex };
