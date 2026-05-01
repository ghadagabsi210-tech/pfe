

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore,collection,getDocs,doc,setDoc,deleteDoc,updateDoc,onSnapshot }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth,createUserWithEmailAndPassword,signOut }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
apiKey:"AIzaSyD56AbWLar8R7qe4x__3a8dfZop6A1jew0",
authDomain:"pfe2026-2cd50.firebaseapp.com",
projectId:"pfe2026-2cd50",
storageBucket:"pfe2026-2cd50.appspot.com",
messagingSenderId:"263356463306",
appId:"1:263356463306:web:bf3b02eb9ec97dce069c33"
};

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// Workaround to prevent admin logout when creating new users
const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
const secondaryAuth = getAuth(secondaryApp);

// --- CONFIGURATION EMAILJS ---
const EMAILJS_PUBLIC_KEY = "89VgfdkHUrxYc1zoK"; 
const EMAILJS_SERVICE_ID = "service_kt5zi5k"; 
const EMAILJS_TEMPLATE_ID = "template_qrg9zr6"; 

emailjs.init(EMAILJS_PUBLIC_KEY);

async function sendEmailCredentials(name, email, password) {
  try {
    const templateParams = {
      to_name: name,
      to_email: email,
      password: password,
      login_url: window.location.origin + "/login.html"
    };
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
    console.log("Email envoyé à " + email);
  } catch (err) {
    console.error("Erreur envoi email à " + email, err);
  }
}

// ===== UI =====

window.goAdmin=()=>location.href="admin.html"

window.searchProf=()=>{
  let filter=document.getElementById("searchBar").value.toLowerCase();
  let trs=document.querySelectorAll("#profTable tr");
  trs.forEach(tr => {
    tr.style.display = tr.innerText.toLowerCase().includes(filter) ? "" : "none";
  });
}

window.openModal=()=>{
document.getElementById("modalTitle").innerText="Ajouter Professeur";
document.getElementById("saveBtn").innerText="Ajouter";
document.getElementById("editId").value="";
document.getElementById("cin").value="";
document.getElementById("nom").value="";
document.getElementById("prenom").value="";
document.getElementById("tel").value="";
document.getElementById("grade").value="";
document.getElementById("specialite").value="";
document.getElementById("email").value="";
document.getElementById("photo").value="";
document.querySelectorAll("#classesCheckboxes input").forEach(i => i.checked = false);
document.getElementById("modal").style.display="flex"
showMsg("")
}

window.closeModal=()=>{
document.getElementById("modal").style.display="none"
}

// ===== Helpers =====

function showMsg(text,color="red"){
let m=document.getElementById("msg")
m.style.color=color
m.innerText=text
}

