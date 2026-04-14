<?php
require 'db.php';

try {
    $worker_email = "worker@test.com";
    $user_email = "user@test.com";
    $password = password_hash("password123", PASSWORD_BCRYPT);
    
    // Create Worker
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$worker_email]);
    if($stmt->rowCount() == 0) {
        $stmt = $conn->prepare("INSERT INTO users (name, email, password, role) VALUES ('Test Worker', ?, ?, 'worker')");
        $stmt->execute([$worker_email, $password]);
        $worker_user_id = $conn->lastInsertId();
        
        $stmt = $conn->prepare("INSERT INTO workers (user_id, skills, pricing, location, availability) VALUES (?, 'Plumber, Electrician', 50.00, 'New York', 'available')");
        $stmt->execute([$worker_user_id]);
        echo "✅ <b>Worker created</b>.<br>Email: <code>worker@test.com</code><br>Password: <code>password123</code><br><br>";
    } else {
        echo "ℹ️ <b>Worker already exists</b>.<br>Email: <code>worker@test.com</code><br>Password: <code>password123</code><br><br>";
    }
    
    // Create User
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$user_email]);
    if($stmt->rowCount() == 0) {
        $stmt = $conn->prepare("INSERT INTO users (name, email, password, role) VALUES ('Test Customer', ?, ?, 'user')");
        $stmt->execute([$user_email, $password]);
        echo "✅ <b>User created</b>.<br>Email: <code>user@test.com</code><br>Password: <code>password123</code><br>";
    } else {
        echo "ℹ️ <b>User already exists</b>.<br>Email: <code>user@test.com</code><br>Password: <code>password123</code><br>";
    }
    
    // Create Admin
    $admin_email = "admin@test.com";
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$admin_email]);
    if($stmt->rowCount() == 0) {
        $stmt = $conn->prepare("INSERT INTO users (name, email, password, role) VALUES ('Platform Admin', ?, ?, 'admin')");
        $stmt->execute([$admin_email, $password]);
        echo "✅ <b>Admin created</b>.<br>Email: <code>admin@test.com</code><br>Password: <code>password123</code><br>";
    } else {
        echo "ℹ️ <b>Admin already exists</b>.<br>Email: <code>admin@test.com</code><br>Password: <code>password123</code><br>";
    }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
