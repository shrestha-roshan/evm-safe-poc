import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useEthereumProvider } from "../context/EthreumContextProvider";
import Safe, { ContractNetworksConfig } from "@safe-global/safe-core-sdk";
import { AppFrame } from "../components/safe-apps/AppFrame";
import { useBrowserPermissions } from "../hooks/safe-apps/permissions";
import SafeServiceClient from "@safe-global/safe-service-client";
import { SafeMultisigTransactionResponse } from "@safe-global/safe-core-sdk-types";
import moment from "moment"
import { SafeOverview, SafeTransactions } from "../components";

export const MySafe = () => {
  const { id } = useParams();
  const { ethAdapter, walletConnected, trimWalletAddress } = useEthereumProvider();
  const [safeSdk, setSafeSdk] = useState<Safe | undefined>(undefined);
  const [transactionType, setTransactionType] = useState<"pending" | "all">("all")
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState<string>("overview")

  const [safeData, setSafeData] = useState({
    safeAddress: "",
    owners: [""],
    nonce: 0,
    threshold: 0,
    chainId: 0,
    balance: "",
  });



  useEffect(() => {
    async function SetData() {
      if (!walletConnected) {
        setSafeData({
          safeAddress: "",
          owners: [""],
          nonce: 0,
          threshold: 0,
          chainId: 0,
          balance: "",
        });
      }

      if (id && ethAdapter) {
        console.log("here");
        const safe = await Safe.create({ ethAdapter, safeAddress: id });
        const safeSdk1 = await safe.connect({ ethAdapter, safeAddress: id });
        setSafeSdk(safeSdk1);
        const owners = await safeSdk1.getOwners();
        const nonce = await safeSdk1.getNonce();
        const threshold = await safeSdk1.getThreshold();
        const balanceWei = await safeSdk1.getBalance();
        const balance = ethers.utils.formatEther(balanceWei);
        const chainId = await safeSdk1.getChainId();
        setSafeData({
          safeAddress: id,
          owners,
          nonce,
          threshold,
          chainId,
          balance,
        });
      }
    }
    SetData();
  }, [id, walletConnected, currentTab]);

  useEffect(() => {
    if (!ethAdapter || !id) return;
    (async () => {
      const safeService = new SafeServiceClient({
        txServiceUrl: "https://safe-transaction-goerli.safe.global",
        ethAdapter,
      });
      console.log("ddd", id)
      const pendingTransactions = transactionType === 'all' ? await safeService.getAllTransactions(id) : await safeService.getPendingTransactions(id);

      console.log("pendingTransactions", pendingTransactions,);
      setPendingTransactions(pendingTransactions?.results);
    })();
  }, [ethAdapter, id, transactionType]);

  const { getAllowedFeaturesList } = useBrowserPermissions();

  return (
    <div className="px-3 md:lg:xl:px-40 py-20 bg-opacity-10">
      <div className="flex gap-2 items-center mb-10 bg-[#1b3a66] text-white rounded">
        {[
          {
            key: 'overview',
            label: "Safe Overview"
          },
          {
            key: 'transactions',
            label: "Transactions"
          },
          {
            key: 'safe-apps',
            label: 'Apps'
          }
        ].map(each => <div
          key={each.key}
          className={`px-4 ${each.key === currentTab ? 'bg-button' : ''} py-3 text-medium cursor-pointer rounded-lg`}
          onClick={() => {
            setCurrentTab(each.key)
            each.key === 'transactions' && setTransactionType("pending")
          }}
        > {each.label} </div>)}
      </div>


      {currentTab === 'overview' && <SafeOverview safeData={safeData} safeSdk={safeSdk} />}
      {currentTab === 'transactions' && <SafeTransactions safeSdk={safeSdk} safeData={safeData} pendingTransactions={pendingTransactions} transactionType={transactionType} setType={setTransactionType} />}
      {currentTab === 'safe-apps' && <>
        <span className="text-2xl font-bold">Uniswap</span>
        {walletConnected && (
          <AppFrame
            allowedFeaturesList={getAllowedFeaturesList(
              "https://app.uniswap.org"
            )}
            appUrl="https://app.uniswap.org/#/swap?outputCurrency=0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359"
            key={safeData.safeAddress}
            safeSdk={safeSdk}
          />
        )}
      </>}
    </div>
  );
};
