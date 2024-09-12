function openTab(event, tabName) {
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.nav-link');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Hide all tab contents
    const contents = document.querySelectorAll('.tab-pane');
    contents.forEach(content => content.classList.remove('show', 'active'));

    // Activate the clicked tab and show its content
    event.currentTarget.classList.add('active');
    document.getElementById(tabName).classList.add('show', 'active');
}
