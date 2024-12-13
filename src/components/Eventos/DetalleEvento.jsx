import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Header from '../Header/Header.jsx';

const DetalleEvento = () => {
    const { eventId } = useParams();
    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { // `http://localhost:8082/examen/${eventId}`
        fetch(`backendexamen-production-23a8.up.railway.app:8080/examen/${eventId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setEvento(data);
                setLoading(false);
            })
            .catch((error) => console.error('Fetch error:', error));
    }, [eventId]);

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!evento) {
        return <div>No se encontró el evento.</div>;
    }

    return (
        <>
            <Header />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <h1>Detalles del Evento</h1>
                <h2>{evento.nombre}</h2>
                <p>
                    <strong>Fecha:</strong> {new Date(evento.date).toLocaleString()}
                </p>
                <p>
                    <strong>Lugar:</strong> {evento.lugar}
                </p>
                <p>
                    <strong>Creador:</strong> {evento.email}
                </p>
                <img src={evento.image} alt={evento.nombre} style={{ maxWidth: '300px', borderRadius: '8px' }} />
                <MapContainer
                    center={[evento.map.latitud, evento.map.longitud]}
                    zoom={evento.map.zoom}
                    style={{ height: '300px', width: '100%', marginTop: '10px' }}
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
                <Link to="/" style={{ marginTop: '20px', color: 'blue', textDecoration: 'underline' }}>
                    Volver a la lista de eventos
                </Link>
            </div>
        </>
    );
};

export default DetalleEvento;
