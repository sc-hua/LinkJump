
const redirectors = [
  { name: "HJFY", url: id => `https://hjfy.top/arxiv/${id}` },
  { name: "alphaXiv", url: id => `https://www.alphaxiv.org/abs/${id}` },
  { name: "Cool Papers", url: id => `https://papers.cool/arxiv/${id}` },
  { name: "abs", url: id => `https://arxiv.org/abs/${id}` },
  { name: "pdf", url: id => `https://arxiv.org/pdf/${id}` },
];

function extractPaperId(url) {
  const match = url.match(/[0-9]{4}\.[0-9]{4,5}(v\d+)?/);
  return match ? match[0] : null;
}

function createButtons(paperId) {
  const container = document.getElementById('buttons');
  for (const site of redirectors) {
    const btn = document.createElement('button');
    btn.innerText = `${site.name}`;
    btn.onclick = () => {
      const targetUrl = site.url(paperId);
      chrome.tabs.create({ url: targetUrl });
    };
    container.appendChild(btn);
  }
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;
    const paperId = extractPaperId(url);

    if (paperId) {
        createButtons(paperId);
        document.getElementById('status').innerText = `arXiv: ${paperId}`;
    } else {
        document.getElementById('status').innerText = 'No arXiv id.';
    }
});
