import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { DragDropContext, Droppable } from '@hello-pangea/dnd'; 
import List from './List'
import CalendarSidebar from './CalendarioSidebar';

const API_BASE_URL = 'http://localhost:5000/api';
const PROJECT_ID = 1; 

const Board = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("");
  
  const user = JSON.parse(localStorage.getItem('user'));
  const username = user ? user.username : 'Usuario';
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

 const fetchBoardData = async (date = "") => {
  const token = localStorage.getItem('token'); 
  if (!token) {
    setError("No estás autenticado. Redirigiendo al login...");
    setTimeout(() => navigate('/'), 1500); 
    return;
  }

  try {
    setLoading(true);
    setError(null);

    const query = date ? `?day=${date}` : "";

    const response = await fetch(`${API_BASE_URL}/board/${PROJECT_ID}${query}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json',
      },
    });
      
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError("Sesión expirada o inválida. Vuelve a iniciar sesión.");
        setTimeout(() => navigate('/'), 1500);
        return;
      }

      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudieron cargar los datos del tablero.`);
      }
      
      const data = await response.json();
      setLists(data);
      
    } catch (e) {
      console.error("Error al cargar los datos del tablero:", e);
      setError("Error: No se pudo conectar a la API. Verifica la red o el backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
  setSelectedDate(date);
  fetchBoardData(date);
};

useEffect(() => {
  const today = new Date();

  const formattedToday = today.toLocaleDateString("en-CA"); // YYYY-MM-DD

  setSelectedDate(formattedToday);
  fetchBoardData(formattedToday);
}, [navigate]);


  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
        return;
    }
    
    if (type !== 'card') { return; }

    const sourceListId = parseInt(source.droppableId);
    const destinationListId = parseInt(destination.droppableId);
    const draggedCardId = parseInt(draggableId);
    const token = localStorage.getItem('token'); 
    
    const newLists = Array.from(lists);
    const sourceList = newLists.find(list => list.ListaID === sourceListId);
    const destinationList = newLists.find(list => list.ListaID === destinationListId);

    if (!sourceList || !destinationList) return; 

    const [movedCard] = sourceList.cards.splice(source.index, 1);
    movedCard.ListaID = destinationListId; 
    destinationList.cards.splice(destination.index, 0, movedCard);
    
    setLists(newLists); 

    const updateData = {
        cardId: draggedCardId,
        newListId: destinationListId,
        newIndex: destination.index,
        destinationCards: destinationList.cards.map(c => c.TarjetaID) 
    };

    try {
        const apiResponse = await fetch(`${API_BASE_URL}/cards/move`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, 
            },
            body: JSON.stringify(updateData),
        });

        if (!apiResponse.ok) {
            console.error('Error al guardar el movimiento en el servidor.');
            alert('Error al mover la tarjeta en el servidor. Revierte los cambios manualmente.');
        }
    } catch (apiError) {
        console.error('Error de red al mover la tarjeta:', apiError);
        alert('Error de red al mover la tarjeta.');
    }
  };
  
  if (loading) return (<div style={{padding: '50px', fontSize: '24px', textAlign: 'center', color: '#ecf0f1', background: '#2c3e50', minHeight: '100vh'}}>Cargando tablero...</div>);
  if (error) return (<div style={{padding: '50px', color: '#c0392b', textAlign: 'center', backgroundColor: '#fbe8e7', border: '1px solid #c0392b', minHeight: '100vh'}}>{error}</div>);

  return (
  <DragDropContext onDragEnd={onDragEnd}>
  <div style={{ display: "flex", backgroundColor: '#2c3e50', minHeight: '100vh', color: '#ecf0f1' }}>
    
    {/* === COLUMNA LATERAL DEL CALENDARIO === */}
    <CalendarSidebar
      selectedDate={selectedDate}
      onDateChange={handleDateChange}
    />

    {/* === CONTENIDO PRINCIPAL === */}
    <div style={{ flex: 1, padding: '20px', color: "#ecf0f1",
    backgroundImage: "url('/img/fondoPoco.gif')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat", }}>
      <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <div>
              <h1 style={{margin: 0, color: 'black'}}>Proyecto POCOYO</h1>
              <p style={{margin: 0, fontSize: '14px', color: 'black'}}>Bienvenido, **{username}**</p>
          </div>
          <button 
              onClick={handleLogout}
              style={{padding: '8px 15px', backgroundColor: '#c0392b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
              Cerrar Sesión
          </button>
      </header>

      <Droppable droppableId="board-droppable" direction="horizontal" type="list">
          {(provided) => (
              <div 
                  ref={provided.innerRef} 
                  {...provided.droppableProps}
                  style={{display: 'flex', gap: '15px', alignItems: 'flex-start', overflowX: 'auto', paddingBottom: '10px'}}
              >
                  {lists.map((list) => (
                      <List
                        key={list.ListaID}
                        list={list}
                        refreshBoard={() => fetchBoardData(selectedDate)}
                      />

                  ))}

                  {provided.placeholder}
              </div>
          )}
        </Droppable>
      </div>
    </div>
  </DragDropContext>

  );
};

export default Board;