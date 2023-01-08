import React from 'react'
import { useEthereumProvider } from '../context/EthreumContextProvider'
import { getSafes } from '../utils'
import {Link} from "react-router-dom"

export const Safes = () => {
  const {walletConnected, signerAddress, trimWalletAddress, chainId} = useEthereumProvider()
  const [safes, setSafes] = React.useState([])

  React.useEffect(()=>{
    if(signerAddress && chainId ){
        getSafes(signerAddress)
        .then(data=>{
            setSafes(data.safes);
        })
    }
  }, [signerAddress, chainId])
    
  return (
    <section className="text-gray-600 body-font bg-[#F4F3FA] h-screen">
          <div className="container px-5 py-24 mx-auto">
          
              {safes.map(each=>
              <Link key={each} to={`/my-safe/${each}`}>
                  <div className="flex flex-wrap -m-4 text-center">
                <div className="p-4 sm:w-1/2 lg:w-1/3 w-full ">
                    <div className=" flex items-center  justify-between p-4  rounded-lg bg-white shadow-indigo-50 shadow-md">
                    <div>
                        <h2 className="text-gray-900 text-lg font-bold">{trimWalletAddress(each)}</h2>
                        <h3 className="mt-2 text-xl font-bold text-green-500 text-left"></h3>
                            <button className="text-sm mt-6 px-4 py-2 bg-[#304FFE]  text-white rounded-lg font-laonoto tracking-wider hover:bg-indigo-500 outline-none">View</button>
                    </div>
                    <div
                        className="bg-gradient-to-tr from-blue-600 to-indigo-600 w-32 h-32  rounded-full shadow-2xl shadow-[#304FFE] border-white  border-dashed border-2  flex justify-center items-center ">
                        <div>
                        <svg className="w-15 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                    </div>
                    </div>
        
              </div>
                </div>
              </Link>)}
            </div>
    
        </section>
  )
}
