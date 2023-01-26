import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useEthereumProvider } from "../../../context/EthreumContextProvider";
import SafeAppIframe from "./SafeAppFrame";
import useAppIsLoading from "./useAppIsLoading";
import { isSameUrl } from "../../../utils";
import { useSafeAppFromManifest } from "../../../hooks/safe-apps/useSafeAppFromManifest";
import { useSafePermissions } from "../../../hooks/safe-apps/permissions";
import useAppCommunicator from "./useAppCommunicator";
import {
  getBalances,
  getTransactionDetails,
  ChainInfo,
  RpcUri,
  RPC_AUTHENTICATION,
} from "@safe-global/safe-gateway-typescript-sdk";
import Safe, { ContractNetworksConfig } from "@safe-global/safe-core-sdk";
import SafeServiceClient from "@safe-global/safe-service-client";
import { simulateTxn } from "../../../utils/simulateTxn";

// const UNKNOWN_APP_NAME = "Unknown App";

type AppFrameProps = {
  appUrl: string;
  allowedFeaturesList: string;
  safeSdk?: Safe;
};

const rpcURI = {
  authentication: RPC_AUTHENTICATION.UNKNOWN,
  value: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
} as RpcUri;

const chain = {
  chainId: "5",
  chainName: "Goerli",
  rpcUri: rpcURI,
  safeAppsRpcUri: rpcURI,
} as ChainInfo;

export const AppFrame = ({
  appUrl,
  allowedFeaturesList,
}: AppFrameProps): ReactElement => {
  const { chainId } = useEthereumProvider();
  const { iframeRef, appIsLoading, isLoadingSlow, setAppIsLoading } =
    useAppIsLoading();
  const { id: safeAddress } = useParams();

  const { safeApp: safeAppFromManifest } = useSafeAppFromManifest(appUrl, "5");

  const { id } = useParams();
  const { ethAdapter, walletConnected, signerAddress } = useEthereumProvider();
  const [safeSdk, setSafeSdk] = useState<Safe | undefined>(undefined);

  useEffect(() => {
    console.log("safeid", id);
    console.log("safeethAdapter", ethAdapter);
    console.log("safewalletConnected", walletConnected);

    (async () => {
      if (id && ethAdapter) {
        console.log("here");
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
        const safe = await Safe.create({ ethAdapter, safeAddress: id, contractNetworks: networks });
        const safeSdk1 = await safe.connect({ ethAdapter, safeAddress: id, contractNetworks: networks });
        setSafeSdk(safeSdk1);
      }
    })();
  }, [id, walletConnected, ethAdapter]);

  useEffect(() => {
    console.log("safeSdk", safeSdk);
  }, [safeSdk]);

  const {
    getPermissions,
    // hasPermission,
    // permissionsRequest,
    setPermissionsRequest,
    // confirmPermissionRequest,
  } = useSafePermissions();
  const communicator = useAppCommunicator(
    iframeRef,
    safeAppFromManifest,
    chain,
    {
      onConfirmTransactions: async (data, requestId, params) => {
        if (!safeSdk || !ethAdapter) {
          console.log("safeSdk is undefined");
          communicator?.send("Transaction was rejected", requestId, true);
          return;
        }
        console.log("onConfirmTransactions", data);
        console.log("requestId", requestId);
        console.log("params", params);

        const tx = await safeSdk?.createTransaction({
          safeTransactionData: data[0],
          onlyCalls: true,
        });
        const safeAdd = await safeSdk.getAddress();
        const safeTxHash = await safeSdk.getTransactionHash(tx);
        if ((await safeSdk.getThreshold()) === 1) {
          await simulateTxn(safeAdd, tx.data.to, tx.data.data || "", tx.data.value);
          await safeSdk.executeTransaction(tx);
        } else {
          const senderSignature = await safeSdk.signTransactionHash(safeTxHash);
          const safeService = new SafeServiceClient({
            txServiceUrl: "http://18.218.241.2",
            ethAdapter,
          });
          console.log(
            id,
            tx.data,
            safeTxHash,
            signerAddress,
            senderSignature.data
          );
          await safeService.proposeTransaction({
            safeAddress: id || "",
            safeTransactionData: tx.data,
            safeTxHash,
            senderAddress: signerAddress || "",
            senderSignature: senderSignature.data,
          });
        }
        communicator?.send({ safeTxHash }, requestId);
      },
      onSignMessage: (data) => {
        console.log("onSignMessage", data);
      },
      onGetPermissions: getPermissions,
      onSetPermissions: setPermissionsRequest,
      onRequestAddressBook: (origin) => {
        console.log("onRequestAddressBook", origin);
        return [];
      },
      onGetTxBySafeTxHash: (safeTxHash) =>
        getTransactionDetails((chainId || 5).toString(), safeTxHash),
      onGetEnvironmentInfo: () => ({
        origin: document.location.origin,
      }),
      onGetSafeInfo: () => {
        return {
          safeAddress:
            safeAddress || "0x588Ad561cBd35615389dc311532947339dbe5CF8",
          chainId: 5,
          owners: [],
          threshold: 2,
          isReadOnly: false,
        };
      },
      onGetSafeBalances: (currency) =>
        getBalances((chainId || 5).toString(), safeAddress || "", currency, {
          exclude_spam: true,
          trusted: false,
        }),
      onGetChainInfo: () => {
        if (!chain) return;

        const {
          nativeCurrency,
          chainName,
          chainId,
          shortName,
          blockExplorerUriTemplate,
        } = chain;

        return {
          chainName,
          chainId,
          shortName,
          nativeCurrency,
          blockExplorerUriTemplate,
        };
      },
    }
  );

  const onIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !isSameUrl(iframe.src, appUrl)) {
      return;
    }

    setAppIsLoading(false);
  }, [appUrl, iframeRef, setAppIsLoading]);

  return (
    <div>
      {appIsLoading && <div className="text-sm w-full h-[200px] flex items-center justify-center">
        Loading...
      </div>}
      <div
        style={{
          height: "100%",
          display: appIsLoading ? "none" : "block",
          // paddingBottom: queueBarVisible ? TRANSACTION_BAR_HEIGHT : 0,
        }}
      >
        <SafeAppIframe
          appUrl={appUrl}
          allowedFeaturesList={allowedFeaturesList}
          iframeRef={iframeRef}
          onLoad={onIframeLoad}
          title={safeAppFromManifest?.name}
          className="mt-4"
        />
      </div>
    </div>
  );
};
