import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Header, Footer } from "../modules";
import apiClient from "../services/api";

interface ListingImage {
  id: number;
  image: string;
}

interface Listing {
  id: number;
  title: string;
  description?: string;
  price: string;
  location: string;
  rooms: number;
  beds: number;
  bathrooms: number;
  max_people: number;
  total_floor_of_building: number;
  floor_of_this_apartment: number;
  square_meters: string;
  region: number;
  district: number;
  is_active: boolean;
  images: ListingImage[];
}

const MyListings = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Listing>>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  console.log(imageFiles);
  
  
  

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get("/api/listings/my-listings/");

      if (response.data?.result && Array.isArray(response.data.result)) {
        setListings(response.data.result);
      } else {
        setListings([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch listings:", err);
      setError(err.response?.data?.message || "Failed to fetch your listings");
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (listing: Listing) => {
    setEditingId(listing.id);
    setEditFormData({
      title: listing.title,
      description: listing.description,
      price: listing.price,
      location: listing.location,
      rooms: listing.rooms,
      beds: listing.beds,
      bathrooms: listing.bathrooms,
      max_people: listing.max_people,
      total_floor_of_building: listing.total_floor_of_building,
      floor_of_this_apartment: listing.floor_of_this_apartment,
      square_meters: listing.square_meters,
      region: listing.region,
      district: listing.district,
      is_active: listing.is_active,
    });
    setImageFiles([]);
    setDeletedImageIds([]);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : isNaN(Number(value))
          ? value
          : Number(value),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = (imageId: number) => {
    setDeletedImageIds(prev => [...prev, imageId]);
  };

  const handleUpdateListing = async (id: number) => {
    try {
      setLoading(true);
      setError("");
      
      // FormData obyektini yaratish
      const formData = new FormData();
      
      // Matn ma'lumotlarini qo'shish
      Object.entries(editFormData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      // 🔴 O'chirilgan rasm ID'larini qo'shish
      console.log(deletedImageIds);
      
      if (deletedImageIds.length > 0) {
        // API field nomini tekshiring:
        // 1. 'deleted_images' (eng keng tarqalgan)
        // 2. 'delete_images' 
        // 3. 'images_to_delete'
        deletedImageIds.forEach(imageId => {
          formData.append('deleted_images', imageId.toString());
        });
      }
      
      
      // Yangi rasm fayllarini qo'shish
      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append('images_upload', file);
        });
      }
      
      // Debug uchun console
      console.log("Deleted image IDs to send:", deletedImageIds);
      console.log("New image files to upload:", imageFiles.length);
      
      // FormData contentni ko'rish
      for (let [key, value] of (formData as any).entries()) {
        console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }
      
      // API so'rovini yuborish
      const response = await apiClient.patch(
        `/api/listings/${id}/update/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log("Update response:", response.data);
      
      if (response.data?.success) {
        setEditingId(null);
        setImageFiles([]);
        setDeletedImageIds([]);
        
        // Yangilangan ro'yxatni yangilash
        await fetchMyListings();
        
        alert("Listing updated successfully!");
      } else {
        setError(response.data?.message || "Failed to update listing");
      }
    } catch (err: any) {
      console.error("Error updating listing:", err);
      console.error("Error details:", err.response?.data);
      setError(err.response?.data?.message || "Failed to update listing");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        setLoading(true);
        await apiClient.delete(`/api/listings/listings/${id}/delete/`);
        setListings((prev) => prev.filter((listing) => listing.id !== id));
        alert("Listing deleted successfully!");
      } catch (err: any) {
        console.error("Error deleting listing:", err);
        setError(err.response?.data?.message || "Failed to delete listing");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRestoreImage = (imageId: number) => {
    setDeletedImageIds(prev => prev.filter(id => id !== imageId));
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#28A453]"></div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="containers max-w-6xl mx-auto py-8 px-5">
        <h1 className="text-[32px] font-semibold text-[#0F0F0F] mb-8">
          My Listings
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading && listings.length === 0 && (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#28A453]"></div>
          </div>
        )}

        {!loading && listings.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">
              You haven't created any listings yet
            </p>
            <button
              onClick={() => navigate("/create-listing")}
              className="px-6 py-3 bg-[#28A453] text-white rounded-lg font-semibold hover:opacity-90"
            >
              Create Your First Listing
            </button>
          </div>
        )}

        {listings.length > 0 && (
          <div className="space-y-6">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {editingId === listing.id ? (
                  // Edit Form
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold mb-4">
                      Edit Listing #{listing.id}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title *
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={editFormData.title || ""}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price *
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={editFormData.price || ""}
                          onChange={handleInputChange}
                          step="0.01"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location *
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={editFormData.location || ""}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={editFormData.description || ""}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rooms *
                        </label>
                        <input
                          type="number"
                          name="rooms"
                          value={editFormData.rooms || ""}
                          onChange={handleInputChange}
                          min="1"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Beds *
                        </label>
                        <input
                          type="number"
                          name="beds"
                          value={editFormData.beds || ""}
                          onChange={handleInputChange}
                          min="1"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bathrooms *
                        </label>
                        <input
                          type="number"
                          name="bathrooms"
                          value={editFormData.bathrooms || ""}
                          onChange={handleInputChange}
                          min="1"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max People *
                        </label>
                        <input
                          type="number"
                          name="max_people"
                          value={editFormData.max_people || ""}
                          onChange={handleInputChange}
                          min="1"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Square Meters *
                        </label>
                        <input
                          type="number"
                          name="square_meters"
                          value={editFormData.square_meters || ""}
                          onChange={handleInputChange}
                          step="0.01"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total Floors in Building *
                        </label>
                        <input
                          type="number"
                          name="total_floor_of_building"
                          value={editFormData.total_floor_of_building || ""}
                          onChange={handleInputChange}
                          min="1"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Floor Number *
                        </label>
                        <input
                          type="number"
                          name="floor_of_this_apartment"
                          value={editFormData.floor_of_this_apartment || ""}
                          onChange={handleInputChange}
                          min="1"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Region *
                        </label>
                        <input
                          type="number"
                          name="region"
                          value={editFormData.region || ""}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          District *
                        </label>
                        <input
                          type="number"
                          name="district"
                          value={editFormData.district || ""}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                        />
                      </div>

                      {/* Images Section */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Images
                        </label>
                        {listing.images && listing.images.length > 0 ? (
                          <div>
                            <p className="text-gray-500 text-sm mb-2">
                              Click X to mark for deletion
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {listing.images.map((img) => {
                                const isDeleted = deletedImageIds.includes(img.id);
                                return (
                                  <div key={img.id} className="relative">
                                    <img
                                      src={img.image}
                                      alt={`listing-${img.id}`}
                                      className={`w-24 h-24 object-cover rounded-lg border ${isDeleted ? 'opacity-50' : ''}`}
                                    />
                                    {isDeleted ? (
                                      <>
                                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex flex-col items-center justify-center">
                                          <span className="text-white text-xs mb-1">Will be deleted</span>
                                          <button
                                            type="button"
                                            onClick={() => handleRestoreImage(img.id)}
                                            className="text-white text-xs bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded"
                                          >
                                            Restore
                                          </button>
                                        </div>
                                        <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                                          ×
                                        </div>
                                      </>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteExistingImage(img.id)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                        title="Delete this image"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {deletedImageIds.length > 0 && (
                              <p className="text-sm text-red-600 mb-4">
                                {deletedImageIds.length} image(s) marked for deletion
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm mb-4">No images</p>
                        )}

                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Add New Images
                        </label>
                        <input
                          type="file"
                          name="images_upload"
                          onChange={handleImageChange}
                          multiple
                          accept="image/*"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453] mb-2"
                        />
                        <p className="text-xs text-gray-500 mb-4">
                          Select multiple images (JPG, PNG, etc.)
                        </p>

                        {imageFiles.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              New Images to Upload ({imageFiles.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {imageFiles.map((file, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`new-${index}`}
                                    className="w-24 h-24 object-cover rounded-lg border"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveNewImage(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                    title="Remove this image"
                                  >
                                    ×
                                  </button>
                                  <p className="text-xs text-gray-600 truncate max-w-24 mt-1">
                                    {file.name}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="is_active"
                          id="is_active"
                          checked={editFormData.is_active || false}
                          onChange={handleInputChange}
                          className="w-4 h-4 border border-gray-300 rounded focus:outline-none focus:border-[#28A453]"
                        />
                        <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                          Active Listing
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end mt-6 pt-6 border-t">
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setImageFiles([]);
                          setDeletedImageIds([]);
                        }}
                        disabled={loading}
                        className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateListing(listing.id)}
                        disabled={loading}
                        className="px-6 py-2 bg-[#28A453] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </span>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Listing Display
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Image */}
                      <div className="shrink-0">
                        {listing.images && listing.images.length > 0 ? (
                          <img
                            src={listing.images[0].image}
                            alt={listing.title}
                            className="w-48 h-48 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-48 h-48 bg-gray-300 rounded-lg flex items-center justify-center">
                            <span className="text-gray-600">No Image</span>
                          </div>
                        )}
                      </div>

                      {/* Listing Details */}
                      <div className="grow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-2xl font-semibold text-gray-800">
                              {listing.title}
                            </h3>
                            <p className="text-gray-500 mt-1">{listing.location}</p>
                            {listing.description && (
                              <p className="text-gray-600 mt-2 line-clamp-2">
                                {listing.description}
                              </p>
                            )}
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              listing.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {listing.is_active ? "Active" : "Inactive"}
                          </div>
                        </div>

                        <p className="text-3xl font-bold text-[#28A453] mb-4">
                          ${listing.price}/month
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div>
                            <p className="text-gray-600 text-sm">Rooms</p>
                            <p className="text-xl font-semibold">
                              {listing.rooms}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Beds</p>
                            <p className="text-xl font-semibold">{listing.beds}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Bathrooms</p>
                            <p className="text-xl font-semibold">
                              {listing.bathrooms}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Max People</p>
                            <p className="text-xl font-semibold">
                              {listing.max_people}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Area</p>
                            <p className="text-xl font-semibold">
                              {listing.square_meters} m²
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Floor</p>
                            <p className="text-xl font-semibold">
                              {listing.floor_of_this_apartment}/{listing.total_floor_of_building}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Region</p>
                            <p className="text-xl font-semibold">
                              {listing.region}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">District</p>
                            <p className="text-xl font-semibold">
                              {listing.district}
                            </p>
                          </div>
                        </div>

                        {listing.images && listing.images.length > 0 && (
                          <div className="mb-6">
                            <p className="text-gray-600 text-sm mb-2">Images ({listing.images.length})</p>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {listing.images.map((img, idx) => (
                                <img
                                  key={img.id}
                                  src={img.image}
                                  alt={`listing ${idx + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3 flex-wrap">
                          <button
                            onClick={() => handleEditClick(listing)}
                            className="px-6 py-2 bg-[#28A453] text-white rounded-lg hover:opacity-90 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteListing(listing.id)}
                            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:opacity-90 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyListings;