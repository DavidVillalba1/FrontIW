import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Header from '../Header/Header.jsx';
import {Link, useNavigate, useParams} from 'react-router-dom';

const EventoFormulario = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    date: '',
    lugar: '',
    latitud: null,
    longitud: null,
    zoom: 2,
    email: '',
    image: null,
  });

  // Cargar datos del servidor si estamos en modo edición
  useEffect(() => {
    if (eventId) { // `http://localhost:8082/examen/${eventId}`
      fetch(`http://localhost:8082/examen/${eventId}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Error al cargar los datos del evento');
            }
            return response.json();
          })
          .then((data) => {
            setFormData({
              nombre: data.nombre || '',
              date: data.date || '',
              lugar: data.lugar || '',
              latitud: data.map?.latitud || null,
              longitud: data.map?.longitud || null,
              zoom: data.map?.zoom || 2,
              email: data.email || '',
              image: null, // No precargamos imágenes directamente
            });
          })
          .catch((error) => console.error('Error al cargar datos:', error));
    }
  }, [eventId]);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Si la clave es 'lugar', intentamos geocodificar la dirección
    if (name === 'lugar' && value.trim().length > 0) {
      const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setFormData((prevData) => ({
          ...prevData,
          latitud: parseFloat(data[0].lat),
          longitud: parseFloat(data[0].lon),
          zoom: 15,
        }));
      }
    }
  };

  const handleFileChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      image: e.target.files[0],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = eventId ? 'PUT' : 'POST'; // http://localhost:8082
    const url = `http://localhost:8082/examen${eventId ? `/${eventId}` : ''}`;

    const data = new FormData();
    data.append('nombre', formData.nombre);
    data.append('date', formData.date);
    data.append('lugar', formData.lugar);
    data.append('map.latitud', formData.latitud);
    data.append('map.longitud', formData.longitud);
    data.append('map.zoom', formData.zoom);
    data.append('email', formData.email);
    if (formData.image) {
      data.append('image', formData.image);
    }

    fetch(url, {
      method,
      body: data,
    })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to save the event');
          }
          return response.json();
        })
        .then(() => {
          navigate('/');
        })
        .catch((error) => console.error('Submit error:', error));
  };

  const LocationMarker = () => {
    return formData.latitud && formData.longitud ? (
        <Marker position={[formData.latitud, formData.longitud]} />
    ) : null;
  };

  return (
      <>
        <Header />
        <form
            onSubmit={handleSubmit}
            style={{
              maxWidth: '400px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
        >
          <h2>{eventId ? 'Editar Evento' : 'Nuevo Evento'}</h2>
          <label>
            Nombre:
            <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
            />
          </label>
          <label>
            Fecha:
            <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
            />
          </label>
          <label>
            Lugar:
            <input
                type="text"
                name="lugar"
                value={formData.lugar}
                onChange={handleChange}
                required
            />
          </label>
          <label>
            Email:
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
            />
          </label>
          <label>
            Imagen:
            <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
            />
          </label>
          <div>
            <h4>Ubicación seleccionada automáticamente:</h4>
            <MapContainer
                center={[formData.latitud || 0, formData.longitud || 0]}
                zoom={formData.zoom || 2}
                style={{ height: '300px', width: '100%' }}
            >
              <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
              />
              <LocationMarker />
            </MapContainer>
          </div>
          <button type="submit">Guardar</button>
        </form>
        <Link
            to="/"
            style={{
              display: 'block',
              margin: '20px auto',
              textAlign: 'center',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              width: 'fit-content',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
              transition: 'background-color 0.3s ease',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          Volver a la lista de eventos
        </Link>

      </>
  );
};

export default EventoFormulario;
