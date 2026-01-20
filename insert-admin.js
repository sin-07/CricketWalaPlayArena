// Script to insert admin into database via API
const API_URL = 'http://localhost:3000/api/admin/setup';
const SETUP_SECRET = process.env.SETUP_SECRET || 'cricket-box-setup-2024';

async function insertAdmin() {
  try {
    console.log('Attempting to insert admin user...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        setupSecret: SETUP_SECRET,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('SUCCESS: Admin inserted successfully!');
      console.log('Username:', data.username);
      console.log('Password: Rahul@123');
    } else {
      console.log('ERROR:', data.error);
    }
  } catch (error) {
    console.error('Connection error:', error.message);
    console.log('Make sure the Next.js dev server is running on port 3000');
  }
}

insertAdmin();
