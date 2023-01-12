import React from "react";
import moment from "moment";
import Safe from "@safe-global/safe-core-sdk";
import SafeServiceClient from "@safe-global/safe-service-client";
import { useEthereumProvider } from "../..//context/EthreumContextProvider";

export const SafeTransactions: React.FC<{
  pendingTransactions: any;
  safeData: any;
  transactionType: "pending" | "all";
  setType: (type: "pending" | "all") => void;
  safeSdk: Safe | undefined;
}> = ({ pendingTransactions, safeData, transactionType, setType, safeSdk }) => {
  const { ethAdapter } = useEthereumProvider();
  const handleApprove = async (data: any) => {
    const hash = data.safeTxHash;
    let signature = await safeSdk?.signTransactionHash(hash);
    if (!signature || !ethAdapter) return;
    const safeService = new SafeServiceClient({
      txServiceUrl: "https://safe-transaction-goerli.safe.global",
      ethAdapter,
    });
    await safeService?.confirmTransaction(hash, signature.data);

    const safeTransaction = await safeService.getTransaction(hash);
    if(!safeTransaction.confirmations) return;
    if( safeData.threshold > safeTransaction.confirmations.length) return;

    const executeTxResponse = await safeSdk?.executeTransaction(
      safeTransaction
    );
    if (!executeTxResponse) return;
    const receipt =
      executeTxResponse.transactionResponse &&
      (await executeTxResponse.transactionResponse.wait());
    console.log("receipt", receipt);
  };

  return (
    <div>
      <div>
        <div className="flex gap-2 items-center mb-10  bg-[#1b3a66] text-white rounded">
          {[
            {
              key: "pending",
              label: "Pending",
            },
            {
              key: "all",
              label: "History",
            },
          ].map((each) => (
            <div
              key={each.key}
              className={`px-4 ${
                each.key === transactionType ? "bg-button" : ""
              } py-2 text-medium cursor-pointer rounded-lg`}
              onClick={() => {
                setType(each.key as "pending" | "all");
              }}
            >
              {" "}
              {each.label}{" "}
            </div>
          ))}
        </div>
        <span className="text-2xl font-bold capitalize mt-10">
          {transactionType} Transactions
        </span>
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-10">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  To
                </th>
                <th scope="col" className="px-6 py-3">
                  Value
                </th>
                <th scope="col" className="px-6 py-3">
                  {transactionType === "all" ? "Execution" : "Submission"} Date
                </th>
                <th scope="col" className="px-6 py-3">
                  Number of Signatures
                </th>

                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {(!pendingTransactions ||
                (!!pendingTransactions &&
                  pendingTransactions?.length === 0)) && (
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td colSpan={5}>
                    <div className="flex w-full my-10 justify-center">
                      No transactions found
                    </div>
                  </td>
                </tr>
              )}
              {pendingTransactions?.map((data: any) => (
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {data.to}
                  </th>
                  <td className="px-6 py-4">
                    {!!data.value && Number(data.value) / 10 ** 18}
                  </td>
                  <td className="px-6 py-4">
                    {moment(
                      new Date(data.submissionDate ?? data.executionDate)
                    ).fromNow()}
                  </td>
                  <td className="px-6 py-4">
                    {data.confirmations?.length ?? safeData.threshold}/ {safeData.threshold}
                  </td>
                  <td className="px-6 py-4">
                    {transactionType !== "all" && (
                      <button
                        onClick={() => handleApprove(data)}
                        className="font-medium text-slate-700 shadow-xl  hover:bg-white duration-150  bg-yellow-400 rounded-lg px-4 py-2"
                      >
                        {safeData.owners.length === 1 ? "Approve" : "Sign"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
