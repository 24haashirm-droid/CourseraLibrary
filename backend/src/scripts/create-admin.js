const readline = require('readline');
const bcrypt = require('bcryptjs');
const { run, get, initDB } = require('../db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  await initDB();

  console.log('\n===========================================');
  console.log('   CourseFinder — Create Administrator Account');
  console.log('===========================================\n');

  // Support command line arguments: node create-admin.js <email> <password> <name>
  const args = process.argv.slice(2);
  let email = args[0];
  let password = args[1];
  let name = args[2];

  if (!email) {
    email = await question('Enter administrator email address: ');
  }
  if (!password) {
    password = await question('Enter administrator password: ');
  }
  if (!name) {
    name = await question('Enter administrator full name (e.g. Dean of Studies): ');
  }

  email = (email || '').trim().toLowerCase();
  password = (password || '').trim();
  name = (name || 'Administrator').trim();

  if (!email || !password) {
    console.error('Error: Email and password cannot be empty.');
    rl.close();
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('Error: Password should be at least 6 characters long.');
    rl.close();
    process.exit(1);
  }

  const existing = await get('SELECT * FROM users WHERE email = ?', [email]);
  if (existing) {
    const confirm = await question(
      `User with email "${email}" already exists with role "${existing.role}". Promote to Administrator and reset password? (y/N): `
    );
    if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
      const passwordHash = await bcrypt.hash(password, 10);
      await run('UPDATE users SET role = ?, password_hash = ?, name = ? WHERE id = ?', [
        'admin',
        passwordHash,
        name,
        existing.id,
      ]);
      console.log(`\nSuccess! User "${email}" has been promoted to Administrator.\n`);
    } else {
      console.log('Operation cancelled.');
    }
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    const res = await run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, 'admin']
    );
    console.log(`\nSuccess! New Administrator account created:`);
    console.log(`- ID: ${res.id}`);
    console.log(`- Name: ${name}`);
    console.log(`- Email: ${email}`);
    console.log(`- Role: admin\n`);
  }

  rl.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error creating admin:', err);
  rl.close();
  process.exit(1);
});
