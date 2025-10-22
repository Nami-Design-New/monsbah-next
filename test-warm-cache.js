const BASE_URL = 'http://localhost:3000';

async function warmUrl(url, name) {
  process.stdout.write(`⏳ ${name}... `);
  try {
    const start = Date.now();
    const response = await fetch(url);
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    
    if (response.ok) {
      console.log(`✅ ${response.status} - ${duration}s`);
      return true;
    } else {
      console.log(`❌ ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${error.message}`);
    return false;
  }
}

async function warmCache() {
  console.log('🔥 Warming cache for sa-ar locale...\n');
  
  await warmUrl(`${BASE_URL}/sa-ar/sitemap.xml`, 'Locale index');
  await warmUrl(`${BASE_URL}/sa-ar/sitemap-static.xml`, 'Static pages');
  await warmUrl(`${BASE_URL}/sa-ar/sitemap-categories0.xml`, 'Categories');
  
  console.log('\n🛍️  Products chunks (may take time on first load)...');
  for (let i = 0; i < 3; i++) {
    await warmUrl(`${BASE_URL}/sa-ar/sitemap-products${i}.xml`, `Products ${i}`);
  }
  
  console.log('\n🏢 Companies chunks...');
  for (let i = 0; i < 3; i++) {
    await warmUrl(`${BASE_URL}/sa-ar/sitemap-companies${i}.xml`, `Companies ${i}`);
  }
  
  await warmUrl(`${BASE_URL}/sa-ar/sitemap-blogs.xml`, 'Blogs');
  
  console.log('\n✅ Done! Cache is now warm.');
  console.log('💡 Try accessing any sitemap URL - it should load instantly now!');
}

warmCache().catch(console.error);
