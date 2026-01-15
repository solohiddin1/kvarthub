import { useEffect, useState } from "react";
import type { ProductsType } from "../types/auth";
import apiClient from "../services/api";
import { HeaderPart } from "../components";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

const MyListings = () => {
  const navigate = useNavigate();
  const [listings, setListing] = useState<ProductsType[]>([]);
  console.log(listings);

  useEffect(() => {
    apiClient.get("/api/listings/my-listings/").then((res) => {
      setListing(res.data.result);
       localStorage.setItem("product",JSON.stringify(res.data.result))
     
      
    });
  }, []);

  // delete part
  function handleDeleteCard(id: number) {
    const isComfirm = window.confirm("Haqiqatdan ham o'chirmoqchimisz");
    if (isComfirm) {
      apiClient
        .delete(`/api/listings/listings/${id}/delete/`)
        .then(() => {
          const newListings = listings.filter((item) => item.id !== id);
          setListing(newListings);
          toast.success("o'chirildi");
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      toast.info("O'chirilmadi");
    }
  }

  // active disactive 
 function toggleListingStatus(id: number, isCurrentlyActive: boolean) {
  const message = isCurrentlyActive
    ? "E'lonni faolsizlashtirishni istaysizmi?"
    : "E'lonni faollashtirishda pul yechib olinadi. Davom etasizmi?";
  
  const isConfirmed = window.confirm(message);
  
  if (isConfirmed) {
    apiClient
      .patch(`/api/listings/listings/${id}/update_status/`)
      .then((res) => {
        console.log(res.data);
        
        if (res.data.success) {
          const action = isCurrentlyActive ? "faolsizlashtirildi" : "faollashtirildi";
          toast.success(`E'lon muvaffaqiyatli ${action}`);
          
          setListing((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, is_active: !item.is_active } : item
            )
          );
        } else {
          toast.error(res.data.error.message_language.uz);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Xatolik yuz berdi");
      });
  } else {
    const action = isCurrentlyActive ? "faolsizlashtirmaslik" : "faollashtirmaslik";
    toast.info(`E'lonni ${action} bekor qilindi`);
  }
}

  return (
    <>
      <HeaderPart />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {listings.map((item: ProductsType) => (
          <div
            key={item.id}
            className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-100"
          >
            {/* Image Section */}
            <div className="relative h-64 overflow-hidden">
              {item.images.length > 0 ? (
                <div className="relative h-full">
                  {/* Main Image */}
                  <img
                    src={item.images[0].image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Image Gallery Indicator */}
                  {item.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      +{item.images.length - 1} photos
                    </div>
                  )}

                  {/* Favorite Button */}
                  <button className="absolute top-3 right-3 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110">
                    <svg
                      className="w-5 h-5 text-gray-600 hover:text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="w-full h-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-5">
              {/* Title and Category */}
              <div className="mb-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex gap-2 items-center">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        item.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.is_active ? "Faol" : "Nofaol"}
                    </span>
                    <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded">
                      ID: {item.id}
                    </span>
                  </div>
                </div>
                {item.description && (
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Price */}
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Narxi</div>
                    <div className="font-bold text-lg text-gray-900">
                      ${item.price.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Rooms */}
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Xonalar</div>
                    <div className="font-bold text-lg text-gray-900">
                      {item.rooms}
                    </div>
                  </div>
                </div>

                {/* Location (if exists) */}
                {item.location && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-2">
                      <svg
                        className="w-4 h-4 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Manzil</div>
                      <div className="font-semibold text-gray-900 line-clamp-1">
                        {item.location}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between gap-2">
                <button
                  onClick={() => handleDeleteCard(item.id)}
                  className="font-semibold bg-red-600 py-3 rounded-3xl flex-1 text-white cursor-pointer hover:bg-red-700 transition-colors"
                >
                 O'chirish
                </button>
                <button
                  onClick={() => navigate(`/my-listings/${item.id}`)}
                  className="font-semibold bg-blue-600 py-3 rounded-3xl flex-1 text-white cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  Yangilash
                </button>
                <button
                onClick={() => toggleListingStatus(item.id,item.is_active ?? false)}
                  className={`font-semibold py-3 rounded-3xl flex-1 text-white cursor-pointer transition-colors ${
                    item.is_active
                      ? "bg-yellow-600 hover:bg-yellow-700" // Deactivate - sariq
                      : "bg-green-600 hover:bg-green-700" // Activate - yashil
                  }`}
                >
                  {item.is_active ? "Faolsizlashtirish" : "Faollashtirish"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MyListings;
