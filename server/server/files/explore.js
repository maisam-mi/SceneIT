document.addEventListener('DOMContentLoaded', async () => {
    const genreSelect = document.getElementById('genreSelect');
    const movieResults = document.getElementById('movieResults');
  
    // Fetch genres
    const genreRes = await fetch('/genres');
    const genres = await genreRes.json();
  
    // Populate dropdown
    genreSelect.innerHTML = `<option value="">Select a genre</option>` +
      genres.map(genre => `<option value="${genre.id}">${genre.name}</option>`).join('');
  
    // Handle genre selection
    genreSelect.addEventListener('change', async () => {
      const genreId = genreSelect.value;
      if (!genreId) return;
  
      movieResults.innerHTML = 'Loading...';
  
      try {
        const res = await fetch(`/movies/search?genreId=${genreId}`);
        const movies = await res.json();
  
        movieResults.innerHTML = movies.map(movie => `
          <div class="card" onclick="location.href='movie.html?id=${movie.id}'">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
            <div class="card-body">
              <p class="card-title">${movie.title}</p>
            </div>
          </div>
        `).join('');
      } catch (err) {
        movieResults.innerHTML = '<p>Failed to load movies. Try again later.</p>';
      }
    });
  });
  