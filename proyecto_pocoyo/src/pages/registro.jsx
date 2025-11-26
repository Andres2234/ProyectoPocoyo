import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [telefono, setTelefono] = useState("");
  const [errorTelefono, setErrorTelefono] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  const handleTelefonoChange = (e) => {
    const value = e.target.value;

    // Solo permitir números al escribir
    if (!/^\d*$/.test(value)) return;

    setTelefono(value);

    // Validar formato completo
    if (!/^9\d{8}$/.test(value)) {
      setErrorTelefono("Debe tener 9 dígitos y empezar con 9");
    } else {
      setErrorTelefono("");
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();

    // Validar contraseñas
    if (password !== password2) {
      setErrorPassword("Las contraseñas no coinciden");
      return;
    }

    // Validar teléfono final
    if (!/^9\d{8}$/.test(telefono)) {
      setErrorTelefono("Número de teléfono inválido");
      return;
    }

    setErrorPassword("");
    setErrorTelefono("");

    console.log("Nuevo usuario:", { nombre, email, password, telefono });
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
            <p style={{ color: "red" }}>{errorPassword}</p>
          )}

          <input
            type="text"
            placeholder="Teléfono"
            value={telefono}
            onChange={handleTelefonoChange}
            onPaste={(e) => {
              // Bloquear pegado si contiene algo que no sea números
              if (!/^\d+$/.test(e.clipboardData.getData("text"))) {
                e.preventDefault();
              }
            }}
            maxLength={9}
            style={styles.input}
            required
          />

          {errorTelefono && (
            <p style={{ color: "red" }}>{errorTelefono}</p>
          )}

          <button
            type="submit"
            style={styles.button}
            disabled={errorTelefono !== "" || errorPassword !== ""}
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
    