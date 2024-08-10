import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [carrera, setCarrera] = useState('');
  const [semestre, setSemestre] = useState('');
  const [recursarAdelantar, setRecursarAdelantar] = useState(false);
  const [materias, setMaterias] = useState('');
  const [infoExtra, setInfoExtra] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setResultado(null);

    try {
      const response = await axios.post('/api/schedule', {});
      console.log('Respuesta de la API:', response.data);
      if (response.data.choices && response.data.choices.length > 0) {
        setResultado(response.data.choices[0].message.content);
      } else {
        setError('No se obtuvo un horario sugerido de la API.');
      }
    } catch (error) {
      setError('Error analizando el horario.');
      console.error('Error analizando el horario:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resultado) {
      console.log('Resultado actualizado:', resultado);
    }
  }, [resultado]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Asistente de Horarios</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            placeholder="Carrera" 
            value={carrera} 
            onChange={(e) => setCarrera(e.target.value)} 
            required 
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input 
            type="text" 
            placeholder="Semestre" 
            value={semestre} 
            onChange={(e) => setSemestre(e.target.value)} 
            required 
            className="w-full p-2 border border-gray-300 rounded"
          />
          <div className="flex items-center">
            <input 
              type="checkbox" 
              checked={recursarAdelantar} 
              onChange={(e) => setRecursarAdelantar(e.target.checked)} 
              className="mr-2"
            />
            <label>¿Quieres adelantar o recursar materias?</label>
          </div>
          {recursarAdelantar && (
            <input 
              type="text" 
              placeholder="Materias" 
              value={materias} 
              onChange={(e) => setMaterias(e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded"
            />
          )}
          <textarea 
            placeholder="Información Extra" 
            value={infoExtra} 
            onChange={(e) => setInfoExtra(e.target.value)} 
            className="w-full p-2 border border-gray-300 rounded"
          ></textarea>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600" disabled={loading}>
            {loading ? 'Analizando...' : 'Analizar Horario'}
          </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {resultado && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded">
            <h2 className="text-xl font-semibold mb-2">Horario Sugerido</h2>
            <pre className="whitespace-pre-wrap">{resultado}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
