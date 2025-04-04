<?php
header('Content-Type: application/json');

// Database configuratio
$host = 'localhost';
$dbname = 'hangman';
$username = 'root';
$password = '';

$k = isset($_GET['k']) ? (int)$_GET['k'] : 5;

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get k random words
    $stmt = $conn->prepare("SELECT word FROM words ORDER BY RAND() LIMIT :k");
    $stmt->bindParam(':k', $k, PDO::PARAM_INT);
    $stmt->execute();
    
    $words = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo json_encode($words);
    
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>