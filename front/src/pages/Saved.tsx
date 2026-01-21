import { useEffect, useState } from "react";
import { LikedFilledIcon, LikedIcon } from "../assets/icons";
import type { ProductsType } from "../types/auth";
import { useNavigate } from "react-router";
import { Footer } from "../modules";
import { HeaderPart } from "../components";

const Saved = () => {
  const navigate = useNavigate();
  const [showClearModal, setShowClearModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  let [savedCard, setSavedCard] = useState(() => {
    const saved = localStorage.getItem("savedCard");
    return saved ? JSON.parse(saved) : [];
  });

  let [likedBtnId, setLikedBtnId] = useState(() => {
    const likedBtnId = localStorage.getItem("likedBtnId");
    return likedBtnId ? JSON.parse(likedBtnId) : [];
  });

  function SavedCard(id: number) {
    if (likedBtnId.includes(id)) {
      setLikedBtnId(likedBtnId.filter((item: number) => item !== id));
      setSavedCard(savedCard.filter((item: ProductsType) => item.id !== id));
    }
  }

  useEffect(() => {
    localStorage.setItem("likedBtnId", JSON.stringify(likedBtnId));
  }, [likedBtnId]);

  useEffect(() => {
    localStorage.setItem("savedCard", JSON.stringify(savedCard));
  }, [savedCard]);

  function ClearSavedCard() {
    setShowClearModal(true);
  }

  const handleConfirmClear = () => {
    setSavedCard([]);
    setLikedBtnId([]);
    localStorage.setItem("likedBtnId", JSON.stringify([]));
    setShowClearModal(false);
    setShowSuccessModal(true);
  };

  const handleCancelClear = () => {
    setShowClearModal(false);
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
  };

  return (
    <>
      <HeaderPart />
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-blue-50 py-8 px-4 md:px-8">
        {/* Title part */}
        <div className="max-w-7xl mx-auto mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Saqlangan mahsulotlar
              </h1>
              <p className="text-gray-600 mt-2">
                {savedCard.length === 0
                  ? "Hozircha saqlangan mahsulotlar yo'q"
                  : `Jami ${savedCard.length} ta mahsulot saqlangan`}
              </p>
            </div>

            {savedCard.length > 0 && (
              <div className="flex items-center gap-4">
                <button
                  onClick={ClearSavedCard}
                  className="px-6 py-2.5 bg-linear-to-r from-red-500 to-rose-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Barchasini o'chirish
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tasdiqlash Modal */}
        {showClearModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Orqa fon */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={handleCancelClear}
            />

            {/* Modal o'zagi */}
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                {/* Modal kontenti */}
                <div className="bg-white px-6 pt-6 pb-4">
                  <div className="sm:flex sm:items-start">
                    {/* Diqqat ikonkasi */}
                    <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg
                        className="h-6 w-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
                      </svg>
                    </div>

                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg font-semibold leading-6 text-gray-900">
                        Diqqat!
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Haqiqatan ham barcha saqlangan kartalarni o'chirmoqchimisiz?
                        </p>
                        <p className="mt-2 text-sm text-gray-400 italic">
                          Bu amalni ortga qaytarib bo'lmaydi
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal tugmalari */}
                <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    onClick={handleConfirmClear}
                    className="inline-flex w-full justify-center rounded-md bg-linear-to-r from-red-600 to-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-red-700 hover:to-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:ml-3 sm:w-auto"
                  >
                    Ha, O'chirish
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelClear}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Bekor qilish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Muvaffaqiyat Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs bg-opacity-50 transition-opacity"
              onClick={handleCloseSuccess}
            />

            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                <div className="bg-white px-6 pt-6 pb-4">
                  <div className="text-center">
                    {/* Muvaffaqiyat ikonkasi */}
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-r from-green-100 to-emerald-100">
                      <svg
                        className="h-10 w-10 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>

                    <h3 className="mt-4 text-lg font-semibold leading-6 text-gray-900">
                      Muvaffaqiyatli!
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Barcha kartalar muvaffaqiyatli o'chirildi!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4">
                  <button
                    type="button"
                    onClick={handleCloseSuccess}
                    className="inline-flex w-full justify-center rounded-md bg-linear-to-r from-green-600 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-green-700 hover:to-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                  >
                    Tamom
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        {savedCard.length === 0 ? (
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm p-12 text-center border border-gray-200">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-3">
                Saqlangan mahsulotlar yo'q
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Mahsulotlarni saqlash uchun ♡ belgisini bosing. Saqlangan
                mahsulotlar shu yerda ko'rinadi.
              </p>
              <button
                onClick={() => navigate("/")}
                className="px-8 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
              >
                Mahsulotlarni ko'rish
              </button>
            </div>
          </div>
        ) : (
          <div className="containers  grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap lg:justify-between  gap-3 py-5 px-5">
            {savedCard.map((item: ProductsType) => (
              <div
                key={item.id}
                className=" bg-[#0000000D] lg:w-[300px] rounded-[20px] relative"
              >
                {/* liked button start */}
                <div
                  onClick={() => SavedCard(item.id)}
                  className={`w-10 md:w-12 h-10 md:h-12 flex justify-center items-center rounded-xl bg-[#FFFFFF4D] absolute top-2 right-2 cursor-pointer ${likedBtnId.includes(item.id) ? "text-[#FF383C]" : "text-black"
                    }`}
                >
                  {likedBtnId.includes(item.id) ? (
                    <LikedFilledIcon />
                  ) : (
                    <LikedIcon />
                  )}
                </div>
                {/* liked button end */}
                <img className="rounded-xl"
                  src={
                    item.images && item.images.length > 0
                      ? item.images[0].image
                      : "/placeholder.jpg"
                  }
                  alt={item.title}
                  width={357}
                  height={320}
                />
                <div className="pt-4  p-5  pb-7">
                  <h2 className="line-clamp-2 font-medium text-[#000000] text-[18px]">
                    {item.title}
                  </h2>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-[#757575]">{item.price} UZS</p>
                    <p className="text-[14px] text-[#A6A6A6]">{item.rooms} rooms</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Saved;