import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login/Login.jsx';
import Mapas from './components/Mapas/Mapas.jsx';
import MapasUsuario from './components/MapasUsuario/MapasUsuario.jsx';

function App() {

  return (
    <Router>
      <Routes>

        <Route path="/" exact element={<Login />} />
        <Route path="/miMapa" exact element={<Mapas/>} />
        <Route path="/mapas/:email" exact element={<MapasUsuario/>} />
        </Routes>
    </Router>
  );
}

export default App;

