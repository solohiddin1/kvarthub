import { useAuth } from "../context/AuthContext";
import { Footer } from "../modules";
import { HeaderPart } from "../components";
import { useState } from "react";
import apiClient from "../services/api";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const CreateListing = () => {
  const { loading } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [location, setLocation] = useState("");
  const [rooms, setRooms] = useState(0);
  const [phone_number, setPhone_number] = useState("");
  const [floor_of_this_apartment, setFloor_of_this_apartment] = useState(0);
  const [total_floor_of_building, setTotal_floor_of_building] = useState(0);
  const [images_upload, setImages_upload] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", String(price));
    formData.append("location", location);
    formData.append("rooms", String(rooms));
    formData.append("phone_number", phone_number);
    formData.append("floor_of_this_apartment", String(floor_of_this_apartment));
    formData.append("total_floor_of_building", String(total_floor_of_building));
    images_upload.forEach((img) => formData.append("images_upload", img));

    apiClient
      .post("/api/listings/create/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        toast.success("Yaratildi");
        navigate("/");
      })
      .catch(() => {
        toast.error("xato");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  const removeImage = (index: number) => {
    setImages_upload(images_upload.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <HeaderPart />

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 mb-10 text-white">
          <h1 className="text-3xl font-bold mb-3">Yangi Uy Joy E'lon Qo'shish</h1>
          <p className="text-blue-100">
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
                  <div className="w-2 h-8 bg-blue-500 rounded-full mr-3"></div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Asosiy Ma'lumotlar
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      <span className="text-red-500 mr-1">*</span>
                      Sarlavha
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <input
                        required
                        type="text"
                        className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                        placeholder="Masalan: Yaqin Metro, Yangi Ta'mirlangan kvartira"
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      <span className="text-red-500 mr-1">*</span>
                      Oylik Narxi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-bold">$</span>
                      </div>
                      <input
                        required
                        type="number"
                        className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                        placeholder="0"
                        onChange={(e) => setPrice(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="text-red-500 mr-1">*</span>
                  Tavsif
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <textarea
                    rows={4}
                    required
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
                    placeholder="Uy joy haqida batafsil ma'lumot..."
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
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
                  {/* Location */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      <span className="text-red-500 mr-1">*</span>
                      Manzil
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <input
                        required
                        type="text"
                        className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                        placeholder="Shahar, tuman, ko'cha"
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
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                        placeholder="+998 90 123 45 67"
                        onChange={(e) => setPhone_number(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                  {/* Rooms */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Xonalar soni
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <input
                        type="number"
                        placeholder="0"
                        onChange={(e) => setRooms(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
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
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <input
                        type="number"
                        className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                        placeholder="Masalan: 5"
                        onChange={(e) => setFloor_of_this_apartment(Number(e.target.value))}
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
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <input
                        type="number"
                        className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                        placeholder="Masalan: 5"
                        onChange={(e) => setTotal_floor_of_building(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-8 bg-purple-500 rounded-full mr-3"></div>
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
                      setImages_upload([...images_upload, ...Array.from(e.target.files)]);
                    }}
                  />

                  <label htmlFor="property-images" className="block cursor-pointer">
                    <div className="border-3 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:border-blue-400 transition-all duration-300 bg-gradient-to-br from-gray-50 to-white hover:from-blue-50 hover:to-white">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-5 shadow-lg">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-xl font-semibold text-gray-800 mb-2">
                          Rasm yuklash uchun bosing
                        </p>
                        <p className="text-gray-500">
                          PNG, JPG yoki WEBX formatida (maks. 5MB)
                        </p>
                        <button
                          type="button"
                          className="mt-6 px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          Fayllarni Tanlash
                        </button>
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
                          className="text-sm text-red-500 hover:text-red-700 font-medium"
                        >
                          Barchasini O'chirish
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {images_upload.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(img)}
                              alt="Rasm"
                              className="w-full h-32 object-cover rounded-xl border-2 border-gray-200 group-hover:border-blue-400 transition-all duration-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 shadow-lg"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
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
                  className={`w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 text-lg flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:from-blue-700 hover:to-blue-800'}`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

      <Footer />
    </div>
  );
};

export default CreateListing;