import { useAuth } from "../context/AuthContext";
import { Footer } from "../modules";
import { HeaderPart } from "../components";
import { useEffect, useState, useMemo, useCallback } from "react";
import apiClient from "../services/api";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import type { DistrictType, RegionsType } from "../types/auth";

const CreateListing = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [priceDisplay, setPriceDisplay] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [location_link, setLocationLink] = useState("");
  const [location, setLocation] = useState("");
  const [rooms, setRooms] = useState(0);
  const [phone_number, setPhone_number] = useState("");
  const [floor_of_this_apartment, setFloor_of_this_apartment] = useState(0);
  const [total_floor_of_building, setTotal_floor_of_building] = useState(0);
  const [images_upload, setImages_upload] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [card_number, setCard_number] = useState<string>("");
  const [card_holder_name, setCard_holder_name] = useState<string>("");
  const [expiry_month, setExpiry_month] = useState<number>(0);
  const [expiry_year, setExpiry_year] = useState<number>(0);
  const [for_whom, setFor_whom] = useState<string[]>([]);

  // Handle for_whom checkbox changes
  const handleForWhomChange = (value: string) => {
    setFor_whom(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  // Format price with spaces
  const formatPrice = (value: string) => {
    const numValue = value.replace(/\s/g, '');
    if (!numValue) return '';
    return numValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value === '' || /^\d+$/.test(value)) {
      setPrice(Number(value));
      setPriceDisplay(formatPrice(value));
    }
  };

  // select regions
  const [selectRegion, setSelectRegion] = useState<RegionsType[]>([]);
  const [selectedRegionDistricts, setSelectedRegionDistricts] = useState<
    DistrictType[]
  >([]);

  // viloyat tumanlarni olib kelish
  useEffect(() => {
    apiClient
      .get("/api/shared/")
      .then((res) => {
        console.log("Regions data:", res.data);
        const regions = res.data.result || [];
        setSelectRegion(regions);
        // Don't auto-select first region - let user choose
      })
      .catch((error) => {
        console.error("Viloyatlarni olishda xatolik:", error);
        toast.error("Viloyatlarni yuklab bo'lmadi");
      });
  }, []);

  // Viloyat tanlanganda tumanlarni o'zgartirish
  const handleRegionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = e.target.value;
    setRegion(regionId);
    setDistrict(""); // Viloyat o'zgarganda tumani tozalash

    // Tanlangan viloyatni topish va uning tumanlarini o'rnatish
    const selectedRegion = selectRegion.find((r) => r.id === Number(regionId));
    setSelectedRegionDistricts(selectedRegion?.disctricts || []);
  }, [selectRegion]);

  // Tuman tanlanganda
  const handleDistrictChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setDistrict(e.target.value);
  }, []);

  // Memoize region options
  const regionOptions = useMemo(() => {
    return selectRegion.map((region) => (
      <option key={region.id} value={region.id}>
        {region.name_uz}
      </option>
    ));
  }, [selectRegion]);

  // Memoize district options
  const districtOptions = useMemo(() => {
    if (!region) {
      return <option disabled>Avval viloyatni tanlang</option>;
    }
    if (selectedRegionDistricts.length > 0) {
      return selectedRegionDistricts.map((district) => (
        <option key={district.id} value={district.id}>
          {district.name_uz}
        </option>
      ));
    }
    return <option disabled>Bu viloyatda tumanlar mavjud emas</option>;
  }, [region, selectedRegionDistricts]);

  //  formani backentga yuborish
  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate for_whom selection
    if (for_whom.length === 0) {
      toast.error("Kim uchun maydonidan kamida bitta variantni tanlang");
      return;
    }
    
    // Validate rooms
    if (rooms > 200) {
      toast.error("Xonalar soni 200 dan oshmasligi kerak");
      return;
    }
    
    // Validate total floor
    if (total_floor_of_building > 150) {
      toast.error("Bino qavatlari soni 150 dan oshmasligi kerak");
      return;
    }
    
    // Validate floor of apartment vs total floor
    if (floor_of_this_apartment > total_floor_of_building) {
      toast.error("Kvartira qavati binoning umumiy qavatidan oshmasligi kerak");
      return;
    }
    
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", String(price));
    formData.append("region", region);
    formData.append("district", district);
    formData.append("location_link", location_link);
    formData.append("location", location);
    formData.append("rooms", String(rooms));
    formData.append("phone_number", phone_number);
    // Append for_whom array
    for_whom.forEach(item => formData.append("for_whom", item));
    formData.append("floor_of_this_apartment", String(floor_of_this_apartment));
    formData.append("total_floor_of_building", String(total_floor_of_building));
    images_upload.forEach((img) => formData.append("images_upload", img));
    console.log(phone_number);
    
    if(phone_number.length === 13){

      apiClient
        .post("/api/listings/create/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          if (response.data.success) {
            toast.success("E'lon muvaffaqiyatli yaratildi!");
            navigate("/");
            console.log(response.data);
          } else {
            const errorMsg =
              response.data.error?.message_language?.uz ||
              response.data.error?.message_language?.en ||
              response.data.error?.message_language?.ru ||
              response.data.error?.message ||
              "Xatolik yuz berdi, qayta urinib ko'ring.";
            toast.error(errorMsg);
  
            // Agar karta bo'lmasa, Payment page ga redirect qilish
            const errorMessage = errorMsg.toLowerCase();
            if (
              errorMessage.includes("karta") ||
              errorMessage.includes("card") ||
              errorMessage.includes("to'lov") ||
              errorMessage.includes("balans")
            ) {
              setPaymentModal(true);
            }
          }
        })
        .catch((error) => {
          const errorMessage =
            error.response?.data?.message?.uz ||
            error.response?.data?.message_language?.uz ||
            error.response?.data?.error?.message_language?.uz ||
            error.response?.data?.error?.message ||
            "Xatolik yuz berdi, qayta urinib ko'ring.";
  
          toast.error(errorMessage);
          console.log(error);
  
          // Agar karta bo'lmasa yoki balans yetarli bo'lmasa, Payment page ga redirect qilish
          const errorMsgLower = errorMessage.toLowerCase();
          if (
            errorMsgLower.includes("karta") ||
            errorMsgLower.includes("card") ||
            errorMsgLower.includes("to'lov") ||
            errorMsgLower.includes("balans")
          ) {
            navigate("/payment");
          }
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
    else{
      toast.error("Telefon raqam noto'g'ri formatda. Iltimos, +998901234567 shaklida kiriting.");
  setIsSubmitting(false);
    }
  }
  // remove images
  const removeImage = (index: number) => {
    setImages_upload(images_upload.filter((_, i) => i !== index));
  };

  // payment part
  function PaymentFn(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    
    // Validate all fields
    if (!card_number || card_number.replace(/\s/g, "").length !== 16) {
      toast.error("Karta raqamini to'liq kiriting (16 ta raqam)");
      return;
    }
    
    if (!card_holder_name || card_holder_name.trim().length < 3) {
      toast.error("Karta egasining ismini kiriting");
      return;
    }
    
    if (!expiry_month || expiry_month < 1 || expiry_month > 12) {
      toast.error("Oyni to'g'ri kiriting (1-12)");
      return;
    }
    
    if (!expiry_year || expiry_year < 24) {
      toast.error("Yilni to'g'ri kiriting");
      return;
    }
    
    apiClient
      .post("/api/payment/cards/add/", {
        card_number: card_number.replace(/\s/g, ""),
        card_holder_name,
        expiry_month,
        expiry_year,
      })
      .then(() => {
        setPaymentModal(false);
        toast.success("Karta muvaffaqqiyatli qo'shildi");
        // Karta qo'shgandan keyin Payment page ga yuborish
        setPaymentModal(false);
      })
      .catch((error) => {
        const errorMsg =
          error.response?.data?.message?.uz ||
          error.response?.data?.message_language?.uz ||
          "Karta ma'lumotlari xato";
        toast.error(errorMsg);
      });
  }
  useEffect(() => {
    apiClient.get("/api/shared/regions/").then((res) => {
      setSelectRegion(res.data.result);
    });
  }, []);



  function hanleCheckerPhone(e:React.ChangeEvent<HTMLInputElement>){
    setPhone_number(e.target.value);
    

  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-green-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-green-50">
      <HeaderPart />

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header Card */}
        <div className="bg-linear-to-r from-green-600 to-green-700 rounded-2xl shadow-xl p-8 mb-10 text-white">
          <h1 className="text-3xl font-bold mb-3">
            Yangi Uy Joy E'lon Qo'shish
          </h1>
          <p className="text-green-100">
            Barcha maydonlarni to'ldiring va e'loningizni darhol joylashtiring
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Form Header */}
          <div className="border-b border-gray-100 px-8 py-6">
            <h2 className="text-2xl font-bold text-gray-800">
              E'lon Ma'lumotlari
            </h2>
            <p className="text-gray-500 mt-1">
              Quyidagi maydonlarni to'ldiring
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="p-8">
            <div className="space-y-8">
              {/* Title Section */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-8 bg-green-500 rounded-full mr-3"></div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Asosiy Ma'lumotlar
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      <span className="text-red-500 mr-1">*</span>
                      Mo'ljal
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </div>
                      <input
                        required
                        type="text"
                        className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200"
                        placeholder="Masalan: Yaqin Metro, Yangi Ta'mirlangan kvartira"
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      <span className="text-red-500 mr-1">*</span>
                      Oylik Narxi so'mda
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-bold">🇺🇿</span>
                      </div>
                      <input
                        required
                        type="text"
                        value={priceDisplay}
//                         type="number"
//                         min={0}
                        className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200"
                        placeholder="0"
                        onChange={handlePriceChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="text-red-500 mr-1">*</span>
                  To'liq malumot
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                  </div>
                  <textarea
                    rows={4}
                    required
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 resize-none"
                    placeholder="Uy joy haqida batafsil ma'lumot..."
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              {/* Viloyat */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="text-red-500 mr-1">*</span>
                  Viloyat
                </label>
                <select
                  required
                  value={region}
                  className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 appearance-none"
                  onChange={handleRegionChange}
                >
                  <option value="" disabled>
                    Viloyatni tanlang
                  </option>
                  {regionOptions}
                </select>
              </div>

              {/* Tuman */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="text-red-500 mr-1">*</span>
                  Tuman
                </label>
                <select
                  required
                  value={district}
                  className={`w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 appearance-none ${
                    !region ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onChange={handleDistrictChange}
                  disabled={!region}
                >
                  <option value="" disabled>
                    Tumanni tanlang
                  </option>
                  {districtOptions}
                </select>
                {!region && (
                  <p className="text-xs text-gray-500">
                    Tumanni tanlash uchun avval viloyatni tanlang
                  </p>
                )}
              </div>
              {/* kim uchun  */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="text-red-500 mr-1">*</span>
                  Kim uchun (Bir nechta tanlanishi mumkin)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: 'FAMILY', label: 'Oila uchun', icon: '👨‍👩‍👧‍👦' },
                    { value: 'GIRLS', label: 'Qizlar uchun', icon: '👩' },
                    { value: 'BOYS', label: 'Bolalar uchun', icon: '👨‍🦱' },
                    { value: 'FOREIGNERS', label: 'Umumiy', icon: '🌍' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        for_whom.includes(option.value)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 flex-shrink-0"
                        checked={for_whom.includes(option.value)}
                        onChange={() => handleForWhomChange(option.value)}
                      />
                      <span className="text-lg sm:text-xl flex-shrink-0">{option.icon}</span>
                      <span className="font-medium text-sm sm:text-base text-gray-700 leading-tight">{option.label}</span>
                    </label>
                  ))}
                </div>
                {for_whom.length === 0 && (
                  <p className="text-xs text-red-500">Kamida bitta variantni tanlang</p>
                )}
              </div>

              {/* Location & Details */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-8 bg-green-500 rounded-full mr-3"></div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Joylashuv va Tafsilotlar
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Location (manzil) */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      <span className="text-red-500 mr-1">*</span>
                      Aniq manzil
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <input
                        required
                        type="text"
                        className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200"
                        placeholder="Ko'cha, uy, kvartira raqami"
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      <span className="text-red-500 mr-1">*</span>
                      Telefon raqam
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                         maxLength={13} 
                        className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200"
                        placeholder="+998901234567"
                        onChange={(e) => hanleCheckerPhone(e)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Location (manzil) */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      <span className="text-red-500 mr-1">*</span>
                      Aniq manzil linki
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200"
                        placeholder="Aniq manzil linki"
                        onChange={(e) => setLocationLink(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Rooms */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Xonalar soni
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <input
                        type="number"
                        placeholder="0"
                        min={0}
                        max={200}
                        onChange={(e) => setRooms(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Apartment Floor */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Binoning qavati
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                      <input
                        type="number"
                        min={0}
                        className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200"
                        placeholder="Masalan: 5"
                        onChange={(e) =>
                          setFloor_of_this_apartment(Number(e.target.value))
                        }
                      />
                    </div>
                  </div>

                  {/* Total Floors */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Umumiy binoning qavati
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={150}
                        className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200"
                        placeholder="Masalan: 5"
                        onChange={(e) =>
                          setTotal_floor_of_building(Number(e.target.value))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-8 bg-green-500 rounded-full mr-3"></div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Rasm Yuklash
                  </h3>
                </div>

                <div>
                  <input
                    type="file"
                    id="property-images"
                    accept=".png,.jpg,.jpeg,.webp,.webx"
                    multiple
                    className="hidden"
                    required
                    onChange={(e) => {
                      if (!e.target.files) return;
                      setImages_upload([
                        ...images_upload,
                        ...Array.from(e.target.files),
                      ]);
                    }}
                  />

                  <label
                    htmlFor="property-images"
                    className="block cursor-pointer"
                  >
                    <div className="border-3 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:border-green-400 transition-all duration-300 bg-linear-to-br from-gray-50 to-white hover:from-green-50 hover:to-white">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-linear-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-5 shadow-lg">
                          <svg
                            className="w-10 h-10 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-xl font-semibold text-gray-800 mb-2">
                          Rasm yuklash uchun bosing
                        </p>
                        <p className="text-gray-500">
                          PNG, JPG yoki WEBX formatida (maks. 5MB)
                        </p>
                        {/* <button
                          type="button"
                          className="mt-6 px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          Fayllarni Tanlash
                        </button> */}
                      </div>
                    </div>
                  </label>

                  {/* Image Previews */}
                  {images_upload.length > 0 && (
                    <div className="mt-8">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-gray-700">
                          Tanlangan Rasmlar ({images_upload.length})
                        </h4>
                        <button
                          type="button"
                          onClick={() => setImages_upload([])}
                          className="text-sm text-red-500 hover:text-red-700 font-medium cursor-pointer"
                        >
                          O'chirish
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {images_upload.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(img)}
                              alt="Rasm"
                              className="w-full h-32 object-cover rounded-xl border-2 border-gray-200 group-hover:border-green-400 transition-all duration-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 shadow-lg"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-8 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 bg-linear-to-r from-green-600 to-green-700 text-white font-bold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 text-lg flex items-center justify-center ${
                    isSubmitting
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:from-green-700 hover:to-green-800"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Yuklanmoqda...
                    </>
                  ) : (
                    "E'lonni Joylashtirish"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      {/* payment modal  */}

      {paymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay */}
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 transition-opacity"></div>

          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-linear-to-r from-green-600 to-green-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">
                      To'lovni amalga oshirish
                    </h3>
                    <p className="text-green-100 text-sm mt-1">
                      E'lon joylashtirish uchun to'lov qiling
                    </p>
                  </div>
                  <button
                    onClick={() => setPaymentModal(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form className="p-6">
                <div className="space-y-6">
                  {/* Card Number */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Karta raqami <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="1234 5678 9012 3456"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all tracking-[0.25em]"
                        onChange={(e) => setCard_number(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      16 ta raqam kiriting (masalan: 1234 5678 9012 3456)
                    </p>
                  </div>

                  {/* Card Holder Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Karta egasi <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="ALIYEV ALI"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        onChange={(e) => setCard_holder_name(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Expiry Date and CVV */}
                  <div className=" flex justify-between gap-4">
                    {/* Expiry Month */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Oy <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={2}
                        placeholder="MM"
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value.length > 2) value = value.slice(0, 2);
                          if (value.length === 2 && parseInt(value) > 12)
                            value = "12";
                          setExpiry_month(Number(value));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-center"
                      />
                    </div>

                    {/* Expiry Year */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Yil <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="YY"
                        onChange={(e) => setExpiry_year(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-center"
                      />
                    </div>
                  </div>

                  {/* Payment Amount */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">To'lov miqdori:</span>
                      <span className="text-xl font-bold text-green-600">
                        50.00 UZS
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      E'lon joylashtirish uchun bir martalik to'lov
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={(e) => PaymentFn(e)}
                      type="submit"
                      className="w-[50%] mx-auto py-3 rounded-2xl text-white font-semibold bg-green-600 cursor-pointer"
                    >
                      Karta Qo'shish
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CreateListing;
