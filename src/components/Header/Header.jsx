import React from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { useAuth } from '../Context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();  // Obtenemos `user` y `logout` del contexto
  const userEmail = user?.email;

  return (
    <Container fluid="true" className="sticky-top">
      <header className="ps-2 pe-4 text-bg-primary" style={{ fontSize: '1.5rem' }}>
        <div className="d-flex flex-wrap align-items-center justify-content-between">
          {/* Logo */}
          <div className="d-flex align-items-center mb-2 mb-lg-0 text-white text-decoration-none">
            <Link to="/">
              <img
                src="/src/images/logo-cropped.svg"
                alt="Logo CityBeats"
                width="80"
                height="80"
                className="me-5 ms-2"
              />
            </Link>
          </div>
          <h1>{userEmail}</h1>
          {/* Botones de Login y Logout */}
          <div className="d-flex flex-column flex-sm-row align-items-center">
            {!user ? (
              <Link to="/login" className="mb-2 mb-sm-0 me-sm-2">
                <Button variant="light">Iniciar Sesión</Button>
              </Link>
            ) : (
              <Button variant="warning" onClick={logout}>Cerrar Sesión</Button>
            )}
          </div>
        </div>
      </header>
    </Container>
  );
}

export default Header;
