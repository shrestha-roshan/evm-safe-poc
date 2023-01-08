import React, { ReactElement, useCallback } from "react";
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

const UNKNOWN_APP_NAME = "Unknown App";

type AppFrameProps = {
  appUrl: string;
  allowedFeaturesList: string;
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

  const {
    getPermissions,
    hasPermission,
    permissionsRequest,
    setPermissionsRequest,
    confirmPermissionRequest,
  } = useSafePermissions();
  const communicator = useAppCommunicator(
    iframeRef,
    safeAppFromManifest,
    chain,
    {
      onConfirmTransactions: (data) => {
        console.log("onConfirmTransactions", data);
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
          safeAddress: safeAddress || "0x588Ad561cBd35615389dc311532947339dbe5CF8",
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
        />
      </div>
    </div>
  );
};
