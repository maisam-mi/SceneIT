document.addEventListener("DOMContentLoaded", () => {
    const movieContainer = document.getElementById("topPicksScroll");
    const actorContainer = document.getElementById("actors");
    const showMoviesBtn = document.getElementById("showMovies");
    const showSeriesBtn = document.getElementById("showSeries");

    // ==== Beliebte Filme laden ====
    async function loadMovies() {
        if (!movieContainer) return;
        try {
            const res = await fetch("/movies/highlight");
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            const movies = await res.json();

            movieContainer.innerHTML = movies.map(movie => {
                // Genres extrahieren, falls vorhanden
                const genres = movie.genres ? movie.genres.map(genre => genre.name).join(", ") : "Unbekannt";

                return `
                    <div class="movie-card">
                        <a href="movie.html?id=${movie.id}">
                            <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}" />
                        </a>
                        <div class="info">
                            <h3>${movie.title}</h3>
                            <div class="genre-rating">
                                <span class="genre">${genres}</span>
                                <span class="rating">${movie.vote_average.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (err) {
            console.error("Fehler beim Laden der Filme:", err);
            movieContainer.innerHTML = `<p>Fehler beim Laden der Filme.</p>`;
        }
    }

    // ==== Beliebte TV-Serien laden ====
    async function loadSeries() {
        if (!movieContainer) return;
        try {
            const res = await fetch("/tvSeries/highlight");
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            const series = await res.json();

            movieContainer.innerHTML = series.map(serie => {
                // Genres extrahieren, falls vorhanden
                const genres = serie.genres ? serie.genres.map(genre => genre.name).join(", ") : "Unbekannt";

                return `
                    <div class="movie-card">
                        <a href="tvSeries.html?id=${serie.id}">
                            <img src="https://image.tmdb.org/t/p/w300${serie.poster_path}" alt="${serie.name}" />
                        </a>
                        <div class="info">
                            <h3>${serie.name}</h3>
                            <div class="genre-rating">
                                <span class="genre">${genres}</span>
                                <span class="rating">${serie.vote_average.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (err) {
            console.error("Fehler beim Laden der Serien:", err);
            movieContainer.innerHTML = `<p>Fehler beim Laden der Serien.</p>`;
        }
    }

    // ==== Schauspieler laden ====
    async function loadActors() {
        if (!actorContainer) return;
        try {
            const res = await fetch("/actors");
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            const actors = await res.json();

            actorContainer.innerHTML = actors.map(actor => `
                <div class="actor-card">
                    <img src="https://image.tmdb.org/t/p/w300${actor.profile_path}" alt="${actor.name}" />
                    <h3>${actor.name}</h3>
                </div>
            `).join('');
        } catch (err) {
            console.error("Fehler beim Laden der Schauspieler:", err);
            actorContainer.innerHTML = `<p>Fehler beim Laden der Schauspieler.</p>`;
        }
    }

    // ==== Umschalten zwischen Film & Serie ====
    if (showMoviesBtn && showSeriesBtn) {
        showMoviesBtn.addEventListener("click", () => {
            showMoviesBtn.classList.add("active");
            showSeriesBtn.classList.remove("active");
            loadMovies();
        });

        showSeriesBtn.addEventListener("click", () => {
            showSeriesBtn.classList.add("active");
            showMoviesBtn.classList.remove("active");
            loadSeries();
        });
    }

    // ==== Initialer Ladevorgang ====
    loadMovies(); // Standard: Filme
    loadSeries();
    loadActors(); // Schauspieler
});