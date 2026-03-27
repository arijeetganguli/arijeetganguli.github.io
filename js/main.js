/* ═══════════════════════════════════════════════════
   Main JavaScript — Arijeet Ganguli Portfolio
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Mobile Menu Toggle ──
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      const isOpen = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden');
      menuIcon.setAttribute('d', isOpen
        ? 'M4 6h16M4 12h16M4 18h16'
        : 'M6 18L18 6M6 6l12 12'
      );
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.add('hidden');
        menuIcon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
      });
    });
  }

  // ── Active Nav Link on Scroll ──
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    var scrollY = window.scrollY + 100;

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // ── Navbar Background on Scroll ──
  var navbar = document.getElementById('navbar');

  function updateNavbar() {
    if (window.scrollY > 50) {
      navbar.classList.add('shadow-lg');
    } else {
      navbar.classList.remove('shadow-lg');
    }
  }

  // ── Scroll Reveal ──
  function initScrollReveal() {
    // Add reveal class to sections (except hero)
    document.querySelectorAll('#about, #projects, #architecture, #skills, #contact').forEach(function (section) {
      section.querySelectorAll('.grid, .max-w-2xl, .text-center, .relative').forEach(function (el) {
        if (!el.classList.contains('reveal')) {
          el.classList.add('reveal');
        }
      });
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  // ── Smooth scroll for anchor links (fallback) ──
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Event Listeners ──
  window.addEventListener('scroll', function () {
    updateActiveNav();
    updateNavbar();
  }, { passive: true });

  // ── Initialize ──
  document.addEventListener('DOMContentLoaded', function () {
    updateActiveNav();
    updateNavbar();
    initScrollReveal();
  });
})();
