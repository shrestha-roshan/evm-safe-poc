import React, {
    useCallback,
    useContext,
    useMemo,
    useState,
    useEffect
  } from 'react';
  
  import {
    BigNumber,
    ethers,
  } from 'ethers';
  
  import detectEthereumProvider from '@metamask/detect-provider';
  import EthersAdapter from "@safe-global/safe-ethers-lib"

  
  export type Provider = ethers.providers.Web3Provider | undefined;
  export type Signer = ethers.Signer | undefined;
  
  interface IEthereumProviderContext {
    connect(): void;
    disconnect(): void;
    provider: Provider;
    chainId: number | undefined;
    signer: Signer;
    signerAddress: string | undefined;
    providerError: string | null;
    walletConnected: boolean;
    trimWalletAddress: (walletAddress: string | undefined) => string | undefined,
    ethAdapter: EthersAdapter | undefined
  }
  
  const EthereumProviderContext = React.createContext<IEthereumProviderContext>({
    connect: () => { },
    disconnect: () => { },
    provider: undefined,
    chainId: undefined,
    signer: undefined,
    signerAddress: undefined,
    providerError: null,
    walletConnected: false,
    trimWalletAddress: (walletAddress: string | undefined) => walletAddress,
    ethAdapter: undefined
  });
  
  export const EthereumProviderProvider = ({
    children
  }: any) => {
    const [providerError, setProviderError] = useState<string | null>(null);
    const [provider, setProvider] = useState<Provider>(undefined);
    const [chainId, setChainId] = useState<number | undefined>(undefined);
    const [signer, setSigner] = useState<Signer>(undefined);
    const [signerAddress, setSignerAddress] = useState<string | undefined>(
      undefined
    );
    const [walletConnected, setWalletConnected] = useState<boolean>(false)
    const [ethAdapter, setEthAdapter] = useState<EthersAdapter|undefined>(undefined); 
  
    const connect = useCallback(() => {
      setProviderError(null);
      detectEthereumProvider()
        .then((detectedProvider) => {
          if (detectedProvider) {
            const provider = new ethers.providers.Web3Provider(
              // @ts-ignore
              detectedProvider,
              "any"
            );
            provider
              .send("eth_requestAccounts", [])
              .then(() => {
                setProviderError(null);
                setProvider(provider);
                provider
                  .getNetwork()
                  .then((network) => {
                    setChainId(network.chainId);
                  })
                  .catch(() => {
                    setProviderError(
                      "An error occurred while getting the network"
                    );
                  });
                const signer = provider.getSigner();
                setSigner(signer);
                signer
                  .getAddress()
                  .then((address) => {
                    setSignerAddress(address);
                    setWalletConnected(true)
                  })
                  .catch(() => {
                    setProviderError(
                      "An error occurred while getting the signer address"
                    );
                  });
                  const ethAdapter = new EthersAdapter({
                    ethers,
                    signerOrProvider: signer
                  })
                   setEthAdapter(ethAdapter)
                // TODO: try using ethers directly
                // @ts-ignore
                if (detectedProvider && detectedProvider.on) {
                  // @ts-ignore
                  detectedProvider.on("chainChanged", (chainId) => {
                    try {
                      setChainId(BigNumber.from(chainId).toNumber());
                    } catch (e) { }
                  });
                  // @ts-ignore
                  detectedProvider.on("accountsChanged", (_accounts) => {
                    try {
                      const signer = provider.getSigner();
                      setSigner(signer);
                      signer
                        .getAddress()
                        .then((address) => {
                          setSignerAddress(address);
                        })
                        .catch(() => {
                          setProviderError(
                            "An error occurred while getting the signer address"
                          );
                        });
                        const ethAdapter = new EthersAdapter({
                            ethers,
                            signerOrProvider: signer
                          })
                          setEthAdapter(ethAdapter)
                    } catch (e) { }
                  });
                }
              })
              .catch(() => {
                setProviderError(
                  "An error occurred while requesting eth accounts"
                );
              });
          } else {
            setProviderError("Please install MetaMask");
          }
        })
        .catch(() => {
          setProviderError("Please install MetaMask");
        });
    }, []);
    const trimWalletAddress = useCallback((walletAddress: string | undefined) => {
      return `${walletAddress?.slice(0, 6)}.....${walletAddress?.slice(
        walletAddress?.length - 6,
        walletAddress?.length 
      )}`
    }, []);

    const disconnect = useCallback(() => {
      setWalletConnected(false)
      setProviderError(null);
      setProvider(undefined);
      setChainId(undefined);
      setSigner(undefined);
      setSignerAddress(undefined);
      setEthAdapter(undefined);
    }, []);

    const contextValue = useMemo(
      () => ({
        connect,
        disconnect,
        provider,
        chainId,
        signer,
        signerAddress,
        providerError,
        walletConnected,
        trimWalletAddress,
        ethAdapter
      }),
      [
        connect,
        disconnect,
        provider,
        chainId,
        signer,
        signerAddress,
        providerError,
        walletConnected,
        trimWalletAddress,
        ethAdapter
      ]
    );
    useEffect(()=>connect(),[])

    return (
      <EthereumProviderContext.Provider value={contextValue}>
        {children}
      </EthereumProviderContext.Provider>
    );
  };
  export const useEthereumProvider = () => {
    return useContext(EthereumProviderContext);
  };