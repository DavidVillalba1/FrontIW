import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login/Login.jsx';
import Home from './components/Home/Home.jsx';
import Formulario from './components/Formulario/Formulario.jsx';
import Evento from './components/Eventos/DetalleEvento.jsx';

function App() {

  return (
    <Router>
      <Routes>

        <Route path="/" exact element={<Home />} />
        <Route path="/login" exact element={<Login />} />
        <Route path="/formulario" element={<Formulario/>} />
        <Route path="/formulario/:eventId" element={<Formulario/>} />
        <Route path="/evento/:eventId" element={<Evento/>} />
        </Routes>
    </Router>
  );
}

export default App;

