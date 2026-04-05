import HeroSection from './HeroSection'
import CategorySlider from './CategorySlider'
import connectDb from '@/lib/db'
import Grocery from '@/models/groceryModel'
import GroceryItemCard from './GroceryItemCard'

interface IClientGrocery {
  _id: string;
  name: string;
  category: string;
  price: string;
  unit: string;
  image: string;
  createdAt?: Date;
  updatedAt?: Date;
}

async function UserDashBoard() {
  await connectDb()
  const groceries = await Grocery.find({}).lean()
  const plainGrocery: IClientGrocery[] = JSON.parse(JSON.stringify(groceries))

  return (
    <>
      <HeroSection />
      <CategorySlider />
      <div className='w-[90%] md:w-[80%] mx-auto mt-10'>
        <h2 className='text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center'>Grocery Items</h2>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6'>
          {plainGrocery.map((item: IClientGrocery, index: number) => (
            <GroceryItemCard item={item} key={index} isAboveTheFold={index < 4} />
          ))}
        </div>
      </div>

    </>
  )
}

export default UserDashBoard