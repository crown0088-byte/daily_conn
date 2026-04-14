<?php
require_once '../db.php';

// Get POST data
$data = json_decode(file_get_contents("php://input"));

if(!isset($data->user_id) || !isset($data->name) || !isset($data->email)) {
    echo json_encode(["status" => "error", "message" => "Missing required fields."]);
    exit();
}

$user_id = $data->user_id;
$name = $data->name;
$email = $data->email;

try {
    // Check if email is already taken by someone else
    $checkQuery = "SELECT id FROM users WHERE email = :email AND id != :user_id";
    $stmt = $conn->prepare($checkQuery);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":user_id", $user_id);
    $stmt->execute();
    
    if($stmt->fetch()) {
        echo json_encode(["status" => "error", "message" => "Email is already in use by another account."]);
        exit();
    }
    
    $updateQuery = "UPDATE users SET name = :name, email = :email WHERE id = :user_id";
    $stmt = $conn->prepare($updateQuery);
    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":user_id", $user_id);
    
    if($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Profile updated successfully.", "data" => ["name" => $name, "email" => $email]]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update profile."]);
    }

} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
}
?>
