<?php
require_once '../db.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->job_id) && isset($data->status)) {
    $job_id = intval($data->job_id);
    $status = htmlspecialchars(strip_tags($data->status)); // accepted, rejected, completed

    try {
        $query = "UPDATE jobs SET status = :status WHERE id = :job_id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":job_id", $job_id);

        if($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Job status updated."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to update status."]);
        }
    } catch(PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Incomplete data."]);
}
?>
