// 下载 urls 所有SVG图标到本地icons文件夹
const fs = require('fs');
const https = require('https');
const path = require('path');

// 读取 icon-config.js 中的配置
const { ICON_CONFIG } = require('./icon-config.js');
let source = 'tabler_svg_urls';
const urls = ICON_CONFIG.sources[source];

const outDir = path.join(__dirname, '../icons/web');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

function download(url, filename) {
    const file = fs.createWriteStream(filename);
    https.get(url, res => {
        res.pipe(file);
        file.on('finish', () => file.close());
    });
}

for (const [name, url] of Object.entries(urls)) {
    const filePath = path.join(outDir, `${name}.svg`);
    download(url, filePath);
}

// node icon-download.js