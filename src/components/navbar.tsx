import * as React from 'react';

import { useEthereumProvider } from '../context/EthreumContextProvider';
import {Link, useLocation} from "react-router-dom";

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

    const route = useLocation();

    React.useEffect(()=> setMetaMaskButtonText(walletConnected ? trimWalletAddress(signerAddress) : 'Connect Metamask'), [walletConnected])

    return (
    <div className="w-full flex flex-col dark:bg-[#1b3a66] bg-white dark:text-white">
      <nav className='w-full shadow flex items-center px-4 py-3'>
        <div className='container gap-6 flex flex-row justify-between mx-auto'>
            {[
                {name: 'Home', path: '/'},
                {name: 'CreateSafe', path: '/create-safe'},
                {name: 'Safes', path: '/safes'},
            ].map((item, index) => (
                <Link to={item.path} className={`${route.pathname=== item.path? "active": ""} px-4 rounded-lg`}>
                    {item.name}
                </Link>
            ))}

         
          <button className='ml-auto bg-button p-2 w-40 shadow bg-amber-500 rounded text-center'
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