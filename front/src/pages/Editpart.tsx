import { useEffect, useState } from "react";

import apiClient from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import type { ImageType, ProductsType } from "../types/auth";
import { toast } from "react-toastify";

const Editpart = () => {
  const { id } = useParams();
  const navigate = useNavigate()
  const numberId = Number(id);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [location, setLocation] = useState("");
  const [rooms, setRooms] = useState(0);
  const [phone_number, setPhone_number] = useState("");
  const [floor_of_this_apartment, setFloor_of_this_apartment] = useState(0);
  const [total_floor_of_building, setTotal_floor_of_building] = useState(0);
  const [images_upload, setImages_upload] = useState<ImageType[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  useEffect(() => {
    apiClient.get(`/api/listings/listings/${numberId}/`).then((res) => {
      const data: ProductsType = res.data.result;
      setTitle(data.title);
      setDescription(data.description);
      setPrice(Number(data.price));
      setRooms(Number(data.rooms))
      setLocation(data.location);
      setPhone_number(data.phone_number);
      setFloor_of_this_apartment(data.floor_of_this_apartment);
      setTotal_floor_of_building(data.total_floor_of_building);
      setImages_upload(data.images);
    });
  }, [numberId]);


  function handleEditFn() {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", String(price));
    formData.append("location", location);
    formData.append("rooms", String(rooms));
    formData.append("phone_number", phone_number);
    formData.append("floor_of_this_apartment", String(floor_of_this_apartment));
    formData.append("total_floor_of_building", String(total_floor_of_building));

    newImages.forEach((file) => {
      

      formData.append(`images_upload`, file); 
    });

    apiClient
      .patch(`/api/listings/${numberId}/update/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        toast.success("Yangilandi");
        navigate("/")
      })
      .catch((error) => {
        // Error handling
        console.log(error);
        
      });
  }

  // img delete
  function handledeleteFn(id: string) {
    apiClient
      .delete(`/api/listings/delete-image/${id}/`)
      .then(() => {
       setImages_upload(images_upload.filter(img => img.id !== id));
        alert("O'chirildi");
      })
      .catch((error) => {
        console.log(error);
        
      });
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Uy joy e'lon qo'shish
          </h1>
          <p className="text-gray-600">
            Barcha maydonlarni to'ldiring va e'loningizni joylashtiring
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Sarlavha *
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
                Tavsif *
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

            {/* Price and Location Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Narxi ($) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-semibold">$</span>
                  </div>
                  <input
                    type="number"
                    value={price}
                     onChange={(e) => {
    const val = e.target.value;
    setPrice(val === "" ? "" : Number(val));
  }}
                    
                    placeholder="0"
                    min="0"
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
                    value={rooms}
                    onChange={(e) => setRooms(Number(e.target.value))}
                    placeholder="Masalan: 3"
                    min="1"
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
                    type="tel"
                    value={phone_number}
                    onChange={(e) => setPhone_number(e.target.value)}
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
                      type="text"
                      value={floor_of_this_apartment}
                      onChange={(e) =>
                        setFloor_of_this_apartment(Number(e.target.value))
                      }
                      placeholder="Masalan: 5"
                      min="1"
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
                      type="text"
                      value={total_floor_of_building}
                      onChange={(e) =>
                        setTotal_floor_of_building(Number(e.target.value))
                      }
                      placeholder="Masalan: 9"
                      min="1"
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
                    setNewImages([...newImages, ...Array.from(e.target.files)]);
                  }}
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
                >
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <svg
                        className="w-8 h-8 text-blue-600"
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
                    <button
                      type="button"
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Fayl tanlash
                    </button>
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
            <div className="pt-6">
              <button
                onClick={handleEditFn}
                type="submit"
                className="w-full py-4 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                E'lonni joylashtirish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editpart;
