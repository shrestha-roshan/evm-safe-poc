import React, { ReactElement, useCallback } from 'react'
import { useEthereumProvider } from '../../../context/EthreumContextProvider'
import SafeAppIframe from './SafeAppFrame'
import useAppIsLoading from './useAppIsLoading'
import { isSameUrl } from '../../../utils'
import { useSafeAppFromManifest } from '../../../hooks/safe-apps/useSafeAppFromManifest'

const UNKNOWN_APP_NAME = 'Unknown App'

type AppFrameProps = {
  appUrl: string
  allowedFeaturesList: string
}

export const AppFrame = ({ appUrl, allowedFeaturesList }: AppFrameProps): ReactElement => {
  const {chainId} = useEthereumProvider()
  const { iframeRef, appIsLoading, isLoadingSlow, setAppIsLoading } = useAppIsLoading()

  const { safeApp: safeAppFromManifest } = useSafeAppFromManifest(appUrl, "5")


  const communicator = useAppCommunicator(iframeRef, safeAppFromManifest, chain, {
    onConfirmTransactions: openTxModal,
    onSignMessage: openSignMessageModal,
    onGetPermissions: getPermissions,
    onSetPermissions: setPermissionsRequest,
    onRequestAddressBook: (origin: string): AddressBookItem[] => {
      if (hasPermission(origin, Methods.requestAddressBook)) {
        return Object.entries(addressBook).map(([address, name]) => ({ address, name, chainId }))
      }

      return []
    },
    onGetTxBySafeTxHash: (safeTxHash) => getTransactionDetails(chainId, safeTxHash),
    onGetEnvironmentInfo: () => ({
      origin: document.location.origin,
    }),
    onGetSafeInfo: useGetSafeInfo(),
    onGetSafeBalances: (currency) =>
      getBalances(chainId, safeAddress, currency, {
        exclude_spam: true,
        trusted: false,
      }),
    onGetChainInfo: () => {
      if (!chain) return

      const { nativeCurrency, chainName, chainId, shortName, blockExplorerUriTemplate } = chain

      return {
        chainName,
        chainId,
        shortName,
        nativeCurrency,
        blockExplorerUriTemplate,
      }
    },
  })
  
  const onIframeLoad = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe || !isSameUrl(iframe.src, appUrl)) {
      return
    }

    setAppIsLoading(false)
  }, [appUrl, iframeRef, setAppIsLoading])
  
  return (
    <div>
      
      <div
          style={{
            height: '100%',
            display: appIsLoading ? 'none' : 'block',
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
  )
}
