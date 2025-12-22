import React from "react";

const CardDetailModal = ({ card, onClose, onEdit, onDelete }) => {
  if (!card) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2>{card.Titulo}</h2>

        <p><strong>Descripción:</strong></p>
        <p>{card.Descripcion || "Sin descripción"}</p>

        <p><strong>Fecha:</strong> {card.FechaLimite || "—"}</p>
        <p><strong>Hora de notificación:</strong> {card.HoraNotificacion || "—"}</p>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button onClick={() => onEdit(card)} style={editBtn}>Editar</button>
          <button onClick={() => onDelete(card.TarjetaID)} style={deleteBtn}>Eliminar</button>
          <button onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default CardDetailModal;

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2000,
};

const modal = {
  background: "#fff",
  padding: "20px",
  borderRadius: "8px",
  width: "400px",
};

const editBtn = {
  background: "#2980b9",
  color: "white",
  border: "none",
  padding: "8px",
};

const deleteBtn = {
  background: "#c0392b",
  color: "white",
  border: "none",
  padding: "8px",
};
