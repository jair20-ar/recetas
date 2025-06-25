document.addEventListener('DOMContentLoaded', async () => {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const favoritasList = document.getElementById("favoritasList");

  if (!userId || !token) {
    favoritasList.innerHTML = `<div style="color:#b30000;">Debes iniciar sesión para ver tus favoritas.</div>`;
    return;
  }

  async function fetchFavoritas() {
    try {
      const res = await fetch(`http://localhost:4322/api/users/${userId}/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("No se pudo obtener favoritas");
      const favoritas = await res.json();
      renderFavoritas(favoritas);
    } catch (e) {
      favoritasList.innerHTML = `<div style="color:#b30000;">No se pudieron cargar tus favoritas.</div>`;
    }
  }

  function renderFavoritas(recetas) {
    if (!recetas.length) {
      favoritasList.innerHTML = `<div style="color:#b30000;">No tienes recetas favoritas.</div>`;
      return;
    }

    favoritasList.innerHTML = recetas.map(recipe => {
      let imageSrc = "";
      if (recipe.image) {
        imageSrc = recipe.image.startsWith("http")
          ? recipe.image
          : `http://localhost:4322/uploads/${encodeURIComponent(recipe.image)}`;
      }
      return `
        <div class="recipe-card">
          <div class="recipe-img-wrapper">
            ${imageSrc ? `<img src="${imageSrc}" alt="${recipe.title}">` : ""}
          </div>
          <div class="title">${recipe.title}</div>
          <span class="category-badge">${recipe.category || "Sin Categoría"}</span>
          <p><b>Ingredientes:</b><br> ${recipe.ingredients ? recipe.ingredients.replace(/\n/g, '<br>') : ""}</p>
          <p><b>Preparación:</b> ${recipe.instructions}</p>
          <button class="fav-btn" type="button"
            title="Quitar de favoritas"
            style="font-size:1.3em;float:right;margin-bottom:8px;"
            onclick="window.toggleFavorite('${recipe.id}')"
          >❤️</button>
        </div>
      `;
    }).join("");
  }

  // Permitir quitar de favoritas directamente
  window.toggleFavorite = async function(recipeId) {
    try {
      await fetch(`http://localhost:4322/api/users/${userId}/favorites/${recipeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFavoritas(); // refresca la lista
    } catch (e) {
      alert("No se pudo quitar de favoritas.");
    }
  };

  fetchFavoritas();
});