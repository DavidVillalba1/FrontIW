import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Header from '../Header/Header.jsx';
import { Button } from 'react-bootstrap';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {useAuth} from '../Context/AuthContext.jsx'

const Eventos = () => {
    const [eventos, setEventos] = useState([]); // Lista de eventos
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado para determinar si el usuario está autenticado
    const navigate = useNavigate();
    const auth = getAuth();
    const { user } = useAuth(); // Obtener el usuario autenticado
    const userEmail = user?.email;
    // Verifica el estado de autenticación
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoggedIn(true); // Usuario autenticado
            } else {
                setIsLoggedIn(false); // Usuario no autenticado
            }
        });

        return () => unsubscribe(); // Limpieza del listener
    }, [auth]);

    // Cargar la lista de eventos desde el servidor
    useEffect(() => { // http://localhost:8082/examen
        fetch('https://backendexamen-production-23a8.up.railway.app/examen')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => setEventos(data))
            .catch((error) => console.error('Fetch error:', error));
    }, []);

    // Manejo para la edición de eventos
    const handleEdit = (eventId) => {
        if (!isLoggedIn) {
            alert('Debes iniciar sesión para editar eventos');
            return;
        }
        navigate(`/formulario/${eventId}`);
    };

    // Manejo para crear un nuevo evento
    const handleNew = () => {
        if (!isLoggedIn) {
            alert('Debes iniciar sesión para crear eventos');
            return;
        }
        navigate('/formulario');
    };

    // Eliminar evento y actualizar la vista automáticamente
    const handleDelete = (eventId) => {
        if (!isLoggedIn) {
            alert('Debes iniciar sesión para eliminar eventos');
            return;
        }

        const confirmed = window.confirm('¿Estás seguro de que quieres eliminar este evento?');
        if (!confirmed) return;
        //`http://localhost:8082/examen/${eventId}`
        fetch(`https://backendexamen-production-23a8.up.railway.app/examen/${eventId}`, {
            method: 'DELETE',
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to delete the event');
                }
                window.location.reload();
                return response.json();
            })
            .then(() => {
                // Actualiza el estado local para eliminar el evento de la vista
                setEventos((prevEventos) => prevEventos.filter((evento) => evento.eventId !== eventId));
            })
            .catch((error) => console.error('Delete error:', error));
    };

    return (
        <>
            <Header />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <h1>Lista de Eventos</h1>
                {/* Botón Crear habilitado solo si el usuario está autenticado */}
                <Button onClick={handleNew} disabled={!isLoggedIn}>
                    Crear Evento
                </Button>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {eventos.map((evento) => (
                        <li
                            key={evento.eventId}
                            style={{
                                border: '1px solid #ddd',
                                margin: '10px',
                                padding: '10px',
                                borderRadius: '8px',
                            }}
                        >
                            <Link to={`/evento/${evento.eventId}`} style={{ textDecoration: 'none', color: 'black' }}>
                                <h2>{evento.nombre}</h2>
                            </Link>
                            <p>
                                <strong>Fecha:</strong> {new Date(evento.date).toLocaleString()}
                            </p>
                            <p>
                                <strong>Lugar:</strong> {evento.lugar}
                            </p>
                            <p>
                                <strong>Creador:</strong> {evento.email}
                            </p>
                            {evento.image && (
                                <img
                                    src={evento.image}
                                    alt={evento.nombre}
                                    style={{ maxWidth: '100px', borderRadius: '8px' }}
                                />
                            )}
                            {evento.map && (
                                <MapContainer
                                    center={[evento.map.latitud, evento.map.longitud]}
                                    zoom={evento.map.zoom}
                                    style={{ height: '200px', width: '100%', marginTop: '10px' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                                    />
                                    <Marker position={[evento.map.latitud, evento.map.longitud]}>
                                        <Popup>
                                            {evento.nombre} - {evento.lugar}
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            )}
                            {/* Botones Editar y Eliminar habilitados solo si el usuario está autenticado */}
                            <button onClick={() => handleEdit(evento.eventId)} disabled={!isLoggedIn}>
                                Editar
                            </button>
                            <button onClick={() => handleDelete(evento.eventId)} disabled={!isLoggedIn}>
                                Eliminar
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default Eventos;
