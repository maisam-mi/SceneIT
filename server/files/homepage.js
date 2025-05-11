document.addEventListener("DOMContentLoaded", async() => {
    const container = document.getElementById("topPicksScroll"); // Wichtig: ID wie in deinem HTML
    if (!container) return;

    try {
        const res = await fetch("/movies/highlight");
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const movies = await res.json();

        const movieCards = movies.slice(0, 20).map(movie => `
            <div class="movie-card">
                <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}" />
                <h3>${movie.title}</h3>
                <a class="details-button" href="movie.html?id=${movie.id}">Details</a>
            </div>
        `).join('');

        container.innerHTML = movieCards;

    } catch (err) {
        console.error("Failed to load movies:", err);
        container.innerHTML = `
            <div id="movie-error-section">
                <div class="error-message">
                    <p>Fehler beim Laden der Filme.</p>
                    <button id="retryBtn" class="retry-button">Erneut versuchen</button>
                </div>
            </div>
        `;

        document.getElementById("retryBtn").addEventListener("click", () => {
            window.location.reload();
        });
    }
});