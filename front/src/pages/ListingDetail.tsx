import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header, Footer } from "../modules";
import apiClient from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { DistrictType, ForWhomType, Listing, RegionsType } from "../types/auth";

type ForWhomMeta = { label: string; icon: string; color: string; desc: string };

const FOR_WHOM_META: Record<ForWhomType, ForWhomMeta> = {
  FAMILY: { label: "Oila uchun", icon: "👨‍👩‍👧‍👦", color: "text-blue-700", desc: "Oilaviy va yakka tartibda" },
  BOYS: { label: "Bolalar uchun", icon: "👨‍🦱", color: "text-emerald-700", desc: "Faqat bolalar uchun" },
  GIRLS: { label: "Qizlar uchun", icon: "👩", color: "text-rose-700", desc: "Faqat qizlar uchun" },
  FOREIGNERS: { label: "Chet elliklar", icon: "🌍", color: "text-slate-700", desc: "Barcha uchun ochiq" },
};

// Agar backend hozircha string qaytarayotgan bo‘lsa ham, biz uni arrayga normalize qilamiz
function normalizeForWhom(value: Listing["for_whom"]): ForWhomType[] {
  if (Array.isArray(value)) return value as ForWhomType[];
  if (typeof value === "string") {
    const v = value.trim();
    // "FAMILY,BOYS" yoki "FAMILY" ko‘rinishlarini ushlash
    const parts = v.includes(",") ? v.split(",").map((x) => x.trim()) : [v];
    return parts.filter(Boolean) as ForWhomType[];
  }
  return [];
}

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);


  // Region/District name’larini chiqarish uchun
  const [regionName, setRegionName] = useState<string>("");
  const [districtName, setDistrictName] = useState<string>("");

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiClient.get(`/api/listings/listings/${id}/`);
        if (response.data?.result) setListing(response.data.result);
        else setError("Listing topilmadi");
      } catch (err: any) {
        setError(err.response?.data?.message || "Listing detail yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchListing();
  }, [id]);

  console.log(listing)

  // viloyatni olish (name_uz)
  useEffect(() => {
    if (!listing?.region) return;
    apiClient
      .get("/api/shared/regions/")
      .then((res) => {
        const found: RegionsType | undefined = res.data?.result?.find(
          (item: RegionsType) => item.id === listing.region.id
        );
        setRegionName(found?.name_uz || "");
      })
      .catch(() => {});
  }, [listing?.region]);

  // tumanni olish (name_uz)
  useEffect(() => {
    if (!listing?.district) return;
    apiClient
      .get("/api/shared/districts/")
      .then((res) => {
        const found: DistrictType | undefined = res.data?.result?.find(
          (item: DistrictType) => item.id === listing.district.id
        );
        setDistrictName(found?.name_uz || "");
      })
      .catch(() => {});
  }, [listing?.district]);

  const isOwner = Boolean(user && listing && listing.host === parseInt(user.id, 10));

  const images = listing?.images ?? [];
  const mainImage =
    images.length > 0 ? images[Math.min(selectedImageIndex, images.length - 1)]?.image : "/placeholder.jpg";

  const forWhomList = useMemo(() => normalizeForWhom(listing?.for_whom), [listing?.for_whom]);
  const primaryForWhom = forWhomList[0] ?? null;

  const mapUrl = useMemo(() => {
    if (!listing) return "#";
    const link = (listing.location_link || "").trim();
    if (link) return link;
    const q = encodeURIComponent(listing.location || "");
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  }, [listing]);

  // Format price with spaces for readability
  const formatPrice = (price: string) => {
    return price.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
              <div>
                <p className="text-slate-900 font-semibold">Yuklanmoqda…</p>
                <p className="text-slate-500 text-sm">Listing ma’lumotlari tayyorlanmoqda</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !listing) {
    return (
      <>
        <Header />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
            {error || "Listing topilmadi"}
          </div>
          <button
            onClick={() => navigate("/")}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-white font-semibold shadow-sm hover:bg-emerald-700 active:scale-[0.99] transition"
          >
            Orqaga qaytish
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
          {/* Top bar */}
          <div className="mb-4 sm:mb-8 flex items-center justify-between gap-3">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 font-semibold shadow-sm hover:bg-slate-50 active:scale-[0.99] transition"
            >
              <span className="text-lg">←</span>
              Orqaga
            </button>

            {listing.is_active ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 text-sm font-semibold">
                Aktiv
              </span>
            ) : (
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-slate-700 text-sm font-semibold">
                Aktiv emas
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            {/* Gallery */}
            <div className="lg:sticky lg:top-6 space-y-3">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <img
                  src={mainImage}
                  alt={listing.title}
                  className="w-full object-cover h-[260px] sm:h-[420px] lg:h-[520px]"
                  loading="lazy"
                />
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {images.map((img, idx) => {
                    const active = idx === selectedImageIndex;
                    return (
                      <button
                        type="button"
                        key={img.id}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={[
                          "relative shrink-0 overflow-hidden rounded-xl border bg-white shadow-sm transition",
                          active ? "border-emerald-500 ring-2 ring-emerald-300" : "border-slate-200 hover:border-slate-300",
                        ].join(" ")}
                        aria-label={`Rasm ${idx + 1}`}
                      >
                        <img src={img.image} alt={`thumb ${idx}`} className="h-16 w-16 sm:h-20 sm:w-20 object-cover" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-4 sm:space-y-6">
              {/* Title + price */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
                <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {listing.title}
                </h1>

                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-slate-500 text-sm">Narxi</p>
                    <p className="text-2xl sm:text-4xl font-extrabold text-emerald-700">
                      {listing.price} <span className="text-base sm:text-lg font-semibold text-slate-500">so‘m / oy</span>
                    </p>
                  </div>

                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-700 font-semibold hover:bg-slate-100 active:scale-[0.99] transition"
                    title="Manzilni xaritada ochish"
                  >
                    📍 Xarita
                  </a>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm">
                  <p className="text-slate-500 text-xs sm:text-sm">Xonalar</p>
                  <p className="mt-1 text-lg sm:text-2xl font-extrabold text-slate-900">{listing.rooms} ta</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm">
                  <p className="text-slate-500 text-xs sm:text-sm">Qavat</p>
                  <p className="mt-1 text-lg sm:text-2xl font-extrabold text-slate-900">
                    {listing.floor_of_this_apartment}/{listing.total_floor_of_building}
                  </p>
                </div>

                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm hover:bg-slate-50 transition"
                  title="Manzilni xaritada ochish"
                >
                  <p className="text-slate-500 text-xs sm:text-sm">Manzil</p>
                  <p className="mt-1 text-sm sm:text-base font-bold text-slate-900 line-clamp-2">
                    {listing.location}
                  </p>
                  <p className="mt-1 text-xs text-emerald-700 font-semibold">Bosib ochish →</p>
                </a>
              </div>

              {/* Mobile: collapsible sections to reduce scrolling */}
              <div className="space-y-3">
                {/* Kim uchun */}
                <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm" open>
                  <summary className="cursor-pointer list-none p-4 sm:p-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👥</span>
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Kim uchun</h2>
                    </div>
                    <span className="text-slate-500 group-open:rotate-180 transition">⌄</span>
                  </summary>

                  <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                    {forWhomList.length === 0 ? (
                      <p className="text-slate-700 font-semibold">Tanlanmagan</p>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                          <span className="text-2xl">{primaryForWhom ? FOR_WHOM_META[primaryForWhom].icon : "👥"}</span>
                        </div>

                        <div className="flex-1">
                          <p className={`text-lg sm:text-xl font-extrabold ${primaryForWhom ? FOR_WHOM_META[primaryForWhom].color : "text-slate-800"}`}>
                            {forWhomList.map((k) => FOR_WHOM_META[k].label).join(", ")}
                          </p>
                          {primaryForWhom && (
                            <p className="text-sm text-slate-600 mt-1">{FOR_WHOM_META[primaryForWhom].desc}</p>
                          )}

                          <div className="mt-3 flex flex-wrap gap-2">
                            {forWhomList.map((k) => (
                              <span
                                key={k}
                                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700"
                              >
                                {FOR_WHOM_META[k].icon} {FOR_WHOM_META[k].label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </details>

{/* <<<<<<< HEAD */}
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

              <div onClick={() => listing.location_link && window.open(listing.location_link, '_blank')} className="bg-linear-to-br from-amber-50 to-white p-5 rounded-xl border border-amber-100 text-center cursor-pointer">
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

            {/* To'liq ma'lumot */}
                <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <summary className="cursor-pointer list-none p-4 sm:p-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">ℹ️</span>
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900">To‘liq ma’lumot</h2>
                    </div>
                    <span className="text-slate-500 group-open:rotate-180 transition">⌄</span>
                  </summary>
                  <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
                  </div>
                </details>

                {/* Manzil details */}
                <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <summary className="cursor-pointer list-none p-4 sm:p-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🗺️</span>
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Manzil</h2>
                    </div>
                    <span className="text-slate-500 group-open:rotate-180 transition">⌄</span>
                  </summary>

                  <div className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">Viloyat</p>
                        <p className="mt-1 font-bold text-slate-900">{listing.region?.name_uz || "—"}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">Tuman</p>
                        <p className="mt-1 font-bold text-slate-900">{listing.district?.name_uz || "—"}</p>
                      </div>
                    </div>
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
======= */}
                  <div className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">Viloyat</p>
                        <p className="mt-1 font-bold text-slate-900">{regionName || "—"}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">Tuman</p>
                        <p className="mt-1 font-bold text-slate-900">{districtName || "—"}</p>
                      </div>
                    </div>
{/* >>>>>>> 52ddef07b9d4ec82b770b27bb644a1a63455c463 */}

                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-white font-extrabold shadow-sm hover:bg-emerald-700 active:scale-[0.99] transition"
                    >
                      📍 Xaritada ochish
                    </a>
                  </div>
{/* <<<<<<< HEAD
                  <div>
                    <p className="text-sm text-gray-500">Tuman</p>
                    <p className="font-semibold text-gray-900">{listing.district?.name_uz || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
======= */}
                </details>
{/* >>>>>>> 52ddef07b9d4ec82b770b27bb644a1a63455c463 */}

                {/* Aloqa */}
                {listing.phone_number && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-slate-500 text-sm">Telefon</p>
                        <p className="mt-1 text-lg sm:text-2xl font-extrabold text-slate-900">{listing.phone_number}</p>
                        <p className="mt-1 text-xs text-slate-500">Bosib qo‘ng‘iroq qiling</p>
                      </div>

                      <a
                        href={`tel:${listing.phone_number}`}
                        className="shrink-0 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-white font-extrabold hover:bg-black active:scale-[0.99] transition"
                      >
                        Qo‘ng‘iroq
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {!isOwner ? (
                  <a
                    href={listing.phone_number ? `tel:${listing.phone_number}` : mapUrl}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-white font-extrabold shadow-sm hover:bg-emerald-700 active:scale-[0.99] transition"
                  >
                    📞 Bog‘lanish
                  </a>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-100 px-5 py-4 text-center text-slate-600 font-semibold">
                    Bu sizning listingingiz
                  </div>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    const shareUrl = window.location.href;
                    try {
                      // Web Share API bo‘lsa
                      // @ts-ignore
                      if (navigator.share) {
                        // @ts-ignore
                        await navigator.share({ title: listing.title, text: listing.location, url: shareUrl });
                        return;
                      }
                      await navigator.clipboard.writeText(shareUrl);
                      alert("Link nusxalandi!");
                    } catch {
                      await navigator.clipboard.writeText(shareUrl);
                      alert("Link nusxalandi!");
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-900 font-extrabold shadow-sm hover:bg-slate-50 active:scale-[0.99] transition"
                >
                  🔗 Ulashish
                </button>
              </div>
            </div>
          </div>

          {/* Bottom spacing */}
          <div className="h-6" />
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ListingDetail;
