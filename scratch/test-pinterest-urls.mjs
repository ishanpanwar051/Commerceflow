import https from 'https';

const candidates = {
  pumpkinSeeds: [
    'https://i.pinimg.com/736x/8d/d5/07/8dd5074e0d9b4b05a6e4d5807beab2ff.jpg',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80',
  ],
  moongDal: [
    'https://i.pinimg.com/736x/8b/44/22/8b4422f2b388d745e69bf8841dbb6e68.jpg',
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
  ],
  masoorDal: [
    'https://i.pinimg.com/736x/56/9e/7c/569e7c30f40d85a15bd5064e432c253d.jpg',
    'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=800&q=80',
  ],
  lobia: [
    'https://i.pinimg.com/736x/1a/05/20/1a0520d2ec8e9fbf2e336d3efbc74041.jpg',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
  ]
};

async function testUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode);
    }).on('error', () => resolve(500));
  });
}

async function run() {
  for (const [key, list] of Object.entries(candidates)) {
    console.log(`Testing ${key}:`);
    for (const url of list) {
      const code = await testUrl(url);
      console.log(`  ${code === 200 ? '✅' : '❌'} [${code}] ${url}`);
    }
  }
}

run();
