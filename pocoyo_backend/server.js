const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 
const cron = require('node-cron');
const axios = require('axios');

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
    const { day } = req.query;
    const userId = req.user.userId;

    let connection;

    try {
        connection = await getConnection();

        // Listas
        const [lists] = await connection.execute(
            `
            SELECT ListaID, NombreLista, Orden
            FROM Listas
            WHERE ProyectoID = ?
            ORDER BY Orden
            `,
            [projectId]
        );

        // Tarjetas SOLO asignadas al usuario
        let cardsQuery = `
            SELECT 
                c.TarjetaID,
                c.ListaID,
                c.Titulo,
                c.Descripcion,
                c.Orden,
                c.FechaLimite,
                c.HoraNotificacion
            FROM Tarjetas c
            INNER JOIN Listas l ON c.ListaID = l.ListaID
            INNER JOIN AsignacionesTarjeta a ON a.TarjetaID = c.TarjetaID
            WHERE l.ProyectoID = ?
              AND a.UsuarioID = ?
        `;

        const params = [projectId, userId];

        if (day) {
            cardsQuery += ` AND DATE(c.FechaLimite) = ?`;
            params.push(day);
        }

        cardsQuery += ` ORDER BY c.Orden`;

        const [cards] = await connection.execute(cardsQuery, params);

        const boardData = lists.map(list => ({
            ListaID: list.ListaID,
            NombreLista: list.NombreLista,
            Orden: list.Orden,
            cards: cards.filter(card => card.ListaID === list.ListaID)
        }));

        res.json(boardData);

    } catch (err) {
        console.error(err);
        res.status(500).send('Error al cargar tablero');
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

    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    let connection;

    try {
        connection = await getConnection();
        await connection.beginTransaction(); // 🔒 importante

        // Obtener orden
        const [result] = await connection.execute(
            'SELECT MAX(Orden) AS max_orden FROM Tarjetas WHERE ListaID = ?',
            [ListaID]
        );

        const newOrder = (result[0].max_orden ?? -1) + 1;

        // 1️⃣ Crear tarjeta
        const [insertCard] = await connection.execute(
            `
            INSERT INTO Tarjetas 
            (ListaID, Titulo, Descripcion, Orden, FechaLimite, HoraNotificacion)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                ListaID,
                Titulo,
                Descripcion,
                newOrder,
                FechaLimite || null,
                HoraNotificacion || null
            ]
        );

        const tarjetaId = insertCard.insertId;

        // 2️⃣ Asignar tarjeta al usuario creador
        await connection.execute(
            `
            INSERT INTO AsignacionesTarjeta (TarjetaID, UsuarioID)
            VALUES (?, ?)
            `,
            [tarjetaId, userId]
        );

        await connection.commit(); 
        
        res.status(201).json({
            TarjetaID: tarjetaId,
            ListaID,
            Titulo,
            Descripcion,
            Orden: newOrder,
            FechaLimite,
            HoraNotificacion,
            assignedTo: userId
        });

    } catch (err) {
        if (connection) await connection.rollback(); 
        console.error('Error al crear tarjeta:', err);
        res.status(500).json({ message: 'Error al crear la tarjeta' });
    } finally {
        if (connection) connection.end();
    }
});

app.put('/api/cards/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { Titulo, Descripcion, FechaLimite, HoraNotificacion } = req.body;

  let connection;

  try {
    connection = await getConnection();

    await connection.execute(
      `
      UPDATE Tarjetas
      SET Titulo = ?, 
          Descripcion = ?, 
          FechaLimite = ?, 
          HoraNotificacion = ?
      WHERE TarjetaID = ?
      `,
      [
        Titulo,
        Descripcion,
        FechaLimite || null,
        HoraNotificacion || null,
        id
      ]
    );

    res.json({ message: 'Tarjeta actualizada correctamente' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar tarjeta' });
  } finally {
    if (connection) connection.end();
  }
});


app.delete("/api/cards/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const connection = await getConnection();

  await connection.execute(
    "DELETE FROM Tarjetas WHERE TarjetaID = ?",
    [id]
  );

  res.json({ message: "Tarjeta eliminada" });
});


cron.schedule('*/1 * * * *', async () => {
    let connection;

    try {
        console.log('⏳ CRON: revisando tareas...');

        connection = await getConnection();

        // 🔔 15 MIN ANTES
        const [antes15] = await connection.execute(`
            SELECT 
                t.TarjetaID,
                t.Titulo,
                t.Descripcion,
                t.FechaLimite,
                t.HoraNotificacion,
                u.NombreUsuario,
                u.Telefono
            FROM tarjetas t
            JOIN usuarios u ON u.UsuarioID = t.ListaID
            WHERE 
                t.Notificado15Min = 0
                AND t.ListaID = 1
                AND TIMESTAMP(t.FechaLimite, t.HoraNotificacion)
                BETWEEN DATE_ADD(NOW(), INTERVAL 14 MINUTE)
                AND DATE_ADD(NOW(), INTERVAL 16 MINUTE)
        `);

        for (const t of antes15) {
            await axios.post('http://localhost:3000/send-message', {
                token: 'qmx4owznrctvd3n4lytihgrmbiusoj',
                number: `51${t.Telefono}`,
                message: `👋 Hola ${t.NombreUsuario}.\n\n⏳ Recuerda que en *15 minutos* tienes:\n📌 *${t.Titulo}*`
            });


            await connection.execute(
                'UPDATE tarjetas SET Notificado15Min = 1 WHERE TarjetaID = ?',
                [t.TarjetaID]
            );
        }

        // ⏰ HORA EXACTA
        const [horaExacta] = await connection.execute(`
            SELECT 
                t.TarjetaID,
                t.Titulo,
                t.Descripcion,
                t.FechaLimite,
                t.HoraNotificacion,
                u.NombreUsuario,
                u.Telefono
            FROM tarjetas t
            JOIN usuarios u ON u.UsuarioID = t.ListaID
            WHERE 
                t.NotificadoHora = 0
                AND t.ListaID = 1
                AND TIMESTAMP(t.FechaLimite, t.HoraNotificacion)
                BETWEEN NOW()
                AND DATE_ADD(NOW(), INTERVAL 2 MINUTE)
        `);

        for (const t of horaExacta) {
            await axios.post('http://localhost:3000/send-message', {
                token: 'qmx4owznrctvd3n4lytihgrmbiusoj',
                number: `51${t.Telefono}`,
                message: `⏰ Hola ${t.NombreUsuario}.\n\n📌 *Ya es hora de la tarea*\n\n📘 *${t.Titulo}*\n📝 ${t.Descripcion || ''}`
            });

            await connection.execute(
                'UPDATE tarjetas SET NotificadoHora = 1 WHERE TarjetaID = ?',
                [t.TarjetaID]
            );
        }

        console.log('✅ CRON: revisión terminada');

    } catch (err) {
        console.error('❌ Error CRON:', err);
    } finally {
        if (connection) await connection.end();
    }
});

app.post('/api/pendientes', async (req, res) => {
    const { day = null, userId = null } = req.body || {};
    const projectId = 1;

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
            SELECT 
                c.TarjetaID,
                c.ListaID,
                c.Titulo,
                c.Descripcion,
                c.Orden,
                c.FechaLimite,
                c.HoraNotificacion
            FROM Tarjetas c
            INNER JOIN Listas l ON c.ListaID = l.ListaID
            LEFT JOIN AsignacionesTarjeta a 
                ON a.TarjetaID = c.TarjetaID
            WHERE l.ProyectoID = ?
              AND (? IS NULL OR a.UsuarioID = ?)
              AND (? IS NULL OR DATE(c.FechaLimite) = ?)
              AND l.ListaID = 1
            ORDER BY c.Orden
            `,
            [projectId, userId, userId, day, day]
        );

        const data = lists.map(list => ({
            ListaID: list.ListaID,
            NombreLista: list.NombreLista,
            Orden: list.Orden,
            cards: cards.filter(c => c.ListaID === list.ListaID)
        }));

        res.json({ projectId, day, data });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener pendientes' });
    } finally {
        if (connection) connection.end();
    }
});

app.get('/api/users/phone', async (req, res) => {
    let connection;

    try {
        // Si no mandan user_id, usar 1 por defecto
        const userId = req.query.user_id || 1;

        connection = await getConnection();

        const [rows] = await connection.execute(
            `
            SELECT UsuarioID, NombreUsuario, Telefono
            FROM Usuarios
            WHERE UsuarioID = ?
            `,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        const user = rows[0];

        res.json({
            user_id: user.UsuarioID,
            nombre: user.NombreUsuario,
            telefono: `${user.Telefono}` // 📱 prefijo Perú
        });

    } catch (error) {
        console.error('Error obteniendo teléfono:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    } finally {
        if (connection) connection.end();
    }
});


app.listen(port, () => {
    console.log(`Servidor API escuchando en http://localhost:${port}`);
});