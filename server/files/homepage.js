document.addEventListener("DOMContentLoaded", async() => {
    const container = document.getElementById("recommendations");
    if (!container) return;

    try {
        const res = await fetch("/movies/highlight");

        // prüft, ob der HTTP-Statuscode der Antwort im Bereich von 200 bis 299 liegt
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const movies = await res.json();

        // HTML für alle Filme auf einmal generieren
        const movieCards = movies.slice(0, 12).map(movie => `
            <div class="movie-card">
                <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}" />
                <h3>${movie.title}</h3>
                <button onclick="window.location.href='movie.html?id=${movie.id}'">Details</button>
            </div>
        `).join('');

        // Alle Cards auf einmal ins DOM einfügen
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