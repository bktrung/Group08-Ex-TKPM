document.addEventListener("DOMContentLoaded", function () {
    const scriptElement = document.currentScript;
    const sidebarPath = scriptElement.getAttribute("data-path");
    const sidebarContainer = document.getElementById('sidebar-container');
    
    if (!sidebarPath || !sidebarContainer) return;

    loadSidebar(sidebarPath, sidebarContainer);
});

async function loadSidebar(sidebarPath, container) {
    try {
        const response = await fetch(sidebarPath);
        if (!response.ok) throw new Error(`Failed to load sidebar: ${response.status}`);
        
        const html = await response.text();
        container.innerHTML = html;
        
        updateSidebarLinks();
    } catch (error) {
        console.error("Lỗi khi tải sidebar:", error);
    }
}

function updateSidebarLinks() {
    const currentPath = window.location.pathname;
    const depth = (currentPath.match(/\//g) || []).length - 1;
    const basePath = depth > 1 ? "../".repeat(depth - 1) : "";
    
    const links = document.querySelectorAll("#sidebar a");
    links.forEach(link => {
        const href = link.getAttribute("href");
        if (href && !href.startsWith("http")) {
            link.setAttribute("href", basePath + href);
        }
    });
}