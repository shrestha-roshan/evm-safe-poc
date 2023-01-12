import React from "react";
import { useEthereumProvider } from "../../context/EthreumContextProvider";
import { ethers, BigNumber, utils } from "ethers";
import Safe from "@safe-global/safe-core-sdk";
import { SafeTransactionDataPartial } from "@safe-global/safe-core-sdk-types";
import SafeServiceClient from "@safe-global/safe-service-client";
import { toast } from "react-toastify";

export const SafeOverview: React.FC<{
  safeData: any;
  safeSdk: Safe | undefined;
}> = ({ safeData, safeSdk }) => {

  const [ownerToRemove, setOwnerToRemove] = React.useState<string>("");
  const {
    ethAdapter,
    walletConnected,
    trimWalletAddress,
    signerAddress,
    provider,
    signer,
  } = useEthereumProvider();
  const handleTransfer = async () => {
    if (!safeSdk) return;
    const sendTo = prompt("Address to send?")?.toString();
    const value = prompt("How much?")?.toString();
    const tx: SafeTransactionDataPartial = {
      to: sendTo || "",
      value: utils.parseUnits((value || "").toString()).toString(),
      data: "0x",
    };

    const transferTx = await safeSdk?.createTransaction({
      safeTransactionData: tx,
    });
    if (transferTx) {
      const txnHash = await safeSdk?.getTransactionHash(transferTx);
      if (!txnHash || !ethAdapter) return;
      if (safeData.threshold === 1) {
        await safeSdk.executeTransaction(transferTx);
      } else {
        const sig = await safeSdk?.signTransactionHash(txnHash);
        const safeService = new SafeServiceClient({
          txServiceUrl: "https://safe-transaction-goerli.safe.global",
          ethAdapter,
        });
        try {
          if (!sig) throw Error("Sig not found");
          await safeService.proposeTransaction({
            safeAddress: safeData.safeAddress || "",
            safeTransactionData: transferTx.data,
            safeTxHash: txnHash,
            senderAddress: signerAddress || "",
            senderSignature: sig.data,
          });
        } catch (e) {
          console.log("errore", e);
        }
      }
    }
  };

  return (
    <div>
      <div className="text-[24px] font-semibold mb-10">
        {safeData.safeAddress}
      </div>
      <div className="rounded-lg grid grid-cols-1 md:lg:xl:grid-cols-3 group bg-white shadow-xl shadow-neutral-100 border ">
        <div className="p-10 flex flex-col items-center text-center group md:lg:xl:border-r hover:bg-slate-50">
          <span className="p-5 rounded-full bg-red-500 text-white shadow-lg shadow-red-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </span>
          <p className="text-xl font-medium text-slate-700 mt-3">
            Owners ({safeData?.owners?.length ?? "0"})
          </p>
          <div className="max-h-[85px] min-h-[80px] overflow-auto px-4">
            <ul className="mt-2 text-lg text-slate-500">
              {safeData?.owners?.map((owner: any) => (
                <li
                  className={` ${ownerToRemove === owner ? "bg-red-200": ""} cursor-pointer hover:bg-red-100`}
                  key={owner}
                  onClick={() => {
                    if(ownerToRemove === owner) {
                      setOwnerToRemove("");
                      return;
                    }
                    navigator.clipboard.writeText(owner || "");
                    toast.success("Copied and Selected");
                    setOwnerToRemove(owner || "");
                  }}
                >
                  {!!owner && owner !== "" && trimWalletAddress(owner)}
                </li>
              ))}
            </ul>
          </div>
          <button
            className="px-5 py-3  mb-7 mt-12 font-medium text-slate-700 shadow-xl  hover:bg-white duration-150  bg-yellow-400"
            onClick={async () => {
              if (!safeSdk || !ethAdapter) return;
              const owner = prompt(
                "Enter the address of the owner to be added"
              );
              if (!owner) return;

              const threshold = prompt("Enter the threshold number of signers");

              if (!threshold) return;

              if (Number(threshold) > safeData.owners.length + 1) {
                alert("Threshold must be less than total number of owners");
                return;
              }
              const tx = await safeSdk?.createAddOwnerTx({
                ownerAddress: (owner || "").toString(),
                threshold: Number(threshold),
              });
              if (safeData.threshold === 1) {
                const receipt = await safeSdk?.executeTransaction(tx);
                console.log(receipt);
              } else {
                if (tx) {
                  const txnHash = await safeSdk?.getTransactionHash(tx);
                  if (!txnHash || !ethAdapter) return;
                  const sig = await safeSdk?.signTransactionHash(txnHash);
                  const safeService = new SafeServiceClient({
                    txServiceUrl: "https://safe-transaction-goerli.safe.global",
                    ethAdapter,
                  });
                  try {
                    if (!sig) throw Error("Sig not found");
                    await safeService.proposeTransaction({
                      safeAddress: safeData.safeAddress || "",
                      safeTransactionData: tx.data,
                      safeTxHash: txnHash,
                      senderAddress: signerAddress || "",
                      senderSignature: sig.data,
                    });
                  } catch (e) {
                    console.log("errore", e);
                  }
                }
              }
            }}
          >
            {" "}
            Add Owners{" "}
          </button>
          {ownerToRemove !== "" && (<>
          
          <button
            className="px-5 py-3 disabled:bg-slate-600  mb-12 font-medium text-slate-700 shadow-xl  hover:bg-white duration-150  bg-yellow-400"
            disabled={ownerToRemove === ""}
            onClick={async () => {
              if (!safeSdk || !ethAdapter) return;
              const owner = ownerToRemove.trim().toString();
              if (!owner) return;

              const threshold = prompt("Enter the threshold number of signers");

              if (!threshold) return;

              if (Number(threshold) > safeData.owners.length + 1) {
                alert("Threshold must be less than total number of owners");
                return;
              }
              const tx = await safeSdk?.createRemoveOwnerTx({
                ownerAddress: (owner || "").toString(),
                threshold: Number(threshold),
              });
              if (safeData.threshold === 1) {
                const receipt = await safeSdk?.executeTransaction(tx);
                console.log(receipt);
              } else {
                if (tx) {
                  const txnHash = await safeSdk?.getTransactionHash(tx);
                  if (!txnHash || !ethAdapter) return;
                  const sig = await safeSdk?.signTransactionHash(txnHash);
                  const safeService = new SafeServiceClient({
                    txServiceUrl: "https://safe-transaction-goerli.safe.global",
                    ethAdapter,
                  });
                  try {
                    if (!sig) throw Error("Sig not found");
                    await safeService.proposeTransaction({
                      safeAddress: safeData.safeAddress || "",
                      safeTransactionData: tx.data,
                      safeTxHash: txnHash,
                      senderAddress: signerAddress || "",
                      senderSignature: sig.data,
                    });
                  } catch (e) {
                    console.log("errore", e);
                  }
                }
              }
            }}
          >
            {" "}
            Remove Owner{" "}
          </button></>)}
        </div>

        <div className="p-10 flex flex-col items-center text-center group md:lg:xl:border-r hover:bg-slate-50">
          <span className="p-5 rounded-full bg-orange-500 text-white shadow-lg shadow-orange-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </span>
          <p className="text-xl font-medium text-slate-700 mt-3">
            Signature Threshold
          </p>
          <p className="mt-3 min-h-[80px] overflow-auto text-xl text-slate-500">
            {safeData.threshold}
          </p>
          <button
            className="px-5 py-3 mb-12 mt-8 font-medium text-slate-700 shadow-xl  hover:bg-white duration-150  bg-yellow-400 "
            onClick={async () => {
              if (!safeSdk || !ethAdapter) return;
              const threshold = prompt("Enter threshold to be updated");
              if (!threshold) return;

              if (Number(threshold) > safeData.owners.length + 1) {
                alert("Threshold must be less than total number of owners");
                return;
              }
              const tx = await safeSdk?.createChangeThresholdTx(
                Number(threshold)
              );
              if (safeData.threshold === 1) {
                const receipt = await safeSdk?.executeTransaction(tx);
                console.log(receipt);
              } else {
                if (tx) {
                  const txnHash = await safeSdk?.getTransactionHash(tx);
                  if (!txnHash || !ethAdapter) return;
                  const sig = await safeSdk?.signTransactionHash(txnHash);
                  const safeService = new SafeServiceClient({
                    txServiceUrl: "https://safe-transaction-goerli.safe.global",
                    ethAdapter,
                  });
                  try {
                    if (!sig) throw Error("Sig not found");
                    await safeService.proposeTransaction({
                      safeAddress: safeData.safeAddress || "",
                      safeTransactionData: tx.data,
                      safeTxHash: txnHash,
                      senderAddress: signerAddress || "",
                      senderSignature: sig.data,
                    });
                  } catch (e) {
                    console.log("errore", e);
                  }
                }
              }
            }}
          >
            {" "}
            Change Threshold{" "}
          </button>
        </div>

        <div className="p-10 flex flex-col items-center text-center group hover:bg-slate-50">
          <span className="p-5 rounded-full bg-yellow-500 text-white shadow-lg shadow-yellow-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
              />
            </svg>
          </span>
          <p className="text-xl font-medium text-slate-700 mt-3">
            Native Balance
          </p>
          <p className="mt-3  min-h-[80px] overflow-auto text-xl text-slate-500">
            {Number(safeData.balance).toFixed(5)}
          </p>
          <button
            onClick={handleTransfer}
            className="px-5 py-3 mb-12 mt-8  font-medium text-slate-700 shadow-xl  hover:bg-white duration-150  bg-yellow-400"
          >
            {" "}
            Transfer Balance{" "}
          </button>
        </div>
      </div>
    </div>
  );
};
