<?php
// Simple upload test
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>PHP Upload Test</h2>";

// Check PHP upload settings
echo "<h3>PHP Configuration:</h3>";
echo "file_uploads: " . (ini_get('file_uploads') ? 'ON' : 'OFF') . "<br>";
echo "upload_max_filesize: " . ini_get('upload_max_filesize') . "<br>";
echo "post_max_size: " . ini_get('post_max_size') . "<br>";
echo "max_execution_time: " . ini_get('max_execution_time') . "<br>";
echo "memory_limit: " . ini_get('memory_limit') . "<br>";

// Check directory permissions
$uploadDir = 'uploads/recibos/';
echo "<h3>Directory Status:</h3>";
echo "Upload directory: " . realpath($uploadDir) . "<br>";
echo "Directory exists: " . (is_dir($uploadDir) ? 'YES' : 'NO') . "<br>";
echo "Directory writable: " . (is_writable($uploadDir) ? 'YES' : 'NO') . "<br>";

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['test_file'])) {
    echo "<h3>Upload Test Results:</h3>";
    
    $file = $_FILES['test_file'];
    echo "File name: " . $file['name'] . "<br>";
    echo "File size: " . $file['size'] . " bytes<br>";
    echo "File type: " . $file['type'] . "<br>";
    echo "Temp file: " . $file['tmp_name'] . "<br>";
    echo "Error code: " . $file['error'] . "<br>";
    
    if ($file['error'] === UPLOAD_ERR_OK) {
        $targetPath = $uploadDir . 'test_' . time() . '_' . $file['name'];
        
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            echo "<strong style='color: green;'>SUCCESS: File uploaded to " . $targetPath . "</strong><br>";
            
            // Verify file exists
            if (file_exists($targetPath)) {
                echo "File verification: EXISTS<br>";
                echo "File size on disk: " . filesize($targetPath) . " bytes<br>";
            } else {
                echo "<strong style='color: red;'>ERROR: File not found after upload</strong><br>";
            }
        } else {
            echo "<strong style='color: red;'>ERROR: Failed to move uploaded file</strong><br>";
            echo "Source: " . $file['tmp_name'] . "<br>";
            echo "Target: " . $targetPath . "<br>";
        }
    } else {
        echo "<strong style='color: red;'>Upload error code: " . $file['error'] . "</strong><br>";
        switch($file['error']) {
            case UPLOAD_ERR_INI_SIZE:
                echo "File exceeds upload_max_filesize<br>";
                break;
            case UPLOAD_ERR_FORM_SIZE:
                echo "File exceeds MAX_FILE_SIZE<br>";
                break;
            case UPLOAD_ERR_PARTIAL:
                echo "File was only partially uploaded<br>";
                break;
            case UPLOAD_ERR_NO_FILE:
                echo "No file was uploaded<br>";
                break;
            case UPLOAD_ERR_NO_TMP_DIR:
                echo "Missing temporary folder<br>";
                break;
            case UPLOAD_ERR_CANT_WRITE:
                echo "Failed to write file to disk<br>";
                break;
        }
    }
}
?>

<form method="post" enctype="multipart/form-data" style="margin-top: 20px; padding: 20px; border: 1px solid #ccc;">
    <h3>Test File Upload:</h3>
    <input type="file" name="test_file" accept="image/*" required>
    <br><br>
    <input type="submit" value="Upload Test File" style="padding: 10px 20px; background: #007cba; color: white; border: none; cursor: pointer;">
</form>
