import { useEthereumProvider } from './context/EthreumContextProvider';
import Navbar from './components/navbar';
import {BrowserRouter, Routes,Route} from  "react-router-dom";
import { Home } from './pages/home';
import { CreateSafe } from './pages/create-safe';
import { MySafe } from './pages/my-safe';
import { Safes } from './pages/safes';
import {ToastContainer} from "react-toastify"

import 'react-toastify/dist/ReactToastify.css';
import { SafeContextProvider } from './context/SafeContext';

function App() {
  return (
  
    <BrowserRouter>
      <Navbar />
      <ToastContainer/>
      <Routes>
        <Route path ="/" element={<Home />} />
        <Route path ="/safes" element={<Safes />} />
        <Route path ="/create-safe" element={<CreateSafe/>} />
        <Route path ="/my-safe/:id" element={<MySafe/>} />
      </Routes>
    </BrowserRouter>);
} 

export default App;
