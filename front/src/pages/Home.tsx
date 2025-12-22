import {  useEffect, useState } from "react"
import axios from "axios"
import type { ProductsType } from "../types/auth"
import { LikedFilledIcon, LikedIcon } from "../assets/icons"
import { Footer, Header } from "../modules"
import { Skleton } from "../components"

const Home = () => {
  const [products,setProducts] = useState<ProductsType[]>([])
  const [loading,setLoading] = useState(false)
  const [productsCount,setProductsCount] = useState<number>(30)
  const [savedCard,setSavedCard] = useState(() =>{
    const saved = localStorage.getItem("savedCard")
     return  saved ? JSON.parse(saved) : []
  })
  const [likedBtnId, setLikedBtnId] = useState<number[]>(() => {
    const data = localStorage.getItem("likedBtnId");
    return data ? JSON.parse(data) : [];
});


  // saved card start 
  function SavedCard(id:number){
    if(likedBtnId.includes(id)){
      setLikedBtnId(likedBtnId.filter(item => item !== id))
      setSavedCard(savedCard.filter((item:ProductsType) => item.id !== id))
    }

    else{
      const card = products.find((item:ProductsType) => item.id === id)
      if(!card) return null
      setSavedCard([...savedCard,card])
      setLikedBtnId([...likedBtnId,id])
    }  
}

// click like
useEffect(() => {
  localStorage.setItem("likedBtnId", JSON.stringify(likedBtnId))
}, [likedBtnId])


useEffect(() =>{
  localStorage.setItem("savedCard",JSON.stringify(savedCard))
},[savedCard])
// saved card end 

useEffect(() =>{
  axios.get("https://dummyjson.com/products").then(res =>{
    setProducts(res.data.products);
    setLoading(true)
    setProductsCount(res.data.products.length)
  })
},[])

return (
    <div>
        <Header/>
        <ul className=" containers pt-5 pb-6 lg:pb-[63px] flex justify-between    gap-2 overflow-x-auto scrollbar-hidden scroll-smooth">
          <li className="py-[13px] px-6 rounded-[30px] bg-[#0000000D]">Yunusobod</li>
          <li className="py-[13px] px-6 rounded-[30px] bg-[#0000000D]">Yunusobod</li>
          <li className="py-[13px] px-6 rounded-[30px] bg-[#0000000D]">Yunusobod</li>
          <li className="py-[13px] px-6 rounded-[30px] bg-[#0000000D]">Yunusobod</li>
          <li className="py-[13px] px-6 rounded-[30px] bg-[#0000000D]">Yunusobod</li>
          <li className="py-[13px] px-6 rounded-[30px] bg-[#0000000D]">Yunusobod</li>
          <li className="py-[13px] px-6 rounded-[30px] bg-[#0000000D]">Yunusobod</li>
          <li className="py-[13px] px-6 rounded-[30px] bg-[#0000000D]">Yunusobod</li>
          <li className="py-[13px] px-6 rounded-[30px] bg-[#0000000D]">Yunusobod</li>
        
          
        </ul>
        <Skleton loading ={!loading} productsCount={productsCount}/>
        <div className="containers  grid grid-cols-1 md:grid-cols-3 lg:flex lg:flex-wrap lg:justify-between  gap-3 py-5 px-5">
          {
              products.map((item:ProductsType) => (
                <div  key={item.id} className=" bg-red-500 lg:w-[300px] rounded-[20px] relative">
                  {/* liked button start */}
                  <div onClick={() => SavedCard(item.id)} className= "w-10 md:w-12 h-10 md:h-12 flex justify-center items-center rounded-xl bg-[#FFFFFF4D] absolute top-2 right-2 cursor-pointer">
                    {
                    likedBtnId.includes(item.id) ? (
                     <LikedFilledIcon/>
                    ):(
                      <LikedIcon/>
                    )
                  }
                  </div>
                  {/* liked button end */}
                  <img src={item.images[0]} alt="logo" width={357} height={320} />
                  <div className="pt-4  p-5  pb-7">
                    <h2 className="line-clamp-2 font-medium text-[#000000] text-[18px]">{item.description}</h2>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-[#757575]">{item.price}</p>
                      <p className="text-[14px] text-[#A6A6A6]">{item.rating}</p>
                    </div>
                  </div>
                </div>
              ) )
            }
        </div>
        <Footer/>
    </div>
  )
}

export default Home
