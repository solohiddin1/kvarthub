import { Skeleton } from 'antd'


const Skleton = ({loading,productsCount}:{loading:boolean,productsCount:number}) => {
    if(!loading) return null
  return (
    <div className='containers  grid grid-cols-1 md:grid-cols-3 lg:flex lg:flex-wrap lg:justify-between  gap-3 py-5 px-5'>
        {
        Array(productsCount).fill(0).map(item => <Skeleton.Node key={item} active style={{ width:'100%', height:420, borderRadius:20 }} className='lg:w-[300px]!'  />)
        }
    </div>
  )
}

export default Skleton
