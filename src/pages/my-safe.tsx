import { MySafeCard } from "../components/mySafeCard"
import {useParams} from "react-router-dom"
import { useEffect, useState } from "react"
import { useEthereumProvider } from "../context/EthreumContextProvider"
import Safe from "@safe-global/safe-core-sdk"
import { BigNumber, ethers } from "ethers"


export const MySafe = () => {
    const {id} = useParams()
    const {ethAdapter, walletConnected} = useEthereumProvider();
    const [safeData, setSafeData] = useState({
        safeAddress: "",
        owners:[""],
        nonce:0,
        threshold:0,
        chainId:0,
        balance: ""
    })

    const handleTransfer = () => {
        
    }

    useEffect(()=>{  
        async function SetData() {
            if(!walletConnected){
                setSafeData({
                    safeAddress: "",
                    owners:[""],
                    nonce:0,
                    threshold:0,
                    chainId:0,
                    balance: ""
                })
            }
            if(id && ethAdapter){
                console.log("here")
                const safe =  await Safe.create({ethAdapter, safeAddress: id})
                const safeSdk = await safe.connect({ethAdapter, safeAddress:id}) 
                const owners = await safeSdk.getOwners()
                const nonce = await safeSdk.getNonce()
                const threshold = await safeSdk.getThreshold()
                const balanceWei = await safeSdk.getBalance()
                const balance = ethers.utils.formatEther(balanceWei)
                const chainId = await safeSdk.getChainId()
                setSafeData({
                    safeAddress:id,
                    owners,
                    nonce,
                    threshold,
                    chainId ,
                    balance 
                })
            }  
        }
        SetData()
    }, [id, walletConnected])
    console.log("safeAdd:", safeData.safeAddress)

return(
    <div className="px-3 md:lg:xl:px-40   border-t border-b py-20 bg-opacity-10">
        <div className="text-[24px] font-semibold">{safeData.safeAddress}</div>
        <div className="grid grid-cols-1 md:lg:xl:grid-cols-3 group bg-white shadow-xl shadow-neutral-100 border ">
            <div
                className="p-10 flex flex-col items-center text-center group md:lg:xl:border-r md:lg:xl:border-b hover:bg-slate-50 cursor-pointer">
                <button className="px-5 py-3  mb-12 mt-8 font-medium text-slate-700 shadow-xl  hover:bg-white duration-150  bg-yellow-400"> Add Owners </button>
                <span className="p-5 rounded-full bg-red-500 text-white shadow-lg shadow-red-200"><svg
                        xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg></span>
                <p className="text-xl font-medium text-slate-700 mt-3">Owners</p>
                <ul className="mt-2 mb-10 text-lg text-slate-500">
                    {safeData.owners.map(owner => (
                        <li>{owner}</li>
                    ))}
                 </ul>
                
            </div>

            <div
                className="p-10 flex flex-col items-center text-center group md:lg:xl:border-r md:lg:xl:border-b hover:bg-slate-50 cursor-pointer">
                <button className="px-5 py-3 mb-12 mt-8 font-medium text-slate-700 shadow-xl  hover:bg-white duration-150  bg-yellow-400"> Change Threshold </button>
                <span className="p-5 rounded-full bg-orange-500 text-white shadow-lg shadow-orange-200"><svg
                        xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" stroke-width="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg></span>
                <p className="text-xl font-medium text-slate-700 mt-3">Signature Threshold</p>
                <p className="mt-3 mb-20 text-xl text-slate-500">{safeData.threshold}</p>

            </div>

            <div className="p-10 flex flex-col items-center text-center group   md:lg:xl:border-b hover:bg-slate-50 cursor-pointer">
                <button onClick={handleTransfer}  className="px-5 py-3 mb-12 mt-8  font-medium text-slate-700 shadow-xl  hover:bg-white duration-150  bg-yellow-400"> Transfer Balance </button>
                <span className="p-5 rounded-full bg-yellow-500 text-white shadow-lg shadow-yellow-200"><svg
                        xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg></span>
                <p className="text-xl font-medium text-slate-700 mt-3">Native Balance</p>
                <p className="mt-3 mb-6 text-xl text-slate-500">{safeData.balance.toString()}</p>

            </div>
        </div>
        <iframe
            src="https://app.uniswap.org/#/swap?outputCurrency=0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359"
            height="660px"
            width="100%"
            />
    </div>
)}