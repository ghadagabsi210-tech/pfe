# Firestore Database Schema - Professional Setup

## Collections Structure for Web/Mobile Sync

### 1. users (Canonical - Source of Truth)
```
users/{uid}
{
  uid: string,
  email: string,
  emailLower: string,
  role: "admin" | "professor" | "student" | "employe",
  nom: string,
  prenom: string,
  photo: string (URL),
  poste: string (job title/position),
  classe: string,
  filiere: string,
  matiere: string,
  cin: string,
  num: string,
  tel: string,
  phone: string,
  profId: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 2. etudiants / etd (Students - Synced from users)
```
etudiants/{uid}
{
  uid: string,
  email: string,
  emailLower: string,
  nom: string,
  prenom: string,
  photo: string (URL),
  classe: string,
  filiere: string,
  cin: string,
  num: string,
  tel: string,
  phone: string,
  profId: string
}
```

### 3. professeurs / professeur (Professors - Synced from users)
```
professeurs/{uid}
{
  uid: string,
  email: string,
  emailLower: string,
  nom: string,
  prenom: string,
  photo: string (URL),
  poste: string,
  matiere: string,
  classe: string,
  tel: string,
  phone: string
}
```

### 4. admins (Administrators - Synced from users)
```
admins/{uid}
{
  uid: string,
  email: string,
  emailLower: string,
  nom: string,
  prenom: string,
  photo: string (URL),
  poste: string (e.g., "Administrateur Système")
}
```

### 5. emplois (Job Positions)
```
emplois/{docId}
{
  nom: string,
  description: string,
  departement: string,
  createdAt: timestamp
}
```

### 6. presences (Attendance Records)
```
presences/{docId}
{
  studentId: string,
  studentName: string,
  classe: string,
  profId: string,
  date: timestamp,
  dateText: string (dd/MM/yyyy),
  scanType: "face" | "qr",
  submittedAt: timestamp
}
```

### 7. absences (Absence Records)
```
absences/{docId}
{
  studentId: string,
  studentName: string,
  classe: string,
  date: timestamp,
  dateText: string (dd/MM/yyyy),
  reason: string,
  justifie: boolean,
  justificatif: string (URL),
  createdAt: timestamp,
  createdBy: string (professor uid)
}
```

### 8. presence_requests (Attendance Requests - Pending Validation)
```
presence_requests/{docId}
{
  studentId: string,
  studentName: string,
  studentClass: string,
  profId: string,
  status: "pending" | "accepted" | "refused",
  submittedAt: timestamp,
  submittedAtText: string,
  scanType: "face" | "qr",
  validatedAt: timestamp,
  validatedBy: string
}
```

### 9. qr_scans (QR Code Scan Records)
```
qr_scans/{docId}
{
  studentId: string,
  qrValue: string,
  status: "pending" | "processed",
  submittedAt: timestamp,
  submittedAtText: string
}
```

### 10. schedules (Emploi du Temps - Course Schedule)
```
schedules/{docId}
{
  classe: string,
  jour: string (Monday, Tuesday, etc.),
  heurDebut: string (HH:mm),
  heureFin: string (HH:mm),
  matiere: string,
  prof: string (professor uid),
  profName: string,
  salle: string (room),
  createdAt: timestamp
}
```

### 11. notifications
```
notifications/{docId}
{
  toUserId: string,
  title: string,
  message: string,
  type: string,
  requestId: string,
  isRead: boolean,
  createdAt: timestamp
}
```

### 12. reclamations (Complaints)
```
reclamations/{docId}
{
  studentId: string,
  studentName: string,
  classe: string,
  subject: string,
  description: string,
  status: "pending" | "resolved",
  createdAt: timestamp,
  resolvedAt: timestamp,
  resolvedBy: string
}
```

---

## Data Sync Rules

1. **Photo URLs**: All photos should be stored in Cloud Storage and referenced as URLs
2. **Job Titles (Poste)**: From emplois collection or directly in user profile
3. **Profile Fields**: Always maintained in `users/{uid}` as source of truth
4. **Specialized Collections** (etd, professeurs, etudiants): Synced from users via admin backfill
5. **Email Lowercase**: Always compute `emailLower` for case-insensitive queries
6. **Timestamps**: Use serverTimestamp() for automatic sync across regions

---

## Mobile Implementation Requirements

1. Display photos using Glide library
2. Show job titles from poste field
3. Load absences from absences collection
4. Display professor's classes and students
5. Show student's schedule from schedules collection
6. Real-time sync with Firestore listeners

