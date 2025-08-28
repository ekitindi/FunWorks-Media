console.info("%cFunWorks site loaded successfully! Ready to grow brands.", "color: #3366cc; font-weight: bold;");

document.addEventListener("DOMContentLoaded", () => {
  // === Enhanced Header Scroll Effect ===
  const header = document.querySelector('header');
  const nav = document.querySelector('nav');
  
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    if (scrolled > 100) {
      header.style.background = 'rgba(34, 34, 34, 0.98)';
      nav.style.background = 'rgba(93, 58, 155, 0.98)';
    } else {
      header.style.background = 'rgba(34, 34, 34, 0.95)';
      nav.style.background = 'rgba(93, 58, 155, 0.95)';
    }
  });

  // === Enhanced Ethos Carousel ===
  const scrollContainer = document.getElementById("ethosScroll");
  const scrollLeftBtn = document.getElementById("scrollLeft");
  const scrollRightBtn = document.getElementById("scrollRight");

  if (scrollContainer && scrollLeftBtn && scrollRightBtn) {
    let autoScrollInterval;
    let isPaused = false;
    let isScrolling = false;

    // Enhanced auto-scroll with smooth transitions
    const startAutoScroll = () => {
      autoScrollInterval = setInterval(() => {
        if (!isPaused && !isScrolling) {
          if (
            scrollContainer.scrollLeft + scrollContainer.clientWidth >=
            scrollContainer.scrollWidth - 10
          ) {
            // Reset to start with smooth animation
            scrollContainer.scrollTo({ left: 0, behavior: "smooth" });
          } else {
            // Scroll right with smooth animation
            scrollContainer.scrollBy({ left: 300, behavior: "smooth" });
          }
        }
      }, 5000);
    };

    // Enhanced scroll buttons with visual feedback
    const scrollWithFeedback = (direction) => {
      if (isScrolling) return;
      
      isScrolling = true;
      const scrollAmount = direction === 'left' ? -300 : 300;
      
      scrollContainer.scrollBy({ left: scrollAmount, behavior: "smooth" });
      
      // Add visual feedback to button
      const btn = direction === 'left' ? scrollLeftBtn : scrollRightBtn;
      btn.style.transform = 'scale(0.9)';
      
      setTimeout(() => {
        btn.style.transform = 'scale(1)';
        isScrolling = false;
      }, 500);
    };

    scrollLeftBtn.addEventListener("click", () => scrollWithFeedback('left'));
    scrollRightBtn.addEventListener("click", () => scrollWithFeedback('right'));

    // Enhanced pause on hover with visual indicator
    scrollContainer.addEventListener("mouseenter", () => {
      isPaused = true;
      scrollContainer.style.opacity = '0.8';
    });
    
    scrollContainer.addEventListener("mouseleave", () => {
      isPaused = false;
      scrollContainer.style.opacity = '1';
    });

    // Enhanced keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        scrollWithFeedback('left');
      } else if (e.key === "ArrowRight") {
        scrollWithFeedback('right');
      }
    });

    // Touch/swipe support for mobile
    let startX = 0;
    let endX = 0;

    scrollContainer.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });

    scrollContainer.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 50) { // Minimum swipe distance
        if (diff > 0) {
          scrollWithFeedback('right');
        } else {
          scrollWithFeedback('left');
        }
      }
    });

    startAutoScroll();
  } else {
    console.warn("Ethos scroll elements not found");
  }

  // === Enhanced Scroll-to-Top Button ===
  const topBtn = document.getElementById("topBtn");
  
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      topBtn.style.display = "flex";
      topBtn.style.opacity = "1";
      topBtn.style.transform = "translateY(0)";
    } else {
      topBtn.style.opacity = "0";
      topBtn.style.transform = "translateY(20px)";
      setTimeout(() => {
        if (window.pageYOffset <= 300) {
          topBtn.style.display = "none";
        }
      }, 300);
    }
  });

  window.scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // === Intersection Observer for Animations ===
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe all sections for fade-in animations
  document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });

  // === Enhanced Service Cards ===
  const serviceCards = document.querySelectorAll('.service-card');
  
  serviceCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
    });
  });

  // === Enhanced Testimonials ===
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  
  testimonialCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
    });
  });

  // === Smooth Navigation ===
  const navLinks = document.querySelectorAll('nav a');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Remove active class from all links
      navLinks.forEach(l => l.classList.remove('active'));
      // Add active class to clicked link
      link.classList.add('active');
    });
  });

  // === Parallax Effect for Hero Section ===
  const hero = document.querySelector('.hero');
  
  if (hero) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;
      hero.style.transform = `translateY(${rate}px)`;
    });
  }

  // === Enhanced Form Interactions ===
  const formInputs = document.querySelectorAll('#contactForm input, #contactForm textarea, #contactForm select');
  
  formInputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement.style.transform = 'translateY(-2px)';
    });
    
    input.addEventListener('blur', () => {
      input.parentElement.style.transform = 'translateY(0)';
    });
  });

  // === Loading Animation ===
  const loadingElements = document.querySelectorAll('.loading');
  
  loadingElements.forEach(element => {
    setTimeout(() => {
      element.classList.remove('loading');
    }, 1000);
  });

  // === Enhanced Button Interactions ===
  const buttons = document.querySelectorAll('.button-fun');
  
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-3px) scale(1.05)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0) scale(1)';
    });
    
    button.addEventListener('click', () => {
      button.style.transform = 'translateY(-1px) scale(0.98)';
      setTimeout(() => {
        button.style.transform = 'translateY(-3px) scale(1.05)';
      }, 150);
    });
  });

  // === Performance Optimization ===
  let ticking = false;
  
  function updateOnScroll() {
    // Update scroll-based animations here
    ticking = false;
  }
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateOnScroll);
      ticking = true;
    }
  });

  // === Accessibility Enhancements ===
  // Add focus indicators for keyboard navigation
  const focusableElements = document.querySelectorAll('a, button, input, textarea, select');
  
  focusableElements.forEach(element => {
    element.addEventListener('focus', () => {
      element.style.outline = '2px solid var(--fun-yellow)';
      element.style.outlineOffset = '2px';
    });
    
    element.addEventListener('blur', () => {
      element.style.outline = 'none';
    });
  });

  // === Mobile Menu Enhancement ===
  const createMobileMenu = () => {
    if (window.innerWidth <= 768) {
      const nav = document.querySelector('nav');
      const navList = nav.querySelector('ul');
      
      // Add hamburger menu for mobile
      if (!document.querySelector('.mobile-menu-toggle')) {
        const toggle = document.createElement('button');
        toggle.className = 'mobile-menu-toggle';
        toggle.innerHTML = '<i class="fas fa-bars"></i>';
        toggle.setAttribute('aria-label', 'Toggle navigation menu');
        
        toggle.addEventListener('click', () => {
          navList.classList.toggle('mobile-open');
          toggle.innerHTML = navList.classList.contains('mobile-open') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
        });
        
        nav.insertBefore(toggle, navList);
      }
    }
  };

  // Initialize mobile menu
  createMobileMenu();
  
  // Update on resize
  window.addEventListener('resize', createMobileMenu);

  console.log('Enhanced FunWorks site loaded with modern interactions!');
});