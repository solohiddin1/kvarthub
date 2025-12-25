import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Header, Footer } from "../modules";
import apiClient from "../services/api";
import { HeaderPart } from "../components";

const CreateListing = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    rooms: 1,
    beds: 1,
    bathrooms: 1,
    max_people: 1,
    phone_number: "",
    total_floor_of_building: 1,
    floor_of_this_apartment: 1,
    square_meters: "",
    region: "",
    district: "",
    lat: "",
    long: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const form = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "") {
          form.append(key, String(value));
        }
      });

      // Add images
      images.forEach((image) => {
        form.append("images_upload", image);
      });

      const response = await apiClient.post("/api/listings/create/", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.success) {
        setSuccess(true);
        setFormData({
          title: "",
          description: "",
          price: "",
          location: "",
          rooms: 1,
          beds: 1,
          bathrooms: 1,
          max_people: 1,
          phone_number: "",
          total_floor_of_building: 1,
          floor_of_this_apartment: 1,
          square_meters: "",
          region: "",
          district: "",
          lat: "",
          long: "",
        });
        setImages([]);
        
        // Redirect to home after 2 seconds
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (err: any) {
      console.error("Error creating listing:", err);
      setError(err.response?.data?.message || "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#28A453]"></div>
      </div>
    );
  }

  return (
    <div>
      <HeaderPart/>
      <div className="containers max-w-2xl mx-auto py-8 px-5 pb-[100px]">
        <h1 className="text-[32px] font-semibold text-[#0F0F0F] mb-8">
          Create New Listing
        </h1>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            Listing created successfully! Redirecting to home...
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
              placeholder="e.g., Modern apartment in city center"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
              placeholder="Describe your property..."
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
              Price (Monthly) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
              placeholder="e.g., 500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
              placeholder="e.g., Downtown"
            />
          </div>

          {/* Room Details - Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
                Rooms
              </label>
              <input
                type="number"
                name="rooms"
                value={formData.rooms}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
                Beds
              </label>
              <input
                type="number"
                name="beds"
                value={formData.beds}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
                Bathrooms
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
                Max People
              </label>
              <input
                type="number"
                name="max_people"
                value={formData.max_people}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
              />
            </div>
          </div>

          {/* Square Meters */}
          <div>
            <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
              Square Meters
            </label>
            <input
              type="number"
              name="square_meters"
              value={formData.square_meters}
              onChange={handleInputChange}
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
              placeholder="e.g., 100"
            />
          </div>

          {/* Building Floors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
                Total Floors in Building
              </label>
              <input
                type="number"
                name="total_floor_of_building"
                value={formData.total_floor_of_building}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
                Floor Number
              </label>
              <input
                type="number"
                name="floor_of_this_apartment"
                value={formData.floor_of_this_apartment}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
              />
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
                Latitude
              </label>
              <input
                type="text"
                name="lat"
                value={formData.lat}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                placeholder="e.g., 41.2995"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
                Longitude
              </label>
              <input
                type="text"
                name="long"
                value={formData.long}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                placeholder="e.g., 69.2401"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
              placeholder="e.g., +998..."
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-[#0F0F0F] mb-2">
              Property Images
            </label>
            <input required
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
            />
            {images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  Selected {images.length} image(s)
                </p>
                <div className="flex gap-2 flex-wrap">
                  {images.map((image, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`preview ${idx}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#28A453] text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Listing"}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CreateListing;