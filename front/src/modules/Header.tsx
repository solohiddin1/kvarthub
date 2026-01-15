import { FiltrIcon, SearchIcon } from "../assets/icons";
import { HeaderPart } from "../components";
import { useState, useEffect } from "react";

const Header = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  
  // Viloyat va tumanlar ma'lumotlari
  const regionsData = [
    { 
      id: 1, 
      name: "Toshkent", 
      districts: [
        { id: 101, name: "Yunusobod" },
        { id: 102, name: "Mirzo Ulug'bek" },
        { id: 103, name: "Yakkasaroy" },
        { id: 104, name: "Shayxontohur" },
        { id: 105, name: "Olmazor" },
        { id: 106, name: "Bektemir" },
        { id: 107, name: "Yangihayot" },
        { id: 108, name: "Uchtepa" },
        { id: 109, name: "Sergeli" },
        { id: 110, name: "Chilonzor" }
      ]
    },
    { 
      id: 2, 
      name: "Samarqand", 
      districts: [
        { id: 201, name: "Samarqand shahri" },
        { id: 202, name: "Bulung'ur" },
        { id: 203, name: "Jomboy" },
        { id: 204, name: "Ishtixon" },
        { id: 205, name: "Kattaqo'rg'on" },
        { id: 206, name: "Narpay" },
        { id: 207, name: "Nurobod" },
        { id: 208, name: "Oqdaryo" },
        { id: 209, name: "Paxtachi" },
        { id: 210, name: "Toyloq" }
      ]
    },
    { 
      id: 3, 
      name: "Buxoro", 
      districts: [
        { id: 301, name: "Buxoro shahri" },
        { id: 302, name: "Olot" },
        { id: 303, name: "Peshku" },
        { id: 304, name: "Romitan" },
        { id: 305, name: "Shofirkon" },
        { id: 306, name: "Vobkent" },
        { id: 307, name: "Jondor" },
        { id: 308, name: "Qorako'l" },
        { id: 309, name: "Qorovulbozor" }
      ]
    },
    { 
      id: 4, 
      name: "Andijon", 
      districts: [
        { id: 401, name: "Andijon shahri" },
        { id: 402, name: "Asaka" },
        { id: 403, name: "Baliqchi" },
        { id: 404, name: "Bo'ston" },
        { id: 405, name: "Buloqboshi" },
        { id: 406, name: "Izboskan" },
        { id: 407, name: "Jalaquduq" },
        { id: 408, name: "Marhamat" },
        { id: 409, name: "Oltinko'l" },
        { id: 410, name: "Paxtaobod" },
        { id: 411, name: "Qo'rg'ontepa" },
        { id: 412, name: "Shahrixon" },
        { id: 413, name: "Xo'jaobod" }
      ]
    },
    { 
      id: 5, 
      name: "Farg'ona", 
      districts: [
        { id: 501, name: "Farg'ona shahri" },
        { id: 502, name: "Beshariq" },
        { id: 503, name: "Bog'dod" },
        { id: 504, name: "Buvayda" },
        { id: 505, name: "Dang'ara" },
        { id: 506, name: "Furqat" },
        { id: 507, name: "O'zbekiston" },
        { id: 508, name: "Qo'shtepa" },
        { id: 509, name: "Quva" },
        { id: 510, name: "Rishton" },
        { id: 511, name: "So'x" },
        { id: 512, name: "Toshloq" },
        { id: 513, name: "Uchko'prik" },
        { id: 514, name: "Yozyovon" }
      ]
    },
    { 
      id: 6, 
      name: "Namangan", 
      districts: [
        { id: 601, name: "Namangan shahri" },
        { id: 602, name: "Chortoq" },
        { id: 603, name: "Chust" },
        { id: 604, name: "Kosonsoy" },
        { id: 605, name: "Mingbuloq" },
        { id: 606, name: "Norin" },
        { id: 607, name: "Pop" },
        { id: 608, name: "To'raqo'rg'on" },
        { id: 609, name: "Uchqo'rg'on" },
        { id: 610, name: "Uychi" },
        { id: 611, name: "Yangiqo'rg'on" }
      ]
    },
    { 
      id: 7, 
      name: "Navoiy", 
      districts: [
        { id: 701, name: "Navoiy shahri" },
        { id: 702, name: "Karmana" },
        { id: 703, name: "Konimex" },
        { id: 704, name: "Navbahor" },
        { id: 705, name: "Nurota" },
        { id: 706, name: "Qiziltepa" },
        { id: 707, name: "Tomdi" },
        { id: 708, name: "Uchquduq" },
        { id: 709, name: "Xatirchi" }
      ]
    },
    { 
      id: 8, 
      name: "Qashqadaryo", 
      districts: [
        { id: 801, name: "Qarshi shahri" },
        { id: 802, name: "Chiroqchi" },
        { id: 803, name: "Dehqonobod" },
        { id: 804, name: "G'uzor" },
        { id: 805, name: "Kasbi" },
        { id: 806, name: "Kitob" },
        { id: 807, name: "Koson" },
        { id: 808, name: "Mirishkor" },
        { id: 809, name: "Muborak" },
        { id: 810, name: "Nishon" },
        { id: 811, name: "Qamashi" },
        { id: 812, name: "Shahrisabz" },
        { id: 813, name: "Yakkabog'" }
      ]
    },
    { 
      id: 9, 
      name: "Surxondaryo", 
      districts: [
        { id: 901, name: "Termiz shahri" },
        { id: 902, name: "Angor" },
        { id: 903, name: "Bandixon" },
        { id: 904, name: "Boysun" },
        { id: 905, name: "Denov" },
        { id: 906, name: "Jarqo'rg'on" },
        { id: 907, name: "Muzrabot" },
        { id: 908, name: "Oltinsoy" },
        { id: 909, name: "Qiziriq" },
        { id: 910, name: "Qumqo'rg'on" },
        { id: 911, name: "Sariosiyo" },
        { id: 912, name: "Sherobod" },
        { id: 913, name: "Sho'rchi" },
        { id: 914, name: "Termiz tumani" },
        { id: 915, name: "Uzun" }
      ]
    },
    { 
      id: 10, 
      name: "Jizzax", 
      districts: [
        { id: 1001, name: "Jizzax shahri" },
        { id: 1002, name: "Arnasoy" },
        { id: 1003, name: "Baxmal" },
        { id: 1004, name: "Do'stlik" },
        { id: 1005, name: "Forish" },
        { id: 1006, name: "G'allaorol" },
        { id: 1007, name: "Mirzacho'l" },
        { id: 1008, name: "Paxtakor" },
        { id: 1009, name: "Yangiobod" },
        { id: 1010, name: "Zafarobod" },
        { id: 1011, name: "Zarbdor" },
        { id: 1012, name: "Zomin" }
      ]
    },
    { 
      id: 11, 
      name: "Sirdaryo", 
      districts: [
        { id: 1101, name: "Guliston shahri" },
        { id: 1102, name: "Boyovut" },
        { id: 1103, name: "Guliston tumani" },
        { id: 1104, name: "Mirzaobod" },
        { id: 1105, name: "Oqoltin" },
        { id: 1106, name: "Sardoba" },
        { id: 1107, name: "Sayxunobod" },
        { id: 1108, name: "Sirdaryo tumani" },
        { id: 1109, name: "Xovos" }
      ]
    },
    { 
      id: 12, 
      name: "Xorazm", 
      districts: [
        { id: 1201, name: "Urganch shahri" },
        { id: 1202, name: "Bog'ot" },
        { id: 1203, name: "Gurlan" },
        { id: 1204, name: "Hazorasp" },
        { id: 1205, name: "Xonqa" },
        { id: 1206, name: "Qo'shko'pir" },
        { id: 1207, name: "Shovot" },
        { id: 1208, name: "Urganch tumani" },
        { id: 1209, name: "Yangiariq" },
        { id: 1210, name: "Yangibozor" }
      ]
    },
    { 
      id: 13, 
      name: "Qoraqalpog'iston", 
      districts: [
        { id: 1301, name: "Nukus shahri" },
        { id: 1302, name: "Amudaryo" },
        { id: 1303, name: "Beruniy" },
        { id: 1304, name: "Chimboy" },
        { id: 1305, name: "Ellikqala" },
        { id: 1306, name: "Kegeyli" },
        { id: 1307, name: "Mo'ynoq" },
        { id: 1308, name: "Nukus tumani" },
        { id: 1309, name: "Qonliko'l" },
        { id: 1310, name: "Qo'ng'irot" },
        { id: 1311, name: "Shumanay" },
        { id: 1312, name: "Taxtako'pir" },
        { id: 1313, name: "To'rtko'l" },
        { id: 1314, name: "Xo'jayli" }
      ]
    }
  ];

  // Tanlangan viloyat obyektini topish
  const selectedRegionData = regionsData.find(region => 
    region.id.toString() === selectedRegion
  );

  // Tumanlarni chiqarish funksiyasi
  const renderDistricts = () => {
    if (!selectedRegionData) return null;
    
    return selectedRegionData.districts.map((district) => (
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
    if (selectedRegionData) {
      const regionName = selectedRegionData.name;
      console.log("Tanlangan viloyat nomi:", regionName);
      
      if (selectedDistrict) {
        const districtData = selectedRegionData.districts.find(
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
                    {regionsData.map((region) => (
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