<?php
// Direct test of the exact API call that's failing
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Direct API Test</h2>";

// Simulate the exact request
$_GET['start_date'] = '2025-08-31';
$_GET['end_date'] = '2025-10-01';
$_GET['format'] = 'pdf';

echo "<p>Testing with parameters:</p>";
echo "<ul>";
echo "<li>start_date: " . $_GET['start_date'] . "</li>";
echo "<li>end_date: " . $_GET['end_date'] . "</li>";
echo "<li>format: " . $_GET['format'] . "</li>";
echo "</ul>";

try {
    // Include the gastos.php file directly
    ob_start();
    include 'api/reportes/gastos.php';
    $output = ob_get_contents();
    ob_end_clean();
    
    echo "<h3>SUCCESS</h3>";
    echo "<p>Output length: " . strlen($output) . " bytes</p>";
    echo "<p>First 500 characters:</p>";
    echo "<pre>" . htmlspecialchars(substr($output, 0, 500)) . "</pre>";
    
} catch (Exception $e) {
    echo "<h3>ERROR</h3>";
    echo "<p>Exception: " . $e->getMessage() . "</p>";
    echo "<p>File: " . $e->getFile() . "</p>";
    echo "<p>Line: " . $e->getLine() . "</p>";
} catch (Error $e) {
    echo "<h3>FATAL ERROR</h3>";
    echo "<p>Error: " . $e->getMessage() . "</p>";
    echo "<p>File: " . $e->getFile() . "</p>";
    echo "<p>Line: " . $e->getLine() . "</p>";
}
?>
