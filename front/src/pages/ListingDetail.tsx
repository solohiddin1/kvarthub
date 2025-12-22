import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header, Footer } from "../modules";
import apiClient from "../services/api";

interface ListingImage {
  id: number;
  image: string;
}

interface Listing {
  id: number;
  title: string;
  description: string;
  host: number;
  price: string;
  location: string;
  lat: string;
  long: string;
  rooms: number;
  beds: number;
  bathrooms: number;
  max_people: number;
  phone_number: string;
  total_floor_of_building: number;
  floor_of_this_apartment: number;
  square_meters: string;
  region: number;
  district: number;
  is_active: boolean;
  images: ListingImage[];
}

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
        console.error("Failed to fetch listing:", err);
        setError(err.response?.data?.message || "Failed to load listing details");
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

  return (
    <>
      <Header />
      <div className="containers max-w-6xl mx-auto py-8 px-5">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Image Gallery */}
          <div>
            <div className="mb-4">
              <img
                src={mainImage}
                alt={listing.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>

            {/* Image Thumbnails */}
            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {listing.images.map((img, idx) => (
                  <img
                    key={img.id}
                    src={img.image}
                    alt={`listing ${idx}`}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                      idx === selectedImageIndex
                        ? "border-[#28A453]"
                        : "border-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Listing Details */}
          <div>
            {/* Status Badge */}
            <div className="mb-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  listing.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {listing.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {listing.title}
            </h1>

            {/* Location */}
            <p className="text-lg text-gray-600 mb-4">{listing.location}</p>

            {/* Price */}
            <p className="text-4xl font-bold text-[#28A453] mb-6">
              ${listing.price}
              <span className="text-lg text-gray-600">/month</span>
            </p>

            {/* Description */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Description
              </h3>
              <p className="text-gray-700">{listing.description}</p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white border border-gray-300 rounded-lg p-4">
                <p className="text-gray-600 text-sm">Rooms</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {listing.rooms}
                </p>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-4">
                <p className="text-gray-600 text-sm">Beds</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {listing.beds}
                </p>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-4">
                <p className="text-gray-600 text-sm">Bathrooms</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {listing.bathrooms}
                </p>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-4">
                <p className="text-gray-600 text-sm">Max People</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {listing.max_people}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Square Meters:</span>
                <span className="font-semibold text-gray-800">
                  {listing.square_meters} m²
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Floor:</span>
                <span className="font-semibold text-gray-800">
                  {listing.floor_of_this_apartment} of{" "}
                  {listing.total_floor_of_building}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Region ID:</span>
                <span className="font-semibold text-gray-800">
                  {listing.region}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">District ID:</span>
                <span className="font-semibold text-gray-800">
                  {listing.district}
                </span>
              </div>
            </div>

            {/* Contact Info */}
            {listing.phone_number && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-gray-600 text-sm mb-1">Contact</p>
                <p className="text-xl font-semibold text-gray-800">
                  {listing.phone_number}
                </p>
              </div>
            )}

            {/* Coordinates */}
            {listing.lat && listing.long && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Latitude</p>
                  <p className="font-semibold text-gray-800">{listing.lat}</p>
                </div>
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Longitude</p>
                  <p className="font-semibold text-gray-800">{listing.long}</p>
                </div>
              </div>
            )}

            {/* Contact Button */}
            <button className="w-full py-3 bg-[#28A453] text-white rounded-lg font-semibold hover:opacity-90 mb-4">
              Contact Host
            </button>

            {/* Share Button */}
            <button className="w-full py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400">
              Share Listing
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ListingDetail;
