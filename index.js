const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

let locations = [];

app.get('/', (req, res) => {
    res.render('index', { locations: locations });
});

app.get('/locations', (req, res) => {
    res.json(locations); 
});

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

app.post('/update-location', (req, res) => {
    const index = req.body.index;
    locations[index].name = req.body.newName;
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
