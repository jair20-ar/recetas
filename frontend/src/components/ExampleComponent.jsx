import { useEffect, useState } from 'react';
import axios from 'axios'; // Si usas fetch, puedes eliminar esta línea

export default function ExampleComponent() {
  const [data, setData] = useState(null); // Estado para almacenar los datos
  const [error, setError] = useState(null); // Estado para manejar errores

  useEffect(() => {
    // Hacer la solicitud al backend
    axios
      .get(import.meta.env.VITE_API_URL + '/ruta-del-backend') // Cambia '/ruta-del-backend' por la ruta de tu API
      .then((response) => {
        setData(response.data); // Almacena los datos en el estado
      })
      .catch((err) => {
        setError('Ocurrió un error al obtener los datos.');
        console.error(err);
      });
  }, []); // [] significa que esto solo se ejecuta una vez al cargar el componente

  // Renderizar los datos o un mensaje de error
  return (
    <div>
      <h1>Datos desde el backend:</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
}