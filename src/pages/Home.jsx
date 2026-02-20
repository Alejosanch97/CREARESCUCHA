import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import "../Styles/happiness.css";

// URL de tu nuevo despliegue de Apps Script
const API_URL = 'https://script.google.com/macros/s/AKfycbxIybOB54-6yRoWS7uWoi7ERHYYdgCJbB545YyePOkPdfTkHLlW0DfRbxI7iLYcq2EA1w/exec';
const SCHOOL_LOGO = "https://i.pinimg.com/736x/1c/fc/8b/1cfc8b1ab0460021e731dd82d17abb72.jpg";
const BACKGROUND_IMG = "https://i.pinimg.com/1200x/46/8a/86/468a868053de4674786e2828885d8741.jpg";

export const Home = () => {
    const { store, dispatch } = useGlobalReducer();
    const [step, setStep] = useState(0); // 0: Bienvenida, 1: Formulario, 2: Éxito
    const [syncing, setSyncing] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);
    const [adminAuth, setAdminAuth] = useState(false);
    const [password, setPassword] = useState("");
    const [pqrsData, setPqrsData] = useState([]);

    const [formData, setFormData] = useState({
        Email: "",
        Apellidos: "",
        Nombres: "",
        Relacion_Colegio: "",
        Telefono: "",
        Nombre_Estudiante: "",
        Curso: "",
        Categoria: "",
        Mensaje: ""
    });

    const categorias = [
        "Ruta", "Atención al Cliente", "Restaurante", "Cafeteria", 
        "Felicitaciones", "Académico", "Convivencia", 
        "Orientación Escolar", "Enfermería", "Procedimientos Administrativos", "Directivos"
    ];

    const relaciones = ["Padre de Familia", "Estudiante", "Funcionario", "Proveedor", "Visitante", "Otro"];

    // --- LÓGICA DE DATOS ---

    const fetchPqrs = async () => {
        try {
            const resp = await fetch(API_URL);
            const data = await resp.json();
            setPqrsData(data);
        } catch (err) { console.error("Error cargando PQRS", err); }
    };

    const handleAdminLogin = () => {
        if (password === "Crearescucha1997") {
            setAdminAuth(true);
            fetchPqrs();
        } else {
            alert("Contraseña incorrecta");
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSyncing(true);

        const payload = {
            action: 'CREATE',
            data: formData,
            teacherKey: "GENERAL"
        };

        try {
            await fetch(API_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(payload)
            });

            setTimeout(() => {
                setSyncing(false);
                setStep(2);
                setFormData({ Email: "", Apellidos: "", Nombres: "", Relacion_Colegio: "", Telefono: "", Nombre_Estudiante: "", Curso: "", Categoria: "", Mensaje: "" });
            }, 1500);
        } catch (err) {
            console.error("Error:", err);
            setSyncing(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        setSyncing(true);
        try {
            await fetch(API_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({
                    action: 'UPDATE',
                    id: id,
                    data: { Status: newStatus }
                })
            });
            setTimeout(() => {
                fetchPqrs();
                setSyncing(false);
            }, 1000);
        } catch (err) {
            console.error(err);
            setSyncing(false);
        }
    };

    // --- FILTROS PARA EL ADMIN ---
    const pendientes = pqrsData.filter(p => p.Status !== "Resuelto");
    const resueltos = pqrsData.filter(p => p.Status === "Resuelto");

    return (
        <div className="pqrs-app" style={{ backgroundImage: `url(${BACKGROUND_IMG})`, backgroundSize: 'cover', minHeight: '100vh' }}>
            
            <button className="admin-access-trigger" onClick={() => setShowAdmin(true)}>📊 Análisis</button>

            {syncing && (
                <div className="sync-overlay">
                    <div className="spinner"></div>
                    <p>Procesando información...</p>
                </div>
            )}

            {/* MODAL ADMINISTRACIÓN */}
            {showAdmin && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content wide-modal">
                        <button className="close-modal" onClick={() => {setShowAdmin(false); setAdminAuth(false); setPassword("");}}>×</button>
                        {!adminAuth ? (
                            <div className="auth-section">
                                <h2>Acceso Administrativo 🔒</h2>
                                <input 
                                    type="password" 
                                    className="modern-input" 
                                    placeholder="Ingrese la clave" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button className="confirm-btn" onClick={handleAdminLogin}>Entrar</button>
                            </div>
                        ) : (
                            <div className="dashboard-container">
                                <h2>📈 Panel GCRB Te Escucha</h2>
                                
                                <div className="stats-grid">
                                    <div className="stat-card">Pendientes: {pendientes.length}</div>
                                    <div className="stat-card green">Resueltos: {resueltos.length}</div>
                                </div>

                                <div className="tables-container">
                                    <div className="table-section">
                                        <h3>📥 Bandeja de Entrada (Pendientes)</h3>
                                        {pendientes.map(item => (
                                            <div key={item.ID_Registro} className="pqrs-card">
                                                <p><strong>De:</strong> {item.Nombres} {item.Apellidos} ({item.Categoria})</p>
                                                <p className="msg-preview">"{item.Mensaje}"</p>
                                                <button className="resolve-btn" onClick={() => updateStatus(item.ID_Registro, "Resuelto")}>
                                                    Marcar como Resuelto ✅
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="table-section resueltos">
                                        <h3>✅ Histórico de Resueltos</h3>
                                        {resueltos.map(item => (
                                            <div key={item.ID_Registro} className="pqrs-card solved">
                                                <p><strong>{item.Categoria}:</strong> {item.Nombres}</p>
                                                <span className="badge-solved">SOLUCIONADO</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* PASO 0: BIENVENIDA */}
            {step === 0 && (
                <div className="welcome-container">
                    <div className="glass-card main-welcome">
                        <img src="/logo.png" className="school-logo-large" alt="GCRB Logo" />
                        <h1>Crear Te Escucha</h1>
                        <p>Tu opinión nos ayuda a crecer. Espacio para PQRS & Felicitaciones.</p>
                        <button className="start-btn-huge" onClick={() => setStep(1)}>INICIAR ENCUESTA 🚀</button>
                    </div>
                </div>
            )}

            {/* PASO 1: FORMULARIO */}
            {step === 1 && (
                <div className="form-container">
                    <form className="glass-card-form" onSubmit={handleSubmit}>
                        <h2>Formulario de Contacto</h2>
                        <div className="form-grid">
                            <input type="email" name="Email" placeholder="Correo electrónico*" required onChange={handleInputChange} />
                            <input type="text" name="Nombres" placeholder="Nombres*" required onChange={handleInputChange} />
                            <input type="text" name="Apellidos" placeholder="Apellidos*" required onChange={handleInputChange} />
                            <input type="tel" name="Telefono" placeholder="Teléfono*" required onChange={handleInputChange} />
                            
                            <select name="Relacion_Colegio" required onChange={handleInputChange}>
                                <option value="">Relación con el Colegio*</option>
                                {relaciones.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>

                            <select name="Categoria" required onChange={handleInputChange}>
                                <option value="">PQRS & F (Categoría)*</option>
                                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                            <input type="text" name="Nombre_Estudiante" placeholder="Nombre Estudiante (opcional)" onChange={handleInputChange} />
                            <input type="text" name="Curso" placeholder="Curso" onChange={handleInputChange} />
                        </div>
                        <textarea name="Mensaje" placeholder="Escribe tu mensaje aquí..." required onChange={handleInputChange}></textarea>
                        
                        <div className="terms-box">
                            <p>Acepto el tratamiento de datos personales según la Ley 1581 de 2012.</p>
                        </div>

                        <div className="form-buttons">
                            <button type="button" className="back-btn" onClick={() => setStep(0)}>Volver</button>
                            <button type="submit" className="submit-btn">ENVIAR PQRS</button>
                        </div>
                    </form>
                </div>
            )}

            {/* PASO 2: ÉXITO */}
            {step === 2 && (
                <div className="success-container">
                    <div className="glass-card success-box">
                        <div className="check-icon">✅</div>
                        <h1>¡Enviado con éxito!</h1>
                        <p>Hemos recibido tu solicitud. Pronto nos pondremos en contacto contigo.</p>
                        <button className="start-btn-huge" onClick={() => setStep(0)}>Finalizar</button>
                    </div>
                </div>
            )}
        </div>
    );
};