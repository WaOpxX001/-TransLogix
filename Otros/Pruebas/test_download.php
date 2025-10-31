<?php
// Test direct download functionality
header('Content-Type: text/plain');
echo "Testing download functionality...\n\n";

// Test if we can access the gastos.php file
$gastosFile = __DIR__ . '/api/reportes/gastos.php';
echo "Gastos file exists: " . (file_exists($gastosFile) ? 'YES' : 'NO') . "\n";
echo "Gastos file path: " . $gastosFile . "\n\n";

// Test CSV first
$csvUrl = "http://localhost/LogisticaFinal/api/reportes/gastos.php?start_date=2025-08-31&end_date=2025-09-30&format=csv";
echo "Testing CSV URL: " . $csvUrl . "\n";
$csvResult = @file_get_contents($csvUrl);
if ($csvResult === false) {
    echo "CSV ERROR: Could not access API\n";
    $error = error_get_last();
    echo "CSV Error: " . ($error['message'] ?? 'Unknown error') . "\n";
} else {
    echo "CSV SUCCESS: " . strlen($csvResult) . " bytes\n";
    echo "CSV First 200 chars: " . substr($csvResult, 0, 200) . "\n";
}

echo "\n" . str_repeat("-", 50) . "\n\n";

// Test PDF
$pdfUrl = "http://localhost/LogisticaFinal/api/reportes/gastos.php?start_date=2025-08-31&end_date=2025-09-30&format=pdf";
echo "Testing PDF URL: " . $pdfUrl . "\n";
$pdfResult = @file_get_contents($pdfUrl);
if ($pdfResult === false) {
    echo "PDF ERROR: Could not access API\n";
    $error = error_get_last();
    echo "PDF Error: " . ($error['message'] ?? 'Unknown error') . "\n";
} else {
    echo "PDF SUCCESS: " . strlen($pdfResult) . " bytes\n";
    echo "PDF First 200 chars: " . substr($pdfResult, 0, 200) . "\n";
}

echo "\n" . str_repeat("-", 50) . "\n\n";

// Test direct inclusion
echo "Testing direct inclusion...\n";
try {
    $_GET['start_date'] = '2025-08-31';
    $_GET['end_date'] = '2025-09-30';
    $_GET['format'] = 'json';
    
    ob_start();
    include $gastosFile;
    $output = ob_get_clean();
    
    echo "Direct inclusion SUCCESS\n";
    echo "Output length: " . strlen($output) . " bytes\n";
    echo "First 200 chars: " . substr($output, 0, 200) . "\n";
} catch (Exception $e) {
    echo "Direct inclusion ERROR: " . $e->getMessage() . "\n";
}
?>
