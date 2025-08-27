console.info("%cFunWorks site loaded successfully! Ready to grow brands.", "color: #3366cc; font-weight: bold;");

document.addEventListener("DOMContentLoaded", () => {
  // === Ethos Carousel ===
  const scrollContainer = document.getElementById("ethosScroll");
  const scrollLeftBtn = document.getElementById("scrollLeft");
  const scrollRightBtn = document.getElementById("scrollRight");

  if (scrollContainer && scrollLeftBtn && scrollRightBtn) {
    let autoScrollInterval;
    let isPaused = false;

    // Start auto-scroll
    const startAutoScroll = () => {
      autoScrollInterval = setInterval(() => {
        if (!isPaused) {
          if (
            scrollContainer.scrollLeft + scrollContainer.clientWidth >=
            scrollContainer.scrollWidth
          ) {
            // Reset to start
            scrollContainer.scrollTo({ left: 0, behavior: "smooth" });
          } else {
            // Scroll right
            scrollContainer.scrollBy({ left: 300, behavior: "smooth" });
          }
        }
      }, 4000);
    };

    // Scroll buttons
    scrollLeftBtn.addEventListener("click", () => {
      scrollContainer.scrollBy({ left: -300, behavior: "smooth" });
    });

    scrollRightBtn.addEventListener("click", () => {
      scrollContainer.scrollBy({ left: 300, behavior: "smooth" });
    });

    // Pause auto-scroll on hover
    scrollContainer.addEventListener("mouseenter", () => {
      isPaused = true;
    });
    scrollContainer.addEventListener("mouseleave", () => {
      isPaused = false;
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        scrollContainer.scrollBy({ left: -300, behavior: "smooth" });
      } else if (e.key === "ArrowRight") {
        scrollContainer.scrollBy({ left: 300, behavior: "smooth" });
      }
    });

    startAutoScroll();
  } else {
    console.warn("Ethos scroll elements not found");
  }

  // === Scroll-to-Top Button ===
  window.onscroll = () => {
    const btn = document.getElementById("topBtn");
    btn.style.display = window.scrollY > 100 ? "block" : "none";
  };

  window.scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
});