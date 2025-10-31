<?php
// Simple test to see what's happening
echo "<h2>Simple Format Test</h2>";

echo "<p>GET parameters received:</p>";
echo "<pre>" . print_r($_GET, true) . "</pre>";

$format = $_GET['format'] ?? 'not_set';
echo "<p>Format parameter: '" . $format . "'</p>";

if ($format === 'csv') {
    echo "<p>CSV format detected - would generate CSV</p>";
} elseif ($format === 'pdf') {
    echo "<p>PDF format detected - would generate PDF</p>";
} else {
    echo "<p>No valid format detected - would return JSON</p>";
}

// Test direct CSV generation
if ($format === 'csv') {
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="test.csv"');
    echo "ID,Tipo,Monto\n";
    echo "1,combustible,3500\n";
    echo "2,hospedaje,4000\n";
    exit;
}

// Test direct PDF generation
if ($format === 'pdf') {
    header('Content-Type: text/html');
    echo '<!DOCTYPE html><html><head><title>Test PDF</title></head><body>';
    echo '<h1>Test PDF Report</h1>';
    echo '<p>This would be a PDF report</p>';
    echo '<script>window.print();</script>';
    echo '</body></html>';
    exit;
}
?>
