const fs = require('fs');

let html = fs.readFileSync('c:/Users/LENOVO/Desktop/application/login.html', 'utf8');

// Replace CSS block
const targetCSS = `/* NAV */
nav{
    position:fixed;
    top:0;
    width:100%;
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:15px 50px;
    background: rgba(61, 43, 31, 0.95);
    backdrop-filter: blur(10px);
    color:white;
    z-index:1000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

/* LOGO */
.logo{
    display:flex;
    align-items:center;
    gap:12px;
}

.logo i {
    font-size: 24px;
    color: var(--gold);
    filter: drop-shadow(0 0 5px rgba(140, 120, 81, 0.4));
}

.logo span{
    font-weight:800;
    font-size: 22px;
    letter-spacing: 2px;
    text-transform: uppercase;
    background: linear-gradient(135deg, #fff, #d4c2ad);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* NAV LINKS */
nav a{
    color: rgba(255, 255, 255, 0.85);
    text-decoration:none;
    margin:0 15px;
    font-weight:600;
    font-size: 14px;
    transition: 0.3s;
}

nav a:hover {
    color: var(--gold);
}

/* BTN */
.btn-login{
    padding:10px 25px;
    border-radius:30px;
    background: var(--gold);
    color: white;
    border: none;
    cursor: pointer;
    font-weight: 700;
    transition: 0.3s;
    box-shadow: 0 4px 15px rgba(140, 120, 81, 0.3);
}

.btn-login:hover {
    background: var(--tan);
    transform: translateY(-2px);
}

/* HERO */
.hero{
height:100vh;
display:flex;
flex-direction:column;
justify-content:center;
align-items:center;
text-align:center;
color:#3d2b1f;
}

.hero h1{
font-size:50px;
animation:fadeUp 1s;
}`;

const newCSS = `/* NAV */
nav{
    position:fixed;
    top:0;
    width:100%;
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:20px 8%;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    color:white;
    z-index:1000;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    transition: 0.4s ease;
}

/* LOGO */
.logo{
    display:flex;
    align-items:center;
    gap:15px;
}

.logo i {
    font-size: 30px;
    color: var(--gold);
    filter: drop-shadow(0 0 8px rgba(37, 99, 235, 0.3));
}

.logo span{
    font-weight:900;
    font-size: 26px;
    letter-spacing: 3px;
    text-transform: uppercase;
    background: linear-gradient(135deg, #fff, #94a3b8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* NAV LINKS */
.nav-links {
    display: flex;
    gap: 15px;
}

nav a{
    color: rgba(255, 255, 255, 0.9);
    text-decoration:none;
    font-weight:600;
    font-size: 15px;
    transition: 0.3s;
    padding: 8px 14px;
    border-radius: 8px;
}

nav a:hover {
    color: #fff;
    background: rgba(37, 99, 235, 0.2);
    transform: translateY(-2px);
}

/* NAV ACTIONS */
.nav-actions {
    display: flex;
    align-items: center;
    gap: 20px;
}

.nav-actions button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    transition: 0.3s;
    font-size: 18px;
}

.nav-actions button:hover {
    color: var(--gold);
    transform: scale(1.1);
}

/* BTN */
.btn-login{
    padding:12px 28px !important;
    border-radius:30px !important;
    background: linear-gradient(135deg, var(--gold), #1d4ed8) !important;
    color: white !important;
    border: none;
    cursor: pointer;
    font-weight: 700;
    font-size: 15px !important;
    transition: 0.3s;
    box-shadow: 0 5px 20px rgba(37, 99, 235, 0.3);
}

.btn-login:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 8px 25px rgba(37, 99, 235, 0.5);
}

/* HERO */
.hero{
min-height:100vh;
display:flex;
flex-direction:column;
justify-content:center;
align-items:center;
text-align:center;
color: #0f172a;
background: radial-gradient(circle at center, rgba(37, 99, 235, 0.05) 0%, transparent 60%);
padding-top: 100px;
}

.hero h1{
font-size:75px;
font-weight: 900;
line-height: 1.1;
letter-spacing: -1px;
margin-bottom: 20px;
background: linear-gradient(135deg, #0f172a, #2563eb);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
animation:fadeUp 1s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.hero-subtitle {
    font-size: 20px;
    color: var(--gold);
    font-weight: 700;
    letter-spacing: 3px;
    margin-bottom: 50px;
    text-transform: uppercase;
    animation: fadeUp 1.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}`;

const targetHTML = `<nav>

<div class="logo">
    <i class="fa-solid fa-graduation-cap"></i>
    <span>ESIP Gafsa</span>
</div>

<div>
<a href="propos.html">À propos</a>
<a href="contact.html">Contact</a>
</div>

<div>
<button onclick="toggleDark()"><i class="fa-solid fa-moon" style="font-size:18px"></i></button>
<a href="#" class="btn" onclick="openLogin(event)">Connexion</a>
</div>

</nav>

<!-- HERO -->
<div class="hero">

<h1>ESIP Gafsa</h1>
<p style="color: var(--gold); font-weight: 600; letter-spacing: 1px;">EXCELLENCE & INNOVATION</p>

<div class="stats">

<div class="stat"><i class="fa-solid fa-graduation-cap" style="font-size:28px;color:var(--gold)"></i><h2>750</h2><p>Étudiants</p></div>
<div class="stat"><i class="fa-solid fa-book-open" style="font-size:28px;color:var(--gold)"></i><h2>6</h2><p>Filières</p></div>
<div class="stat"><i class="fa-solid fa-users" style="font-size:28px;color:var(--gold)"></i><h2>40</h2><p>Staff</p></div>
<div class="stat"><i class="fa-solid fa-building" style="font-size:28px;color:var(--gold)"></i><h2>25</h2><p>Partenaires</p></div>

</div>

<!-- FORMATIONS -->
<div class="formations">

<div class="form-card">Cycle préparatoire</div>

<div class="form-card">
Cycle ingénieur
<ul>
<li>Présentation</li>
<li>Admission</li>
<li>Programmes</li>
<li>Double diplôme</li>
<li>Certifications</li>
</ul>
</div>

<div class="form-card">
ACADEMY
<ul>
<li>Formation continue</li>
<li>Formation BAC</li>
</ul>
</div>

</div>

</div>`;

