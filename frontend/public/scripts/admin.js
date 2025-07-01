const recipeList = document.getElementById('recipeList');

// --- VER TODAS LAS RECETAS ---
async function fetchRecipes() {
  recipeList.innerHTML = '<li>Cargando...</li>';
  try {
    const res = await fetch('http://localhost:4321/api/admin/recipes');
    const recipes = await res.json();
    recipeList.innerHTML = '';
    if (!recipes.length) {
      recipeList.innerHTML = '<li>No hay recetas.</li>';
      return;
    }
    recipes.forEach(recipe => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${recipe.title}</span>`;
      // Botón eliminar receta
      const delBtn = document.createElement('button');
      delBtn.textContent = "Eliminar";
      delBtn.onclick = async () => {
        if (confirm(`¿Seguro que deseas eliminar la receta "${recipe.title}"?`)) {
          await deleteRecipe(recipe.id);
        }
      };
      li.appendChild(delBtn);
      recipeList.appendChild(li);
    });
  } catch (e) {
    recipeList.innerHTML = '<li>Error al cargar recetas</li>';
  }
}

// --- ELIMINAR RECETA ---
async function deleteRecipe(id) {
  try {
    const res = await fetch(`http://localhost:4321/api/admin/recipes/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.success) {
      fetchRecipes();
    } else {
      alert('No se pudo eliminar la receta: ' + (data.message || ''));
    }
  } catch (err) {
    alert('Error de red');
  }
}

// --- INICIALIZAR ---
fetchRecipes();