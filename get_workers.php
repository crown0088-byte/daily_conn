<?php
require_once '../db.php';

$query = "SELECT w.id as worker_id, u.name, u.email, w.skills, w.pricing, w.location, w.availability,
                 COALESCE(AVG(r.rating), 0) as avg_rating,
                 COUNT(r.id) as review_count
          FROM workers w 
          JOIN users u ON w.user_id = u.id
          LEFT JOIN reviews r ON w.id = r.worker_id
          GROUP BY w.id, u.name, u.email, w.skills, w.pricing, w.location, w.availability";
$stmt = $conn->prepare($query);

if($stmt->execute()) {
    $workers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["status" => "success", "data" => $workers]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to fetch workers."]);
}
?>
