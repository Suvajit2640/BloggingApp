# 📝 NotesApp

A full-stack **secure and feature-rich Notes Application** built using the **MERN stack**, where users can create, update, delete, and manage their personal notes — with authentication, email verification, password recovery, profile picture uploads, and more.

---

## 🚀 Live Demo

👉 https://blogging-app-f7.vercel.app/

---

## 🧩 Features

### 🔐 Authentication & Security

* **User Registration** with name, email, and password.
* **Email Verification** using **JWT tokens** and **Nodemailer** — users must verify before logging in.
* **Hashed Passwords** stored securely using **bcrypt**.
* **Forgot Password Flow** with **OTP-based email verification** to reset credentials (old password cannot be reused).
* **JWT Access Token** generated upon login for session management.
* **Protected Routes** — notes and profile actions are only accessible when authenticated.

### 🧠 Notes Management

* Create, Read, Update, and Delete (CRUD) operations for notes.
* **Search Notes** feature with **debouncing** for performance optimization.
* **Sort Notes** by title or creation date (ascending/descending).
* **Pagination** support for seamless browsing when multiple notes exist.

### 👤 User Profile

* Users can **upload and update profile pictures**.
* Initially implemented using **Multer**, later integrated with **Cloudinary** for cloud storage.
* Profile picture and notes remain consistent across all logged-in devices.

### 🧭 Navigation & UI

* **Landing Page** as the entry point.
* **Responsive and user-friendly interface** built with modern UI practices.
* Clear **logout functionality**, removing local sessions and tokens.

---

## 🛠️ Tech Stack

### Frontend:

* **React.js**
* **HTML5**, **CSS3**, **JavaScript (ES6+)**

### Backend:

* **Node.js**
* **Express.js**
* **MongoDB** with **Mongoose** ODM
* **JWT** for authentication
* **Nodemailer** for email services
* **Cloudinary** for media storage
* **Bcrypt** for password hashing

---


## 🧠 Key Highlights

* Implements **real-world authentication flow** with email and token verification.
* Uses **debounced search** for performance.
* Built with **scalable code structure** and **modular backend design**.
* Demonstrates **cloud integration (Cloudinary)** and **secure credential handling**.

---

## 🧑‍💻 Developer

**Suvajit Saha**
📍 2025 Graduate – Meghnad Saha Institute of Technology
🔗 [GitHub Profile](https://github.com/Suvajit2640)


---

*"Simple. Secure. Smart Notes."*
