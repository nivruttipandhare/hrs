document.addEventListener("DOMContentLoaded", () => {
  const sidebarLinks = document.querySelectorAll(".sidebar a");
  const sections = document.querySelectorAll("main section");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const toggleBtn = document.getElementById("toggleSidebar");

  function showSection(id) {
    sections.forEach(s => s.classList.remove("active"));
    const target = document.getElementById(id);
    if (target) target.classList.add("active");

    sidebarLinks.forEach(link => link.classList.remove("active"));
    const activeLink = document.querySelector(`.sidebar a[href="#${id}"]`);
    if (activeLink) activeLink.classList.add("active");
  }

  // Initialize
  const initialSection = location.hash.substring(1) || "overview";
  showSection(initialSection);

  sidebarLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id = link.getAttribute("href").substring(1);
      showSection(id);
      history.pushState(null, "", `#${id}`);
    });
  });

  // Toggle Sidebar
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("expanded");
    toggleBtn.classList.toggle("collapsed");
  });

  // Handle popstate for browser back/forward
  window.addEventListener("popstate", () => {
    showSection(location.hash.substring(1) || "overview");
  });
});

function confirmDeleteUser(id) {
  if (confirm(`Are you sure you want to delete user ${id}?`)) {
    alert("Delete user API call goes here");
  }
}

function confirmDeleteHotel(id) {
  if (confirm(`Are you sure you want to delete hotel ${id}?`)) {
    alert("Delete hotel API call goes here");
  }
}

window.confirmDeleteUser = confirmDeleteUser;
window.confirmDeleteHotel = confirmDeleteHotel;