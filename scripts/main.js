console.info("%cFunWorks site loaded successfully! Ready to grow brands.", "color: #3366cc; font-weight: bold;");

document.addEventListener("DOMContentLoaded", () => {
  // === Mobile Nav Toggle ===
  const header = document.querySelector("header");
  const nav = document.querySelector("nav");
  const navToggle = document.getElementById("navToggle");

  if (nav && navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    nav.addEventListener("click", (e) => {
      if (e.target && e.target.tagName === "A") {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }
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

  // === Scroll-to-Top Button + Header Scroll Effect ===
  window.addEventListener("scroll", () => {
    const btn = document.getElementById("topBtn");
    if (btn) {
      btn.style.display = window.scrollY > 100 ? "block" : "none";
    }

    if (header) {
      if (window.scrollY > 10) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }
  });

  window.scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
});