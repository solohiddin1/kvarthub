import { useEffect, useState, useMemo, useCallback } from "react";
import apiClient from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import type { DistrictType, ForWhomType, ImageType, ProductsType, RegionsType } from "../types/auth";
import { toast } from "react-toastify";
import { HeaderPart } from "../components";



const Editpart = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const numberId = Number(id);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [priceDisplay, setPriceDisplay] = useState("");
  const [location, setLocation] = useState("");
  const [location_link, setLocationLink] = useState<string>("");
  const [rooms, setRooms] = useState(0);
  const [phone_number, setPhone_number] = useState("+998");

  const [district, setDistrict] = useState<number>(0);
  const [region, setRegion] = useState<number>(0);

  const [selectRegion, setSelectRegion] = useState<RegionsType[]>([]);
  const [selectDistrict, setSelectDistrict] = useState<DistrictType[]>([]);
  const [selectRegionValue, setSelectRegionValue] = useState<string>("");
  const [selectDistrictValue, setSelectDistrictValue] = useState<string>("");
  const [floor_of_this_apartment, setFloor_of_this_apartment] = useState(0);
  const [total_floor_of_building, setTotal_floor_of_building] = useState(0);
  const [images_upload, setImages_upload] = useState<ImageType[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [allDistricts, setAllDistricts] = useState<DistrictType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLinkError, setLocationLinkError] = useState<string>("");
  
  const [for_whom, setFor_whom] = useState<ForWhomType[]>([]);

  // Debug: Log for_whom changes
  useEffect(() => {
    console.log("for_whom state changed:", for_whom);
  }, [for_whom]);

  // URL validation function - matches Django URLValidator
  const isValidUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return true; // Empty is valid since it's optional
    
    url = url.trim();
    
    try {
      const urlObj = new URL(url);
      
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return false;
      }
      
      if (!urlObj.hostname || urlObj.hostname.length === 0) {
        return false;
      }
      
      if (urlObj.hostname !== 'localhost' && !urlObj.hostname.includes('.')) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  };

  // Handle location link change with validation
  const handleLocationLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setLocationLink(value);
    
    if (value && !isValidUrl(value)) {
      setLocationLinkError("Noto'g'ri URL. Misol: https://maps.google.com/...");
    } else {
      setLocationLinkError("");
    }
  };

  // Check if form is valid
  const isFormValid = useMemo(() => {
    const isLocationLinkValid = !location_link || isValidUrl(location_link);
    return (
      title.trim() !== "" &&
      description.trim() !== "" &&
      price > 0 &&
      region > 0 &&
      district > 0 &&
      location.trim() !== "" &&
      rooms > 0 &&
      phone_number.replace(/\s/g, '').length === 13 &&
      for_whom.length > 0 &&
      floor_of_this_apartment > 0 &&
      total_floor_of_building > 0 &&
      floor_of_this_apartment <= total_floor_of_building &&
      (images_upload.length > 0 || newImages.length > 0) &&
      isLocationLinkValid
    );
  }, [title, description, price, region, district, location, rooms, phone_number, for_whom, floor_of_this_apartment, total_floor_of_building, images_upload, newImages, location_link]);

  // Handle for_whom checkbox changes
  const handleForWhomChange = (value: string) => {
    console.log("Toggle for_whom:", value);
    setFor_whom(prev => {
      const newValue = prev.includes(value as ForWhomType)
        ? prev.filter(item => item !== value)
        : [...prev, value as ForWhomType];
      console.log("New for_whom state:", newValue);
      return newValue;
    });
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

  // Prevent non-numeric keyboard input
  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      [46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      (e.keyCode >= 35 && e.keyCode <= 39)
    ) {
      return;
    }
    if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };


  // update
  function handleEditFn() {
    // Validate for_whom selection
    if (for_whom.length === 0) {
      toast.error("Kim uchun maydonidan kamida bitta variantni tanlang");
      return;
    }
    
    // Validate location link if provided
    if (location_link && !isValidUrl(location_link)) {
      toast.error("Manzil linki noto'g'ri formatda. Iltimos, to'g'ri URL kiriting.");
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
    
    if(images_upload.length === 0 && newImages.length === 0) {
      toast.error("Kamida 1 ta rasm tanlang");
      return;
    }

    if (phone_number.replace(/\s/g, '').length !== 13) {
      toast.error("Telefon raqam noto'g'ri formatda. Iltimos, +998901234567 shaklida kiriting.");
      return;
    }
    
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", String(price));
    formData.append("location", location);
    formData.append("location_link", location_link);
    formData.append("rooms", String(rooms));
    formData.append("phone_number", phone_number.replace(/\s/g, ''));

    formData.append("region", String(region));
    formData.append("district", String(district));

    for_whom.forEach((v) => formData.append("for_whom", v));

    formData.append("floor_of_this_apartment", String(floor_of_this_apartment));
    formData.append("total_floor_of_building", String(total_floor_of_building));

    newImages.forEach((file) => {
      formData.append("images_upload", file);
    });

    apiClient
      .patch(`/api/listings/${numberId}/update/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        toast.success("E'lon muvaffaqiyatli yangilandi!");
        navigate("/");
        console.log(res.data);
      })
      .catch((error) => {
        console.log(error);
        const errorMsg = error.response?.data?.message?.uz || 
                        error.response?.data?.error?.message || 
                        "Ma'lumotlar xato";
        toast.error(errorMsg);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  // img delete
  function handledeleteFn(id: string) {
    apiClient
      .delete(`/api/listings/delete-image/${id}/`)
      .then(() => {
        setImages_upload(images_upload.filter((img) => img.id !== id));
        alert("O'chirildi");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // region
  useEffect(() => {
    apiClient
      .get("/api/shared/regions")
      .then((res) => {
        setSelectRegion(res.data.result);

        const foundRegion = res.data.result.find((item: RegionsType) => item.id === region);
        setSelectRegionValue(foundRegion?.name_uz || "");
      })
      .catch((err) => console.log(err));
  }, []);

  // barcha tumanlarni olish
  useEffect(() => {
    apiClient
      .get("/api/shared/districts")
      .then((res) => {
        setAllDistricts(res.data.result);

        const foundDistrict = res.data.result.find((item: DistrictType) => item.id === district);
        if (foundDistrict) setSelectDistrictValue(foundDistrict.name_uz);
      })
      .catch((err) => console.log(err));
  }, []);

  // viloyat tanlanganida tumanlarni filter qilish
  useEffect(() => {
    if (region > 0 && allDistricts.length > 0) {
      const filteredDistricts = allDistricts.filter((item: DistrictType) => item.region === region);
      setSelectDistrict(filteredDistricts);

      const currentDistrict = filteredDistricts.find((item: DistrictType) => item.id === district);
      if (district > 0 && !currentDistrict) {
        setDistrict(0);
        setSelectDistrictValue("");
      }
    } else {
      setSelectDistrict([]);
    }
  }, [region, allDistricts]);

  //  barcha ma'lumotlarni olish
  useEffect(() => {
    apiClient.get(`/api/listings/listings/${numberId}/`).then((res) => {
      const data: ProductsType = res.data.result;

      console.log("Loaded listing data:", data);
      console.log("for_whom from API:", data.for_whom);

      setTitle(data.title);
      setDescription(data.description);
      setPrice(Number(data.price));
      setPriceDisplay(formatPrice(String(data.price)));
      setRooms(Number(data.rooms));
      setLocation(data.location);
      // Format phone number with spaces
      const phoneDigits = data.phone_number.replace(/\D/g, '');
      if (phoneDigits.length === 12 && phoneDigits.startsWith('998')) {
        const formatted = '+998 ' + phoneDigits.slice(3, 5) + ' ' + 
                         phoneDigits.slice(5, 8) + ' ' + 
                         phoneDigits.slice(8, 10) + ' ' + 
                         phoneDigits.slice(10, 12);
        setPhone_number(formatted);
      } else {
        setPhone_number(data.phone_number);
      }
      setFloor_of_this_apartment(data.floor_of_this_apartment);
      setTotal_floor_of_building(data.total_floor_of_building);
      setImages_upload(data.images);

      // ✅ ProductsType da district object, region object:
      setDistrict(data.district.id);
      setRegion(data.region.id);

      // Handle for_whom - ensure it's an array
      if (data.for_whom) {
        const forWhomArray = Array.isArray(data.for_whom) ? data.for_whom : [];
        console.log("Setting for_whom to:", forWhomArray);
        setFor_whom(forWhomArray);
      } else {
        console.log("No for_whom in data, setting empty array");
        setFor_whom([]);
      }
      setLocationLink(data.location_link || "");
    }).catch((error) => {
      console.error("Error loading listing:", error);
    });
  }, [numberId]);

  // disabled regons
  useEffect(() => {
    if (region > 0 && selectRegion.length > 0) {
      const foundRegion = selectRegion.find((item) => item.id === region);
      if (foundRegion) setSelectRegionValue(foundRegion.name_uz);
    }
  }, [region, selectRegion]);

  // disabled district
  useEffect(() => {
    if (district > 0 && selectDistrict.length > 0) {
      const foundDistrict = selectDistrict.find((item) => item.id === district);
      if (foundDistrict) setSelectDistrictValue(foundDistrict.name_uz);
    }
  }, [district, selectDistrict]);

  // viloyat tanlash handler
  const handleRegionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRegionId = Number(e.target.value);
    setRegion(selectedRegionId);
    setDistrict(0);
    setSelectDistrictValue("");
  }, []);

  // tuman tanlash handler
  const handleDistrictChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDistrictId = Number(e.target.value);
    setDistrict(selectedDistrictId);
    const selected = selectDistrict.find((item) => item.id === selectedDistrictId);
    setSelectDistrictValue(selected?.name_uz || "");
  }, [selectDistrict]);

  function hanleCheckerPhone(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value;
    
    // Always ensure it starts with +998
    if (!value.startsWith('+998')) {
      value = '+998';
    }
    
    // Only allow numbers after +998
    const afterPrefix = value.slice(4).replace(/\D/g, '');
    
    // Limit to 9 digits after +998
    const limitedDigits = afterPrefix.slice(0, 9);
    
    // Format with spaces: +998 XX XXX XX XX
    let formatted = '+998';
    if (limitedDigits.length > 0) {
      formatted += ' ' + limitedDigits.slice(0, 2);
    }
    if (limitedDigits.length > 2) {
      formatted += ' ' + limitedDigits.slice(2, 5);
    }
    if (limitedDigits.length > 5) {
      formatted += ' ' + limitedDigits.slice(5, 7);
    }
    if (limitedDigits.length > 7) {
      formatted += ' ' + limitedDigits.slice(7, 9);
    }
    
    setPhone_number(formatted);
  }

  // Prevent deletion of +998 prefix
  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const cursorPosition = input.selectionStart || 0;
    
    // Prevent backspace and delete if cursor is within +998
    if ((e.key === 'Backspace' && cursorPosition <= 4) || 
        (e.key === 'Delete' && cursorPosition < 4)) {
      e.preventDefault();
    }
  };

  return (
    <>
      <HeaderPart />
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              E'lonni tahrirlash
            </h1>
            <p className="text-gray-600">
              Barcha maydonlarni to'ldiring va e'loningizni yangilang
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-6">
              {/* Title Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Mo'ljal *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    type="text"
                    placeholder="Masalan: 3 xonali, yangi ta'mir, markaziy joy"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  To'liq ma'lumot*
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Batafsil tavsif yozing..."
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 resize-none"
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
                  value={region}
                  onChange={handleRegionChange}
                  required
                  className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 appearance-none"
                >
                  <option value="">
                    {selectRegionValue || "Viloyatni tanlang"}
                  </option>
                  {selectRegion.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name_uz}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tuman */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="text-red-500 mr-1">*</span>
                  Tuman
                </label>
                <select
                  value={district}
                  onChange={handleDistrictChange}
                  disabled={!region}
                  className={`w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 appearance-none ${!region ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  <option value="">
                    {selectDistrictValue ||
                      (region ? "Tumanni tanlang" : "Avval viloyat tanlang")}
                  </option>
                  {selectDistrict.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name_uz}
                    </option>
                  ))}
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
                    { value: "FAMILY", label: "Oila uchun", icon: "👨‍👩‍👧‍👦" },
                    { value: "GIRLS", label: "Qizlar uchun", icon: "👩" },
                    { value: "BOYS", label: " Bolalar uchun", icon: "👨" },
                    { value: "FOREIGNERS", label: "Umumiy", icon: "🌍" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        for_whom.includes(option.value as ForWhomType)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={for_whom.includes(option.value as ForWhomType)}
                        onChange={() => handleForWhomChange(option.value)}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 shrink-0"
                      />
                      <span className="text-lg sm:text-xl shrink-0">{option.icon}</span>
                      <span className="font-medium text-sm sm:text-base text-gray-700 leading-tight">{option.label}</span>
                    </label>
                  ))}
                </div>
                {for_whom.length === 0 && (
                  <p className="text-xs text-red-500">Kamida bitta variantni tanlang</p>
                )}
              </div>

              {/* Price and Location Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Narxi (uz) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-semibold">uz</span>
                    </div>
                    <input
                      type="text"
                      value={priceDisplay}
                      onChange={handlePriceChange}
                      placeholder="0"
                      inputMode="numeric"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Location Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Manzil *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
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
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Shahar, tuman, ko'cha"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Manzil linki (ixtiyoriy)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
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
                    <input
                      type="url"
                      value={location_link}
                      onChange={handleLocationLinkChange}
                      placeholder="https://maps.google.com/..."
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all duration-200 ${
                        locationLinkError
                          ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                      }`}
                    />
                  </div>
                  {locationLinkError && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {locationLinkError}
                    </p>
                  )}
                </div>
              </div>

              {/* Rooms and Phone Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rooms Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Xonalar soni *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
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
                    <input
                      type="number"
                      value={rooms || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^[0-9]+$/.test(value)) {
                          setRooms(Number(value));
                        }
                      }}
                      onKeyDown={handleNumericKeyDown}
                      placeholder="Masalan: 3"
                      min="1"
                      max="200"
                      inputMode="numeric"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Phone Number Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Telefon raqami *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
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
                    <input
                      type="text"
                      maxLength={17}
                      inputMode="tel"
                      value={phone_number}
                      onChange={(e) => hanleCheckerPhone(e)}
                      onKeyDown={handlePhoneKeyDown}
                      onFocus={(e) => {
                        // Set cursor after +998 on focus if no digits entered
                        if (e.target.value === '+998') {
                          setTimeout(() => e.target.setSelectionRange(4, 4), 0);
                        }
                      }}
                      placeholder="+998 90 123 45 67"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Floor Information */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Qavat ma'lumotlari
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Apartment Floor */}
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">
                      Kvartira qavati
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                      <input
                        type="number"
                        value={floor_of_this_apartment || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^[0-9]+$/.test(value)) {
                            setFloor_of_this_apartment(Number(value));
                          }
                        }}
                        onKeyDown={handleNumericKeyDown}
                        placeholder="Masalan: 5"
                        min="1"
                        inputMode="numeric"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Total Floors */}
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">
                      Binoning umumiy qavati
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
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
                      <input
                        type="number"
                        value={total_floor_of_building || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^[0-9]+$/.test(value)) {
                            setTotal_floor_of_building(Number(value));
                          }
                        }}
                        onKeyDown={handleNumericKeyDown}
                        placeholder="Masalan: 9"
                        min="1"
                        max="150"
                        inputMode="numeric"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Rasm yuklash *
                </label>

                {/* File Input */}
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    id="image-upload"
                    onChange={(e) => {
                      if (!e.target.files) return null;
                      setNewImages([
                        ...newImages,
                        ...Array.from(e.target.files),
                      ]);
                    }}
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl hover:border-green-400 hover:bg-green-50 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-lg font-medium text-gray-700 mb-1">
                        Rasm yuklang
                      </p>
                      <p className="text-sm text-gray-500">
                        PNG, JPG, WEBP (Maksimum 10MB)
                      </p>
                    </div>
                  </label>
                </div>

                {/* Image Preview */}
                <div className="grid grid-cols-4 gap-3">
                  {/* Eski rasmlar */}
                  {images_upload.map((img, index) => (
                    <div key={`old-${index}`} className="relative group">
                      <img
                        src={img.image}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => handledeleteFn(img.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
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
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {/* Yangi rasmlar */}
                  {newImages.map((file, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        className="w-full h-24 object-cover rounded-lg border border-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updatedImages = newImages.filter(
                            (_, i) => i !== index
                          );
                          setNewImages(updatedImages);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
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
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-8 border-t border-gray-100">
                {!isFormValid && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium">⚠️ Iltimos, barcha majburiy maydonlarni to'ldiring:</p>
                    <ul className="mt-2 text-xs text-yellow-700 list-disc list-inside space-y-1">
                      {title.trim() === "" && <li>Mo'ljal</li>}
                      {description.trim() === "" && <li>To'liq malumot</li>}
                      {price === 0 && <li>Narx</li>}
                      {region === 0 && <li>Viloyat</li>}
                      {district === 0 && <li>Tuman</li>}
                      {location.trim() === "" && <li>Aniq manzil</li>}
                      {rooms === 0 && <li>Xonalar soni</li>}
                      {phone_number.replace(/\s/g, '').length !== 13 && <li>Telefon raqam (+998 formatida)</li>}
                      {for_whom.length === 0 && <li>Kim uchun (kamida 1 ta)</li>}
                      {floor_of_this_apartment === 0 && <li>Binoning qavati</li>}
                      {total_floor_of_building === 0 && <li>Umumiy binoning qavati</li>}
                      {floor_of_this_apartment > total_floor_of_building && <li>Kvartira qavati binoning umumiy qavatidan oshmasligi kerak</li>}
                      {(images_upload.length === 0 && newImages.length === 0) && <li>Kamida 1 ta rasm</li>}
                      {locationLinkError && <li>Manzil linki noto'g'ri formatda</li>}
                    </ul>
                  </div>
                )}
                <button
                  onClick={handleEditFn}
                  disabled={!isFormValid || isSubmitting}
                  type="button"
                  className={`w-full py-4 font-bold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 text-lg flex items-center justify-center ${
                    !isFormValid || isSubmitting
                      ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-500'
                      : 'bg-linear-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
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
                    "E'lonni Yangilash"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Editpart;
