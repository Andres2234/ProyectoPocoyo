// kanban-frontend/src/components/List.jsx

import React, { useState } from 'react'; // 👈 Importar useState
import { Droppable, Draggable } from '@hello-pangea/dnd'; 
import Card from './Card'; 

const API_BASE_URL = 'http://localhost:5000/api';

// Recibe list y refreshBoard
const List = ({ list, refreshBoard }) => { 
    const { ListaID, NombreLista, cards } = list;
    
    // Estado para controlar la visibilidad del formulario de nueva tarjeta
    const [isAdding, setIsAdding] = useState(false);
    // Estado para el contenido del título de la nueva tarjeta
    const [newCardTitle, setNewCardTitle] = useState('');

    const handleAddCard = async () => {
        if (!newCardTitle.trim()) {
            return; // No hacer nada si el título está vacío
        }
        
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Error de autenticación. Por favor, vuelve a iniciar sesión.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/cards`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify({
                    ListaID: ListaID,
                    Titulo: newCardTitle.trim(),
                    Descripcion: '', // La descripción es opcional por ahora
                }),
            });

            if (response.ok) {
                // Limpiar el estado del formulario
                setNewCardTitle('');
                setIsAdding(false);
                
                // 🔑 Llamar a la función de Board para recargar todos los datos desde el servidor
                refreshBoard(); 
                
            } else {
                const errorData = await response.json();
                alert(`Error al crear tarjeta: ${errorData.message}`);
            }

        } catch (error) {
            console.error('Error de red al añadir tarjeta:', error);
            alert('No se pudo conectar al servidor para añadir la tarjeta.');
        }
    };
    
    // Función para manejar el Enter en el textarea
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevenir salto de línea
            handleAddCard();
        }
    }

    return (
        <div style={{flexShrink: 0, width: '272px', backgroundColor: '#f1f2f4', borderRadius: '8px', padding: '10px', maxHeight: 'calc(100vh - 100px)'}}>
            
            <div style={{padding: '5px 0'}}>
                <h3 style={{fontSize: '16px', fontWeight: 600, margin: 0}}>{NombreLista} ({cards.length})</h3>
            </div>
            
            {/* Droppable Container */}
            <Droppable droppableId={String(ListaID)} type="card">
                {(provided, snapshot) => (
                    <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                            // ... (estilos de Droppable) ...
                            overflowY: 'auto', 
                            maxHeight: 'calc(100vh - 200px)',
                            padding: '8px',
                            backgroundColor: snapshot.isDraggingOver ? '#e2e4e6' : 'transparent',
                            borderRadius: '5px'
                        }}
                    >
                        {cards.map((card, index) => (
                            // ... (Draggable Card component) ...
                             <Draggable 
                                key={String(card.TarjetaID)} 
                                draggableId={String(card.TarjetaID)} 
                                index={index}
                            >
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{
                                            ...provided.draggableProps.style,
                                            backgroundColor: snapshot.isDragging ? 'lightgray' : 'white',
                                            boxShadow: snapshot.isDragging ? '0 5px 10px rgba(0,0,0,0.3)' : '0 1px 0 rgba(9,30,66,.25)',
                                            marginBottom: '8px'
                                        }}
                                    >
                                        <Card 
                                            TarjetaID={card.TarjetaID}
                                            Titulo={card.Titulo} 
                                            Description={card.Descripcion}
                                            assignedUsers={card.TarjetaID % 2 === 0 ? ['MG'] : []} 
                                        />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder} 
                    </div>
                )}
            </Droppable>
            {/* Fin Droppable Container */}

            {/* Formulario de Adición de Tarjeta */}
            {isAdding ? (
                <div style={{marginTop: '10px'}}>
                    <textarea
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Introduce el título para esta tarjeta..."
                        autoFocus
                        style={{
                            width: '100%',
                            resize: 'none',
                            border: 'none',
                            borderRadius: '5px',
                            padding: '8px',
                            boxShadow: '0 1px 0 rgba(9,30,66,.1)',
                            minHeight: '60px'
                        }}
                    />
                    <div style={{display: 'flex', gap: '8px', marginTop: '5px'}}>
                        <button 
                            onClick={handleAddCard}
                            style={{
                                padding: '8px 12px', 
                                backgroundColor: '#5aac44', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Añadir tarjeta
                        </button>
                        <button 
                            onClick={() => { setIsAdding(false); setNewCardTitle(''); }}
                            style={{
                                padding: '8px 12px', 
                                background: 'none', 
                                border: 'none', 
                                color: '#42526e', 
                                cursor: 'pointer',
                                fontSize: '20px'
                            }}
                        >
                            &times;
                        </button>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsAdding(true)}
                    style={{
                        width: '100%', 
                        padding: '8px', 
                        marginTop: '10px', 
                        background: 'none', 
                        border: 'none', 
                        textAlign: 'left', 
                        cursor: 'pointer', 
                        color: '#5e6c84', 
                        fontWeight: 500,
                        backgroundColor: 'rgba(9,30,66,.04)',
                        borderRadius: '5px'
                    }}
                >
                    + Añadir una tarjeta
                </button>
            )}
        </div>
    );
};

export default List;