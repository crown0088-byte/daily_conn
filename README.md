# DailyConnect 🛠️
### _Empowering Every Hand, Connecting Every Home_

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tech Stack](https://img.shields.io/badge/Stack-PHP%20%7C%20MySQL%20%7C%20JS-blue)](https://github.com/yourusername/daily-connect)

**DailyConnect** is a professional hyperlocal service marketplace designed to bridge the gap between skilled daily wage workers (laborers, beauticians, electricians, etc.) and customers. It provides a dignified platform for workers to showcase their skills and an efficient, reliable way for customers to book services.

---

## 📌 Problem Statement
In many urban and semi-urban areas, the unorganized labor sector suffers from:
- **Inconsistent Work:** Workers rely on physical "labor squares" with no guarantee of daily employment.
- **Lack of Visibility:** Skilled professionals have no digital footprint or way to show credibility.
- **Trust Deficit:** Customers struggle to find reliable, rated, and background-verified help on short notice.

## 💡 The Solution
DailyConnect transforms this unorganized sector into a structured digital marketplace. By providing:
- **Verified Digital Identities:** Workers get a professional profile with reviews and ratings.
- **On-Demand Booking:** Customers can hire for specific services or on an hourly basis.
- **Transparent Feedback:** A community-driven rating system that rewards quality work.

---

## 🚀 Key Features

### 👤 For Workers
- **Self-Onboarding:** Easy registration with skill selection and profile management.
- **Dynamic Stats:** Track earnings, job requests, and overall performance through a dedicated dashboard.
- **Job Management:** Accept or decline service requests based on availability.

### 🏠 For Customers
- **Intuitive Discovery:** Filter and find workers based on service type and ratings.
- **Hybrid Booking:** Option to book based on fixed service rates or hourly work.
- **Secure Feedback:** Rate and review workers after service completion to maintain quality standards.

### 🛡️ Admin Panel
- **User Management:** Oversee both workers and customers.
- **Platform Analytics:** Monitor booking trends and system health.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Modern UI/UX with smooth transitions)
- **Backend:** PHP (Procedural/OOP)
- **Database:** MySQL
- **Tools:** XAMPP, VS Code, Git

---

## 📂 Folder Structure

```text
daily_connect/
├── backend/
│   ├── admin/           # Admin-side API logic
│   ├── auth/            # Login, Registration, & Logout
│   ├── user/            # Customer-specific operations
│   ├── worker/          # Worker-specific operations
│   ├── db.php           # Database connection configuration
│   └── setup.php        # Database initialization script
├── database/
│   └── schema.sql       # Database tables and structure
├── frontend/
│   ├── css/             # Stylesheets (Dashboard, Profile, Landing)
│   ├── js/              # Client-side logic & API integration
│   ├── about.html       # About page
│   ├── index.html       # Landing page
│   ├── login.html       # Authentication interface
│   ├── workers.html     # Worker listing & discovery
│   └── ...              # Role-based dashboard interfaces
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- [XAMPP](https://www.apachefriends.org/index.html) (or any WAMP/MAMP/LAMP stack)
- Git (Optional)

### Steps to Run Locally
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/daily-connect.git
   ```
2. **Move to Server Directory:**
   Copy the `daily_connect` folder to `C:\xampp\htdocs\` (or your server's root).

3. **Database Configuration:**
   - Start Apache and MySQL from XAMPP Control Panel.
   - Open `http://localhost/phpmyadmin`.
   - Create a new database named `daily_connect`.
   - Import `database/schema.sql` into the database.

4. **Link Backend:**
   Ensure `backend/db.php` has your correct database credentials:
   ```php
   $host = "localhost";
   $user = "root";
   $pass = "";
   $dbname = "daily_connect";
   ```

5. **Launch:**
   Navigate to `http://localhost/daily_connect/frontend/index.html` in your browser.

---

## 📸 Screenshots

| Landing Page | Worker Discovery | User Dashboard |
| :---: | :---: | :---: |
| ![Landing Page Placeholder](https://via.placeholder.com/800x450?text=DailyConnect+Landing+Page) | ![Workers List Placeholder](https://via.placeholder.com/800x450?text=Worker+Discovery+Interface) | ![Dashboard Placeholder](https://via.placeholder.com/800x450?text=User+Management+Dashboard) |

---

## 🔮 Future Enhancements
- [ ] **AI-Powered Matching:** Smart recommendations based on customer location and worker ratings.
- [ ] **Real-time Chat:** In-app communication between customers and workers.
- [ ] **Geolocation:** Map integration to find the nearest available worker in real-time.
- [ ] **Payment Gateway via UPI:** Integrated automated payment tracking (currently manual/UPI intent).
- [ ] **Native Mobile App:** React Native or Flutter version for better accessibility on the field.

---

## 🤝 Contribution Guidelines
Contributions are what make the open-source community such an amazing place to learn, inspire, and create.
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---

## 📧 Contact
**Your Name** - [Your LinkedIn](https://linkedin.com/in/yourprofile) - email@example.com

Project Link: [https://github.com/yourusername/daily-connect](https://github.com/yourusername/daily-connect)
