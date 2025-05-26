const bcrypt = require('bcrypt');

async function createHash() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash for admin123:', hash);
}

createHash();