const newHTML = `<nav>

<div class="logo">
    <i class="fa-solid fa-graduation-cap" style="color: var(--gold);"></i>
    <span>ESIP Gafsa</span>
</div>

<div class="nav-links">
    <a href="login.html">Accueil</a>
    <a href="#formations">Formations</a>
    <a href="#admission">Admission</a>
    <a href="#recherche">Recherche</a>
    <a href="#vie">Vie Étudiante</a>
    <a href="propos.html">À propos</a>
    <a href="contact.html">Contact</a>
</div>

<div class="nav-actions">
    <button onclick="toggleDark()"><i class="fa-solid fa-moon"></i></button>
    <a href="#" class="btn-login" onclick="openLogin(event)" style="text-decoration:none;">Espace Numérique <i class="fa-solid fa-arrow-right" style="margin-left:5px;"></i></a>
</div>

</nav>

<!-- HERO -->
<div class="hero">

<h1>L'Avenir Commence<br>À Gafsa</h1>
<p class="hero-subtitle">Excellence, Innovation & Leadership</p>

<div class="stats">

<div class="stat"><i class="fa-solid fa-graduation-cap" style="font-size:32px;color:var(--gold);margin-bottom:10px;"></i><h2>750+</h2><p style="font-weight:600;color:#666">Étudiants</p></div>
<div class="stat"><i class="fa-solid fa-book-open" style="font-size:32px;color:var(--gold);margin-bottom:10px;"></i><h2>6</h2><p style="font-weight:600;color:#666">Filières d'Excellence</p></div>
<div class="stat"><i class="fa-solid fa-users" style="font-size:32px;color:var(--gold);margin-bottom:10px;"></i><h2>120</h2><p style="font-weight:600;color:#666">Corps Enseignant</p></div>
<div class="stat"><i class="fa-solid fa-building" style="font-size:32px;color:var(--gold);margin-bottom:10px;"></i><h2>45+</h2><p style="font-weight:600;color:#666">Partenaires Tech</p></div>

</div>

<!-- FORMATIONS -->
<div class="formations" id="formations">

<div class="form-card" style="border-top: 4px solid var(--gold);">
    <h3 style="font-size:20px;margin-bottom:15px;color:var(--espresso);"><i class="fa-solid fa-microscope" style="margin-right:8px;color:var(--tan);"></i>Cycle Préparatoire</h3>
    <p style="font-size:14px;color:#555;margin-bottom:15px;line-height:1.6;">Acquérez des bases scientifiques solides pour préparer votre parcours en école d'ingénieurs.</p>
</div>

<div class="form-card" style="border-top: 4px solid var(--gold);">
    <h3 style="font-size:20px;margin-bottom:15px;color:var(--espresso);"><i class="fa-solid fa-laptop-code" style="margin-right:8px;color:var(--tan);"></i>Cycle Ingénieur</h3>
    <ul style="list-style:none;padding:0;font-size:14px;color:#555;line-height:2;">
        <li><i class="fa-solid fa-check" style="color:var(--gold);margin-right:8px;"></i>Génie Logiciel</li>
        <li><i class="fa-solid fa-check" style="color:var(--gold);margin-right:8px;"></i>Génie Réseaux & Télécoms</li>
        <li><i class="fa-solid fa-check" style="color:var(--gold);margin-right:8px;"></i>Génie Civil & Électromécanique</li>
    </ul>
</div>

<div class="form-card" style="border-top: 4px solid var(--gold);">
    <h3 style="font-size:20px;margin-bottom:15px;color:var(--espresso);"><i class="fa-solid fa-award" style="margin-right:8px;color:var(--tan);"></i>ESIP Academy</h3>
    <ul style="list-style:none;padding:0;font-size:14px;color:#555;line-height:2;">
        <li><i class="fa-solid fa-certificate" style="color:var(--gold);margin-right:8px;"></i>Formation Continue Focus Pro</li>
        <li><i class="fa-solid fa-certificate" style="color:var(--gold);margin-right:8px;"></i>Certifications (Cisco, MS, Oracle)</li>
        <li><i class="fa-solid fa-certificate" style="color:var(--gold);margin-right:8px;"></i>Pôle Innovation & Startup</li>
    </ul>
</div>

</div>

</div>`;

html = html.replace(targetCSS, newCSS);
html = html.replace(targetHTML, newHTML);

fs.writeFileSync('c:/Users/LENOVO/Desktop/application/login.html', html);
console.log('Update complete');
