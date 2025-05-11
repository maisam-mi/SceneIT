const movieId = new URLSearchParams(window.location.search).get('id');
const detailsEl = document.getElementById('movieDetails');

async function fetchData() {
    const [details, credits, videos, keywords] = await Promise.all([
        fetch(`/movies/details/${movieId}`).then(res => res.json()),
        fetch(`/movies/credits/${movieId}`).then(res => res.json()),
        fetch(`/movies/videos/${movieId}`).then(res => res.json()),
        fetch(`/movies/keywords/${movieId}`).then(res => res.json())
    ]);

    const director = credits.crew.find(p => p.job === 'Director');
    const cast = credits.cast.slice(0, 5).map(actor => actor.name).join(', ');

    const trailer = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');

    const releaseDate = new Date(details.release_date).toLocaleDateString();

    const roundedRating = details.vote_average.toFixed(1);

    const keywordList = keywords.keywords.map(keyword => keyword.name).join(', ');


    detailsEl.innerHTML = `
    <div class="movie-header">
      <img class="movie-poster" src="https://image.tmdb.org/t/p/w300${details.poster_path}" alt="${details.title}" />
      <div class="movie-info">
        <h1>${details.title}</h1>
        
        <!-- Informationen unter dem Titel in einer Reihe -->
        <div class="movie-details">
          <p><strong></strong> ${releaseDate}</p>
          <p><strong></strong> ${details.runtime} min</p>
          <p><strong>Rating:</strong> ${roundedRating}</p>
        </div>

        <p><strong></strong> ${details.genres.map(g => `<span class="genre">${g.name}</span>`).join(' ')}</p>

          <div class="movie-details">
            <p><strong>Director:</strong> ${director?.name || 'N/A'}</p>
            <p><strong>Author:</strong> ${details.writers ? details.writers.map(w => w.name).join(', ') : 'N/A'}</p>
          </div>

          <div class="keywords">
                <p><strong>Keywords:</strong> ${keywordList}</p>
            </div>
      
        <div class="movie-buttons">
          ${trailer ? `<button class="trailer-button" onclick="openModal('${trailer.key}')">Watch Trailer</button>` : ''}
          <button class="btn-like">
          <button class="btn-save">
          </button>
        </div>

      
      

      </div>
    </div>

    <p class="overview-lalala"><strong></strong> ${details.overview}</p>

    <div class="movie-actors">
      <h3>Actors:</h3>
      <div class="actors-list">
        ${credits.cast.map(actor => `
          <div class="actor">
            <img src="https://image.tmdb.org/t/p/w300${actor.profile_path}" alt="${actor.name}" class="actor-img" />
            <p>${actor.name}</p>
          </div>
        `).join('')}
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