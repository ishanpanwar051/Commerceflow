import fetch from 'node-fetch';

async function checkFrontend() {
  console.log('Checking live Render frontend bundle...');
  try {
    const res = await fetch('https://commerceflow-frontend-5c7v.onrender.com/login');
    const text = await res.text();
    const isLive = text.includes('1-Click Demo Login') || text.includes('Customer') || text.includes('index-');
    console.log('Response status:', res.status);
    console.log('Contains new bundle/text:', isLive);
    
    // Let's check JS bundle files in HTML
    const jsMatches = text.match(/\/assets\/[a-zA-Z0-9_-]+\.js/g);
    console.log('JS assets found:', jsMatches);
    if (jsMatches && jsMatches[0]) {
      const jsUrl = 'https://commerceflow-frontend-5c7v.onrender.com' + jsMatches[0];
      const jsRes = await fetch(jsUrl);
      const jsText = await jsRes.text();
      console.log('Is 1-Click Demo Login in JS bundle?:', jsText.includes('1-Click Demo Login'));
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

checkFrontend();
