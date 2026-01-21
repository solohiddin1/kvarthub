import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header, Footer } from "../modules";
import apiClient from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { DistrictType, Listing, RegionsType } from "../types/auth";

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/listings/listings/${id}/`);

        if (response.data?.result) {
          setListing(response.data.result);
        } else {
          setError("Listing not found");
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to load listing details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#28A453]"></div>
        </div>
        <Footer />
      </>
    );
  }

  // Check if current user is the owner
  const isOwner = user && listing && listing.host === parseInt(user.id);
  if (error || !listing) {
    return (
      <>
        <Header />
        <div className="containers max-w-6xl mx-auto py-8 px-5">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error || "Listing not found"}
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-[#28A453] text-white rounded-lg"
          >
            Back to Home
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const mainImage =
    listing.images && listing.images.length > 0
      ? listing.images[selectedImageIndex].image
      : "/placeholder.jpg";

  // Format price with spaces for readability
  const formatPrice = (price: string) => {
    return price.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  console.log(listing)
  type ForWhomType = "BOYS" | "GIRLS" | "FAMILY" | "FOREIGNERS";

  const FOR_WHOM_META: Record<ForWhomType, { label: string; icon: string; color: string; desc: string }> = {
    FAMILY: { label: "Oila uchun", icon: "👨‍👩‍👧‍👦", color: "text-blue-700", desc: "Ham oilaviy, ham yakka tartibda" },
    BOYS: { label: "Bolalar uchun", icon: "👨‍🦱", color: "text-green-700", desc: "Faqat bolalar uchun" },
    GIRLS: { label: "Qizlar uchun", icon: "👩", color: "text-rose-700", desc: "Faqat qizlar uchun" },
    FOREIGNERS: { label: "Chet elliklar", icon: "🌍", color: "text-gray-700", desc: "Barcha uchun ochiq" },
  };

  const forWhomList: ForWhomType[] = Array.isArray(listing?.for_whom_display) 
    ? (listing!.for_whom_display as ForWhomType[]).filter((item): item is ForWhomType => 
        item != null && item in FOR_WHOM_META
      ) 
    : [];
  const primaryForWhom: ForWhomType | null = forWhomList.length > 0 ? forWhomList[0] : null;


  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-gray-50 to-gray-100 text-gray-700 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200 font-medium"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Orqaga qaytish
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-2xl shadow-lg group">
              <img
                src={mainImage}
                alt={listing.title}
                className="w-full h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Status Badge on Image */}

            </div>

            {/* Image Thumbnails */}
            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {listing.images.map((img, idx) => (
                  <div
                    key={img.id}
                    className="relative shrink-0 group cursor-pointer"
                    onClick={() => setSelectedImageIndex(idx)}
                  >
                    <div
                      className={`absolute inset-0 rounded-xl transition-all duration-300 ${idx === selectedImageIndex
                        ? "ring-3 ring-blue-500 ring-offset-2"
                        : "group-hover:ring-2 group-hover:ring-blue-300"
                        }`}
                    ></div>
                    <img
                      src={img.image}
                      alt={`listing ${idx}`}
                      className="w-24 h-24 object-cover rounded-xl transition-transform duration-300 group-hover:scale-110"
                    />
                    {idx === selectedImageIndex && (
                      <div className="absolute inset-0 bg-blue-500/20 rounded-xl"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Listing Details */}
          <div className="space-y-8">
            {/* Title Section */}
            <div className="space-y-2">

              <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {listing.title}
              </h1>
            </div>

            {/* Price Section */}
            <div className="bg-linear-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
              <div className="flex items-end gap-2">
                <span className="text-4xl md:text-5xl font-bold text-emerald-700">
                  {formatPrice(listing.price)} so'm
                </span>
                <span className="text-gray-600 text-lg mb-1">/oyiga</span>
              </div>

            </div>

            {/* Key Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-linear-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-100 text-center">
                <div className="text-3xl text-blue-600 mb-2">🚪</div>
                <h3 className="text-gray-600 text-sm mb-1">Xonalar soni</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {listing.rooms} ta
                </p>
              </div>

              <div className="bg-linear-to-br from-purple-50 to-white p-5 rounded-xl border border-purple-100 text-center">
                <div className="text-3xl text-purple-600 mb-2">🏢</div>
                <h3 className="text-gray-600 text-sm mb-1">Qavat</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {listing.floor_of_this_apartment}/
                  {listing.total_floor_of_building}
                </p>
              </div>

              <div onClick={() => window.open(listing.location_link, '_blank')} className="bg-linear-to-br from-amber-50 to-white p-5 rounded-xl border border-amber-100 text-center cursor-pointer">
                <div className="text-3xl text-amber-600 mb-2">📍</div>
                <p className="text-gray-600 text-sm mb-1">Joylashuv</p>
                <h3 className="text-lg font-bold text-gray-900 truncate ">
                  {listing.location}
                </h3>
              </div>
            </div>

            {/* kim uchun  */}
            <div className="bg-linear-to-r from-pink-50 to-rose-50 p-6 rounded-2xl border border-rose-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0h-15" />
                </svg>
                Kim uchun
              </h2>

              {forWhomList.length === 0 ? (
                <p className="text-gray-700 font-semibold">Tanlanmagan</p>
              ) : (
                <div className="flex items-start gap-4">
                  {/* Primary icon */}
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/70 border border-rose-200">
                    <span className="text-2xl">{primaryForWhom ? FOR_WHOM_META[primaryForWhom].icon : "👥"}</span>
                  </div>

                  {/* Text + chips */}
                  <div className="flex-1">
                    <p className={`text-xl font-bold ${primaryForWhom ? FOR_WHOM_META[primaryForWhom].color : "text-gray-700"}`}>
                      {forWhomList.map((k) => FOR_WHOM_META[k].label).join(", ")}
                    </p>

                    <p className="text-sm text-gray-600 mt-1">
                      {primaryForWhom ? FOR_WHOM_META[primaryForWhom].desc : ""}
                    </p>

                    {/* badges */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {forWhomList.map((k) => (
                        <span
                          key={k}
                          className="px-3 py-1 rounded-full bg-white border border-rose-200 text-sm text-gray-700"
                        >
                          {FOR_WHOM_META[k].icon} {FOR_WHOM_META[k].label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Description */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                To'liq ma'lumot
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Location Details */}
            <div className="bg-linear-to-r from-gray-50 to-gray-100 p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-red-500"
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
                Manzil
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">V</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Viloyat</p>
                    <p className="font-semibold text-gray-900">{listing.region?.name_uz || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold">T</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tuman</p>
                    <p className="font-semibold text-gray-900">{listing.district?.name_uz || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            {listing.phone_number && (
              <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Aloqa uchun
                </h2>
                <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-linear-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Telefon raqami</p>
                      <p className="text-xl font-bold text-gray-900">
                        {listing.phone_number}
                      </p>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg">
                    Qo'ng'iroq qilish
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {!isOwner ? (
                <button className="flex-1 py-4 bg-linear-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold text-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Bog'lanish
                </button>
              ) : (
                ""
              )}

              <button className="flex-1 py-4 bg-linear-to-r from-gray-200 to-gray-300 text-gray-800 rounded-xl font-semibold text-lg hover:from-gray-300 hover:to-gray-400 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-3">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Ulashish
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ListingDetail;
