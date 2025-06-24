// USER PROFILE DROPDOWN LOGIC
      let userName = localStorage.getItem("userName") || "Usuario";
      let userEmail = localStorage.getItem("email") || "";
      let userId = localStorage.getItem("userId") || "";
      document.getElementById("profileName").textContent = userName;
      document.getElementById("dropdownUserName").textContent = userName;

      // Dropdown open/close logic
      const profileBtn = document.getElementById("profileBtn");
      const profileDropdown = document.getElementById("profileDropdown");
      profileBtn.addEventListener("click", function(e) {
        profileDropdown.classList.toggle("active");
        if (profileDropdown.classList.contains("active")) {
          document.getElementById("myRecipesList").style.display = "none";
        }
      });
      // Close dropdown if clicking outside
      document.addEventListener("mousedown", function(e){
        if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)){
          profileDropdown.classList.remove("active");
        }
      });

      // Logout
      document.getElementById("logoutBtn").addEventListener("click", function() {
        localStorage.clear();
        window.location.href = "/login";
      });

      // === BLOQUE NUEVO: LÓGICA DE EDICIÓN ===
      let currentEditRecipeId = null;
      const editModal = document.getElementById('editModal');
      const closeEditModalBtn = document.getElementById('closeEditModalBtn');
      const editForm = document.getElementById('editRecipeForm');
      const editImageInput = document.getElementById('editImageInput');
      const customEditImageBtn = document.getElementById('customEditImageBtn');
      const editImageFileName = document.getElementById('editImageFileName');
      const editCurrentImage = document.getElementById('editCurrentImage');
      const editIngredientsList = document.getElementById('editIngredientsList');
      const editAddIngredientBtn = document.getElementById('editAddIngredientBtn');
      const editTitle = document.getElementById('editTitle');
      const editCategory = document.getElementById('editCategory');
      const editInstructions = document.getElementById('editInstructions');

      async function abrirModalEdicion(recipeId) {
        currentEditRecipeId = recipeId;
        let receta = null;
        try {
          const res = await fetch('http://localhost:4322/api/recipes');
          const recetas = await res.json();
          receta = recetas.find(r => String(r.id) === String(recipeId) || String(r._id) === String(recipeId));
        } catch {
          alert("No se pudo obtener la receta.");
          return;
        }
        if (!receta) {
          alert("No se encontró la receta.");
          return;
        }
        editTitle.value = receta.title || '';
        editCategory.value = receta.category || 'vegetariana';
        editInstructions.value = receta.instructions || '';
        editIngredientsList.innerHTML = '';
        (receta.ingredients ? receta.ingredients.split('\n') : [""]).forEach((ing, idx) => {
          const div = document.createElement('div');
          div.style.display = 'flex';
          div.style.gap = '0.5rem';
          div.innerHTML = `
            <input type="text" name="ingredient" required placeholder="Ingrediente" style="flex:1;" value="${ing.replace(/"/g, '&quot;')}" />
            <button type="button" class="editRemoveIngredientBtn" title="Quitar ingrediente">–</button>
          `;
          div.querySelector('.editRemoveIngredientBtn').onclick = function() {
            editIngredientsList.removeChild(div);
            updateEditRemoveButtons();
          };
          editIngredientsList.appendChild(div);
        });
        updateEditRemoveButtons();
        // Imagen actual
        if (receta.image) {
          editCurrentImage.src = receta.image.startsWith("http")
            ? receta.image
            : `http://localhost:4322/uploads/${encodeURIComponent(receta.image)}`;
          editCurrentImage.style.display = '';
        } else {
          editCurrentImage.style.display = 'none';
        }
        editImageFileName.textContent = '';
        editImageInput.value = "";
        editModal.classList.add('active');
      }

      function updateEditRemoveButtons() {
        const btns = editIngredientsList.querySelectorAll('.editRemoveIngredientBtn');
        if (btns.length > 1) {
          btns.forEach(btn => btn.style.display = '');
        } else {
          btns.forEach(btn => btn.style.display = 'none');
        }
      }
      editAddIngredientBtn.onclick = function() {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.gap = '0.5rem';
        div.innerHTML = `
          <input type="text" name="ingredient" required placeholder="Ingrediente" style="flex:1;" />
          <button type="button" class="editRemoveIngredientBtn" title="Quitar ingrediente">–</button>
        `;
        div.querySelector('.editRemoveIngredientBtn').onclick = function() {
          editIngredientsList.removeChild(div);
          updateEditRemoveButtons();
        };
        editIngredientsList.appendChild(div);
        updateEditRemoveButtons();
      };
      customEditImageBtn.onclick = function() {
        editImageInput.click();
      };
      editImageInput.onchange = function() {
        editImageFileName.textContent = this.files.length ? this.files[0].name : '';
      };
      closeEditModalBtn.addEventListener('click', () => { editModal.classList.remove('active'); });
      editModal.addEventListener('click', (e) => {
        if (e.target === editModal) editModal.classList.remove('active');
      });
      editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentEditRecipeId) return;
        const formData = new FormData();
        formData.append('title', editTitle.value.trim());
        formData.append('category', editCategory.value);
        const ingredientInputs = editIngredientsList.querySelectorAll('input[name="ingredient"]');
        const ingredients = Array.from(ingredientInputs).map(i => i.value.trim()).filter(Boolean);
        formData.append('ingredients', ingredients.join('\n'));
        formData.append('instructions', editInstructions.value.trim());
        if (editImageInput.files.length > 0) {
          formData.append('image', editImageInput.files[0]);
        }
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`http://localhost:4322/api/recipes/${currentEditRecipeId}`, {
            method: 'PUT',
            headers: token && token.trim() !== "" && token !== "null" && token !== "undefined"
              ? { 'Authorization': 'Bearer ' + token }
              : {},
            body: formData
          });
          const data = await res.json();
          if (res.ok) {
            alert('Receta actualizada exitosamente');
            editModal.classList.remove('active');
            document.getElementById("myRecipesBtn").click(); // recarga la lista
          } else {
            alert('Error: ' + (data.error || 'al actualizar la receta'));
          }
        } catch (err) {
          alert('Error de red');
        }
      });
      // === FIN BLOQUE NUEVO ===

      // Mis Recetas CON EDITAR Y ELIMINAR (FILTRAR POR author_id y usar token en DELETE)
      document.getElementById("myRecipesBtn").addEventListener("click", function() {
        const listWrapper = document.getElementById("myRecipesList");
        const items = document.getElementById("myRecipesItems");
        if (listWrapper.style.display === "block") {
          listWrapper.style.display = "none";
          return;
        }
        fetch('http://localhost:4322/api/recipes')
          .then(res => res.json())
          .then(data => {
            // CAMBIO: FILTRO POR author_id, no userId
            const myRecipes = Array.isArray(data)
              ? data.filter(
                  r => (r.author_id && userId && String(r.author_id) === String(userId))
                )
              : [];
            if (!myRecipes.length) {
              items.innerHTML = "<div style='color:#9c0720;opacity:0.7;'>No has subido recetas.</div>";
            } else {
              items.innerHTML = myRecipes
                .map(r => {
                  let imageSrc = "";
                  if (r.image) {
                    imageSrc = r.image.startsWith("http")
                      ? r.image
                      : `http://localhost:4322/uploads/${encodeURIComponent(r.image)}`;
                  }
                  return `<div class="my-recipes-item" data-recipe-id="${r.id || r._id}">
                            ${imageSrc ? `<img src="${imageSrc}" alt="img">` : ""}
                            <span style="flex:1;">${r.title}</span>
                            <button class="editRecipeBtn" data-id="${r.id || r._id}" title="Editar">✏️</button>
                            <button class="deleteRecipeBtn" data-id="${r.id || r._id}" title="Eliminar">🗑️</button>
                          </div>`;
                })
                .join("");
            }
            listWrapper.style.display = "block";

            // CAMBIO: Eliminar receta usando token
            document.querySelectorAll('.deleteRecipeBtn').forEach(btn => {
              btn.onclick = function(e) {
                e.stopPropagation();
                const recipeId = btn.getAttribute("data-id");
                if (confirm("¿Seguro que deseas eliminar esta receta?")) {
                  const token = localStorage.getItem('token');
                  fetch(`http://localhost:4322/api/recipes/${recipeId}`, {
                    method: "DELETE",
                    headers: token && token.trim() !== "" && token !== "null" && token !== "undefined"
                      ? { 'Authorization': 'Bearer ' + token }
                      : {}
                  })
                  .then(res => {
                    if(res.ok) {
                      btn.closest('.my-recipes-item').remove();
                    } else {
                      res.json().then(err => {
                        alert("No se pudo eliminar la receta: " + (err.error || ""));
                      });
                    }
                  });
                }
              };
            });

            // Editar receta (ahora abre el modal de edición)
            document.querySelectorAll('.editRecipeBtn').forEach(btn => {
              btn.onclick = function(e) {
                e.stopPropagation();
                const recipeId = btn.getAttribute("data-id");
                abrirModalEdicion(recipeId);
              };
            });
          });
      });

      // USER INFO GREETING
      document.getElementById("user-info").textContent = `Hola, ${userName}`;

      // MODAL Y FORMULARIO DE RECETA (igual que antes)
      document.getElementById('customImageBtn').onclick = function() {
        document.getElementById('imageInput').click();
      };
      document.getElementById('imageInput').onchange = function() {
        document.getElementById('imageFileName').textContent = this.files.length ? this.files[0].name : '';
      };

      // Ingredientes dinámicos
      const ingredientsList = document.getElementById('ingredientsList');
      const addIngredientBtn = document.getElementById('addIngredientBtn');
      addIngredientBtn.onclick = function() {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.gap = '0.5rem';
        div.innerHTML = `
          <input type="text" name="ingredient" required placeholder="Ingrediente" style="flex:1;" />
          <button type="button" class="removeIngredientBtn" title="Quitar ingrediente">–</button>
        `;
        div.querySelector('.removeIngredientBtn').onclick = function() {
          ingredientsList.removeChild(div);
          updateRemoveButtons();
        };
        ingredientsList.appendChild(div);
        updateRemoveButtons();
      };
      function updateRemoveButtons() {
        const btns = ingredientsList.querySelectorAll('.removeIngredientBtn');
        if (btns.length > 1) {
          btns.forEach(btn => btn.style.display = '');
        } else {
          btns.forEach(btn => btn.style.display = 'none');
        }
      }
      updateRemoveButtons();

      // Modal control
      const modal = document.getElementById('modal');
      const closeBtn = document.getElementById('closeModalBtn');
      document.getElementById("navOpenModal").addEventListener("click", function(e) {
        e.preventDefault();
        modal.classList.add('active');
      });
      closeBtn.addEventListener('click', () => { modal.classList.remove('active'); });
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });

      // Modifica el envío del formulario para juntar ingredientes y enviar token
      const form = document.getElementById('recipeForm');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const ingredientInputs = ingredientsList.querySelectorAll('input[name="ingredient"]');
        const ingredients = Array.from(ingredientInputs).map(i => i.value.trim()).filter(Boolean);
        formData.delete('ingredient');
        formData.append('ingredients', ingredients.join('\n'));
        if(userId) formData.append('userId', userId);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('http://localhost:4322/api/recipes', {
            method: 'POST',
            headers: token && token.trim() !== "" && token !== "null" && token !== "undefined"
              ? { 'Authorization': 'Bearer ' + token }
              : {},
            body: formData
          });
          if (res.ok) {
            alert('Receta registrada exitosamente');
            form.reset();
            modal.classList.remove('active');
            document.getElementById('imageFileName').textContent = '';
            while (ingredientsList.children.length > 1) ingredientsList.removeChild(ingredientsList.lastChild);
            updateRemoveButtons();
          } else {
            const err = await res.json();
            alert('Error: ' + (err.error || 'al registrar la receta'));
          }
        } catch (err) {
          alert('Error de red');
        }
      });