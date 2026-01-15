import { FiltrIcon, SearchIcon } from "../assets/icons";
import { HeaderPart } from "../components";
import { useState, useEffect } from "react";
import apiClient from "../services/api";

interface District {
  id: number;
  name: string;
  region: number;
}

interface Region {
  id: number;
  name: string;
}

const Header = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [allDistricts, setAllDistricts] = useState<District[]>([]);
  
  // Fetch regions and districts on mount
  useEffect(() => {
    const fetchRegionsAndDistricts = async () => {
      try {
        const [regionsRes, districtsRes] = await Promise.all([
          apiClient.get("/api/shared/regions/"),
          apiClient.get("/api/shared/districts/")
        ]);
        
        if (regionsRes.data?.result) {
          setRegions(regionsRes.data.result);
        }
        
        if (districtsRes.data?.result) {
          setAllDistricts(districtsRes.data.result);
        }
      } catch (error) {
        console.error("Error fetching regions/districts:", error);
      }
    };
    
    fetchRegionsAndDistricts();
  }, []);
  
  // Filter districts based on selected region
  useEffect(() => {
    if (selectedRegion) {
      const filtered = allDistricts.filter(
        district => district.region.toString() === selectedRegion
      );
      setDistricts(filtered);
    } else {
      setDistricts([]);
    }
  }, [selectedRegion, allDistricts]);
  
  // Tumanlarni chiqarish funksiyasi
  const renderDistricts = () => {
    return districts.map((district) => (
      <option key={district.id} value={district.id}>
        {district.name}
      </option>
    ));
  };

  // Modal ochilganda state'larni tozalash
  const handleOpenFilter = () => {
    setIsFilterOpen(true);
    setSelectedRegion("");
    setSelectedDistrict("");
  };

  // Modal yopilganda state'larni tozalash
  const handleCloseFilter = () => {
    setIsFilterOpen(false);
    setSelectedRegion("");
    setSelectedDistrict("");
  };

  // Filter qo'llash va modalni yopish
  const handleApplyFilter = () => {
    // Bu yerda filter ma'lumotlarini saqlash yoki qo'llash logikasi
    console.log("Tanlangan viloyat ID:", selectedRegion);
    console.log("Tanlangan tuman ID:", selectedDistrict);
    
    // Agar viloyat va tuman nomlarini ham olish kerak bo'lsa:
    if (selectedRegion) {
      const regionData = regions.find(r => r.id.toString() === selectedRegion);
      console.log("Tanlangan viloyat nomi:", regionData?.name);
      
      if (selectedDistrict) {
        const districtData = districts.find(
          d => d.id.toString() === selectedDistrict
        );
        console.log("Tanlangan tuman nomi:", districtData?.name);
      }
    }
    
    setIsFilterOpen(false);
  };

  // Modal ochilish/yopilish animatsiyalari
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => setIsVisible(true), 10);
    } else {
      document.body.style.overflow = "unset";
      setIsVisible(false);
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFilterOpen]);

  return (
    <>
      <HeaderPart />

      <div className="bg-[#DBF0E2] py-[30px] sm:py-[70px] px-5">
        <div className="containers flex justify-between">
          <label className="w-[80%] bg-white py-4.5 pl-7 rounded-[30px] block relative border border-transparent duration-300 hover:border-[#28A453]">
            <input
              type="text"
              placeholder="Search"
              className=" text-[#5C5C5C] placeholder:text-[#5C5C5C] w-[80%] outline-none pl-10"
            />
            <div className="flex items-center gap-1.5 absolute top-4.5 text-[#1C1C1C]">
              <SearchIcon />
              <div className="w-px h-5 bg-[#0000001A]"></div>
            </div>
          </label>

          {/* Filter Button */}
          <button
            onClick={handleOpenFilter}
            className="flex items-center justify-center gap-4.5 py-4.5 rounded-[40px] bg-[#28A453] w-[19%] cursor-pointer duration-300 hover:opacity-80 group relative"
          >
            <FiltrIcon />
            <span className="text-white font-medium hidden md:flex">
              Filter
            </span>
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      <div
        className={`fixed inset-0 z-50 ${
          !isFilterOpen ? "pointer-events-none" : ""
        }`}
      >
        {/* Backdrop - sekin ochiladi */}
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${
            isVisible ? "opacity-50" : "opacity-0"
          }`}
          onClick={handleCloseFilter}
        />

        {/* Modal - pastdan chiqib keladi */}
        <div className="flex items-end justify-center min-h-screen px-4 pb-4 text-center sm:block sm:p-0">
          {/* Modal container */}
          <div
            className={`inline-block align-bottom bg-white rounded-t-2xl rounded-b-none sm:rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all duration-300 sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-full opacity-0 sm:translate-y-8 sm:scale-95"
            }`}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#28A453] bg-opacity-10 rounded-lg">
                    <svg
                      className="w-6 h-6 text-[#28A453]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Filterlar
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Kerakli filterlarni tanlang
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseFilter}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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

            {/* Modal Content */}
            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
              {/* Price Range Filter */}
              <div className="mb-7">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-semibold text-gray-900">
                    Narx oralig'i
                  </h4>
                  <span className="text-sm text-[#28A453] font-medium">
                    0 - 1000 so'm
                  </span>
                </div>
                <div className="space-y-5">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Min:</span>
                      <input
                        type="number"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm duration-300 focus:border-[#28A453] focus:ring-1 focus:ring-[#28A453] outline-0"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Max:</span>
                      <input
                        type="number"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm duration-300 focus:border-[#28A453] focus:ring-1 focus:ring-[#28A453] outline-0"
                        placeholder="1000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Number of rooms  */}
              <div className="mb-3">
                <h4 className="text-base font-semibold text-gray-900 mb-2">
                  Xonalar soni
                </h4>
                <input
                  type="text"
                  placeholder="0"
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white  border  rounded-xl   duration-200 border-gray-300  focus:border-[#28A453] focus:ring-1 focus:ring-[#28A453] outline-none"
                />
              </div>

              {/* Viloyat filteri */}
              <div className="mb-4">
                <h4 className="text-base font-semibold text-gray-900 mb-2">
                  Viloyat
                </h4>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 focus:border-[#28A453] focus:ring-1 focus:ring-[#28A453] focus:ring-opacity-20 appearance-none transition-all duration-300 outline-0"
                    value={selectedRegion}
                    onChange={(e) => {
                      setSelectedRegion(e.target.value);
                      setSelectedDistrict("");
                    }}
                  >
                    <option value="">Viloyatni tanlang</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
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
                </div>
              </div>

              {/* Tuman filteri */}
              <div className="mb-4">
                <h4 className="text-base font-semibold text-gray-900 mb-2">
                  Tuman
                </h4>
                <div className="relative">
                  <select
                    className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 focus:border-[#28A453] focus:ring-1 focus:ring-[#28A453] focus:ring-opacity-20 appearance-none transition-all duration-300 outline-0 ${
                      !selectedRegion ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={!selectedRegion}
                  >
                    <option value="">Tumanni tanlang</option>
                    {renderDistricts()}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
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
                </div>
                {!selectedRegion && (
                  <p className="text-xs text-gray-500 mt-2">
                    Tumanni tanlash uchun avval viloyatni tanlang
                  </p>
                )}
              </div>

              {/* for whom  */}
              <div className="mb-7">
                <h4 className="text-base font-semibold text-gray-900 mb-4">
                  Kim uchun
                </h4>
                <div className="relative">
                  <select className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:border-[#28A453] focus:ring-1 focus:ring-[#28A453] focus:ring-opacity-20 appearance-none transition-all duration-300 outline-0">
                    <option value="">Kim uchun</option>
                    <option value="oila">Oila</option>
                    <option value="qizlar">Qizlar</option>
                    <option value="bolalar">Bolalar</option>
                    <option value="umumiy">Umumiy</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
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
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  onClick={handleCloseFilter}
                  className="flex-1 px-6 py-3.5 text-gray-700 bg-white border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 focus:outline-none transition-all duration-200 active:scale-95"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleApplyFilter}
                  className="flex-1 px-6 py-3.5 text-white bg-linear-to-r from-[#28A453] to-emerald-500 rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-200 focus:outline-none transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
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
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Filter qo'llash
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;