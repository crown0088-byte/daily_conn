<?php
require_once '../db.php';

if (!isset($_GET['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Missing user ID."]);
    exit();
}

$user_id = $_GET['user_id'];

try {
    $query = "
        SELECT 
            r.id as review_id, 
            r.rating, 
            r.review_text, 
            r.created_at, 
            w.name as worker_name,
            w.id as worker_id,
            j.description as job_description
        FROM reviews r
        JOIN users w ON r.worker_id = w.id
        JOIN jobs j ON r.job_id = j.id
        WHERE r.user_id = :user_id
        ORDER BY r.created_at DESC
    ";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":user_id", $user_id);
    $stmt->execute();
    
    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(["status" => "success", "data" => $reviews]);

} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
}
?>
