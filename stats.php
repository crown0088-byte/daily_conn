<?php
require_once '../db.php';

try {
    $stats = [];
    
    // Total Users Structure
    $stmt = $conn->query("SELECT role, COUNT(*) as count FROM users GROUP BY role");
    $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stats['users'] = 0;
    $stats['workers'] = 0;
    $stats['admins'] = 0;
    
    foreach($roles as $row) {
        if($row['role'] === 'user') $stats['users'] = $row['count'];
        else if($row['role'] === 'worker') $stats['workers'] = $row['count'];
        else if($row['role'] === 'admin') $stats['admins'] = $row['count'];
    }
    
    // Total Jobs
    $stmt = $conn->query("SELECT status, COUNT(*) as count FROM jobs GROUP BY status");
    $jobStats = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $stats['jobs_pending'] = 0;
    $stats['jobs_active'] = 0;
    $stats['jobs_completed'] = 0;
    
    foreach($jobStats as $row) {
        if($row['status'] === 'pending') $stats['jobs_pending'] = $row['count'];
        else if($row['status'] === 'accepted') $stats['jobs_active'] = $row['count'];
        else if($row['status'] === 'completed') $stats['jobs_completed'] = $row['count'];
    }
    
    $stats['total_users'] = $stats['users'] + $stats['workers'] + $stats['admins'];
    $stats['total_jobs'] = $stats['jobs_pending'] + $stats['jobs_active'] + $stats['jobs_completed'];

    echo json_encode(["status" => "success", "data" => $stats]);

} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
}
?>
