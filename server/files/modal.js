document.addEventListener("DOMContentLoaded", function () {
    function openModal(id) {
      document.getElementById(id).style.display = "flex";
    }
  
    function closeModal(id) {
      document.getElementById(id).style.display = "none";
    }
  
    function switchModals(fromId, toId) {
      closeModal(fromId);
      openModal(toId);
    }
  
    // Expose to global scope
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.switchModals = switchModals;
  
    // Optional: close modal on outside click
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        e.target.style.display = "none";
      }
    });
  });
  