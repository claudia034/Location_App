const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3001;

//Definimos el middleware para analizar los datos del cuerpo de la solicitud
//Definimos el middleware para servir archivos estáticos desde la carpeta public, en este caso
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

//Arreglo que es utilizado para almacenar las ubicaciones que se agregarán
let locations = [];

//Ruta para el endpoit principal que rederiza la vista
app.get('/', (req, res) => {
    res.render('index', { locations: locations });
});
//Ruta para obtener las ubicaciones guardadas
app.get('/locations', (req, res) => {
    res.json(locations); 
});
//Ruta para agregar una nueva ubicación, definimos los campos que se deben guardar
app.post('/add-location', (req, res) => {
    const location = {
        name: req.body.name,
        address: req.body.address,
        latitude: req.body.latitude,
        longitude: req.body.longitude
    };
    locations.push(location);
    res.redirect('/');
});
//Ruta para actualizar el nombre de la ubicación que deseamos
app.post('/update-location', (req, res) => {
    const index = req.body.index;
    locations[index].name = req.body.newName;
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); //Define el servidor a escuchar en el puerto que deseamos