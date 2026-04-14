<?php
require_once '../db.php';
session_start();

$data = json_decode(file_get_contents("php://input"));

if(isset($data->user_id) && isset($data->worker_id) && isset($data->description)) {
    $user_id = intval($data->user_id);
    $worker_id = intval($data->worker_id);
    $description = htmlspecialchars(strip_tags($data->description));

    try {
        $query = "INSERT INTO jobs (user_id, worker_id, description, status) VALUES (:user_id, :worker_id, :description, 'pending')";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":worker_id", $worker_id);
        $stmt->bindParam(":description", $description);

        if($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Job request sent successfully."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to send request."]);
        }
    } catch(PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Incomplete data."]);
}
?>
