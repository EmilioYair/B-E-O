const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Views'));

app.use('/images', express.static(path.join(__dirname, 'Images')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	console.log("GET / -> rendering Pages/inicio");
	try {
		res.render('Pages/inicio');
	} catch (err) {
		console.error('Render error on /:', err);
		res.status(500).send('Server error');
	}
});

app.get('/encuentra', (req, res) => {
	try {
		res.render('Pages/encuentra');
	} catch (err) {
		console.error('Render error:', err);
		res.status(500).send('Server error');
	}
});

app.get('/como_funciona', (req, res) => {
	try {
		res.render('Pages/como_funciona');
	} catch (err) {
		console.error('Render error:', err);
		res.status(500).send('Server error');
	}
});

app.get('/sobre_nosotros', (req, res) => {
	try {
		res.render('Pages/sobre_nosotros');
	} catch (err) {
		console.error('Render error:', err);
		res.status(500).send('Server error');
	}
});

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
