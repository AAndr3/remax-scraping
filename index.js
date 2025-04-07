const express = require('express');
const { chromium } = require('playwright');

const app = express();

console.log('🔥 ESTE É O FICHEIRO index.js QUE ESTÁ A CORRER 🔥');

// FUNÇÃO DE SCRAPING
async function scrapeRemax(cidade = 'lisboa', tipologia = '') {
  const browser = await chromium.launch({
    headless: true,
    executablePath: await executablePath(),
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  cidade = cidade.toLowerCase();
  tipologia = tipologia.toLowerCase();

  let url = `https://www.remax.pt/pt/comprar/imoveis/habitacao/${cidade}/r/r`;
  if (tipologia) url += `/${tipologia}`;

  const queryParams = `?s=${encodeURIComponent(JSON.stringify({ rg: cidade.charAt(0).toUpperCase() + cidade.slice(1) }))}&p=1&o=-PublishDate`;
  url += queryParams;

  console.log('🔗 URL final:', url);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const dados = await page.$$eval('[data-id="listing-card-container"]', cards =>
    cards
      .map(card => {
        const imagem = card.querySelector('img')?.src;
        const link = card.querySelector('a[data-id="listing-card-link"]')?.getAttribute('href');

        const bTags = Array.from(card.querySelectorAll('b')).map(b => b.innerText.trim());
        const preco = bTags.find(text => text.includes('€')) || '-';

        const linhas = card.innerText.split('\n').map(l => l.trim()).filter(Boolean);
        const local = linhas.find(l => l.includes(',') && !l.includes('€') && !l.toLowerCase().includes('virtual'));

        if (!imagem || !link || !preco || !local) return null;

        return [local, preco, imagem, `https://www.remax.pt${link}`];
      })
      .filter(Boolean)
  );

  await browser.close();
  return dados;
}

// ENDPOINT PRINCIPAL
app.get('/scrape', async (req, res) => {
  const { cidade = 'lisboa', tipologia = '' } = req.query;

  console.log('🌍 Parâmetros recebidos:', cidade, tipologia);

  try {
    const dados = await scrapeRemax(cidade, tipologia);

    if (!Array.isArray(dados) || dados.length === 0) {
      throw new Error('Nenhum imóvel encontrado no scraping.');
    }

    res.json({ status: 'ok', resultados: dados.length, data: dados });
  } catch (err) {
    console.error('❌ ERRO:', err.message);
    res.status(500).json({ status: 'erro', mensagem: err.message });
  }
});

app.get('/scrapefull', async (req, res) => {
  const { url } = req.query;

  if (!url || !url.startsWith('https://www.remax.pt/pt/imoveis/')) {
    return res.status(400).json({ status: 'erro', mensagem: 'URL inválido ou não fornecido.' });
  }

  try {
    const browser = await chromium.launch({
      headless: true,
      executablePath: await executablePath(),
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const imagens = await page.$$eval('img', imgs =>
      imgs
        .map(img => img.src)
        .filter(src => src.includes('maxwork.pt/l-feat')) // só as imagens do anúncio
        .slice(0, 10) // no máximo 10
    );

    await browser.close();

    res.json({ status: 'ok', imagens });
  } catch (err) {
    console.error('❌ ERRO NO /scrapefull:', err.message);
    res.status(500).json({ status: 'erro', mensagem: err.message });
  }
});


// INICIAR SERVER
app.listen(3333, () => {
  console.log('🟢 Server a correr em http://localhost:3333');
});

setInterval(() => {
  console.log('⏳ Estou vivo...');
}, 5000);
