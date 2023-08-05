const express = require('express');
const path = require('path');
const fs = require('fs');

const uuid = require('./helpers/uuid');

var PORT = process.env.PORT || 8080;

const app = express();

app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//GET API route to notes 
app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (error, data) =>
        error ? console.error(error) : res.json(JSON.parse(data))
    );
});

//POST API route to post new note into the db.json file
app.post('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (error, data) => {
        if (error) {
            console.error(error)
            return res.status(500).send("There was an error on the server")
        }
        const newNote = req.body
        const parsedNotes = JSON.parse(data)
        parsedNotes.push(newNote);
        console.log(parsedNotes);
        fs.writeFile('./db/db.json', JSON.stringify(parsedNotes), (err) =>
            err ? console.error(err) : res.json(newNote))
    }
    );
});

//GET HTML route to take user to notes.html
app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, './public/notes.html'))
);

//GET HTML route to take user to index.html
app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, './public/index.html'))
);

app.listen(PORT, () =>
    console.log(`Serving static asset routes on port ${PORT}!`)
);
