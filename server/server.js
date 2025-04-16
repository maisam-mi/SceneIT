const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'files')));

app.get('/hello', (req, res) => {
    res.send('Hello Maisam!');
})

app.listen(3100);

console.log('Server now listening on http://localhost:3100/');
