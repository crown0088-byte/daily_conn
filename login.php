<?php
require_once '../db.php';
session_start();

$data = json_decode(file_get_contents("php://input"));

if(isset($data->email) && isset($data->password)) {
    $email = htmlspecialchars(strip_tags($data->email));

    $query = "SELECT id, name, password, role FROM users WHERE email = :email";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":email", $email);

    if($stmt->execute() && $stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if(password_verify($data->password, $row['password'])) {
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['role'] = $row['role'];
            $_SESSION['name'] = $row['name'];

            $worker_id = null;
            if($row['role'] === 'worker') {
                $w_query = "SELECT id FROM workers WHERE user_id = :user_id";
                $w_stmt = $conn->prepare($w_query);
                $w_stmt->bindParam(":user_id", $row['id']);
                $w_stmt->execute();
                if($w_stmt->rowCount() > 0) {
                    $worker_row = $w_stmt->fetch(PDO::FETCH_ASSOC);
                    $worker_id = $worker_row['id'];
                }
            }

            echo json_encode([
                "status" => "success", 
                "message" => "Login successful.",
                "user" => [
                    "id" => $row['id'],
                    "name" => $row['name'],
                    "role" => $row['role'],
                    "worker_id" => $worker_id
                ]
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid credentials."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid credentials."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Incomplete data."]);
}
?>
