import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useParams, useNavigate } from "react-router-dom"; // Usamos useParams para obtener el email de la URL y useNavigate para la redirección
import Header from "../Header/Header.jsx";

const MapasUsuario = () => {
    const { email } = useParams(); // Obtenemos el email desde la URL
    const [mapas, setMapas] = useState([]);
    const [searchEmail, setSearchEmail] = useState(email || ""); // Inicializamos el estado con el email de la URL
    const [visitas, setVisitas] = useState([]); // Para almacenar las visitas
    const navigate = useNavigate(); // Para redirigir a la ruta deseada
    const currentUserEmail = "usuario@dominio.com"; // Aquí debes obtener el email del usuario actual desde tu contexto o algún otro lugar.

    // Cargar los datos del mapa según el email pasado en la URL
    useEffect(() => {
        if (email) {
            //https://backendexamen-production-23a8.up.railway.app/examen/
            fetch(`http://localhost:8082/examen/${email}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Error al obtener los datos");
                    }
                    return response.json();
                })
                .then((data) => setMapas(data))
                .catch((error) => console.error(error));

            // Realizar el POST a la URL /visitas al acceder a la página
            const visitaData = new FormData();
            visitaData.append('autor', email); // Email del autor (email de la URL)
            visitaData.append('visitante', currentUserEmail); // Email del usuario actual
            visitaData.append('token', ''); // Suponemos que el token es una cadena vacía por ahora
            visitaData.append('date', new Date().toISOString()); // Fecha actual en formato ISO

            //https://backendexamen-production-23a8.up.railway.app/examen/visitas
            fetch("http://localhost:8082/examen/visitas", {
                method: "POST",
                body: visitaData, // Enviar como form-data
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Error al registrar la visita");
                    }
                    return response.json();
                })
                .catch((error) => console.error("Error al registrar visita:", error));

            // Cargar las visitas del autor
            //https://backendexamen-production-23a8.up.railway.app/examen/visitas/${email}
            fetch(`http://localhost:8082/examen/visitas/${email}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Error al obtener las visitas");
                    }
                    return response.json(); // Parsear el JSON de las visitas
                })
                .then((data) => {
                    // Asegurarnos de que las visitas estén en el formato adecuado
                    if (Array.isArray(data)) {
                        setVisitas(data); // Guardar las visitas en el estado
                    } else {
                        console.error("Las visitas no están en el formato esperado.");
                    }
                })
                .catch((error) => console.error("Error al obtener visitas:", error));
        }
    }, [email]);

    // Icono predeterminado para los marcadores
    const defaultIcon = new L.Icon({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    // Manejar la búsqueda por email
    const handleSearchEmail = () => {
        if (searchEmail) {
            navigate(`/mapas/${searchEmail}`); // Redirige a la ruta /mapas/:email
        }
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    return (
        <>
            <Header />
            <div style={{ height: "100vh", width: "100%", padding: "0 20px" }}>
                {/* Buscador de emails */}
                <div style={{ marginBottom: "20px" }}>
                    <input
                        type="email"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        placeholder="Buscar por email"
                        style={{
                            padding: "8px",
                            width: "200px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                        }}
                    />
                    <button
                        onClick={handleSearchEmail}
                        style={{
                            padding: "8px 12px",
                            marginLeft: "10px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                        }}
                    >
                        Buscar
                    </button>
                </div>

                {/* Título con el email buscado */}
                <h3>{email ? `Ubicaciones de ${email}` : "No hay ubicaciones disponibles"}</h3>

                {/* Mapa */}
                <MapContainer
                    center={[0, 0]}
                    zoom={2}
                    style={{ height: "70vh", width: "100%" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                    />
                    {mapas.map((mapa) => (
                        <Marker key={mapa.mapaId} position={[mapa.latitud, mapa.longitud]} icon={defaultIcon}>
                            <Popup>
                                <div>
                                    {mapa.image && (
                                        <img
                                            src={mapa.image}
                                            alt="Event"
                                            style={{ width: "100px", height: "100px", objectFit: "cover" }}
                                        />
                                    )}
                                    <p><strong>Lugar:</strong> {mapa.lugar}</p>
                                    <p><strong>Fecha:</strong> {new Date(mapa.date).toLocaleString()}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* Tabla de visitas */}
                <h3>Visitas realizadas:</h3>
                <table border="1" style={{ width: "100%", marginTop: "20px", textAlign: "left" }}>
                    <thead>
                        <tr>
                            <th>Visitante</th>
                            <th>Fecha de visita</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visitas.map((visita, index) => (
                            <tr key={index}>
                                <td>{visita.visitante}</td>
                                <td>{formatDate(visita.date)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default MapasUsuario;
