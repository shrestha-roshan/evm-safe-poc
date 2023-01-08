import * as React from 'react';

import { useEthereumProvider } from '../context/EthreumContextProvider';
import {Link} from "react-router-dom";

export interface INavbarProps {
}

const Navbar = (props: INavbarProps) => {
  const [metamaskButtonText, setMetaMaskButtonText] = React.useState<string | undefined>('Connect Metamask');
  const {
    connect,
    disconnect,
    provider,
    chainId,
    signer,
    signerAddress,
    providerError,
    walletConnected,
    trimWalletAddress } = useEthereumProvider()

    const onButtonClick = () => walletConnected ? disconnect() : connect();

    React.useEffect(()=> setMetaMaskButtonText(walletConnected ? trimWalletAddress(signerAddress) : 'Connect Metamask'), [walletConnected])

    return (
    <div className="w-full flex flex-col">
      <nav className='w-full shadow flex items-center p-3'>
        <div className='container gap-6 flex flex-row justify-between mx-auto'>
            <Link to="/">
                Home
            </Link>
            <Link to="/create-safe">
                CreateSafe
            </Link>
            <Link to="/safes">
                Safes
            </Link>
         
          <button className='ml-auto p-2 w-40 shadow bg-amber-500 rounded text-center'
            type='button'
            onClick={onButtonClick} >
            {metamaskButtonText}
          </button>
        </div>
      </nav>
    </div>
  );
}

export default Navbar