function validEmail(email){
return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function generatePassword(){
return Math.random().toString(36).slice(-8)
}

// ===== ADD PROF =====

window.addProf=async ()=>{

let editId=document.getElementById("editId").value;
let cinVal=document.getElementById("cin").value.trim()
let nomVal=document.getElementById("nom").value.trim()
let prenomVal=document.getElementById("prenom").value.trim()
let telVal=document.getElementById("tel").value.trim()
let gradeVal=document.getElementById("grade").value.trim()
let specialiteVal=document.getElementById("specialite").value.trim()
let emailVal=document.getElementById("email").value.trim()
let photoFile=document.getElementById("photoFile").files[0]
let photoVal=document.getElementById("photo").value.trim()
let classesArr = Array.from(document.querySelectorAll("#classesCheckboxes input:checked")).map(i => i.value);

if(!nomVal || !prenomVal || !specialiteVal || !emailVal){
    showMsg("Champs obligatoires manquants");
    return;
}

// Photo Upload Logic
let photoURL = photoVal;
if(photoFile){
    photoURL = await new Promise(resolve=>{
        let reader=new FileReader()
        reader.onload=()=>resolve(reader.result)
        reader.readAsDataURL(photoFile)
    })
}

if(!validEmail(emailVal)){
showMsg("Email invalide")
return
}

if(!editId){
  // check duplicate
  const snap=await getDocs(collection(db,"professeur"))
  let exist=false
  snap.forEach(d=>{
  if(d.data().email===emailVal) exist=true
  })

  if(exist){
  showMsg("Email déjà utilisé")
  return
  }
}

try{
  if(editId) {
    await updateDoc(doc(db,"professeur",editId),{
      cin:cinVal,
      nom:nomVal,
      prenom:prenomVal,
      "numero de telephone":telVal,
      grade:gradeVal,
      specialite:specialiteVal,
      email:emailVal,
      photo:photoURL,
      classes:classesArr
    });
    alert("Professeur modifié !");
    closeModal();
  } else {
    let password = Math.floor(10000000 + Math.random() * 90000000).toString(); // Standardize to 8 digits
    try {
      const userCred = await createUserWithEmailAndPassword(secondaryAuth, emailVal, password);
      await signOut(secondaryAuth); // Sign out of secondary instance to prevent session conflicts

      // Envoyer l'email
      await sendEmailCredentials(nomVal + " " + prenomVal, emailVal, password);

      await setDoc(doc(db, "professeur", userCred.user.uid), {
        cin: cinVal,
        nom: nomVal,
        prenom: prenomVal,
        "numero de telephone": telVal,
        grade: gradeVal,
        specialite: specialiteVal,
        email: emailVal,
        photo: photoURL,
        role: "prof",
        password,
        classes: classesArr
      });
      alert("Professeur créé avec succès et email envoyé !");
      closeModal();
    } catch(e) {
      alert("Erreur Creation: " + e.message);
    }
  }

  closeModal()
  loadProfs()

}catch(e){
showMsg(e.message)
}

}

// ===== LOAD =====
let profsData = [];

async function loadProfs(){
profsData = []; // clear cache to prevent duplicates
let table=document.getElementById("profTable")
table.innerHTML=""

const snap=await getDocs(collection(db,"professeur"))

snap.forEach(d=>{
let p=d.data()
if(p.role!=="prof") return
p.id=d.id;
profsData.push(p);

let photoHtml = p.photo ? `<img src="${p.photo}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">` : `<i class="fa-solid fa-user-tie" style="font-size:24px;color:#ccc;"></i>`;
table.innerHTML+=`
<tr>
<td>${photoHtml}</td>
<td>${p.cin || '-'}</td>
<td style="text-align:left; font-weight:600; color:var(--secondary);">${p.nom} ${p.prenom}</td>
<td><span style="background:#f1f5f9; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:700;">${p.specialite}</span></td>
<td style="font-size:13px;">${p.email}</td>
<td style="font-weight:700; color:var(--primary);">${p["numero de telephone"] || '-'}</td>
<td style="font-family:monospace; background:#fafafa; padding:5px; border-radius:8px; color:var(--primary); font-size:13px; font-weight:700;">${p.password || '******'}</td>
<td style="font-size:12px; color:var(--secondary); font-weight:600;">${(p.classes || []).join(', ') || '-'}</td>
<td>
  <div style="display:flex; gap:8px; justify-content:center;">
    <button style="background:#6366f1;" onclick="editProf('${d.id}', '${p.cin||''}', '${p.nom}', '${p.prenom}', '${p.grade||''}', '${p.specialite}', '${p.email}', '${p.tel||''}', '${p.photo||''}', ${JSON.stringify(p.classes || [])})"><i class="fa-solid fa-pen"></i></button>
    <button class="btn-delete" onclick="deleteProf('${d.id}')"><i class="fa-solid fa-trash"></i></button>
  </div>
</td>
</tr>
`
})

renderAbsencesList();
}

window.editProf = (id, cin, nom, prenom, grade, specialite, email, tel, photo, classes) => {
document.getElementById("modalTitle").innerText="Modifier Professeur";
document.getElementById("saveBtn").innerText="Enregistrer";
document.getElementById("editId").value=id;
document.getElementById("cin").value=cin;
document.getElementById("nom").value=nom;
document.getElementById("prenom").value=prenom;
document.getElementById("grade").value=grade;
document.getElementById("specialite").value=specialite;
document.getElementById("email").value=email;
document.getElementById("tel").value=tel;
document.getElementById("photo").value=photo;

// Reset and set checkboxes
document.querySelectorAll("#classesCheckboxes input").forEach(i => {
    i.checked = (classes || []).includes(i.value);
});

document.getElementById("modal").style.display="flex";
showMsg("");
}

// ===== DELETE =====

window.deleteProf=async(id)=>{
if(confirm("Supprimer ?")){
await deleteDoc(doc(db,"professeur",id))
loadProfs()
}
}
const matieresList = [
"Algorithmique",
"Programmation",
"Réseaux",
"Systèmes",
"Base de données",
"Intelligence Artificielle",
"Développement Web",
"Génie Logiciel",
"Mathématiques",
"Anglais",
"Gestion"
]
// ===== EXPORT =====

window.exportData=async ()=>{
const snap=await getDocs(collection(db,"professeur"))
let data=[]

snap.forEach(d=>{
if(d.data().role==="prof") data.push(d.data())
})

let blob=new Blob([JSON.stringify(data)],{type:"application/json"})
let a=document.createElement("a")
a.href=URL.createObjectURL(blob)
a.download="profs.json"
a.click()
}

// ===== IMPORT =====
window.importExcel=()=>{
let input=document.createElement("input")
input.type="file"
input.accept=".xlsx, .csv"

input.onchange=(e)=>{
let reader=new FileReader()

reader.onload=async(evt)=>{
let wb=XLSX.read(evt.target.result,{type:"array"})
let data=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])

for(let p of data){
    let password = p.Password || Math.floor(10000000 + Math.random() * 90000000).toString();
    try {
        const userCred = await createUserWithEmailAndPassword(auth, p.Email, password);

        // Envoyer l'email
        await sendEmailCredentials((p.Nom || "") + " " + (p.Prenom || ""), p.Email, password);

        await setDoc(doc(db, "professeur", userCred.user.uid), {
            cin: p.CIN || "",
            nom: p.Nom,
            prenom: p.Prenom,
            "numero de telephone": p.Tel || "",
            specialite: p.Specialite || p.Matiere || "",
            email: p.Email,
            role: "prof",
            password: password,
            photo: ""
        });
    } catch(err) { console.error("Error creating prof:", err); }
}

alert("Import terminé et emails envoyés avec succès")
loadProfs()
}

reader.readAsArrayBuffer(e.target.files[0])
}

