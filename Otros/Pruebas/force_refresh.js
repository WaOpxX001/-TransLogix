// Force refresh script to clear cache and reload
if (performance.navigation.type !== 1) {
    window.location.reload(true);
}
console.log('Force refresh script loaded at:', new Date().toISOString());

// Add timestamp to force reload
window.forceRefreshTimestamp = Date.now();

// Clear any cached data
if (window.GastosManagerInstance) {
    window.GastosManagerInstance.expenses = [];
    console.log('Cleared cached expenses');
}

// Force reload gastos data
setTimeout(() => {
    if (window.GastosManagerInstance) {
        console.log('Force reloading gastos data...');
        window.GastosManagerInstance.loadData();
    }
}, 1000);
