import fetch from 'node-fetch';

async function checkAllChunks() {
  console.log('Checking all JavaScript chunks on Render frontend...');
  const mainRes = await fetch('https://commerceflow-frontend-5c7v.onrender.com/login');
  const html = await mainRes.text();
  
  // Find all js asset references in html or main js
  const matches = html.match(/\/assets\/[a-zA-Z0-9_-]+\.js/g) || [];
  console.log('Main JS assets in HTML:', matches);

  for (const asset of matches) {
    const url = 'https://commerceflow-frontend-5c7v.onrender.com' + asset;
    const res = await fetch(url);
    const code = await res.text();
    // Search for chunk references inside main JS
    const chunkMatches = code.match(/assets\/[a-zA-Z0-9_-]+\.js/g) || [];
    console.log(`Asset ${asset} references ${chunkMatches.length} sub-chunks.`);
    
    // Check if 1-Click Demo Login or customer@example.com is in any chunk
    if (code.includes('1-Click Demo Login') || code.includes('customer@example.com')) {
      console.log(`🎯 FOUND 1-Click Demo Login in ${asset}!`);
    }

    for (const chunk of chunkMatches.slice(0, 30)) {
      const chunkUrl = 'https://commerceflow-frontend-5c7v.onrender.com/' + chunk;
      try {
        const cRes = await fetch(chunkUrl);
        const cCode = await cRes.text();
        if (cCode.includes('1-Click Demo Login') || cCode.includes('customer@example.com')) {
          console.log(`🎯 FOUND 1-Click Demo Login in chunk ${chunk}!`);
          return;
        }
      } catch (e) {}
    }
  }
}

checkAllChunks();
