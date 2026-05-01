const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteTestStudents() {
    console.log('Récupération des étudiants...');
    const snap = await db.collection('etd').get();
    console.log(`Total: ${snap.size} documents trouvés.`);

    let toDelete = [];
    snap.forEach(doc => {
        const data = doc.data();
        const email = data.email || '';
        if (doc.id.startsWith('student_auto_') || email.endsWith('@gmail.com')) {
            toDelete.push({ id: doc.id, email });
        }
    });

    console.log(`A supprimer: ${toDelete.length} etudiants test.`);

    let count = 0;
    for (const s of toDelete) {
        await db.collection('etd').doc(s.id).delete();
        count++;
        console.log(`[${count}/${toDelete.length}] Supprime: ${s.email || s.id}`);
    }

    console.log(`\nTERMINE! ${count} etudiants supprimes.`);
    process.exit(0);
}

deleteTestStudents().catch(err => {
    console.error('Erreur:', err.message);
    process.exit(1);
});
