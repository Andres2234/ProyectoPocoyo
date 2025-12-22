import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

const AddModal = ({ isOpen, onClose, listaID, onCardCreated, mode = 'create', card }) => {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fechaLimite, setFechaLimite] = useState('');
    const [horaNotificacion, setHoraNotificacion] = useState('');

    React.useEffect(() => {
        if (mode === 'edit' && card) {
            setTitulo(card.Titulo || '');
            setDescripcion(card.Descripcion || '');
            setFechaLimite(card.FechaLimite?.split('T')[0] || '');
            setHoraNotificacion(card.HoraNotificacion || '');
        }
    }, [mode, card]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo || !descripcion || !fechaLimite || !horaNotificacion) {
        alert('Todos los campos son obligatorios');
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const url =
        mode === 'edit'
        ? `${API_BASE_URL}/cards/${card.TarjetaID}`
        : `${API_BASE_URL}/cards`;

    const method = mode === 'edit' ? 'PUT' : 'POST';

    const body = {
        ListaID: listaID,
        Titulo: titulo.trim(),
        Descripcion: descripcion,
        FechaLimite: fechaLimite,
        HoraNotificacion: horaNotificacion,
    };

    await fetch(url, {
        method,
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });

    onCardCreated();
    onClose();

    setTitulo('');
    setDescripcion('');
    setFechaLimite('');
    setHoraNotificacion('');
    };


    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h3 style={{ color: 'black' }}>
                    {mode === 'edit' ? 'Editar tarjeta' : 'Nueva tarjeta'}
                </h3>


                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Título"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        style={inputStyle}
                    />

                    <textarea
                        placeholder="Descripción"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        style={{ ...inputStyle, minHeight: '80px' }}
                    />

                    <label style={{ color: 'black'}}>Fecha</label>
                    <input
                        type="date"
                        value={fechaLimite}
                        onChange={(e) => setFechaLimite(e.target.value)}
                        style={inputStyle}
                    />

                    <label style={{ color: 'black'}}>Hora de notificación</label>
                    <input
                        type="time"
                        value={horaNotificacion}
                        onChange={(e) => setHoraNotificacion(e.target.value)}
                        style={inputStyle}
                    />

                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <button type="submit" style={saveBtn}>
                            Guardar
                        </button>
                        <button type="button" onClick={onClose} style={cancelBtn}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddModal;

const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
};

const modalStyle = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    width: '400px',
};

const inputStyle = {
    width: '100%',
    padding: '8px',
    marginBottom: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
};

const saveBtn = {
    backgroundColor: '#5aac44',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
};

const cancelBtn = {
    backgroundColor: '#ddd',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
};
const toInputDate = (dateStr) => {
    if (!dateStr) return '';
    
    // si viene dd-MM-yyyy → convertir
    if (dateStr.includes('-') && dateStr.split('-')[0].length === 2) {
        const [dd, mm, yyyy] = dateStr.split('-');
        return `${yyyy}-${mm}-${dd}`;
    }

    // si viene ISO
    return dateStr.split('T')[0];
};
