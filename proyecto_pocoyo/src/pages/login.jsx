import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 

const API_BASE_URL = 'http://localhost:5000/api/auth'; 

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); 
  const navigate = useNavigate();

  const handleLogin = async (e) => { 
    e.preventDefault();
    setError(null);

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user)); 
            
            alert(`¡Bienvenido, ${data.user.username}!`);
            
            navigate('/board'); 
            
        } else {
            setError(data.message || 'Error desconocido al iniciar sesión.');
        }

    } catch (e) {
        console.error("Error de conexión:", e);
        setError("No se pudo conectar al servidor de autenticación. Verifica que el backend esté activo.");
    }
  };

  return (
    <div style={styles.background}>
      <div style={styles.card}>
        <h2 style={styles.title}>Bienvenido a POCOYO</h2>
        <p style={styles.subtitle}>Inicia sesión para continuar</p>

        <form onSubmit={handleLogin} style={styles.form}>
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
          
          {error && (
            <p style={styles.errorText}>{error}</p>
          )}

          <button type="submit" style={styles.button} disabled={!email || !password}>Ingresar</button>
        </form>

        <p style={styles.linkText}>
          ¿No tienes cuenta? <Link to="/registro" style={styles.link}>Regístrate</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
    errorText: {
        color: 'red',
        fontSize: '14px',
        margin: '5px 0 0 0',
        fontWeight: 'bold',
    },
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
