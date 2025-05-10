document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("recommendations");
    if (!container) return;

    try {
        const res = await fetch("/movies/highlight");
        const movies = await res.json();

        movies.slice(0, 12).forEach((movie) => {
            const card = document.createElement("div");
            card.classList.add("movie-card");
            card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}" />
        <h3>${movie.title}</h3>
        <button onclick="window.location.href='movie.html?id=${movie.id}'">Details</button>`;
            container.appendChild(card);
        });
    } catch (err) {
        console.error("Failed to load movies:", err);
    }
});
