const express = require('express');
const path = require('path');
const fs = require('fs');

const uuid = require('./helpers/uuid');

var PORT = process.env.PORT || 8080;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// GET Route for homepage
app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

// GET Route for feedback page
app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);
//API Routes
app.get('/api/notes', (req, res) => {
    // Send a message to the client
    res.sendFile(path.join(__dirname, '/db/db.json'))

    // Log our request to the terminal
    console.info(`${req.method} request received to get notes`);
});

// POST request to add a note
app.post('/api/notes', (req, res) => {
    // Log that a POST request was received
    console.info(`${req.method} request received to add a note`);

    // Destructuring assignment for the items in req.body
    const { title, text } = req.body;

    // If all the required properties are present
    if (title && text) {
        // Variable for the object we will save
        const newNote = {
            title,
            text,
            note_id: uuid(),
        };

        // Obtain existing notes
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
            } else {
                // Convert string into JSON object
                const parsedNotes = JSON.parse(data);

                // Add a new note
                parsedNotes.push(newNote);

                // Write updated notes back to the file
                fs.writeFile(
                    './db/db.json',
                    JSON.stringify(parsedNotes, null, 4),
                    (writeErr) =>
                        writeErr
                            ? console.error(writeErr)
                            : console.info('Successfully updated notes!')
                );
            }
        });

        const response = {
            status: 'success',
            body: newNote,
        };

        console.log(response);
        res.status(201).json(response);
    } else {
        res.status(500).json('Error in posting note');
    }
});

app.delete('/api/notes/:note_id', (req, res) => {
    const noteID = req.params.note_id;
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.sendStatus(500)
        }
        const newCollection = JSON.parse(data).filter(i => i.note_id != noteID)
        console.log(newCollection)
        fs.writeFile(
            './db/db.json',
            JSON.stringify(newCollection, null, 4),
            (writeErr) =>
                writeErr
                    ? console.error(writeErr)
                    : res.send(200)
        );
    })

})

app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT} 🚀`)
);






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
