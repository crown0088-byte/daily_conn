<?php
require_once '../db.php';

if(isset($_GET['user_id'])) {
    $user_id = intval($_GET['user_id']);

    $query = "SELECT j.id, j.description, j.status, j.created_at, w.skills, u.name as worker_name 
              FROM jobs j 
              JOIN workers w ON j.worker_id = w.id 
              JOIN users u ON w.user_id = u.id 
              WHERE j.user_id = :user_id ORDER BY j.created_at DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":user_id", $user_id);
    
    if($stmt->execute()) {
        $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $jobs]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to fetch jobs."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Incomplete data."]);
}
?>
