const express = require('express');
const { resolve } = require('path');
const cors = require('cors');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());
const port = 3010;

let db;
(async () => {
  db = await open({
    filename: './BD4.2/database.sqlite',
    driver: sqlite3.Database,
  });
})();

app.use(express.static('static'));

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

async function fetchAllMovies() {
  const query = 'SELECT * from movies';
  let response = await db.all(query, []);
  return { movies: response };
}

app.get('/movies', async (req, res) => {
  try {
    const allMovies = await fetchAllMovies();
    if (allMovies.movies.length === 0) {
      res.status(404).json({ error: 'Movies not found' });
    }
    res.status(200).json(allMovies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function fetchMoviesByGenre(genre) {
  const query = `Select * from movies where genre = ?`;
  let response = await db.all(query, [genre]);
  return response;
}

app.get('/movies/genre/:genre', async (req, res) => {
  const genre = req.params.genre;
  try {
    const results = await fetchMoviesByGenre(genre);
    if (results.length === 0) {
      res.status(404).json({ error: 'Movies of this genre not found' });
    } else {
      res.status(200).json({ movies: results });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function fetchMovieById(id) {
  console.log('id', id);
  const query = 'Select * from movies where id = ?';
  let response = await db.get(query, [id]);
  console.log('response', response);

  return response;
}

app.get('/movies/details/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await fetchMovieById(id);
    console.log('result', result);
    if (result == undefined) {
      res.status(404).json({ error: 'Movie not found' });
    } else {
      res.status(200).json({ movie: result });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function fetchMoviesByReleaseYear(year) {
  const query = 'select * from movies where release_year = ?';
  const result = await db.all(query, [year]);
  return result;
}

app.get('/movies/release-year/:year', async (req, res) => {
  let releaseYear = req.params['year'];
  try {
    const result = await fetchMoviesByReleaseYear(releaseYear);
    if (result.length === 0) {
      res.status(404).json({ error: 'Movies of this year not found' });
    } else {
      res.status(200).json({ movies: result });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
