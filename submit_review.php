<?php
require_once '../db.php';

// Get POST data
$data = json_decode(file_get_contents("php://input"));

if(!isset($data->user_id) || !isset($data->job_id) || !isset($data->worker_id) || !isset($data->rating)) {
    echo json_encode(["status" => "error", "message" => "Missing required fields."]);
    exit();
}

$user_id = $data->user_id;
$job_id = $data->job_id;
$worker_id = $data->worker_id;
$rating = $data->rating;
$review_text = isset($data->review_text) ? $data->review_text : null;

// Validate rating
if($rating < 1 || $rating > 5) {
    echo json_encode(["status" => "error", "message" => "Rating must be between 1 and 5."]);
    exit();
}

try {
    // Check if job exists, is completed, belongs to the user, and matches the worker
    $checkQuery = "SELECT status FROM jobs WHERE id = :job_id AND user_id = :user_id AND worker_id = :worker_id";
    $stmt = $conn->prepare($checkQuery);
    $stmt->bindParam(":job_id", $job_id);
    $stmt->bindParam(":user_id", $user_id);
    $stmt->bindParam(":worker_id", $worker_id);
    $stmt->execute();
    
    $job = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if(!$job) {
        echo json_encode(["status" => "error", "message" => "Job not found or unauthorized."]);
        exit();
    }
    
    if($job['status'] !== 'completed') {
        echo json_encode(["status" => "error", "message" => "You can only review completed jobs."]);
        exit();
    }
    
    // Check if a review already exists for this job
    $reviewQuery = "SELECT id FROM reviews WHERE job_id = :job_id";
    $stmt = $conn->prepare($reviewQuery);
    $stmt->bindParam(":job_id", $job_id);
    $stmt->execute();
    if($stmt->fetch()) {
        echo json_encode(["status" => "error", "message" => "You have already reviewed this job."]);
        exit();
    }
    
    // Insert review
    $insertQuery = "INSERT INTO reviews (job_id, user_id, worker_id, rating, review_text) VALUES (:job_id, :user_id, :worker_id, :rating, :review_text)";
    $stmt = $conn->prepare($insertQuery);
    $stmt->bindParam(":job_id", $job_id);
    $stmt->bindParam(":user_id", $user_id);
    $stmt->bindParam(":worker_id", $worker_id);
    $stmt->bindParam(":rating", $rating);
    $stmt->bindParam(":review_text", $review_text);
    
    if($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Review submitted successfully."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to submit review."]);
    }

} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
}
?>
