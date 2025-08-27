console.info("%cFunWorks site loaded successfully! 🚀 Ready to grow brands with style.", "color: #5D3A9B; font-weight: bold; font-size: 14px;");

document.addEventListener("DOMContentLoaded", () => {
  // === Modern Header Scroll Effect ===
  const header = document.querySelector("header");
  let lastScrollY = window.scrollY;

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    
    // Add/remove backdrop blur based on scroll position
    if (currentScrollY > 50) {
      header.style.background = "rgba(255, 255, 255, 0.98)";
      header.style.backdropFilter = "blur(20px)";
      header.style.borderBottom = "1px solid rgba(93, 58, 155, 0.2)";
    } else {
      header.style.background = "rgba(255, 255, 255, 0.95)";
      header.style.backdropFilter = "blur(10px)";
      header.style.borderBottom = "1px solid rgba(93, 58, 155, 0.1)";
    }
    
    lastScrollY = currentScrollY;
  };

  window.addEventListener("scroll", handleScroll, { passive: true });

  // === Enhanced Ethos Carousel ===
  const scrollContainer = document.getElementById("ethosScroll");
  const scrollLeftBtn = document.getElementById("scrollLeft");
  const scrollRightBtn = document.getElementById("scrollRight");

  if (scrollContainer && scrollLeftBtn && scrollRightBtn) {
    let autoScrollInterval;
    let isPaused = false;

    // Enhanced auto-scroll with smooth transitions
    const startAutoScroll = () => {
      autoScrollInterval = setInterval(() => {
        if (!isPaused && !document.hidden) {
          const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
          
          if (scrollContainer.scrollLeft >= maxScroll - 10) {
            // Smooth reset to start
            scrollContainer.scrollTo({ left: 0, behavior: "smooth" });
          } else {
            // Scroll by card width
            const cardWidth = scrollContainer.querySelector('.ethos-card').offsetWidth + 25;
            scrollContainer.scrollBy({ left: cardWidth, behavior: "smooth" });
          }
        }
      }, 5000);
    };

    // Enhanced scroll buttons with visual feedback
    const scrollLeft = () => {
      const cardWidth = scrollContainer.querySelector('.ethos-card').offsetWidth + 25;
      scrollContainer.scrollBy({ left: -cardWidth, behavior: "smooth" });
      scrollLeftBtn.style.transform = "scale(0.95)";
      setTimeout(() => scrollLeftBtn.style.transform = "scale(1)", 150);
    };

    const scrollRight = () => {
      const cardWidth = scrollContainer.querySelector('.ethos-card').offsetWidth + 25;
      scrollContainer.scrollBy({ left: cardWidth, behavior: "smooth" });
      scrollRightBtn.style.transform = "scale(0.95)";
      setTimeout(() => scrollRightBtn.style.transform = "scale(1)", 150);
    };

    scrollLeftBtn.addEventListener("click", scrollLeft);
    scrollRightBtn.addEventListener("click", scrollRight);

    // Pause auto-scroll on hover/touch
    scrollContainer.addEventListener("mouseenter", () => isPaused = true);
    scrollContainer.addEventListener("mouseleave", () => isPaused = false);
    scrollContainer.addEventListener("touchstart", () => isPaused = true);
    scrollContainer.addEventListener("touchend", () => {
      setTimeout(() => isPaused = false, 3000);
    });

    // Enhanced keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (scrollContainer.matches(':hover') || document.activeElement.closest('.ethos-wrapper')) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          scrollLeft();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          scrollRight();
        }
      }
    });

    // Pause when tab is not visible
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearInterval(autoScrollInterval);
      } else {
        startAutoScroll();
      }
    });

    startAutoScroll();
  }

  // === Enhanced Scroll-to-Top Button ===
  const topBtn = document.getElementById("topBtn");
  
  const handleScrollButton = () => {
    const scrolled = window.scrollY;
    if (scrolled > 300) {
      topBtn.style.display = "block";
      topBtn.style.opacity = "1";
      topBtn.style.transform = "translateY(0)";
    } else {
      topBtn.style.opacity = "0";
      topBtn.style.transform = "translateY(10px)";
      setTimeout(() => {
        if (window.scrollY <= 300) topBtn.style.display = "none";
      }, 300);
    }
  };

  window.addEventListener("scroll", handleScrollButton, { passive: true });

  window.scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    topBtn.style.transform = "scale(0.9)";
    setTimeout(() => topBtn.style.transform = "scale(1)", 150);
  };

  // === Intersection Observer for Animation Triggers ===
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        
        // Stagger animations for service cards
        if (entry.target.classList.contains('service-card')) {
          const cards = entry.target.parentElement.children;
          Array.from(cards).forEach((card, index) => {
            if (card === entry.target) return;
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, index * 100);
          });
        }
      }
    });
  }, observerOptions);

  // Observe all sections and cards
  document.querySelectorAll('section, .service-card, .ethos-card, .testimonial-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // === Enhanced Button Interactions ===
  document.querySelectorAll('.button-fun').forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-3px) scale(1.02)';
    });
    
    button.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
    
    button.addEventListener('mousedown', function() {
      this.style.transform = 'translateY(-1px) scale(0.98)';
    });
    
    button.addEventListener('mouseup', function() {
      this.style.transform = 'translateY(-3px) scale(1.02)';
    });
  });

  // === Performance Optimization ===
  // Debounce scroll events
  let scrollTimeout;
  const originalHandleScroll = handleScroll;
  const originalHandleScrollButton = handleScrollButton;
  
  const debouncedScroll = () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      originalHandleScroll();
      originalHandleScrollButton();
    }, 10);
  };

  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("scroll", handleScrollButton);
  window.addEventListener("scroll", debouncedScroll, { passive: true });

  console.log("✨ Modern enhancements loaded successfully!");
});