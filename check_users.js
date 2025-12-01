
async function checkUsers() {
    try {
        const response = await fetch('http://localhost:3001/users');
        const users = await response.json();
        console.log(`Status: ${response.status}`);
        console.log(`Count: ${users.length}`);
        if (users.length > 0) {
            console.log('First user:', users[0]);
            console.log('Sample NIFs:', users.map(u => u.nif).slice(0, 5));
        } else {
            console.log('No users found.');
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

checkUsers();
