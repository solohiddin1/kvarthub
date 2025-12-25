import { useEffect, useState } from "react";
import { LikedFilledIcon, LikedIcon } from "../assets/icons";
import type { ProductsType } from "../types/auth";
import { useNavigate } from "react-router";
import { Footer } from "../modules";
import { HeaderPart } from "../components";

const Saved = () => {
   const navigate = useNavigate()

  const [savedCard,setSavedCard] = useState(() =>{
    const saved = localStorage.getItem("savedCard");
    return saved ? JSON.parse(saved) : [];

  })
  const [likedBtnId,setLikedBtnId] = useState(() =>{
    const likedBtnId = localStorage.getItem("likedBtnId");
    return likedBtnId ? JSON.parse(likedBtnId) : [];

  })

  function SavedCard(id:number){
     if(likedBtnId.includes(id)){
      setLikedBtnId(likedBtnId.filter((item:number )=> item !== id))
      setSavedCard(savedCard.filter((item:ProductsType) => item.id !== id))

  }
}


useEffect(() =>{
  localStorage.setItem("likedBtnId",JSON.stringify(likedBtnId))
},[likedBtnId])


useEffect(() =>{
  localStorage.setItem("savedCard",JSON.stringify(savedCard))
},[savedCard])

  return (
    <>
    <HeaderPart/>
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-blue-50 py-8 px-4 md:px-8">
      {/* Title part */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Saqlangan mahsulotlar
            </h1>
            <p className="text-gray-600 mt-2">
              {savedCard.length === 0
                ? "Hozircha saqlangan mahsulotlar yo'q"
                : `Jami ${savedCard.length} ta mahsulot saqlangan`}
            </p>
          </div>

          {savedCard.length > 0 && (
            <div className="flex items-center gap-4">
              <button className="px-6 py-2.5 bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95">
                Barchasini o'chirish
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content  */}
      {savedCard.length === 0 ? (
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm p-12 text-center border border-gray-200">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-r from-blue-100 to-purple-100 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">
              Saqlangan mahsulotlar yo'q
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Mahsulotlarni saqlash uchun ♡ belgisini bosing. Saqlangan
              mahsulotlar shu yerda ko'rinadi.
            </p>
            <button onClick={() => navigate("/")}  className="px-8 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer">
              Mahsulotlarni ko'rish
            </button>
          </div>
        </div>
      ) : (
        <div className="containers  grid grid-cols-1 md:grid-cols-3 lg:flex lg:flex-wrap lg:justify-between  gap-3 py-5 px-5">
          {savedCard.map((item: ProductsType) => (
            <div
              key={item.id}
              className=" bg-[#0000000D] lg:w-[300px] rounded-[20px] relative"
            >
              {/* liked button start */}
              <div  onClick={() => SavedCard(item.id)} className={`w-10 md:w-12 h-10 md:h-12 flex justify-center items-center rounded-xl bg-[#FFFFFF4D] absolute top-2 right-2 cursor-pointer ${likedBtnId.includes(item.id) ? "text-[#FF383C]":"text-black"}`}>
                   {
                    likedBtnId.includes(item.id) ? (
                      <LikedFilledIcon/>
                    ):(
                      <LikedIcon />

                    )
                   }
              </div>
              {/* liked button end */}
              <img src={item.images && item.images.length > 0 ? item.images[0].image : '/placeholder.jpg'} alt={item.title} width={357} height={320} />
              <div className="pt-4  p-5  pb-7">
                <h2 className="line-clamp-2 font-medium text-[#000000] text-[18px]">
                  {item.title}
                </h2>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-[#757575]">${item.price}</p>
                  <p className="text-[14px] text-[#A6A6A6]">{item.rooms} rooms</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    <Footer/>
    </>
  );
};

export default Saved;
