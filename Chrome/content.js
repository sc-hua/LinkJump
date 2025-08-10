
var url = window.location.href;

const redirectors = [
  { name: "HJFY", url: id => `https://hjfy.top/arxiv/${id}` },
  { name: "alphaXiv", url: id => `https://www.alphaxiv.org/abs/${id}` },
  { name: "Cool Papers", url: id => `https://papers.cool/arxiv/${id}` }
];

if (url.startsWith('https://arxiv.org/')) {
    
    // for a exact paper, e.g. "https://arxiv.org/abs/1706.03762"
    if (url.startsWith('https://arxiv.org/abs/')) {
        var paperId = url.match(/[0-9]{4}\.[0-9]{4,5}/)[0];
        var ul = document.querySelector('div.full-text ul');
        for (const site of redirectors) {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${site.url(paperId)}" target="_blank">${site.name}</a>`;
            ul.appendChild(li);
        }
        
    // for a list of papers, e.g. "https://arxiv.org/list/cs.CV/recent"
    } else if (url.startsWith('https://arxiv.org/list/')) {
        var dts = document.querySelectorAll('#articles dt');
        Array.from(dts).map(function(dt) {
            var paperId = dt.querySelectorAll('a')[1].id;
            for (const site of redirectors) {
                dt.innerHTML = dt.innerHTML.trim().slice(0, -1) +
                  `, <a href="${site.url(paperId)}" target="_blank">${site.name.toLowerCase()}</a>]`;
            }
        })
    }
}
