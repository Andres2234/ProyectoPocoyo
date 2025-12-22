import React from 'react';

const Card = ({
  TarjetaID,
  Titulo,
  Description,
  FechaLimite,
  HoraNotificacion,
  onDelete,
  onEdit
}) => {

  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 1px 0 rgba(9,30,66,.25)',
      }}
    >
      <h4 style={{ margin: '0 0 6px 0' , color: 'black'}}>{Titulo}</h4>

      {Description && (
        <p style={{ fontSize: '12px', color: '#5e6c84' }}>
          {Description}
        </p>
      )}

      {(FechaLimite || HoraNotificacion) && (
        <p style={{ fontSize: '11px', color: '#d35400' }}>
          📅 {FechaLimite?.split('T')[0] || '—'} ⏰ {HoraNotificacion || '—'}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button onClick={onEdit} style={btnEdit}>Editar</button>
        <button onClick={onDelete} style={btnDelete}>Eliminar</button>
      </div>
    </div>
  );
};

const btnEdit = {
  border: 'none',
  background: '#3498db',
  color: 'white',
  padding: '4px 8px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '11px'
};

const btnDelete = {
  border: 'none',
  background: '#e74c3c',
  color: 'white',
  padding: '4px 8px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '11px'
};

export default Card;
