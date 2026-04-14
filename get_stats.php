<?php
require_once '../db.php';

$worker_id = isset($_GET['worker_id']) ? intval($_GET['worker_id']) : 0;

if($worker_id > 0) {
    $q = "SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(id) as review_count FROM reviews WHERE worker_id = :worker_id";
    $stmt = $conn->prepare($q);
    $stmt->bindParam(":worker_id", $worker_id);
    
    if($stmt->execute()) {
        $res = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $res]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to fetch stats."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid worker ID."]);
}
?>
