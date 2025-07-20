const tvSerieId = new URLSearchParams(window.location.search).get('id');

console.log('tvSeries.js wird geladen');

const detailsEl = document.getElementById('tvSeriesDetails');

async function fetchData() {
    try {
        const tvDetails = await fetch(`/tvSeries/details/${tvSerieId}`).then(res => res.json());

        const details = tvDetails;
        const credits = { cast: tvDetails.cast, crew: tvDetails.crew || [] };
        const videos = { results: tvDetails.trailers || [] };
        const keywords = { keywords: tvDetails.keywords || [] };

        const director = credits.crew.find(p => p.job === 'Director' || p.job === 'Executive Producer');
        const cast = credits.cast.slice(0, 5).map(actor => actor.name).join(', ');
        const trailer = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        const firstAirDate = new Date(details.first_air_date).toLocaleDateString();
        const roundedRating = details.vote_average.toFixed(1);
        const keywordList = keywords.keywords.map(keyword => keyword.name).join(', ');

        document.body.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${details.backdrop_path || details.poster_path})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundAttachment = 'fixed';

        detailsEl.innerHTML = `
        <div class="movie-header">
          <img class="movie-poster" src="https://image.tmdb.org/t/p/w300${details.poster_path}" alt="${details.name}" />
          <div class="movie-info">
            <h1>${details.name}</h1>

            <div class="movie-details">
              <p>${firstAirDate}</p>
              <p>${details.episode_run_time?.[0] || 'N/A'} min/episode</p>
              <p><strong>Rating:</strong> ${roundedRating}</p>
            </div>

            <p>${details.genres.map(g => `<span class="keyword">${g.name}</span>`).join(' ')}</p>

            <div class="movie-details">
              <p><strong>Director:</strong> ${director?.name || 'N/A'}</p>
              <p><strong>Seasons:</strong> ${details.number_of_seasons}</p>
              <p><strong>Episodes:</strong> ${details.number_of_episodes}</p>
            </div>

            <div class="movie-buttons">
              ${trailer ? `<button class="trailer-button" onclick="openModal('${trailer.key}')">Watch Trailer</button>` : ''}
              <button class="btn-like"><img src="/photos/heart.png" alt="Like" class="icon"></button>
              <button class="btn-save"><img src="/photos/save.png" alt="Save" class="icon"></button>
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
        console.error('Fehler beim Laden der Serien-Details:', err);
        detailsEl.innerHTML = `<p>Fehler beim Laden der Serien-Details.</p>`;
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

/*
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