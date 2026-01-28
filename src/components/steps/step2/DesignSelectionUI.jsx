import { Check, Edit3, HelpCircle, ImageIcon, Palette, Pencil, Search, Star, Upload, X } from "lucide-react"
import Input from "../../ui/Input"
import React, { useEffect, useState} from "react"
import consumeContext from "../../../context/context"
import { APP_BASE_URL, convertToBase64 } from "../../../utils/helpers"
import LightBox from "../../lightbox/LightBox"

const validImgFile = [".png", ".jpg", ".jpeg", ".webp"]

const DesignSelectionUI = ({
  category,
  currentType,
  setType,
  currentDesign,
  setDesign,
  currentFile,
  setFile,
  currentNote,
  setNote,
  allCollections,
  step
}) => {
  const { setShowHelp, uploadedFile } = consumeContext()
  const [searchTerm, setSearchTerm] = useState("") // NEU: Suchbegriff
  const designTypes = [
    {
      id: "Motiv",
      label: "Motiv Katalog",
      sub: "Vorlagen",
      icon: <Palette />,
      colorClass: "bg-blue-100 text-blue-600"
    },
    {
      id: "Special",
      label: "Special Styles",
      sub: "Bitmoji...",
      icon: <Star />,
      colorClass: "bg-purple-100 text-purple-600"
    },
    {
      id: "Upload",
      label: "Eigener Upload",
      sub: "Logo / Datei",
      icon: <Upload />,
      colorClass: "bg-green-100 text-green-600"
    },
    { id: "None", label: "Unbedruckt", sub: "Nur Textil", icon: <X />, colorClass: "bg-gray-100 text-gray-600" }
  ]

  // Bestimmen, ob eine detaillierte Auswahl getroffen wurde
  const isDetailedSelection = currentDesign || currentFile || currentType === "None"
  const handleFileUpload = e => {
    console.log(currentType)
    const file = e.target.files[0]
    const fileExt = file ? `.${file.name.split(".").pop().toLowerCase()}` : ""
    if (file && validImgFile.includes(fileExt)) {
      convertToBase64(file)
        .then(imgBase64 => {
          if (imgBase64) {
            setFile({ name: file.name, data: imgBase64 })
            setDesign({title:file.name, name: file.name, image: imgBase64,type: currentType })
          }
        })
        .catch(err => {
          console.error("Fehler beim Konvertieren der Datei:", err)
        })
    } else {
      alert("Bitte eine gültige Bilddatei hochladen (png, jpg, jpeg, webp).")
    }
  }

  const handleReset = () => {
    setType(null)
    setDesign(null)
    setFile(null)
  }

  // const ImagePreview = () => {
  //   const fileToShow = uploadedFile?.data || currentFile?.data
  //   if (!fileToShow) return null

  //   return (
  //     <div className="border bg-gray-100/60 mt-3 border-gray-200 rounded-xl p-4 max-h-62.5 overflow-hidden">
  //       <img src={fileToShow} alt="Uploaded" className="w-full max-h-53.75 object-contain rounded-lg" />
  //     </div>
  //   )
  // }

     const [allMotives,setAllMotives] = useState([]);
     const [visibleCount,setVisibleCount] = useState(6);
     const [loading,setLoading] = useState(true);

     async function  fetchMotives() {
      setAllMotives([]);
      setLoading(true);
      if(!category){
        setLoading(false)
        return
      };
      let AllCollections = allCollections;
      let fCol = null;
      if(AllCollections){
       fCol = AllCollections.find(col => col.title === category);
      }else{
       const savedData = JSON.parse(localStorage.getItem("abschlussklamotten_data"))
       fCol = savedData.allCollections.find(col => col.title === category);
      }
      console.log(fCol)
      if(!fCol){ 
        setLoading(false)
        return
      };
     const r = await fetch(`https://dev.hamzadeveloper.com/api/abschlussklamotten/products?collection_id=${fCol.id.split('/').pop()}`, {
         headers: {"Content-Type": "application/json" },
       });
       const data = await r.json();
       if(data.status){
         setAllMotives(data.products);
        }else{
          setAllMotives([]);
        }
        setLoading(false);
       console.log("Raw motives data from Shopify API:", data);
    }
  
   useEffect(() => {
     //   // if(step !== 2 && subStep !== 'B') return;
     //    // Fetch collections or any other initial data here if needed
     fetchMotives()
    }, [category, allCollections])

  //  fetchMotives()

  // Komponente für die kompakte Anzeige
  const CompactSelection = () => {
    let display = "Nicht gewählt"
    let icon = <Pencil size={18} />

    if (currentDesign) {
      display = currentDesign?.title ? currentDesign.title : currentDesign
      icon = currentType === "Special" ? <Star size={18} /> : <Palette size={18} />
    } else if (currentFile) {
      display = currentFile?.name ?? "Eigener Upload"
      icon = <ImageIcon size={18} />
    } else if (currentType === "None") {
      display = "Unbedruckt"
      icon = <X size={18} />
    }

    return (
      <>
        <div
          onClick={handleReset}
          className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-orange-600 shadow-md cursor-pointer transition-all hover:bg-orange-50"
        >
          <div className="flex items-center gap-3">
            <span className="text-orange-600">{icon}</span>
            <span className="font-bold text-gray-800 text-ellipsis overflow-hidden whitespace-nowrap">
              {display?.title ? display.title : display}
            </span>
          </div>
          <button className="text-sm text-orange-600 font-bold flex items-center gap-1 cursor-pointer">
            <Edit3 size={16} /> Ändern
          </button>
        </div>
        <LightBox uploadedFile={uploadedFile} currentFile={currentFile} />
      </>
    )
  }

  return (
    <div className="space-y-6">
      {isDetailedSelection ? (
        <CompactSelection />
      ) : (
        <>
          {/* Type Selection */}
          <div
            className={`grid gap-3 transition-all duration-500 ease-in-out ${
              !currentType ? "grid-cols-1 md:grid-cols-2" : "grid-cols-4"
            }`}
          >
            {designTypes.map(type => {
              const isSelected = currentType === type.id
              const opacityClass = currentType && !isSelected ? "opacity-40 hover:opacity-100 scale-95" : "opacity-100"

              return (
                <div
                  key={type.id}
                  onClick={() => {
                    setType(type.id)
                    setDesign(null)
                  }}
                  className={`
                    cursor-pointer rounded-2xl border transition-all duration-300 relative overflow-hidden group
                    ${
                      isSelected
                        ? "ring-4 ring-orange-500/20 border-orange-600 bg-orange-50/50 shadow-lg scale-[1.01]"
                        : "border-gray-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-1"
                    }
                    ${!currentType ? "p-5" : "p-2"} ${opacityClass}
                  `}
                >
                  {!currentType ? (
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${type.colorClass}`}>{type.icon}</div>
                      <div className="text-left">
                        <div className="font-bold text-lg">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.sub}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1 text-center h-full">
                      <div className={`p-1.5 rounded-lg ${type.colorClass} ${isSelected ? "scale-110" : ""}`}>
                        {React.cloneElement(type.icon, { size: 18 })}
                      </div>
                      <div className="text-[10px] font-bold leading-tight hidden md:block">{type.label}</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Detailed Input Area (Visible when a type is selected, before a design is chosen) */}
          {currentType && !isDetailedSelection && (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-300 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 bg-gray-50">
                {currentType === "Motiv" && (
                  <div className="flex flex-col gap-5" >
                    <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
                      <h4 className="font-bold flex items-center gap-2">
                        <Palette size={18} className="text-orange-600" />
                        {`Motive für ${category}`}
                        <button
                          onClick={() => setShowHelp("Motiv")}
                          className="text-gray-400 hover:text-orange-600 ml-2"
                        >
                          <HelpCircle size={18} />
                        </button>
                      </h4>

                      <div className="relative w-full max-w-sm">
                        <Input
                          placeholder="Motiv suchen (z.B. 'Motiv 3')"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>

                    {/* HINWEIS: Hier ist der Fehler, der in der vorherigen Version korrigiert wurde */}
                    <div className="grid lg:grid-cols-4 grid-cols-2 md:grid-cols-2 gap-3 place-content-center place-items-center animate-in slide-in-from-bottom-2">
                      {loading ? <div className="text-orange-500 col-span-full text-center" >
                        Lade Motive...
                      </div> : allMotives?.length > 0 ?
                        allMotives.slice(0, visibleCount).filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(m => (
                          m.featuredImage?.url ? (
                          <div key={m.id} onClick={() => setDesign({title:m.title,image:m.featuredImage.url})} className="aspect-square max-w-[220px] bg-white rounded-xl border-2 border-gray-200 flex items-center overflow-hidden justify-center cursor-pointer hover:border-orange-300 transition-all active:scale-95 group">
                            <img src={m.featuredImage.url.replace(/(\.[^.]+)(\?.*)?$/, '_x300$1$2')} alt="img" className="w-full h-full object-cover"/>
                          </div>
                         ): null
                        )): (<div className="text-red-500 col-span-full text-center">Keine Motive gefunden.</div>
                      )}
                    </div>
                    {!loading && allMotives.length > 6 ? <div className="flex justify-center h-10 mt-5" >{visibleCount > 6 ? <button className="px-6 py-3 text-orange-600 border-2 border-orange-500 rounded-xl font-bold flex items-center gap-2 cursor-pointer" onClick={() => setVisibleCount(visibleCount === 6 ? allMotives.length : 6)} >Show less designs</button> : <button className="px-6 py-3 text-orange-600 border-2 border-orange-500 rounded-xl font-bold flex items-center gap-2 cursor-pointer" onClick={() => setVisibleCount(visibleCount === 6 ? allMotives.length : 6)} >Load more designs</button>}</div> : null}
                  </div>
                )}

                {currentType === "Special" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-purple-900 flex items-center gap-2">
                        <Star size={18} /> Special Styles
                      </h4>
                      <button
                        onClick={() => setShowHelp("Special")}
                        className="text-gray-400 hover:text-purple-600 ml-2"
                      >
                        <HelpCircle size={18} />
                      </button>
                    </div>

                    {!currentDesign ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-in slide-in-from-bottom-2">
                        {["Bitmoji", "Stranger Things", "Simpsons", "Disney"].map(style => (
                          <div
                            key={style}
                            onClick={() => setDesign(style)}
                            className="p-3 mb-3 bg-white border-2 border-gray-200 rounded-xl text-center text-xs font-bold cursor-pointer hover:border-purple-300 hover:text-purple-700 transition-all active:scale-95 h-20 flex items-center justify-center"
                          >
                            {style}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 p-4 border border-purple-200 bg-purple-50 rounded-xl animate-in fade-in">
                        <div className="w-16 h-16 bg-white rounded-lg border border-purple-200 flex items-center justify-center shadow-sm">
                          <Star size={24} className="text-purple-500" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-lg">{currentDesign?.title ? currentDesign.title : currentDesign}</div>
                          <div className="text-xs text-purple-700 font-medium">Style ausgewählt</div>
                        </div>
                        <div className="ml-auto bg-green-100 text-green-600 p-2 rounded-full">
                          <Check size={20} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentType === "Upload" && (
                  <div>
                    {!currentFile ? (
                      <div className="border-2 border-dashed border-gray-300 bg-white rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 transition-colors relative group animate-in zoom-in-95">
                        <Upload size={24} className="text-gray-400 mb-2 group-hover:text-orange-500" />
                        <span className="font-bold text-gray-700 group-hover:text-orange-600">Hier Datei ablegen</span>
                        <input
                          type="file"
                          id="fileUpload"
                          accept=".png, .jpg, .jpeg, .webp"
                          hidden
                          onChange={handleFileUpload}
                        />
                        {/* Mock Upload Click */}
                        <label htmlFor="fileUpload" className="absolute inset-0"></label>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 p-4 border border-green-200 bg-green-50 rounded-xl animate-in fade-in relative">
                        <div className="w-16 h-16 bg-white rounded-lg border border-green-200 flex items-center justify-center shadow-sm overflow-hidden p-2">
                          <ImageIcon className="text-green-500 w-full h-full" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">Eigene Datei</div>
                          <div className="text-xs text-green-700 font-medium">Erfolgreich hochgeladen</div>
                        </div>
                        <button
                          onClick={() => setFile(null)}
                          className="ml-auto text-xs font-bold text-gray-500 hover:text-red-500 bg-white px-3 py-2 rounded-lg border border-gray-200 hover:border-red-200 transition-colors"
                        >
                          Löschen
                        </button>
                        <LightBox uploadedFile={uploadedFile} currentFile={currentFile} />
                      </div>
                    )}
                  </div>
                )}

                {currentType === "Special" && (
                  <div>
                    {!currentFile ? (
                      <div className="border-2 border-dashed border-gray-300 bg-white rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 transition-colors relative group animate-in zoom-in-95">
                        <Upload size={24} className="text-gray-400 mb-2 group-hover:text-orange-500" />
                        <span className="font-bold text-gray-700 group-hover:text-orange-600">Hier Datei ablegen</span>
                        <input
                          type="file"
                          id="fileUpload"
                          accept=".png, .jpg, .jpeg, .webp"
                          hidden
                          onChange={handleFileUpload}
                        />
                        {/* Mock Upload Click */}
                        <label htmlFor="fileUpload" className="absolute inset-0"></label>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 p-4 border border-green-200 bg-green-50 rounded-xl animate-in fade-in relative">
                        <div className="w-16 h-16 bg-white rounded-lg border border-green-200 flex items-center justify-center shadow-sm overflow-hidden p-2">
                          <ImageIcon className="text-green-500 w-full h-full" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">Eigene Datei</div>
                          <div className="text-xs text-green-700 font-medium">Erfolgreich hochgeladen</div>
                        </div>
                        <button
                          onClick={() => setFile(null)}
                          className="ml-auto text-xs font-bold text-gray-500 hover:text-red-500 bg-white px-3 py-2 rounded-lg border border-gray-200 hover:border-red-200 transition-colors"
                        >
                          Löschen
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {currentType === "None" && (
                  <div className="p-6 bg-white rounded-xl border border-gray-200 text-center text-sm text-gray-500 animate-in fade-in">
                    <div className="inline-block p-3 bg-gray-100 rounded-full mb-2">
                      <X size={24} className="text-gray-400" />
                    </div>
                    <div>Dieses Produkt bleibt auf der Vorderseite leer.</div>
                  </div>
                )}

                {/* Note Field - Always visible if a main type is selected */}
                <div className="mt-6 border-t border-gray-100">
                  <Input
                    label="Zusatzwünsche / Text"
                    placeholder="z.b. 'Abi 2025' oder Änderungswunsch..."
                    value={currentNote}
                    onChange={e => setNote(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default DesignSelectionUI
