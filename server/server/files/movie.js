const movieId = new URLSearchParams(window.location.search).get('id');
const detailsEl = document.getElementById('movieDetails');

async function fetchData() {
    try {
        const movieDetails = await fetch(`/movies/details/${movieId}`).then(res => res.json());

        const details = movieDetails;
        const credits = { cast: movieDetails.cast, crew: movieDetails.crew || [] };
        const videos = { results: movieDetails.trailers || [] };
        const keywords = { keywords: movieDetails.keywords || [] };


        const director = credits.crew.find(p => p.job === 'Director');
        const cast = credits.cast.slice(0, 5).map(actor => actor.name).join(', ');
        const trailer = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        const releaseDate = new Date(details.release_date).toLocaleDateString();
        const roundedRating = details.vote_average.toFixed(1);
        const keywordList = keywords.keywords.map(keyword => keyword.name).join(', ');

        document.body.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${details.backdrop_path || details.poster_path})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundAttachment = 'fixed';

        detailsEl.innerHTML = `

        <div class="movie-header">
          <img class="movie-poster" src="https://image.tmdb.org/t/p/w300${details.poster_path}" alt="${details.title}" />
          <div class="movie-info">
            <h1>${details.title}</h1>
            
            <div class="movie-details">
              <p>${releaseDate}</p>
              <p>${details.runtime} min</p>
              <p><strong>Rating:</strong> ${roundedRating}</p>
            </div>

            <p>${details.genres.map(g => `<span class="keyword">${g.name}</span>`).join(' ')}</p>

            <div class="movie-details">
              <p><strong>Director:</strong> ${director?.name || 'N/A'}</p>
              <p><strong>Author:</strong> ${details.writers ? details.writers.map(w => w.name).join(', ') : 'N/A'}</p>
            </div>



        
            <div class="movie-buttons">
              ${trailer ? `<button class="trailer-button" onclick="openModal('${trailer.key}')">Watch Trailer</button>` : ''}
              <button class="btn-like"><img src="/photos/heart.png" alt="Like" class="icon"></button>
              <button class="btn-save"><img src="/photos/save.png" alt="Like" class="icon"></button>
            </div>
          </div>
        </div>

        <p class="overview-lalala">${details.overview}</p>

        <div class="movie-actors">
          <h3>Actors:</h3>
          <div class="actors-list">
            ${credits.cast.map(actor => `
              <div class="actor-card">
                <img src="https://image.tmdb.org/t/p/w300${actor.profile_path}" alt="${actor.name}" />
                <h3>${actor.name}</h3>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } catch (err) {
        console.error('Fehler beim Laden der Filmdetails:', err);
        detailsEl.innerHTML = `<p>Fehler beim Laden der Filmdetails.</p>`;
    }
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

/*        keyword code
 
            <div class="keywords">
              <strong class="key">Keywords:</strong>
              <div class="keyword-list">
                ${keywords.keywords && keywords.keywords.length > 0
                  ? keywords.keywords
                      .slice(0, 5)
                      .map(keyword => `<span class="keyword">${keyword.name}</span>`)
                      .join('')
                  : '<span class="keyword">None</span>'
                }
              </div>
            </div>
*/