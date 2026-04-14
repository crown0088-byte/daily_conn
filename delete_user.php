<?php
require_once '../db.php';

$data = json_decode(file_get_contents("php://input"));

if(!isset($data->user_id)) {
    echo json_encode(["status" => "error", "message" => "Missing user ID."]);
    exit();
}

$user_id = $data->user_id;

try {
    // Don't allow deleting self (admin) if we knew the current admin ID, 
    // but for now just general delete.
    
    $stmt = $conn->prepare("DELETE FROM users WHERE id = :user_id");
    $stmt->bindParam(":user_id", $user_id);
    
    if($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "User deleted successfully."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to delete user."]);
    }

} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
}
?>
