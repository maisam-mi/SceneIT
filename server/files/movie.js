const movieId = new URLSearchParams(window.location.search).get('id');
const detailsEl = document.getElementById('movieDetails');

async function fetchData() {
  const [details, credits, videos] = await Promise.all([
    fetch(`/movies/details/${movieId}`).then(res => res.json()),
    fetch(`/movies/credits/${movieId}`).then(res => res.json()),
    fetch(`/movies/videos/${movieId}`).then(res => res.json())
  ]);

  const director = credits.crew.find(p => p.job === 'Director');
  const cast = credits.cast.slice(0, 5).map(actor => actor.name).join(', ');

  const trailer = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');

  detailsEl.innerHTML = `
    <div class="movie-header">
      <img src="https://image.tmdb.org/t/p/w300${details.poster_path}" alt="${details.title}" />
      <div class="movie-info">
        <h1>${details.title}</h1>
        <p><strong>Genres:</strong> ${details.genres.map(g => g.name).join(', ')}</p>
        <p><strong>Runtime:</strong> ${details.runtime} min</p>
        <p><strong>Director:</strong> ${director?.name || 'N/A'}</p>
        <p><strong>Cast:</strong> ${cast}</p>
        <p><strong>Overview:</strong> ${details.overview}</p>
        ${trailer ? `<button onclick="openModal('${trailer.key}')">Watch Trailer</button>` : ''}
      </div>
    </div>
  `;
}

function openModal(videoKey) {
  const frame = document.getElementById('trailerFrame');
  frame.src = `https://www.youtube.com/embed/${videoKey}?autoplay=1`;
  document.getElementById('trailerModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('trailerModal').style.display = 'none';
  document.getElementById('trailerFrame').src = '';
}

fetchData();
