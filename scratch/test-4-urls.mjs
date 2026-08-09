import https from 'https';

const testUrls = {
  pumpkinSeeds: [
    'https://images.unsplash.com/photo-1509358217858-a4f7740f92d2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1608797178974-15b35a64057b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
  ],
  moongDal: [
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1585994191611-7589658ef8a1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80',
  ],
  masoorDal: [
    'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
  ],
  lobia: [
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80',
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
  for (const [key, list] of Object.entries(testUrls)) {
    console.log(`Testing ${key}:`);
    for (const url of list) {
      const code = await testUrl(url);
      console.log(`  ${code === 200 ? '✅' : '❌'} [${code}] ${url}`);
    }
  }
}

run();
