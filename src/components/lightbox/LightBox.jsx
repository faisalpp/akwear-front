const LightBox = ({ uploadedFile, currentFile = null }) => {
  const fileToShow = uploadedFile?.data || currentFile?.data
  if (!fileToShow) return null

  return (
    <div className="border bg-gray-100/60 mt-3 border-gray-200 rounded-xl p-4 max-h-62.5 overflow-hidden">
      <img src={fileToShow} alt="Uploaded" className="w-full max-h-53.75 object-contain rounded-lg" />
    </div>
  )
}

export default LightBox
