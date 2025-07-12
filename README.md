# Skill Swap Platform – Odoo-Mind-Trilogy

<!-- Replace with actual logo -->

## Problem Statement

**Develop a Skill Swap Platform** — a mini application that enables users to list their skills and request others in return.

---

## Team Members

* [Mit Gandhi](https://github.com/Mit-Gandhi)
* [Rishit Srivastava](https://github.com/rishitsrivastav)
* [Ansh Verma](https://github.com/Ansh-Verma)

**Contact Emails:**

* [gandhimit04@gmail.com](mailto:gandhimit04@gmail.com)
* [rishitsri12@gmail.com](mailto:rishitsri12@gmail.com)
* [verma.07ansh@gmail.com](mailto:verma.07ansh@gmail.com)

---

## Features

### User Functionality:

* Create profile with:

  * Name, location (optional), profile photo (optional)
  * List of skills offered & wanted
  * Availability (e.g., weekends, weekdays)
  * Public/private profile toggle
* Browse/search other users by skill (e.g., Photoshop, Excel)
* Send, accept, reject, or delete swap requests
* View current & pending swap requests
* Rate and leave feedback after swap completion

### Admin Panel Features:

* Ban users who violate platform policies
* Monitor all pending, accepted, or rejected swap requests
* Send platform-wide messages (e.g., feature updates, downtime alerts)
* View and manage all users & swap activities

---

## 🧰 Tech Stack

### 🖥️ Frontend  
[![React](https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

### 🔥 Backend  
[![Firebase](https://img.shields.io/badge/Firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Firestore](https://img.shields.io/badge/Firestore-FFA000?style=for-the-badge&logo=google-cloud&logoColor=white)](https://firebase.google.com/docs/firestore)
[![Firebase Auth](https://img.shields.io/badge/Firebase%20Auth-FFB300?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/products/auth)


---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Mit-Gandhi/Odoo-Mind-Trilogy
```

### 2. Frontend Setup

```bash
npm install
npm run dev
```

### 3. Firebase Setup

* Create a Firebase project
* Enable Firestore & Auth
* Update Firebase config in your code
* Set Firestore rules (see below)

---

## Firestore Rules (Important)

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if current user is an admin
    function isAdmin() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }

    // ========== USERS COLLECTION ==========
    match /users/{userId} {

      // Allow profile creation only by that user
      allow create: if request.auth != null && request.auth.uid == userId;

      // Allow read if:
      // - User is owner
      // - Admin
      // - Public profile for anyone
      allow read: if request.auth != null && request.auth.uid == userId
               || isAdmin()
               || (resource.data.visibility == "public");

      // Combined update rule that handles both cases
      allow update: if request.auth != null && (
        // User updating their own profile OR admin updating any profile
        (request.auth.uid == userId || isAdmin()) ||
        // Other users updating only feedback and rating fields
        (request.auth.uid != userId &&
         request.resource.data.diff(resource.data).affectedKeys().hasOnly(['feedback', 'rating', 'updatedAt']) &&
         resource.data.feedback is list &&
         request.resource.data.feedback is list)
      );

      // Allow only admin to delete users
      allow delete: if isAdmin();
    }

    // ========== SWAP REQUESTS COLLECTION ==========
    match /requests/{docId} {
      // Allow creation by any authenticated user
      allow create: if request.auth != null;

      // Allow read/update by:
      // - Sender
      // - Receiver
      // - Admin
      allow read, update: if request.auth != null && (
        resource.data.fromUserId == request.auth.uid ||
        resource.data.toUserId == request.auth.uid ||
        isAdmin()
      );

      // No one can delete swap requests
      allow delete: if false;
    }

    // ========== ANNOUNCEMENTS COLLECTION ==========
    match /announcements/{docId} {
      // Public read-only
      allow read: if true;
    }

    // ========== ADMIN MESSAGES COLLECTION ==========
    match /adminMessages/{docId} {
      // Anyone can read platform-wide announcements
      allow read: if true;

      // Only admins can create new messages
      allow create: if isAdmin();

      // Admin can update full message
      allow update: if isAdmin();

      // Authenticated users can update only the seenBy field
      allow update: if request.auth != null &&
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['seenBy']);

      // No one can delete admin messages
      allow delete: if false;
    }
  }
}
```

---

## Pages & Functionality

### Home

* Shows all public profiles
* Navbar with notification bell and message icon

### Register

* Firebase Auth-based sign-in

### Dashboard

* Browse user profiles
* Filter/search by skills
* Send and manage swap requests

### Swap Requests

* Shows pending, accepted, and rejected requests

### Feedback

* Leave rating & feedback for users after swap
* See all feedback on profile

### Admin Panel

* Protected by role-based access
* View/delete/ban users
* View all swaps by tab (Pending/Accepted/Rejected)
* Send platform-wide messages(e.g., feature updates, downtime alerts).

### Admin Messages

* Users receive notifications for new admin messages
* Seen/unseen state maintained

---


## Future Improvements

* Add chat between matched users
* Schedule swap slots and Google Calendar sync
* Analytics dashboard for admin

---

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

---

**Odoo-Mind-Trilogy — Empowering learning through community-driven skill exchange.**
