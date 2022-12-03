// Create the analytics database
db = db.getSiblingDB('analytics');

// Create sample collection
db.createCollection('social');

// Add sample record to force database and collection creation
db.social.insertMany([
    {
        company: 'Softrizon',
        description: 'Follow us on social media',
        website: 'https://www.softrizon.com/',
        linked_in: 'https://www.linkedin.com/company/softrizon',
        instagram: 'https://instagram.com/softrizon',
        facebook: 'https://www.facebook.com/softrizon',
        twitter: 'https://twitter.com/softrizon'
    }
]);

// Create the root user in the analytics database
db.createUser({
    user: "root",
    pwd: "EtLTest2022",
    roles: [
        { role: "readWrite", db: "analytics" }
    ],
});
