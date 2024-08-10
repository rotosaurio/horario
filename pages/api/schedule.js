import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import axios from 'axios';

const llamarApiOpenAI = async (pdfContent) => {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Analiza el siguiente contenido del PDF y sugiere el mejor horario para un estudiante. Carrera: Ingeniería en Sistemas Computacionales, Semestre: Segundo, Recursar/Adelantar: Sí, Materias: Álgebra Lineal, Información Extra: Prefiero el profesor Juan Pérez.'
          },
          {
            role: 'user',
            content: `Contenido del PDF: ${pdfContent}`
          }
        ],
        max_tokens: 2048
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        retryCount++;
        console.log(`Intento ${retryCount} fallido. Reintentando en ${retryCount * 2} segundos...`);
        await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
      } else {
        throw error;
      }
    }
  }

  throw new Error('Se ha alcanzado el límite de reintentos para la solicitud a la API de OpenAI.');
};

export default async (req, res) => {
  if (req.method === 'POST') {
    const pdfPath = path.join(process.cwd(), 'public', 'data', 'horarios.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);

    try {
      const pdfData = await pdfParse(pdfBuffer);
      const pdfText = pdfData.text;

      const result = await llamarApiOpenAI(pdfText);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error procesando el PDF o llamando a la API:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
