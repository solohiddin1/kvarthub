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
  total_floor_of_building: number;
  floor_of_this_apartment: number;
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
      total_floor_of_building: listing.total_floor_of_building,
      floor_of_this_apartment: listing.floor_of_this_apartment,
      region: listing.region,
      district: listing.district,
      is_active: listing.is_active,
    });
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

  const handleUpdateListing = async (id: number) => {
    try {
      setLoading(true);
      const response = await apiClient.patch(
        `/api/listings/${id}/update/`,
        editFormData
      );

      if (response.data?.success) {
        setListings((prev) =>
          prev.map((listing) =>
            listing.id === id ? { ...listing, ...editFormData } : listing
          )
        );
        setEditingId(null);
      }
    } catch (err: any) {
      console.error("Error updating listing:", err);
      setError(err.response?.data?.message || "Failed to update listing");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        setLoading(true);
        await apiClient.delete(`/api/listings/${id}/delete/`);
        setListings((prev) => prev.filter((listing) => listing.id !== id));
      } catch (err: any) {
        console.error("Error deleting listing:", err);
        setError(err.response?.data?.message || "Failed to delete listing");
      } finally {
        setLoading(false);
      }
    }
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
                          Title
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={editFormData.title || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={editFormData.price || ""}
                          onChange={handleInputChange}
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={editFormData.location || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rooms
                        </label>
                        <input
                          type="number"
                          name="rooms"
                          value={editFormData.rooms || ""}
                          onChange={handleInputChange}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                        />
                      </div>

                      {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Beds
                        </label>
                        <input
                          type="number"
                          name="beds"
                          value={editFormData.beds || ""}
                          onChange={handleInputChange}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                        />
                      </div> */}

                      {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bathrooms
                        </label>
                        <input
                          type="number"
                          name="bathrooms"
                          value={editFormData.bathrooms || ""}
                          onChange={handleInputChange}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                        />
                      </div> */}

                      {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max People
                        </label>
                        <input
                          type="number"
                          name="max_people"
                          value={editFormData.max_people || ""}
                          onChange={handleInputChange}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                        />
                      </div> */}

                      {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Square Meters
                        </label>
                        <input
                          type="number"
                          name="square_meters"
                          value={editFormData.square_meters || ""}
                          onChange={handleInputChange}
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                        />
                      </div> */}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total Floors in Building
                        </label>
                        <input
                          type="number"
                          name="total_floor_of_building"
                          value={editFormData.total_floor_of_building || ""}
                          onChange={handleInputChange}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Floor Number
                        </label>
                        <input
                          type="number"
                          name="floor_of_this_apartment"
                          value={editFormData.floor_of_this_apartment || ""}
                          onChange={handleInputChange}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#28A453]"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Active
                        </label>
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={editFormData.is_active || false}
                          onChange={handleInputChange}
                          className="w-4 h-4 border border-gray-300 rounded focus:outline-none focus:border-[#28A453]"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end mt-6">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateListing(listing.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-[#28A453] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Listing Display
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Image */}
                      <div className="flex-shrink-0">
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
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-2xl font-semibold text-gray-800">
                              {listing.title}
                            </h3>
                            <p className="text-gray-500 mt-1">{listing.location}</p>
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
                          {/* <div>
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
                          </div> */}
                        </div>

                        <p className="text-gray-600 mb-6">
                          Floor{" "}
                          {listing.floor_of_this_apartment} of{" "}
                          {listing.total_floor_of_building}
                        </p>

                        {listing.images && listing.images.length > 0 && (
                          <div className="flex gap-2 mb-6">
                            {listing.images.map((img, idx) => (
                              <img
                                key={img.id}
                                src={img.image}
                                alt={`listing ${idx}`}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ))}
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
