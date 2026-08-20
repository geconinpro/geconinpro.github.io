(function(){
  "use strict";
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* header shadow on scroll */
  var mast = document.querySelector("header.masthead");
  var onScroll = function(){ mast.classList.toggle("scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  var reveals = document.querySelectorAll(".rv");
  var counters = document.querySelectorAll("[data-count]");

  /* animated counters */
  function runCounter(el){
    var end = parseInt(el.getAttribute("data-count"), 10);
    var start = parseInt(el.textContent, 10) || 0;
    if (reduced){ el.textContent = end; return; }
    var dur = 1100, t0 = null;
    function step(t){
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (end - start) * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (reduced || !("IntersectionObserver" in window)){
    reveals.forEach(function(el){ el.classList.add("in"); });
    counters.forEach(function(el){ el.textContent = el.getAttribute("data-count"); });
    return;
  }

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      io.unobserve(entry.target);
    });
  }, {threshold: 0.12, rootMargin: "0px 0px -6% 0px"});
  reveals.forEach(function(el){ io.observe(el); });

  /* safety net: some browsers delay the first observer callback —
     reveal anything already inside the viewport now, on load and shortly after */
  function revealVisible(){
    reveals.forEach(function(el){
      if (el.classList.contains("in")) return;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.98){
        el.classList.add("in");
        io.unobserve(el);
      }
    });
  }
  revealVisible();
  window.addEventListener("load", revealVisible);
  setTimeout(revealVisible, 900);

  var cio = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (!entry.isIntersecting) return;
      runCounter(entry.target);
      cio.unobserve(entry.target);
    });
  }, {threshold: 0.6});
  counters.forEach(function(el){ cio.observe(el); });
})();
