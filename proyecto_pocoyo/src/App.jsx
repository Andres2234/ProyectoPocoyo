import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/login'
import Registro from './pages/registro'
import Board from './pages/board'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/board" element={<Board />} />        
      </Routes>
    </BrowserRouter>
  )
}

export default App
