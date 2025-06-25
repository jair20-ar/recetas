document.addEventListener('DOMContentLoaded', () => {
  let recetas = [];
  let recetaAbierta = null;

  // --- FAVORITOS: funciones locales ---
  function getUserFavoritesLocal() {
    try {
      return JSON.parse(localStorage.getItem("favorites") || "[]");
    } catch { return []; }
  }

  function setUserFavoritesLocal(favs) {
    localStorage.setItem("favorites", JSON.stringify(favs));
  }

  function isFavorite(recipeId) {
    const favs = getUserFavoritesLocal();
    return favs.includes(String(recipeId));
  }

  function toggleFavorite(recipeId) {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) {
      alert("Debes iniciar sesión para manejar favoritos.");
      return;
    }
    const fav = isFavorite(recipeId);
    const method = fav ? "DELETE" : "POST";
    fetch(`http://localhost:4322/api/users/${userId}/favorites/${recipeId}`, {
      method,
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(() => {
      let favs = getUserFavoritesLocal();
      if (fav) {
        favs = favs.filter(id => id !== String(recipeId));
      } else {
        favs.push(String(recipeId));
      }
      setUserFavoritesLocal(favs);
      renderRecipeList();
    });
  }
  // --- FIN FAVORITOS ---

  function renderRecipeList() {
    const list = document.getElementById("recipesList");
    if (!recetas.length) {
      list.innerHTML = "<p>No se encontraron recetas vegetarianas.</p>";
      return;
    }
    list.innerHTML = recetas.map((recipe, idx) => `
      <button class="recipe-title-btn${recetaAbierta === idx ? ' open' : ''}" onclick="mostrarDetalle(${idx})">
        <span class="icon-veg">🥦</span>${recipe.title}
        <button 
          class="fav-btn" 
          type="button"
          data-id="${recipe.id}"
          title="${isFavorite(recipe.id) ? "Quitar de favoritas" : "Agregar a favoritas"}"
          style="margin-left:12px;font-size:1.2em;vertical-align:middle;"
          onclick="event.stopPropagation(); window.toggleFavoriteFromList && window.toggleFavoriteFromList('${recipe.id}')"
        >${isFavorite(recipe.id) ? "❤️" : "🤍"}</button>
      </button>
      ${recetaAbierta === idx ? renderRecipeDetails(recipe) : ""}
    `).join("");
  }

  function renderRecipeDetails(recipe) {
    let imageSrc = "";
    if (recipe.image) {
      imageSrc = recipe.image.startsWith("http")
        ? recipe.image
        : `http://localhost:4322/uploads/${encodeURIComponent(recipe.image)}`;
    }
    return `
      <div class="recipe-details">
        <div class="recipe-img-wrapper">
          ${imageSrc ? `<img src="${imageSrc}" alt="${recipe.title}">` : ""}
        </div>
        <div class="title">${recipe.title}</div>
        <span class="category-badge">${recipe.category || "Sin Categoría"}</span>
        <p><b>Ingredientes:</b><br> ${recipe.ingredients ? recipe.ingredients.replace(/\n/g, '<br>') : ""}</p>
        <p><b>Preparación:</b> ${recipe.instructions}</p>
        <button 
          class="fav-btn" 
          type="button"
          data-id="${recipe.id}"
          title="${isFavorite(recipe.id) ? "Quitar de favoritas" : "Agregar a favoritas"}"
          style="font-size:1.3em;float:right;margin-bottom:8px;"
          onclick="window.toggleFavoriteFromDetail && window.toggleFavoriteFromDetail('${recipe.id}')"
        >${isFavorite(recipe.id) ? "❤️" : "🤍"}</button>
        <button onclick="cerrarDetalle()" type="button" class="close-detail-btn">Cerrar</button>
      </div>
    `;
  }

  function mostrarDetalle(idx) {
    recetaAbierta = idx;
    renderRecipeList();
  }
  function cerrarDetalle() {
    recetaAbierta = null;
    renderRecipeList();
  }

  // Hacemos fetch al cargar
  fetch('http://localhost:4322/api/recipes')
    .then(res => res.json())
    .then(data => {
      recetas = Array.isArray(data)
        ? data.filter(
            (r) =>
              r.category &&
              r.category.trim().toLowerCase() === "vegetariana"
          )
        : [];
      renderRecipeList();
    });

  // Exponer funciones globalmente para el HTML inline
  window.mostrarDetalle = mostrarDetalle;
  window.cerrarDetalle = cerrarDetalle;

  // Expone para los botones de favoritos en HTML generado
  window.toggleFavoriteFromList = toggleFavorite;
  window.toggleFavoriteFromDetail = toggleFavorite;
});