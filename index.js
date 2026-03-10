require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { app: firebaseApp, db } = require('./bd/bd');
const rutasProyecto = require('./routes/rutas'); // Importamos el archivo de arriba

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Views'));

app.use('/images', express.static(path.join(__dirname, 'public/Images')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Middleware para parsear JSON
app.use(cookieParser()); // Middleware para manejar cookies de sesión

const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
app.use('/api', apiRoutes);
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);
app.use('/', rutasProyecto);

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Algo salió mal en el servidor');
});

app.listen(PORT, () => console.log(`BEO Server running on http://localhost:${3000}`));