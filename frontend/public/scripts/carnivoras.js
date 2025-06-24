document.addEventListener('DOMContentLoaded', () => {
  let recetas = [];
  let recetaAbierta = null;

  function renderRecipeList() {
    const list = document.getElementById("recipesList");
    if (!recetas.length) {
      list.innerHTML = "<p>No se encontraron recetas carnívoras.</p>";
      return;
    }
    list.innerHTML = recetas.map((recipe, idx) => `
      <button class="recipe-title-btn${recetaAbierta === idx ? ' open' : ''}" onclick="mostrarDetalle(${idx})">
        <span class="icon-meat">🍖</span>${recipe.title}
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
              r.category.trim().toLowerCase() === "carnivora"
          )
        : [];
      renderRecipeList();
    });

  // Exponer funciones globalmente para el HTML inline
  window.mostrarDetalle = mostrarDetalle;
  window.cerrarDetalle = cerrarDetalle;
});