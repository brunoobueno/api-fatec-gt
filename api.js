const express = require('express');
const axios = require('axios');
const pdf = require('pdf-parse');

const app = express();
app.use(express.json());

const YEAR = '2024'; // Ano fixo
const SEMESTER = '1'; // Semestre fixo

app.post('/extrair', async (req, res) => {
    const { ra } = req.body;
    const url = `https://www.fateconline.com.br/sistema/Uploads/Carterinha/${YEAR}${SEMESTER}-F${ra}.pdf`;

    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const data = await pdf(response.data);

        const text = data.text;
        const extractedData = extractInfoFromText(text);

        res.json(extractedData);
    } catch (error) {
        res.status(500).json({ error: 'Falha ao processar o PDF' });
    }
});

function extractInfoFromText(text) {
    const lines = text.trim().split('\n');
    const ra = lines[0].trim();
    
    let curso;
    let nome;

    // Verifica se o curso está em 2 ou 3 linhas e ajusta o índice do nome
    if (lines.length >= 6) {
        curso = lines[2].trim() + ' ' + lines[3].trim() + ' ' + lines[4].trim();
        nome = lines[5].trim();
    } else if (lines.length >= 5) {
        curso = lines[2].trim() + ' ' + lines[3].trim();
        nome = lines[4].trim();
    } else {
        curso = lines[2].trim();
        nome = lines[3].trim();
    }
    
    return { ra, curso, nome };
}

const PORT = 9000;
app.listen(PORT, () => {
    console.log(`API rodando na porta: ${PORT}`);
});
