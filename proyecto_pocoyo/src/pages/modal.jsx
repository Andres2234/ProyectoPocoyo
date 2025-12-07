import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Modal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleModal = (e) => {
    e.preventDefault();
    console.log("Datos de Modal:", { email, password });
  };

  return (
    <div style={styles.background}>
      <div style={styles.card}>
        <h2 style={styles.title}>Bienvenido a POCOYO</h2>
        <p style={styles.subtitle}>Inicia sesión para continuar</p>

        <form onSubmit={handleModal} style={styles.form}>
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
          <button type="submit" style={styles.button}>Ingresar</button>
        </form>

        <p style={styles.linkText}>
          ¿No tienes cuenta? <Link to="/registro" style={styles.link}>Regístrate</Link>
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
