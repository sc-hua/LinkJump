const redirectors_map = {
  github: [
    {
      name: "GitHub",
      prefix: "https://github.com/",
      url: repo => `https://github.com/${repo}`,
      logo: "https://raw.githubusercontent.com/sc-hua/logos/refs/heads/main/github.svg",
      hover: "View on GitHub",
    },
    {
      name: "DeepWiki",
      prefix: "https://deepwiki.com/",
      url: repo => `https://deepwiki.com/${repo}`,
      logo: "https://raw.githubusercontent.com/sc-hua/logos/refs/heads/main/devin.svg",
      hover: "View on DeepWiki",
    },
    {
      name: "Z-Read",
      prefix: "https://zread.ai/",
      url: repo => `https://zread.ai/${repo}`,
      logo: "https://raw.githubusercontent.com/sc-hua/logos/refs/heads/main/zread.svg",
      hover: "View on Z-Read",
    },
  ],
  arxiv: [
    {
      name: "HJFY",
      prefix: "https://hjfy.top/arxiv/",
      url: id => `https://hjfy.top/arxiv/${id}`,
      logo: "https://raw.githubusercontent.com/sc-hua/logos/refs/heads/main/hjfy.svg",
      hover: "Translate into a PDF in zh",
    },
    {
      name: "alphaXiv",
      prefix: "https://www.alphaxiv.org/abs/",
      url: id => `https://www.alphaxiv.org/abs/${id}`,
      logo: "https://raw.githubusercontent.com/sc-hua/logos/refs/heads/main/alphaxiv.svg",
      hover: "View AlphaXiv page for this paper",
    },
    {
      name: "Cool Papers",
      prefix: "https://papers.cool/arxiv/",
      url: id => `https://papers.cool/arxiv/${id}`,
      logo: "https://raw.githubusercontent.com/sc-hua/logos/refs/heads/main/coolpapers.png",
      hover: "View Cool Papers page for this paper",
    },
    {
      name: "arXiv",
      prefix: "https://arxiv.org/abs/",
      url: id => `https://arxiv.org/abs/${id}`,
      logo: "https://raw.githubusercontent.com/sc-hua/logos/refs/heads/main/arxiv.svg",
      hover: "View arXiv page for this paper",
    },
    {
      name: "pdf",
      prefix: "https://arxiv.org/pdf/",
      url: id => `https://arxiv.org/pdf/${id}`,
      logo: "https://raw.githubusercontent.com/sc-hua/logos/refs/heads/main/pdf.svg",
      hover: "View PDF version of this paper",
    },
    {
      name: "Hugging Face",
      prefix: "https://huggingface.co/papers/",
      url: id => `https://huggingface.co/papers/${id}`,
      logo: "https://raw.githubusercontent.com/sc-hua/logos/refs/heads/main/huggingface.svg",
      hover: "View Hugging Face page for this paper",
    }
  ],
  scholar: [  // just for detectPageType
    {
      name: "Scholar Inbox",
      prefix: "https://www.scholar-inbox.com",
    }
  ]
};

const mirrors_map = {
  // main mirrors
  "https://huggingface.co": [
    {
      mirror: "https://hf-mirror.com",
      hover: "To hf-mirror.com"
    }
  ],
  "https://github.com": [
    {
      mirror: "https://kkgithub.com",
      hover: "To kkgithub.com"
    },
    {
      mirror: "https://bgithub.xyz",
      hover: "To bgithub.xyz"
    }
  ]
}

function remove_prefix(url, prefixes) {
  for (const prefix of prefixes) {
    if (url.startsWith(prefix)) {
      url = url.replace(prefix, '');
      break;
    }
  }
  return url;
}

function extractPaperId(url) {
  url = remove_prefix(url, redirectors_map.arxiv.map(site => site.prefix));
  const match = url.match(/[0-9]{4}\.[0-9]{4,5}(v\d+)?/);
  return match ? match[0] : null;
}

function extractGithubRepo(url) {
  url = remove_prefix(url, redirectors_map.github.map(site => site.prefix));
  const match = url.match(/([^\/]+)\/([^\/?#]+)/);
  return match ? `${match[1]}/${match[2]}` : null;
}

function detectPageType(url) {
  for (const [type, sites] of Object.entries(redirectors_map)) {
    if (sites.some(site => url.startsWith(site.prefix))) {
      return type;
    }
  }
  return null;
}