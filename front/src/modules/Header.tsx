import { FiltrIcon, SearchIcon } from "../assets/icons"
import { HeaderPart } from "../components"
import { useEffect, useMemo, useState } from "react"

export type ListingFilters = {
  search?: string
  min_price?: string
  max_price?: string
  rooms?: string
  for_whom?: "" | "BOYS" | "GIRLS" | "FAMILY" | "FOREIGNERS"
  region?: string // region id
}

type HeaderProps = {
  filters?: ListingFilters
  onChangeFilters?: (next: ListingFilters) => void
}

const DEFAULT_FILTERS: ListingFilters = {
  search: "",
  min_price: "",
  max_price: "",
  rooms: "",
  for_whom: "",
  region: "",
}

const Header = ({ filters, onChangeFilters }: HeaderProps) => {
  // ✅ Safe values (propsiz ham ishlaydi)
  const safeFilters = useMemo(() => ({ ...DEFAULT_FILTERS, ...(filters ?? {}) }), [filters])
  const safeOnChange = useMemo(() => onChangeFilters ?? (() => {}), [onChangeFilters])

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // local (modal) state
  const [localFilters, setLocalFilters] = useState<ListingFilters>(safeFilters)

  useEffect(() => {
    setLocalFilters(safeFilters)
  }, [safeFilters])

  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = "hidden"
      setTimeout(() => setIsVisible(true), 10)
    } else {
      document.body.style.overflow = "unset"
      setIsVisible(false)
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isFilterOpen])

  const applyFilters = () => {
    safeOnChange({
      ...safeFilters,
      ...localFilters,
    })
    setIsFilterOpen(false)
  }

  const resetFilters = () => {
    const cleared: ListingFilters = {
      ...DEFAULT_FILTERS,
      // search va regionni saqlab qolmoqchi bo'lsang:
      search: safeFilters.search || "",
      region: safeFilters.region || "",
    }
    setLocalFilters(cleared)
    safeOnChange(cleared)
    setIsFilterOpen(false)
  }

  return (
    <>
      <HeaderPart />

      <div className="bg-[#DBF0E2] py-[30px] sm:py-[70px] px-5">
        <div className="containers flex justify-between">
          <label className="w-[80%] bg-white py-4.5 pl-7 rounded-[30px] block relative border border-transparent duration-300 hover:border-[#28A453]">
            <input
              type="text"
              placeholder="Qidirish"
              value={safeFilters.search || ""}
              onChange={(e) =>
                safeOnChange({
                  ...safeFilters,
                  search: e.target.value,
                })
              }
              className="text-[#5C5C5C] placeholder:text-[#5C5C5C] w-[80%] outline-none pl-10"
            />
            <div className="flex items-center gap-1.5 absolute top-4.5 text-[#1C1C1C]">
              <SearchIcon />
              <div className="w-px h-5 bg-[#0000001A]"></div>
            </div>
          </label>

          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center justify-center gap-4.5 py-4.5 rounded-[40px] bg-[#28A453] w-[19%] cursor-pointer duration-300 hover:opacity-80 group relative"
          >
            <FiltrIcon />
            <span className="text-white font-medium hidden md:flex">Filter</span>
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      <div className={`fixed inset-0 z-50 ${!isFilterOpen ? "pointer-events-none" : ""}`}>
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${
            isVisible ? "opacity-50" : "opacity-0"
          }`}
          onClick={() => setIsFilterOpen(false)}
        />

        <div className="flex items-end justify-center min-h-screen px-4 pb-4 text-center sm:block sm:p-0">
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
                    <svg className="w-6 h-6 text-[#28A453]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Filterlar</h3>
                    <p className="text-sm text-gray-500 mt-1">Kerakli filterlarni tanlang</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
              {/* Price Range */}
              <div className="mb-7">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-semibold text-gray-900">Narx oralig'i</h4>
                </div>

                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Min:</span>
                    <input
                      type="number"
                      value={localFilters.min_price || ""}
                      onChange={(e) =>
                        setLocalFilters((p) => ({ ...p, min_price: e.target.value }))
                      }
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm duration-300 focus:border-[#28A453] focus:ring-1 focus:ring-[#28A453] outline-0"
                      placeholder="0"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Max:</span>
                    <input
                      type="number"
                      value={localFilters.max_price || ""}
                      onChange={(e) =>
                        setLocalFilters((p) => ({ ...p, max_price: e.target.value }))
                      }
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm duration-300 focus:border-[#28A453] focus:ring-1 focus:ring-[#28A453] outline-0"
                      placeholder="1000"
                    />
                  </div>
                </div>
              </div>

              {/* Rooms */}
              <div className="mb-5">
                <h4 className="text-base font-semibold text-gray-900 mb-2">Xonalar soni</h4>
                <input
                  type="number"
                  value={localFilters.rooms || ""}
                  onChange={(e) => setLocalFilters((p) => ({ ...p, rooms: e.target.value }))}
                  placeholder="0"
                  className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border rounded-xl duration-200 border-gray-300 focus:border-[#28A453] focus:ring-1 focus:ring-[#28A453] outline-none"
                />
              </div>

              {/* For whom */}
              <div className="mb-7">
                <h4 className="text-base font-semibold text-gray-900 mb-4">Kim uchun</h4>
                <div className="relative">
                  <select
                    value={localFilters.for_whom || ""}
                    onChange={(e) =>
                      setLocalFilters((p) => ({
                        ...p,
                        for_whom: e.target.value as ListingFilters["for_whom"],
                      }))
                    }
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:border-[#28A453] focus:ring-1 focus:ring-[#28A453] focus:ring-opacity-20 appearance-none transition-all duration-300 outline-0"
                  >
                    <option value="">Kim uchun</option>
                    <option value="FAMILY">Oila</option>
                    <option value="GIRLS">Qizlar</option>
                    <option value="BOYS">Bolalar</option>
                    <option value="FOREIGNERS">Chet elliklar</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  onClick={resetFilters}
                  className="flex-1 px-6 py-3.5 text-gray-700 bg-white border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 focus:outline-none transition-all duration-200 active:scale-95"
                >
                  Tozalash
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 px-6 py-3.5 text-white bg-linear-to-r from-[#28A453] to-emerald-500 rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-200 focus:outline-none transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Filter qollash
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Header