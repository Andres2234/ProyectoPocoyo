import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 

const API_BASE_URL = 'http://localhost:5000/api/auth'; 

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [telefono, setTelefono] = useState("");
  const [errorTelefono, setErrorTelefono] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [serverError, setServerError] = useState(null); 
  const navigate = useNavigate(); 

  const handleTelefonoChange = (e) => {
    const value = e.target.value;

    if (!/^\d*$/.test(value)) return;

    setTelefono(value);

    if (!/^9\d{8}$/.test(value)) {
      setErrorTelefono("Debe tener 9 dígitos y empezar con 9");
    } else {
      setErrorTelefono("");
    }
  };

  const handleRegister = async (e) => { 
    e.preventDefault();
    setServerError(null); 

    if (password !== password2) {
      setErrorPassword("Las contraseñas no coinciden");
      return;
    }

    if (!/^9\d{8}$/.test(telefono)) {
      setErrorTelefono("Número de teléfono inválido");
      return;
    }

    setErrorPassword("");
    setErrorTelefono("");

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                nombre, 
                email, 
                password, 
                telefono 
            }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("¡Registro exitoso! Por favor, inicia sesión.");
            navigate('/'); 
        } else {
            setServerError(data.message || 'Error desconocido al intentar registrar.');
        }

    } catch (error) {
        console.error("Error de conexión al servidor:", error);
        setServerError("No se pudo conectar al servidor. Asegúrate que el backend esté activo.");
    }
  };

  return (
    <div style={styles.background}>
      <div style={styles.card}>
        <h2 style={styles.title}>Crear Cuenta</h2>
        <p style={styles.subtitle}>Regístrate para comenzar</p>

        <form onSubmit={handleRegister} style={styles.form}>
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Repite la contraseña"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            style={styles.input}
            required
          />

          {errorPassword && (
            <p style={{ color: "red", fontSize: '12px', margin: 0 }}>{errorPassword}</p>
          )}

          <input
            type="text"
            placeholder="Teléfono (9XXXXXXXX)"
            value={telefono}
            onChange={handleTelefonoChange}
            onPaste={(e) => {
              if (!/^\d+$/.test(e.clipboardData.getData("text"))) {
                e.preventDefault();
              }
            }}
            maxLength={9}
            style={styles.input}
            required
          />

          {errorTelefono && (
            <p style={{ color: "red", fontSize: '12px', margin: 0 }}>{errorTelefono}</p>
          )}
          
          {serverError && (
            <p style={{ color: "red", fontSize: '14px', margin: 0, fontWeight: 'bold' }}>{serverError}</p>
          )}

          <button
            type="submit"
            style={styles.button}
            disabled={errorTelefono !== "" || errorPassword !== "" || !nombre || !email || !password || !password2 || !telefono}
          >
            Registrarse
          </button>
        </form>

        <p style={styles.linkText}>
          ¿Ya tienes cuenta? <Link to="/" style={styles.link}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}


const styles = {
  background: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "15px",
    padding: "40px",
    width: "350px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  title: {
    margin: "0 0 10px 0",
    fontSize: "28px",
    fontWeight: "700",
    color: "#333",
  },
  subtitle: {
    margin: "0 0 30px 0",
    fontSize: "14px",
    color: "#666",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s ease",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#6B73FF",
    color: "#fff",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  linkText: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#666",
  },
  link: {
    color: "#6B73FF",
    fontWeight: "600",
    textDecoration: "none",
  },
};
