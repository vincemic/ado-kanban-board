// Debug script to test team filtering functionality
// This can be run in the browser console

console.log('=== Debug Team Filtering ===');

// Check if the application is loaded
if (typeof angular === 'undefined') {
    console.log('Angular app not found. Wait for the app to load.');
} else {
    console.log('Angular app is loaded');
}

// Function to simulate team filtering
function testTeamFiltering() {
    console.log('\n=== Testing Team Filtering ===');
    
    // Try to find the team filter dropdown
    const teamFilter = document.querySelector('.team-filter mat-select');
    if (teamFilter) {
        console.log('✅ Team filter dropdown found');
    } else {
        console.log('❌ Team filter dropdown not found');
        console.log('Available selectors:', document.querySelectorAll('mat-select'));
    }
    
    // Check if work items are present
    const workItems = document.querySelectorAll('.work-item-card');
    console.log(`📋 Found ${workItems.length} work items`);
    
    // Log work item details
    workItems.forEach((item, index) => {
        const title = item.querySelector('.work-item-title')?.textContent;
        const areaPath = item.querySelector('.team')?.textContent;
        console.log(`   ${index + 1}. ${title} (Area: ${areaPath})`);
    });
    
    // Check teams
    const teamOptions = document.querySelectorAll('mat-option');
    console.log(`👥 Found ${teamOptions.length} team options`);
    teamOptions.forEach((option, index) => {
        console.log(`   ${index + 1}. ${option.textContent?.trim()}`);
    });
    
    // Check columns
    const columns = document.querySelectorAll('.kanban-column');
    console.log(`📊 Found ${columns.length} kanban columns`);
    columns.forEach((column, index) => {
        const header = column.querySelector('.column-header h3')?.textContent;
        const itemCount = column.querySelectorAll('.work-item-card').length;
        console.log(`   ${index + 1}. ${header} (${itemCount} items)`);
    });
}

// Run the test
testTeamFiltering();

// Add event listener to test filtering when team changes
document.addEventListener('click', (e) => {
    if (e.target.closest('mat-option')) {
        setTimeout(() => {
            console.log('\n=== Team Selection Changed ===');
            testTeamFiltering();
        }, 100);
    }
});

console.log('\n💡 You can call testTeamFiltering() at any time to debug');