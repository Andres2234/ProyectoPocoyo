const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 

const app = express();
const port = 5000; 

const JWT_SECRET = 'PROYECTO_POCOYO_TOKEN'; 
const SALT_ROUNDS = 10; 

const dbConfig = {
    host: 'localhost', 
    user: 'root',     
    password: 'mysql', 
    database: 'PocoyoDB'
};

app.use(cors()); 
app.use(express.json()); 

const getConnection = async () => {
    return await mysql.createConnection(dbConfig);
};

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }
    
    const token = authHeader.split(' ')[1]; 
    if (!token) {
        return res.status(403).json({ message: 'Acceso denegado. Token malformado.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido o expirado. Vuelva a iniciar sesión.' });
        }
        req.user = decoded; 
        next(); 
    });
};



app.post('/api/auth/register', async (req, res) => {
    const { nombre, email, password, telefono } = req.body; 
    let connection;

    if (!nombre || !email || !password || !telefono) {
        return res.status(400).json({ message: 'Faltan campos requeridos.' });
    }

    try {
        connection = await getConnection();
        
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        
        const [result] = await connection.execute(
            'INSERT INTO Usuarios (NombreUsuario, Email, PasswordHash, Telefono) VALUES (?, ?, ?, ?)',
            [nombre, email, passwordHash, telefono]
        );

        res.status(201).json({ 
            message: 'Usuario registrado con éxito.',
            usuarioId: result.insertId 
        });

    } catch (err) {
        console.error('Error en el registro:', err);
        if (err.code === 'ER_DUP_ENTRY') { 
            return res.status(409).json({ message: 'El correo, nombre de usuario o teléfono ya está en uso.' });
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    } finally {
        if (connection) connection.end();
    }
});


app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    let connection;

    try {
        connection = await getConnection();
        
        const [users] = await connection.execute(
            'SELECT UsuarioID, Email, PasswordHash, NombreUsuario FROM Usuarios WHERE Email = ?', 
            [email]
        );

        const user = users[0];

        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.PasswordHash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const token = jwt.sign(
            { userId: user.UsuarioID, email: user.Email }, 
            JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({ 
            message: 'Inicio de sesión exitoso.',
            token,
            user: {
                userId: user.UsuarioID,
                username: user.NombreUsuario,
                email: user.Email
            }
        });

    } catch (err) {
        console.error('Error en el login:', err);
        res.status(500).json({ message: 'Error interno del servidor.' });
    } finally {
        if (connection) connection.end();
    }
});


app.get('/api/board/:projectId', verifyToken, async (req, res) => {
    const { projectId } = req.params;
    let connection;

    try {
        connection = await getConnection();
        
        const [lists] = await connection.execute(
            `
            SELECT ListaID, NombreLista, Orden 
            FROM Listas 
            WHERE ProyectoID = ? 
            ORDER BY Orden
            `, 
            [projectId]
        );

        const [cards] = await connection.execute(
            `
            SELECT c.TarjetaID, c.ListaID, c.Titulo, c.Descripcion, c.Orden
            FROM Tarjetas c
            INNER JOIN Listas l ON c.ListaID = l.ListaID
            WHERE l.ProyectoID = ?
            ORDER BY c.Orden
            `, 
            [projectId]
        );

        const boardData = lists.map(list => ({
            ListaID: list.ListaID,
            NombreLista: list.NombreLista,
            Orden: list.Orden,
            cards: cards.filter(card => card.ListaID === list.ListaID)
        }));

        res.json(boardData);

    } catch (err) {
        console.error('Error al obtener el tablero:', err);
        res.status(500).send('Error interno del servidor al cargar el tablero.');
    } finally {
        if (connection) connection.end();
    }
});
app.put('/api/cards/move', verifyToken, async (req, res) => {
    const { cardId, newListId, newIndex, destinationCards } = req.body;
    let connection;

    try {
        connection = await getConnection();
        await connection.beginTransaction();
        
        await connection.execute(
            'UPDATE Tarjetas SET ListaID = ?, Orden = ? WHERE TarjetaID = ?',
            [newListId, newIndex, cardId]
        );

        for (let i = 0; i < destinationCards.length; i++) {
            const currentCardId = destinationCards[i];
            
            if (currentCardId !== cardId) {
                await connection.execute(
                    'UPDATE Tarjetas SET Orden = ? WHERE TarjetaID = ? AND ListaID = ?',
                    [i, currentCardId, newListId]
                );
            }
        }

        await connection.commit();
        res.json({ message: 'Movimiento de tarjeta y orden actualizados con éxito.' });

    } catch (err) {
        if (connection) {
            await connection.rollback(); 
        }
        console.error('Error al mover la tarjeta en la BD:', err);
        res.status(500).json({ message: 'Error interno del servidor al actualizar el movimiento.', error: err.message });
    } finally {
        if (connection) connection.end();
    }
});
app.post('/api/cards', verifyToken, async (req, res) => {
    const { 
        ListaID, 
        Titulo, 
        Descripcion, 
        FechaLimite, 
        HoraNotificacion 
    } = req.body;
    
    const userId = req.user ? req.user.userId : null;
    if (!userId) {
        return res.status(401).json({ message: 'Token inválido o usuario no identificado.' });
    }

    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.execute(
            'SELECT MAX(Orden) AS max_orden FROM Tarjetas WHERE ListaID = ?',
            [ListaID]
        );
        
        const newOrder = (result[0].max_orden !== null ? result[0].max_orden : -1) + 1;

        const [insertResult] = await connection.execute(
            `INSERT INTO Tarjetas 
            (ListaID, Titulo, Descripcion, Orden,  FechaLimite, HoraNotificacion) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                ListaID, 
                Titulo, 
                Descripcion, 
                newOrder, 
                FechaLimite || null, 
                HoraNotificacion || null 
            ] 
        );
        res.status(201).json({ 
            TarjetaID: insertResult.insertId,
            ListaID,
            Titulo,
            Descripcion,
            Orden: newOrder,
            FechaLimite,
            HoraNotificacion
        });

    } catch (err) {
        console.error('Error al crear la tarjeta:', err);
        res.status(500).json({ message: 'Error interno del servidor al crear la tarjeta.', error: err.message });
    } finally {
        if (connection) connection.end();
    }
});

app.listen(port, () => {
    console.log(`Servidor API escuchando en http://localhost:${port}`);
});