input.click()
}

// === GESTION ABSENCES PROFESSEURS ===
let absencesData = [];

onSnapshot(collection(db,"prof_presences"), snap => {
    absencesData = [];
    snap.forEach(d => {
        let abs = d.data();
        abs.id = d.id;
        absencesData.push(abs);
    });
    renderAbsencesList();
});

function renderAbsencesList() {
    let list = document.getElementById("absencesList");
    if(!list) return;
    list.innerHTML = "";
    
    profsData.forEach(p => {
        let prenom = p.prenom || '';
        let pAbsences = absencesData.filter(a => a.profId === p.id);
        let photoHtml = p.photo ? `<img src="${p.photo}" style="width:25px;height:25px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:8px;">` : `<i class="fa-solid fa-user-tie" style="color:#94a3b8;margin-right:8px;"></i>`;
        
        if(pAbsences.length === 0) {
            list.innerHTML += `
            <tr>
                <td style="font-weight:600; color:var(--secondary); text-align:left;">${photoHtml} ${p.nom} ${prenom}</td>
                <td><span style="background:#f1f5f9; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:700;">${p.specialite || '-'}</span></td>
                <td style="text-align:left; font-weight:600; color:#94a3b8;">-</td>
                <td style="font-weight:800; font-size:15px; color:#10b981;">0</td>
                <td><span style="background:#d1fae5; color:#10b981; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:800; text-transform:uppercase;">En Règle</span></td>
            </tr>
            `;
        } else {
            pAbsences.forEach(abs => {
                let status = "En Règle";
                let statusColor = "#10b981"; 
                let statusBg = "#d1fae5";
                
                if(abs.absences >= 3) {
                    status = "Avertissement";
                    statusColor = "#ef4444";
                    statusBg = "#fee2e2";
                } else if(abs.absences >= 1) {
                    status = "Attention";
                    statusColor = "#f59e0b";
                    statusBg = "#fef3c7";
                }
                
                list.innerHTML += `
                <tr>
                    <td style="font-weight:600; color:var(--secondary); text-align:left;">${photoHtml} ${p.nom} ${prenom}</td>
                    <td><span style="background:#f1f5f9; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:700;">${p.specialite || '-'}</span></td>
                    <td style="text-align:left; font-weight:600;">${abs.seance}</td>
                    <td style="font-weight:800; font-size:15px; ${abs.absences > 0 ? 'color:var(--secondary);' : 'color:#10b981;'}">${abs.absences}</td>
                    <td><span style="background:${statusBg}; color:${statusColor}; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:800; text-transform:uppercase;">${status}</span></td>
                </tr>
                `;
            });
        }
    });
}

window.filterProfAbsences = () => {
    let term = document.getElementById("searchProfAbs").value.toLowerCase();
    let rows = document.querySelectorAll("#absencesList tr");
    rows.forEach(row => {
        let name = row.cells[0].innerText.toLowerCase();
        let seance = row.cells[2].innerText.toLowerCase();
        if(name.includes(term) || seance.includes(term)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}


// INIT
loadProfs()

