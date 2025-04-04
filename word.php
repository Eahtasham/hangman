<?php
// Database configuration
$host = 'localhost';
$dbname = 'hangman';
$username = 'root';
$password = '';

// Create connection
try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $sql = "CREATE TABLE IF NOT EXISTS words (
        id INT AUTO_INCREMENT PRIMARY KEY,
        word VARCHAR(10) NOT NULL,
        length INT NOT NULL
    )";
    $conn->exec($sql);
    
    $filename = 'words.txt'; // Change this to your actual file
    $words = file($filename, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    
    $conn->exec("TRUNCATE TABLE words");
    
    $stmt = $conn->prepare("INSERT INTO words (word, length) VALUES (:word, :length)");
    
    $inserted = 0;
    foreach ($words as $word) {
        $word = trim($word);
        $length = strlen($word);
        if ($length >= 4 && $length <= 10) {
            $stmt->execute([':word' => strtoupper($word), ':length' => $length]);
            $inserted++;
        }
    }
    
    echo "Successfully inserted $inserted words into database.";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>