import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAuth } from "../Context/AuthContext";
import Header from "../Header/Header.jsx";
import { useNavigate } from "react-router-dom"; // Usamos navigate en lugar de useHistory

const MapWithMarkers = () => {
    const { user } = useAuth();
    const [mapas, setMapas] = useState([]);
    const [newLugar, setNewLugar] = useState({
        lugar: "",
        latitud: "",
        longitud: "",
        date: "",
    });
    const [file, setFile] = useState(null); // Archivo para el lugar
    const [previewCoordinates, setPreviewCoordinates] = useState([0, 0]); // Coordenadas para previsualizar
    const [searchEmail, setSearchEmail] = useState(""); // Estado para el email en la barra de búsqueda
    const [visitas, setVisitas] = useState([]); // Estado para almacenar las visitas
    const navigate = useNavigate(); // Para redirigir a la ruta deseada

    // Cargar los datos iniciales de los mapas
    useEffect(() => {
        if (user?.email) {
            //https://exameniw-production.up.railway.app/examen/${user.email}
            //http://localhost:8082/examen/${user.email}
            fetch(`https://exameniw-production.up.railway.app/examen/${user.email}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Error al obtener los datos");
                    }
                    return response.json();
                })
                .then((data) => setMapas(data))
                .catch((error) => console.error(error));

            // Cargar las visitas del usuario
            //https://exameniw-production.up.railway.app/examen/visitas/${user.email}
            //http://localhost:8082/examen/visitas/${user.email}
            fetch(`https://exameniw-production.up.railway.app/examen/visitas/${user.email}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Error al obtener las visitas");
                    }
                    return response.json();
                })
                .then((data) => setVisitas(data))
                .catch((error) => console.error("Error al obtener las visitas:", error));
        }
    }, [user]);

    // Icono predeterminado para los marcadores
    const defaultIcon = new L.Icon({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    // Geocodificar el lugar introducido y actualizar las coordenadas
    const handleLugarChange = async (e) => {
        const lugar = e.target.value;
        setNewLugar((prev) => ({ ...prev, lugar }));

        if (lugar.trim() === "") return;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(lugar)}`
            );
            const data = await response.json();

            if (data.length > 0) {
                const { lat, lon } = data[0];
                setPreviewCoordinates([parseFloat(lat), parseFloat(lon)]);
                setNewLugar((prev) => ({
                    ...prev,
                    latitud: parseFloat(lat),
                    longitud: parseFloat(lon),
                }));
            }
        } catch (error) {
            console.error("Error en la geocodificación:", error);
        }
    };

    // Manejar el archivo seleccionado
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Manejar la solicitud para añadir un nuevo lugar
    const handleAddLugar = async (e) => {
        e.preventDefault();

        if (!newLugar.lugar || !newLugar.latitud || !newLugar.longitud || !newLugar.date) {
            alert("Todos los campos son obligatorios");
            return;
        }

        const formData = new FormData();
        formData.append("lugar", newLugar.lugar);
        formData.append("latitud", newLugar.latitud);
        formData.append("longitud", newLugar.longitud);
        formData.append("date", newLugar.date);
        formData.append("email", user.email);
        if (file) {
            formData.append("image", file);
        }

        try {
            //https://exameniw-production.up.railway.app/examen
            //http://localhost:8082/examen
            const response = await fetch("https://exameniw-production.up.railway.app/examen", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Error al añadir el lugar");
            }

            const addedLugar = await response.json();
            window.location.reload();
        } catch (error) {
            console.error("Error al enviar el formulario:", error);
        }
    };

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

                <form
                    style={{
                        marginTop: "20px",
                        padding: "10px",
                        backgroundColor: "#f9f9f9",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    }}
                    onSubmit={handleAddLugar}
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <h3>Añadir un nuevo lugar: </h3>
                        <input
                            type="text"
                            name="lugar"
                            value={newLugar.lugar}
                            placeholder="Lugar"
                            onChange={handleLugarChange}
                            required
                        />
                        <MapContainer
                            center={[newLugar.latitud || 0, newLugar.longitud || 0]}
                            zoom={2}
                            style={{ height: "200px", width: "100%" }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                            />
                            <Marker position={previewCoordinates} icon={defaultIcon}></Marker>
                        </MapContainer>
                        <input
                            type="datetime-local"
                            name="date"
                            value={newLugar.date}
                            onChange={(e) => setNewLugar((prev) => ({ ...prev, date: e.target.value }))}
                            required
                        />
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                        <button type="submit">Añadir lugar</button>
                    </div>
                </form>

                {/* Tabla de visitas */}
                <h3>Visitas realizadas:</h3>
                <table border="1" style={{ width: "100%", marginTop: "20px", textAlign: "left" }}>
                    <thead>
                        <tr>
                            <th>Visitante</th>
                            <th>Fecha</th>
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

export default MapWithMarkers;
