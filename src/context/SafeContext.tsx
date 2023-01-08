import React, {useContext, useMemo, useState} from "react";
import Safe from '@safe-global/safe-core-sdk'
import { useEthereumProvider } from "./EthreumContextProvider";
import {useParams} from "react-router-dom"
import { ethers } from "ethers";

const {ethAdapter} = useEthereumProvider()
const {id} = useParams();


interface ISafeContextProvider{
    safeAddress:string;
    owners: string[];
    nonce:number;
    threshold:number;
    chainId:number;
    balance:string;
    safeConnect():void
}

const SafeContext = React.createContext<ISafeContextProvider>({
    safeAddress: "",
    owners:[""],
    nonce:0,
    threshold:0,
    chainId:0,
    balance: "",
    safeConnect: () => {}
});

export const SafeContextProvider = async({
    children
}: any) => {
    const {id} = useParams()
    const {ethAdapter, walletConnected} = useEthereumProvider();
    const [safeData, setSafeData] = useState({
        safeAddress: "",
        owners:[""],
        nonce:0,
        threshold:0,
        chainId:0,
        balance: "",
    })
    if(!ethAdapter || !id){
        return <></>
    }
    const safeConnect = async () => {
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
        const newsafe = new Safe()
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
        const contextValue = useMemo(
            () => ({
                safeAddress:id,
                owners:safeData.owners,
                nonce: safeData.nonce,
                threshold: safeData.threshold,
                chainId: safeData.chainId ,
                balance:safeData.balance,
                safeConnect
            }),
            [
                id,
                safeData.owners,
                safeData.nonce,
                safeData.threshold,
                safeData.chainId ,
                safeData.balance,
                safeConnect
            ]
        );
        return (
          <SafeContext.Provider value={contextValue}>
            {children}
          </SafeContext.Provider>
        );
}
export const useSafeContext = () => {
    return useContext(SafeContext);
  };