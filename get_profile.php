<?php
require_once '../db.php';

$worker_id = isset($_GET['worker_id']) ? $_GET['worker_id'] : null;
$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

if(!$worker_id && !$user_id) {
    echo json_encode(["status" => "error", "message" => "Missing identification (worker_id or user_id)."]);
    exit();
}

try {
    if ($worker_id) {
        $stmt = $conn->prepare("SELECT w.*, w.id as worker_id FROM workers w WHERE w.id = :worker_id");
        $stmt->bindParam(":worker_id", $worker_id);
    } else {
        $stmt = $conn->prepare("SELECT w.*, w.id as worker_id FROM workers w WHERE w.user_id = :user_id");
        $stmt->bindParam(":user_id", $user_id);
    }
    $stmt->execute();
    
    $worker = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if($worker) {
        echo json_encode(["status" => "success", "data" => $worker]);
    } else {
        echo json_encode(["status" => "error", "message" => "Worker not found."]);
    }

} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
}
?>
