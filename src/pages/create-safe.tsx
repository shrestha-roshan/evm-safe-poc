import React, { useEffect, useState } from 'react'
import { toast } from "react-toastify"
import { useEthereumProvider } from '../context/EthreumContextProvider'
import { ContractNetworksConfig, SafeAccountConfig, SafeDeploymentConfig, SafeFactory } from '@safe-global/safe-core-sdk'
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";

export const CreateSafe = () => {
  const { walletConnected, ethAdapter, provider, signerAddress } = useEthereumProvider();
  const [data, setData] = useState({
    name: "",
    threshold: 0,
    owners: ""
  });

  const [safeAddress, setSafeAddress] = useState("");

  const handleInputChange = (e: any, key: "name" | "threshold" | "owners") => {
    setData(prevData => ({
      ...prevData,
      [key]: e.target.value
    }))
  }

  let navigate = useNavigate();
  const handleButtonClick = async () => {
    let safeFactory: SafeFactory
    toast.info("Creating Safe")
    if (ethAdapter && signerAddress) {
      const networks: ContractNetworksConfig = {
        "97": {
          safeMasterCopyAddress: "0xA6f2e94bD3EF99528E946e818d4d4E884dF3D5Fc",
          safeProxyFactoryAddress: "0x246f42884273405D13EC0b24c5803212EA3016C8",
          createCallAddress: "0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4",
          fallbackHandlerAddress: "0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4",
          multiSendAddress: "0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761",
          multiSendCallOnlyAddress: "0x40A2aCCbd92BCA938b02010E17A5b8929b49130D",
          signMessageLibAddress: "0xA65387F16B013cf2Af4605Ad8aA5ec25a2cbA3a2"
        }
      };
      safeFactory = await SafeFactory.create({ ethAdapter, contractNetworks: networks });
      const owners = data.owners.split(",");
      const safeAccountConfig: SafeAccountConfig = {
        owners,
        threshold: data.threshold
      }
      const nonce = await provider?.getTransactionCount(signerAddress, "latest")
      const safeDeploymentConfig: SafeDeploymentConfig = {
        saltNonce: (nonce || 1).toString()
      }

      // Predict deployed address
      const predictedDeployAddress = await safeFactory.predictSafeAddress({
        safeAccountConfig,
        safeDeploymentConfig
      })
      const callback = (txHash: string) => {
        console.log('Transaction hash:', txHash)
      }


      // Deploy Safe
      const safe = await safeFactory.deploySafe({
        safeAccountConfig,
        safeDeploymentConfig,
        options: { gasLimit: "2000000" },
        callback
      })

      setSafeAddress(safe.getAddress());

      console.log('Predicted deployed address:', predictedDeployAddress)
      console.log('Deployed Safe:', safe.getAddress())
      const safeAddress = safe.getAddress()
      if (safeAddress === '') {
        toast.error("Error creating safe")
      } else {
        const walletAddressData = JSON.parse(window.localStorage.getItem(signerAddress.toString()) ?? `{
                "safes": []
              }`)
        walletAddressData.safes.push(safeAddress)
        window.localStorage.setItem(signerAddress.toString(), JSON.stringify(walletAddressData))
        toast.success("New Safe Created")
        navigate('/my-safe/' + safeAddress)

      }
    }
  };

  useEffect(() => { console.log(data) }, [data])
  useEffect(() => { console.log("safe_address: ", safeAddress) }, [safeAddress])
  useEffect(() => {
    setData(prevData => ({
      ...prevData,
      owners: signerAddress || ""
    }))
  }, [walletConnected])



  return (
    <section className="text-gray-600 body-font relative">
      <div className="container px-5 py-24 mx-auto">
        <div className="flex flex-col text-center w-full mb-12">
          <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">Create Safe</h1>
        </div>
        <div className="lg:w-1/2 md:w-2/3 mx-auto">
          <div className="flex flex-wrap -m-2">
            <div className="p-2 w-1/2">
              <div className="relative">
                <label className="leading-7 text-sm text-gray-600">Safe Name</label>
                <input value={data.name} onChange={e => handleInputChange(e, "name")} type="text" id="name" name="name" className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
              </div>
            </div>
            <div className="p-2 w-1/2">
              <div className="relative">
                <label className="leading-7 text-sm text-gray-600">Threshold</label>
                <input value={data.threshold} onChange={e => handleInputChange(e, "threshold")} type="number" className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
              </div>
            </div>
            <div className="p-2 w-full">
              <div className="relative">
                <label className="leading-7 text-sm text-gray-600">Owners</label>
                <textarea value={data.owners} placeholder="Use Comma for multiple owners" onChange={e => handleInputChange(e, "owners")} id="message" name="message" className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"></textarea>
              </div>
            </div>
            <div className="p-2 w-full">
              <button onClick={handleButtonClick} disabled={!walletConnected} className="flex mx-auto bg-button border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg disabled:bg-indigo-200">Create</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
