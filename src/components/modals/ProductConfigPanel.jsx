import { useEffect, useState } from "react";
import Button from "../ui/Button";
import { Check, ChevronLeft, X } from "lucide-react";
import { formatPrice, getTierIndex } from "../../utils/helpers";
import { fetchProducts } from "../../api/products";

const ProductConfigPanel = ({
  activeProduct,
  isPanelOpen,
  setIsPanelOpen,
  addCartItem,
  productTotalQtyInCart,
}) => {
  const [localSizes, setLocalSizes] = useState({});
  const [selectedOption, setSelectedOption] = useState(null); // Selected color option
  const [bundleShirtSize, setBundleShirtSize] = useState({});
  const [bundleShirtColor, setBundleShirtColor] = useState(null);
  const [bundleStep, setBundleStep] = useState(1);
  const [priceList, setPriceList] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [customNote, setCustomNote] = useState("");

  useEffect(() => {
    // Guard clause: don't fetch if panel is closed or no product
    if (!isPanelOpen || !activeProduct?.id) {
      // Reset state when panel closes or no product
      setPriceList([]);
      setProductOptions([]);
      setSelectedOption(null);
      setLocalSizes({});
      setBundleShirtSize({});
      setBundleStep(1);
      return;
    }

    const fetchData = async () => {
      try {
        console.log("Fetching product data for ID:", activeProduct.id);
        const productData = await fetchProducts(activeProduct.id);
        console.log(productData);
        if (productData.status && productData.data) {
          setPriceList(productData.data.prices || []);
          setProductOptions(productData.data.options || []);
          setBundleShirtColor(
            productData.data.options && productData.data.options.length > 0
              ? productData.data.options[0].name
              : null,
          );
          // Set first option as default
          if (productData.data.options && productData.data.options.length > 0) {
            setSelectedOption(productData.data.options[0]);
          }

          // Initialize sizes object to empty
          setLocalSizes({});
          setBundleShirtSize({});
          setBundleStep(1);
          setCustomNote("");

          console.log("Fetched product data:", productData);
        } else {
          console.warn("Product fetch returned unsuccessful status or no data");
        }
      } catch (error) {
        console.error("Failed to fetch product data:", error);
        // Reset to safe state on error
        setPriceList([]);
        setProductOptions([]);
        setSelectedOption(null);
      }
    };

    fetchData();
  }, [isPanelOpen, activeProduct?.id]);
  console.log(
    "Rendering ProductConfigPanel with activeProduct:",
    activeProduct,
  );

  const isBundle =
    activeProduct?.product_type.toLowerCase().includes("bundle") ?? false;
  const localQty = Object.values(localSizes).reduce((a, b) => a + Number(b), 0);
  const projectedProductTotal = productTotalQtyInCart + localQty;
  const projectedTierIndex = getTierIndex(projectedProductTotal);

  // Get available sizes from selected option
  const availableSizes = selectedOption?.values || [];

  useEffect(() => {
    if (bundleShirtColor) {
      const shirtOption = productOptions.find(
        (option) => option.name === bundleShirtColor,
      );

      if (shirtOption) {
        console.log("Selected bundle shirt option:", shirtOption);

        setSelectedOption(shirtOption); // ✅ THIS LINE
        setBundleShirtSize({}); // optional but recommended
        setLocalSizes({}); // optional reset
      }
    }
  }, [bundleShirtColor, productOptions]);

  // Early return AFTER all hooks - this is critical for React rules
  if (!activeProduct) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${
        isPanelOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setIsPanelOpen(false)}
      ></div>
      <div
        className={`relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transition-transform duration-300 ${
          isPanelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
          <div>
            <h3 className="font-bold text-xl text-gray-900">
              {activeProduct.title}
            </h3>
            <div className="mt-2 space-y-1">
              {priceList.map((tier, idx) => {
                const isActive = idx === projectedTierIndex;
                const isNext = idx === projectedTierIndex + 1;
                let missing = 0;
                if (isNext && tier.min_quantity) {
                  missing = tier.min_quantity - projectedProductTotal;
                }
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between text-sm ${
                      isActive ? "text-green-600 font-bold" : "text-gray-400"
                    }`}
                  >
                    <span>{`${tier.min_quantity} - ${tier.max_quantity || "∞"}`}</span>
                    <div className="flex items-center gap-2">
                      {isNext && missing > 0 && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                          Noch {missing}
                        </span>
                      )}
                      <span>{formatPrice(tier.price)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => setIsPanelOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="bg-green-50 border border-green-200 p-3 rounded-xl flex items-center gap-3 animate-in fade-in">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <Check size={16} />
            </div>
            <div className="text-sm font-bold text-green-800 leading-tight">
              Mengenrabatte werden für alle Farben dieses Produkts
              zusammengezählt!
            </div>
          </div>

          {isBundle && bundleStep === 2 ? (
            <div className="animate-in slide-in-from-right">
              <button
                onClick={() => setBundleStep(1)}
                className="mb-4 text-sm text-gray-500 flex items-center gap-1 hover:text-orange-600"
              >
                <ChevronLeft size={14} /> Zurück zu Hoodie-Größen
              </button>
              <h4 className="font-bold text-lg mb-4 text-gray-900">
                Größen für Zusatzartikel
              </h4>
              <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-lg mb-6 border border-yellow-200">
                Bitte wähle genau {localQty} Größen für das zweite Teil aus.
              </div>
              <div className="mb-6">
                <h4 className="font-bold text-sm text-gray-500 uppercase mb-3">
                  Farbe (2. Teil)
                </h4>
                <div className="flex flex-wrap gap-3">
                  {productOptions.map((option) =>
                    option.name.startsWith("#") ? (
                      <button
                        key={option.id}
                        onClick={() => setBundleShirtColor(option.name)}
                        style={{ backgroundColor: option.name.split(" - ")[0] }}
                        className={`w-12 h-12 rounded-full shadow-sm ring-offset-2 transition-all ${
                          bundleShirtColor === option.name
                            ? "ring-2 ring-orange-600 scale-110"
                            : "ring-1 ring-gray-200"
                        }`}
                      />
                    ) : (
                      <button
                        key={option.id}
                        onClick={() => setBundleShirtColor(option.name)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          bundleShirtColor === option.name
                            ? "bg-orange-600 text-white ring-2 ring-orange-600 ring-offset-2"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {option.name}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {availableSizes.map((sizeObj) => {
                  const currentBundleQty = Object.values(
                    bundleShirtSize,
                  ).reduce((a, b) => a + b, 0);
                  const val = bundleShirtSize[sizeObj.value] || 0;
                  return (
                    <div
                      key={sizeObj.id}
                      className="bg-gray-50 rounded-lg p-2 flex flex-col items-center border border-gray-200"
                    >
                      <span className="text-xs font-bold text-gray-400 mb-1">
                        {sizeObj.value}
                      </span>
                      <input
                        type="number"
                        min="0"
                        className="w-full text-center bg-transparent font-bold outline-none"
                        value={val || ""}
                        placeholder="0"
                        onChange={(e) => {
                          const newVal = parseInt(e.target.value) || 0;
                          if (currentBundleQty - val + newVal <= localQty) {
                            setBundleShirtSize({
                              ...bundleShirtSize,
                              [sizeObj.value]: newVal,
                            });
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              <div>
                <h4 className="font-bold text-sm text-gray-500 uppercase mb-3">
                  Farbe {isBundle ? "(Hoodie)" : ""}
                </h4>
                <div className="flex flex-wrap gap-3">
                  {productOptions.map((option) =>
                    option.name.startsWith("#") ? (
                      <button
                        title={option.name.split(" - ")[1]}
                        style={{ backgroundColor: option.name.split(" - ")[0] }}
                        key={option.id}
                        onClick={() => setBundleShirtColor(option.name)}
                        className={`w-12 h-12 rounded-full shadow-sm ring-offset-2 transition-all ${
                          bundleShirtColor === option.name
                            ? "ring-2 ring-orange-600 scale-110"
                            : "ring-1 ring-gray-200"
                        }`}
                      />
                    ) : (
                      <button
                        key={option.id}
                        onClick={() => {
                          setSelectedOption(option);
                          setLocalSizes({}); // Reset sizes when changing color
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          selectedOption?.id === option.id
                            ? "bg-orange-600 text-white ring-2 ring-orange-600 ring-offset-2"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {option.name}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-500 uppercase mb-3">
                  Größen {isBundle ? "(Hoodie)" : ""}
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {availableSizes.map((sizeObj) => (
                    <div
                      key={sizeObj.id}
                      className="bg-gray-50 rounded-lg p-2 flex flex-col items-center border border-gray-200"
                    >
                      <span className="text-xs font-bold text-gray-400 mb-1">
                        {sizeObj.value}
                      </span>
                      <input
                        type="number"
                        min="0"
                        className="w-full text-center bg-transparent font-bold outline-none"
                        value={localSizes[sizeObj.value] || ""}
                        placeholder="0"
                        onChange={(e) =>
                          setLocalSizes({
                            ...localSizes,
                            [sizeObj.value]: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* CUSTOM NOTE FIELD */}
          <div>
            <h4 className="font-bold text-sm text-gray-500 uppercase mb-3">
              Anmerkungen / Sonderwünsche (Optional)
            </h4>
            <textarea
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px] text-sm resize-y"
              placeholder="z.B. 'Bitte extra lang', 'Ohne Bündchen', etc."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          {isBundle && bundleStep === 1 ? (
            <Button
              onClick={() => setBundleStep(2)}
              className="w-full"
              disabled={localQty === 0}
            >
              Größen für 2. Teil eintragen
            </Button>
          ) : (
            <Button
              onClick={() => {
                const unitPrice =
                  priceList[projectedTierIndex]?.price || priceList[0]?.price;
                addCartItem(
                  activeProduct,
                  selectedOption?.name,
                  unitPrice,
                  localSizes,
                  isBundle
                    ? { hoodie: localSizes, shirt: bundleShirtSize }
                    : null,
                  customNote,
                );
              }}
              className="w-full"
              disabled={
                localQty === 0 ||
                !selectedOption ||
                (isBundle &&
                  bundleStep === 2 &&
                  Object.values(bundleShirtSize).reduce((a, b) => a + b, 0) !==
                    localQty)
              }
            >
              Hinzufügen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductConfigPanel;
