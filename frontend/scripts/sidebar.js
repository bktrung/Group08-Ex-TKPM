document.addEventListener("DOMContentLoaded", function () {
    let scriptElement = document.currentScript;
    let sidebarPath = scriptElement.getAttribute("data-path"); // Lấy đường dẫn sidebar từ tham số

    fetch(sidebarPath)
        .then(response => response.text())
        .then(html => {
            document.getElementById('sidebar-container').innerHTML = html;

            // Tính toán basePath dựa vào vị trí hiện tại
            let currentPath = window.location.pathname;
            let depth = (currentPath.match(/\//g) || []).length - 1; // Đếm số dấu "/" trong đường dẫn
            let basePath = depth > 1 ? "../".repeat(depth - 1) : "";

            // Chỉnh sửa đường dẫn các thẻ <a> trong sidebar
            let links = document.querySelectorAll("#sidebar a");
            links.forEach(link => {
                let href = link.getAttribute("href");
                if (!href.startsWith("http")) { // Không chỉnh sửa URL tuyệt đối
                    link.setAttribute("href", basePath + href);
                }
            });
        })
        .catch(error => console.error("Lỗi khi tải sidebar:", error));
});

