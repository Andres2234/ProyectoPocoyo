import React from 'react';

const Card = ({ TarjetaID, ListaID, Titulo, Description, assignedUsers = [] }) => {
  
  const renderAssignedUsers = () => {
    return assignedUsers.map((initial) => (
      <span 
        key={initial} 
        style={{
          marginRight: '3px', 
          padding: '2px 5px', 
          borderRadius: '50%', 
          backgroundColor: '#579dff', 
          color: 'white', 
          fontSize: '10px',
          fontWeight: 'bold',
          display: 'inline-block'
        }}
      >
        {initial}
      </span>
    ));
  };

  return (
    <div 
      style={{
        backgroundColor: 'white', 
        padding: '10px', 
        marginBottom: '8px', 
        borderRadius: '5px', 
        boxShadow: '0 1px 0 rgba(9,30,66,.25)', 
        cursor: 'pointer'
      }}
    >
      <p style={{margin: '0 0 8px 0', fontSize: '14px', fontWeight: 500, color: '#172b4d'}}>
        {Titulo}
      </p>

      {Description && (
         <p style={{margin: '0 0 8px 0', fontSize: '12px', color: '#5e6c84'}}>
            {Description}
        </p>
      )}

      <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
        {renderAssignedUsers()}
      </div>
      
    </div>
  );
};

export default Card;