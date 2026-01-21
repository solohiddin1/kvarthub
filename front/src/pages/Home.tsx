import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { ProductsType } from "../types/auth"
import { LikedFilledIcon, LikedIcon } from "../assets/icons"
import { Footer, Header } from "../modules"
import { Skleton } from "../components"
import apiClient from "../services/api"
import type { ListingFilters } from "../modules/Header" // pathni o'zingni strukturangga qarab to'g'rila

interface Region {
  id: number
  name_uz: string
  name_ru: string
  name_en: string
  soato_id: number
}


const Home = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<ProductsType[]>([])
  const [loading, setLoading] = useState(false)
  const [productsCount, setProductsCount] = useState<number>(0)
  const [regions, setRegions] = useState<Region[]>([])
  const [regionsLoading, setRegionsLoading] = useState(false)
  
  

  
  const [filters, setFilters] = useState<ListingFilters>({
    search: "",
    min_price: "",
    max_price: "",
    rooms: "",
    for_whom: "",
    region: "",
  })

  const [savedCard, setSavedCard] = useState(() => {
    const saved = localStorage.getItem("savedCard")
    return saved ? JSON.parse(saved) : []
  })
  const [likedBtnId, setLikedBtnId] = useState<number[]>(() => {
    const data = localStorage.getItem("likedBtnId")
    return data ? JSON.parse(data) : []
  })

  // Query string yasash (bo'sh bo'lsa qo'shmaydi)
  const queryString = useMemo(() => {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);

  // ⚠️ backend kutyapti: price__gte va price__lte
  if (filters.min_price) params.set("price__gte", filters.min_price);
  if (filters.max_price) params.set("price__lte", filters.max_price);

  if (filters.rooms) params.set("rooms", filters.rooms);
  if (filters.for_whom) params.set("for_whom", filters.for_whom);
  if (filters.region) params.set("region", filters.region);

  return params.toString();
}, [filters]);

  // listings fetch (filter o'zgarsa qayta chaqiladi)
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true)

        const url = queryString
          ? `/api/listings/listings/?${queryString}`
          : `/api/listings/listings/`

        const response = await apiClient.get(url)
        if (response.data?.result && Array.isArray(response.data.result)) {
          setProducts(response.data.result)
          setProductsCount(response.data.result.length)
        } else if (Array.isArray(response.data)) {
          setProducts(response.data)
          setProductsCount(response.data.length)
        } else {
          setProducts([])
          setProductsCount(0)
        }
      } catch (error) {
        console.error("Failed to fetch listings:", error)
        setProducts([])
        setProductsCount(0)
      } finally {
        setLoading(false)
      }
    }

    // search typingda juda ko'p request bo'lmasin: kichik debounce
    const t = setTimeout(fetchListings, 350)
    return () => clearTimeout(t)
  }, [queryString])

  // regions fetch
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setRegionsLoading(true)
        const response = await apiClient.get("/api/shared/regions/")

        if (response.data?.result && Array.isArray(response.data.result)) {
          setRegions(response.data.result)
        } else {
          setRegions([])
        }
      } catch (error) {
        console.error("Failed to fetch regions:", error)
        setRegions([])
      } finally {
        setRegionsLoading(false)
      }
    }

    fetchRegions()
  }, [])

  function SavedCard(id: number) {
    if (likedBtnId.includes(id)) {
      setLikedBtnId(likedBtnId.filter((item) => item !== id))
      setSavedCard(savedCard.filter((item: ProductsType) => item.id !== id))
    } else {
      const card = products.find((item: ProductsType) => item.id === id)
      if (!card) return null
      setSavedCard([...savedCard, card])
      setLikedBtnId([...likedBtnId, id])
    }
  }

  useEffect(() => {
    localStorage.setItem("likedBtnId", JSON.stringify(likedBtnId))
  }, [likedBtnId])

  useEffect(() => {
    localStorage.setItem("savedCard", JSON.stringify(savedCard))
  }, [savedCard])

  const toggleRegion = (regionId: number) => {
    setFilters((p) => ({
      ...p,
      region: p.region === String(regionId) ? "" : String(regionId),
    }))
  }
  
  console.log(products);
  


  return (
    <div>
      <Header filters={filters} onChangeFilters={setFilters} />

      <ul className="containers pt-5 pb-6 lg:pb-[63px] flex justify-between gap-2 overflow-x-auto scrollbar-hidden scroll-smooth">
        {regionsLoading ? (
          <li className="py-[13px] px-6 rounded-[30px] bg-[#0000000D] text-gray-500">
            Loading...
          </li>
        ) : regions.length > 0 ? (
          regions.map((region) => (
            <li
              key={region.id}
              onClick={() => toggleRegion(region.id)}
              className={`py-[13px] px-6 rounded-[30px] cursor-pointer transition whitespace-nowrap ${
                filters.region === String(region.id)
                  ? "bg-[#28A453] text-white"
                  : "bg-[#0000000D] hover:bg-gray-300"
              }`}
            >
              {region.name_uz}
            </li>
          ))
        ) : (
          <li className="py-[13px] px-6 rounded-[30px] bg-[#0000000D] text-gray-500">
            No regions available
          </li>
        )}
      </ul>

      <Skleton loading={loading} productsCount={productsCount} />

      {!loading && products.length === 0 && (
        <div className="containers py-10 text-center">
          <p className="text-gray-500 text-lg">No listings available yet</p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="containers grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap lg:justify-between gap-3 py-5 px-5">
          {products.map((item: ProductsType) => (
            <div
              key={item.id}
              onClick={() => navigate(`/listing/${item.id}`)}
              className="bg-[#0000000D] min-h-[319px] lg:w-[357px] rounded-[20px] relative cursor-pointer transition-shadow"
            >
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  SavedCard(item.id)
                }}
                className={`w-10 md:w-12 h-10 md:h-12 flex justify-center items-center rounded-xl bg-[#FFFFFF4D] absolute top-2 right-2 cursor-pointer ${
                  likedBtnId.includes(item.id) ? "text-[#FF383C]" : "text-black"
                }`}
              >
                {likedBtnId.includes(item.id) ? <LikedFilledIcon /> : <LikedIcon />}
              </div>

              <img
                className="rounded-[20px] w-[357px] h-53 md:h-80 object-cover "
                src={
                  item.images && item.images.length > 0
                    ? item.images[0].image
                    : "/placeholder.jpg"
                }
                alt={item.title}
                width={194}
                height={212}
              />

              <div className=" p-3">
                <h2 className="line-clamp-2 font-medium text-[#000000] text-[18px]">
                  {item.title}
                </h2>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[#757575]">{item.price} UZS</p>
                  <p className="text-[14px] text-[#A6A6A6]">{item.rooms} rooms</p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-[#757575]">{item.district.name_uz}</p>
                  <p className="text-[#757575]">{item.for_whom == "GIRLS" ? "Qizlarga" : item.for_whom == "BOYS" ? "Bolalarga" : item.for_whom == "FAMILY" ? "Oilaga" : "Umumiy"}</p>
                  
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Footer />
    </div>
  )
}

export default Home