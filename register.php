<?php
require_once '../db.php';
session_start();

$data = json_decode(file_get_contents("php://input"));

if(isset($data->name) && isset($data->email) && isset($data->password) && isset($data->role)) {
    $name = htmlspecialchars(strip_tags($data->name));
    $email = htmlspecialchars(strip_tags($data->email));
    $role = htmlspecialchars(strip_tags($data->role));
    $password_hash = password_hash($data->password, PASSWORD_BCRYPT);

    try {
        $check_query = "SELECT id FROM users WHERE email = :email";
        $check_stmt = $conn->prepare($check_query);
        $check_stmt->bindParam(":email", $email);
        $check_stmt->execute();

        if($check_stmt->rowCount() > 0) {
            echo json_encode(["status" => "error", "message" => "Email already exists."]);
            exit();
        }

        $query = "INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":password", $password_hash);
        $stmt->bindParam(":role", $role);

        if($stmt->execute()) {
            $user_id = $conn->lastInsertId();
            
            if($role === 'worker') {
                $w_query = "INSERT INTO workers (user_id, skills, pricing, location) VALUES (:user_id, '', 0.00, '')";
                $w_stmt = $conn->prepare($w_query);
                $w_stmt->bindParam(":user_id", $user_id);
                $w_stmt->execute();
            }

            echo json_encode(["status" => "success", "message" => "Registration successful. Please login."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Registration failed."]);
        }
    } catch(PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Incomplete data."]);
}
?>
