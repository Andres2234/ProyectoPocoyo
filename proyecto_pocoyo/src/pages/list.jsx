import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import Card from './Card';
import AddModal from './addModal';
import CardDetailModal from './CardDetailModal';

const API_BASE_URL = 'http://localhost:5000/api';

const List = ({ list, refreshBoard }) => {
  const { ListaID, NombreLista, cards } = list;

  const [selectedCard, setSelectedCard] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit'
  const [editingCard, setEditingCard] = useState(null);

  const handleDeleteCard = async (cardId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!window.confirm('¿Eliminar esta tarjeta?')) return;

    await fetch(`${API_BASE_URL}/cards/${cardId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    setSelectedCard(null);
    refreshBoard();
  };

  const openCreateModal = () => {
    setEditingCard(null);
    setModalMode('create');
  };

  const openEditModal = (card) => {
    setSelectedCard(null);
    setEditingCard(card);
    setModalMode('edit');
  };

  const closeModal = () => {
    setEditingCard(null);
    setModalMode(null);
  };

  return (
    <div style={{ width: 272, background: '#f1f2f4', borderRadius: 8, padding: 10 }}>

      <h3 style={{color: 'black'}}>{NombreLista} ({cards.length})</h3>

      <Droppable droppableId={String(ListaID)} type="card">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ minHeight: 50 }}
          >
            {cards.map((card, index) => (
              <Draggable
                key={card.TarjetaID}
                draggableId={String(card.TarjetaID)}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      marginBottom: 8,
                      ...provided.draggableProps.style,
                    }}
                  >
                    <Card
                      {...card}
                      onEdit={() => openEditModal(card)}
                      onDelete={() => handleDeleteCard(card.TarjetaID)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <button onClick={openCreateModal}>+ Añadir tarjeta</button>

      {/* DETALLE */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onEdit={() => openEditModal(selectedCard)}
          onDelete={() => handleDeleteCard(selectedCard.TarjetaID)}
        />
      )}

      {/* CREAR / EDITAR */}
      {modalMode && (
        <AddModal
          isOpen={true}
          mode={modalMode}
          card={editingCard}
          listaID={ListaID}
          onClose={closeModal}
          onCardCreated={refreshBoard}
        />
      )}
    </div>
  );
};

export default List;
