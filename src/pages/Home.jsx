import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import "../Styles/happiness.css";

// URL de tu despliegue de Apps Script
const API_URL = 'https://script.google.com/macros/s/AKfycbxIybOB54-6yRoWS7uWoi7ERHYYdgCJbB545YyePOkPdfTkHLlW0DfRbxI7iLYcq2EA1w/exec';
const BACKGROUND_IMG = "https://i.pinimg.com/1200x/46/8a/86/468a868053de4674786e2828885d8741.jpg";

export const Home = () => {
    const { store, dispatch } = useGlobalReducer();
    const [step, setStep] = useState(0); 
    const [syncing, setSyncing] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);
    const [adminAuth, setAdminAuth] = useState(false);
    const [password, setPassword] = useState("");
    const [pqrsData, setPqrsData] = useState([]);
    
    // Filtros para el panel de análisis
    const [filtroCategoria, setFiltroCategoria] = useState("Todas");
    const [filtroGrado, setFiltroGrado] = useState("Todos");

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

    // Listas fijas para el formulario
    const categorias = [
        "Ruta", "Atención al Cliente", "Restaurante", "Cafeteria", 
        "Felicitaciones", "Académico", "Convivencia", 
        "Orientación Escolar", "Enfermería", "Procedimientos Administrativos", "Directivos"
    ];

    const relaciones = ["Padre de Familia", "Estudiante", "Funcionario", "Proveedor", "Visitante", "Otro"];

    const listaGradosForm = [
        "Prejardín", "Jardín", "Transición", 
        "Primero", "Segundo", "Tercero", "Cuarto", "Quinto",
        "Sexto", "Séptimo", "Octavo", "Noveno", "Décimo", "Once"
    ];

    // --- LÓGICA DE DATOS ---

    const fetchPqrs = async () => {
        setSyncing(true);
        try {
            const resp = await fetch(API_URL);
            const data = await resp.json();
            setPqrsData(data);
        } catch (err) { console.error("Error cargando PQRS", err); }
        setSyncing(false);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        setStep(2);

        const payload = {
            action: 'CREATE',
            data: formData,
            teacherKey: "GENERAL"
        };

        fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload)
        }).catch(err => console.error("Error de sincronización:", err));

        setFormData({ Email: "", Apellidos: "", Nombres: "", Relacion_Colegio: "", Telefono: "", Nombre_Estudiante: "", Curso: "", Categoria: "", Mensaje: "" });
    };

    const updateStatus = (id, newStatus) => {
        const dataActualizada = pqrsData.map(item => 
            item.ID_Registro === id ? { ...item, Status: newStatus } : item
        );
        setPqrsData(dataActualizada);

        fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({
                action: 'UPDATE',
                id: id,
                data: { Status: newStatus }
            })
        }).catch(err => {
            console.error("Error al actualizar en servidor:", err);
            fetchPqrs();
        });
    };

    // --- LÓGICA DE FILTRADO PARA ANÁLISIS ---
    
    // Obtenemos los grados de la data (para el filtro de admin)
    const gradosEnData = [...new Set(pqrsData.map(item => item.Curso))].filter(Boolean).sort();

    const datosFiltrados = pqrsData.filter(item => {
        const cumpleCategoria = filtroCategoria === "Todas" || item.Categoria === filtroCategoria;
        const cumpleGrado = filtroGrado === "Todos" || item.Curso === filtroGrado;
        return cumpleCategoria && cumpleGrado;
    });

    const pendientesFiltrados = datosFiltrados.filter(p => p.Status !== "Resuelto");
    const resueltosFiltrados = datosFiltrados.filter(p => p.Status === "Resuelto");

    return (
        <div className="pqrs-app" style={{ backgroundImage: `url(${BACKGROUND_IMG})`, backgroundSize: 'cover', minHeight: '100vh' }}>
            
            <button className="admin-access-trigger" onClick={() => setShowAdmin(true)}>📊 Análisis</button>

            {syncing && (
                <div className="sync-overlay">
                    <div className="spinner"></div>
                    <p>Cargando información...</p>
                </div>
            )}

            {/* MODAL ADMINISTRACIÓN */}
            {showAdmin && (
                <div className="admin-modal-overlay">
                    <div className={!adminAuth ? "auth-section" : "admin-modal-content wide-modal"}>

                        <button className="close-modal" onClick={() => { setShowAdmin(false); setAdminAuth(false); setPassword(""); }}>×</button>

                        {!adminAuth ? (
                            <div className="login-wrapper">
                                <h2>Acceso Administrativo 🔒</h2>
                                <p style={{ color: '#666', marginBottom: '20px' }}>Ingrese su credencial</p>
                                <input
                                    type="password"
                                    className="modern-input"
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                                    autoFocus
                                />
                                <button className="confirm-btn" onClick={handleAdminLogin}>ENTRAR</button>
                            </div>
                        ) : (
                            <div className="dashboard-container">
                                <div className="dashboard-header-flex">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <h2>📈 Panel GCRB Te Escucha</h2>
                                        
                                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Área:</span>
                                                <select 
                                                    className="filter-select-mini"
                                                    value={filtroCategoria}
                                                    onChange={(e) => setFiltroCategoria(e.target.value)}
                                                >
                                                    <option value="Todas">Todas</option>
                                                    {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                </select>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Grado:</span>
                                                <select 
                                                    className="filter-select-mini"
                                                    value={filtroGrado}
                                                    onChange={(e) => setFiltroGrado(e.target.value)}
                                                >
                                                    <option value="Todos">Todos</option>
                                                    {gradosEnData.map(grado => <option key={grado} value={grado}>{grado}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={fetchPqrs} className="refresh-btn-small">Actualizar 🔄</button>
                                </div>

                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <small>Pendientes (Filtrados)</small>
                                        <div>{pendientesFiltrados.length}</div>
                                    </div>
                                    <div className="stat-card green">
                                        <small>Resueltos (Filtrados)</small>
                                        <div>{resueltosFiltrados.length}</div>
                                    </div>
                                </div>

                                <div className="tables-container">
                                    <div className="table-section">
                                        <h3>📥 Pendientes</h3>
                                        <div className="scroll-area">
                                            {pendientesFiltrados.length === 0 ? <p className="empty-msg">No hay coincidencias.</p> :
                                                pendientesFiltrados.map(item => (
                                                    <div key={item.ID_Registro} className="pqrs-card">
                                                        <div className="pqrs-header">
                                                            <strong>{item.Nombres} {item.Apellidos}</strong>
                                                            <div style={{display: 'flex', gap: '5px'}}>
                                                                <span className="cat-tag">{item.Categoria}</span>
                                                                <span className="cat-tag" style={{background: '#e9ecef', color: '#495057'}}>{item.Curso}</span>
                                                            </div>
                                                        </div>
                                                        <p className="msg-preview">"{item.Mensaje}"</p>
                                                        <button className="resolve-btn" onClick={() => updateStatus(item.ID_Registro, "Resuelto")}>
                                                            Solucionar ✅
                                                        </button>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>

                                    <div className="table-section resueltos">
                                        <h3>✅ Resueltos</h3>
                                        <div className="scroll-area">
                                            {resueltosFiltrados.length === 0 ? <p className="empty-msg">No hay registros.</p> :
                                                resueltosFiltrados.map(item => (
                                                    <div key={item.ID_Registro} className="pqrs-card solved">
                                                        <p><strong>{item.Categoria} ({item.Curso}):</strong> {item.Nombres}</p>
                                                        <span className="badge-solved">RESUELTO</span>
                                                    </div>
                                                ))
                                            }
                                        </div>
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
                        <img src="logo.png" className="school-logo-large" alt="GCRB Logo" />
                        <h1>Crear Te Escucha</h1>
                        <p>Tu opinión nos permite mejorar cada día. Gracias por comunicarte con nosotros.</p>
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
                            <input type="email" name="Email" placeholder="Correo electrónico*" required value={formData.Email} onChange={handleInputChange} />
                            <input type="text" name="Nombres" placeholder="Nombres*" required value={formData.Nombres} onChange={handleInputChange} />
                            <input type="text" name="Apellidos" placeholder="Apellidos*" required value={formData.Apellidos} onChange={handleInputChange} />
                            <input type="tel" name="Telefono" placeholder="Teléfono*" required value={formData.Telefono} onChange={handleInputChange} />
                            
                            <select name="Relacion_Colegio" required value={formData.Relacion_Colegio} onChange={handleInputChange}>
                                <option value="">Relación con el Colegio*</option>
                                {relaciones.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>

                            <select name="Categoria" required value={formData.Categoria} onChange={handleInputChange}>
                                <option value="">Área o Categoría*</option>
                                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                            <input type="text" name="Nombre_Estudiante" placeholder="Nombre Estudiante (opcional)" value={formData.Nombre_Estudiante} onChange={handleInputChange} />
                            
                            {/* NUEVO SELECTOR DE GRADO EN FORMULARIO */}
                            <select name="Curso" required value={formData.Curso} onChange={handleInputChange}>
                                <option value="">Selecciona el Grado*</option>
                                {listaGradosForm.map(grado => <option key={grado} value={grado}>{grado}</option>)}
                            </select>
                        </div>
                        <textarea name="Mensaje" placeholder="Escribe aquí tu solicitud..." required value={formData.Mensaje} onChange={handleInputChange}></textarea>
                        
                        <div className="terms-box">
                            <p>Al enviar este formulario, acepto el tratamiento de datos según la política institucional del GCRB.</p>
                        </div>

                        <div className="form-buttons">
                            <button type="button" className="back-btn" onClick={() => setStep(0)}>Volver</button>
                            <button type="submit" className="submit-btn">ENVIAR AHORA 🚀</button>
                        </div>
                    </form>
                </div>
            )}

            {/* PASO 2: ÉXITO */}
            {step === 2 && (
                <div className="success-container">
                    <div className="glass-card success-box-clean">
                        <div className="check-icon-large">✨</div>
                        <h1>¡Mensaje Recibido!</h1>
                        <p>Hemos registrado tu solicitud exitosamente.</p>
                        <button className="final-btn" onClick={() => setStep(0)}>Finalizar</button>
                    </div>
                </div>
            )}
        </div>
    );
};