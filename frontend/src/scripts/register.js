document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      // Obtener los valores de los campos del formulario
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      try {
        // Enviar los datos al backend
        const response = await fetch('http://localhost:5000/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
  
        const data = await response.json();
        if (response.ok) {
          alert('Registro exitoso');
        } else {
          alert(data.error || 'Error al registrarse');
        }
      } catch (error) {
        alert('Error de conexión');
      }
    });
  });