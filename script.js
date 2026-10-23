/* =========================================
   MOBILE MENU
========================================= */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.querySelector(".nav-links");

function setMenu(open) {

    navLinks.classList.toggle("active", open);

    const icon = menuToggle.querySelector("i");

    icon.classList.toggle("fa-xmark", open);
    icon.classList.toggle("fa-bars", !open);

    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");

}

menuToggle.addEventListener("click", () => {

    setMenu(!navLinks.classList.contains("active"));

});


/* =========================================
   DARK MODE
========================================= */

const themeToggle =
    document.getElementById("themeToggle");

const themeIcon =
    themeToggle.querySelector("i");

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        themeIcon.classList.remove("fa-moon");
        themeIcon.classList.add("fa-sun");

        localStorage.setItem("theme", "dark");

    } else {

        themeIcon.classList.remove("fa-sun");
        themeIcon.classList.add("fa-moon");

        localStorage.setItem("theme", "light");

    }

});


/* =========================================
   LOAD SAVED THEME
========================================= */

const savedTheme =
    localStorage.getItem("theme");

if (savedTheme === "dark") {

    document.body.classList.add("dark");

    themeIcon.classList.remove("fa-moon");
    themeIcon.classList.add("fa-sun");

}


/* =========================================
   SLIDE NAVIGATION
   One section visible at a time, with a
   horizontal slide transition between them.
========================================= */

const stage = document.querySelector(".slides");
const slides = Array.from(document.querySelectorAll(".slide"));
const slideIds = slides.map(slide => slide.id);
const navigationLinks = document.querySelectorAll(".nav-links a");

const prevButton = document.getElementById("prevSlide");
const nextButton = document.getElementById("nextSlide");
const slideCounter = document.getElementById("slideCounter");
const slideAnnouncer = document.getElementById("slideAnnouncer");

const SLIDE_DURATION = 450;                       /* ms */
const SLIDE_EASING = "cubic-bezier(0.65, 0, 0.35, 1)";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let currentIndex = 0;
let transition = null;                            /* the transition in progress, if any */


/* Slide id requested by the URL hash (falls back to Home) */
function slideIdFromHash() {

    let id = "";

    try {
        id = decodeURIComponent(location.hash.slice(1));
    } catch (error) {
        id = "";
    }

    return slideIds.includes(id) ? id : "home";

}


/* Highlight the active menu item, update counter and arrow buttons */
function updateNavigationState() {

    const activeId = slideIds[currentIndex];

    navigationLinks.forEach(link => {

        const isActive = link.getAttribute("href") === "#" + activeId;

        link.classList.toggle("active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }

    });

    const pad = number => String(number).padStart(2, "0");

    slideCounter.textContent =
        pad(currentIndex + 1) + " / " + pad(slides.length);

    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === slides.length - 1;

    slideAnnouncer.textContent =
        slides[currentIndex].dataset.title + " section";

}


/* Instantly finish a running transition (used for fast repeated clicks) */
function settleTransition() {

    if (!transition) return;

    const { from, to, animations } = transition;

    transition = null;

    animations.forEach(animation => {
        animation.onfinish = null;
        animation.cancel();
    });

    from.classList.remove("is-active", "is-leaving");
    to.classList.remove("is-entering");

}


/* Move to a slide by id. direction follows the menu order. */
function goToSlide(id, { updateHistory = true } = {}) {

    const nextIndex = slideIds.indexOf(id);

    if (nextIndex === -1) return;

    settleTransition();

    /* Already there: just bring the slide back to the top */
    if (nextIndex === currentIndex) {
        slides[currentIndex].scrollTo({ top: 0, behavior: "smooth" });
        return;
    }

    if (updateHistory) {
        history.pushState({ slide: id }, "", "#" + id);
    }

    const from = slides[currentIndex];
    const to = slides[nextIndex];
    const direction = nextIndex > currentIndex ? 1 : -1;

    currentIndex = nextIndex;

    to.scrollTop = 0;

    to.classList.add("is-active", "is-entering");
    from.classList.add("is-leaving");

    updateNavigationState();

    to.focus({ preventScroll: true });

    transition = { from, to, animations: [] };

    if (reduceMotion.matches || typeof to.animate !== "function") {
        settleTransition();
        return;
    }

    const enter = to.animate(
        [
            { transform: "translate3d(" + (direction * 100) + "%, 0, 0)" },
            { transform: "translate3d(0, 0, 0)" }
        ],
        { duration: SLIDE_DURATION, easing: SLIDE_EASING, fill: "forwards" }
    );

    const leave = from.animate(
        [
            { transform: "translate3d(0, 0, 0)" },
            { transform: "translate3d(" + (-direction * 100) + "%, 0, 0)" }
        ],
        { duration: SLIDE_DURATION, easing: SLIDE_EASING, fill: "forwards" }
    );

    transition.animations = [enter, leave];

    enter.onfinish = settleTransition;

}


/* Previous / next slide */
function stepSlide(step) {

    const target = slides[currentIndex + step];

    if (target) goToSlide(target.id);

}


/* Initial slide (supports opening the page on #skills, #projects, ...) */
(function initSlides() {

    currentIndex = slideIds.indexOf(slideIdFromHash());

    slides.forEach((slide, index) => {
        slide.classList.toggle("is-active", index === currentIndex);
    });

    updateNavigationState();

})();


/* Menu, logo and in-page buttons: any link to #section opens that slide */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", event => {

        const id = (anchor.getAttribute("href") || "").slice(1);

        if (!slideIds.includes(id)) return;

        event.preventDefault();

        setMenu(false);

        goToSlide(id);

    });

});


/* Browser back / forward */
window.addEventListener("popstate", () => {

    goToSlide(slideIdFromHash(), { updateHistory: false });

});


/* Previous / next buttons */
prevButton.addEventListener("click", () => stepSlide(-1));
nextButton.addEventListener("click", () => stepSlide(1));


/* Keyboard: left / right arrows change section, Escape closes the menu */
document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        setMenu(false);
        return;
    }

    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

    if (event.target.closest("input, textarea, select, [contenteditable]")) return;

    if (event.key === "ArrowRight") {
        event.preventDefault();
        stepSlide(1);
    } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepSlide(-1);
    }

});


/* Touch: swipe left / right to change section */
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

stage.addEventListener("touchstart", event => {

    if (event.touches.length !== 1) return;

    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    touchStartTime = Date.now();

}, { passive: true });

stage.addEventListener("touchend", event => {

    if (event.changedTouches.length !== 1) return;

    const deltaX = event.changedTouches[0].clientX - touchStartX;
    const deltaY = event.changedTouches[0].clientY - touchStartY;
    const elapsed = Date.now() - touchStartTime;

    const isHorizontalSwipe =
        Math.abs(deltaX) > 70 &&
        Math.abs(deltaX) > Math.abs(deltaY) * 1.5 &&
        elapsed < 800;

    if (isHorizontalSwipe) {
        stepSlide(deltaX < 0 ? 1 : -1);
    }

}, { passive: true });


/* Tapping the content closes the mobile menu */
stage.addEventListener("click", () => {

    if (navLinks.classList.contains("active")) setMenu(false);

});


/* =========================================
   COUNTER ANIMATION
========================================= */

const counters =
    document.querySelectorAll(".counter");

const counterObserver =
    new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    const counter =
                        entry.target;

                    const target =
                        Number(
                            counter.dataset.target
                        );

                    let current = 0;

                    const increment =
                        target / 50;

                    const updateCounter =
                        () => {

                            current += increment;

                            if (current < target) {

                                counter.textContent =
                                    Math.ceil(current);

                                requestAnimationFrame(
                                    updateCounter
                                );

                            } else {

                                counter.textContent =
                                    target;

                            }

                        };

                    updateCounter();

                    counterObserver.unobserve(counter);

                }

            });

        },

        {
            threshold: 0.5
        }

    );

counters.forEach(counter => {

    counterObserver.observe(counter);

});


/* =========================================
   SCROLL REVEAL
   (runs when a card first becomes visible
   inside its slide)
========================================= */

const revealElements =
    document.querySelectorAll(
        ".section-heading, .timeline-item, .project-card, .cert-card, .skill-category, .stat-card"
    );

revealElements.forEach(element => {

    element.style.opacity = "0";

    element.style.transform =
        "translateY(30px)";

    element.style.transition =
        "opacity 0.7s ease, transform 0.7s ease";

});


const revealObserver =
    new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    const element = entry.target;

                    element.style.opacity = "1";

                    element.style.transform =
                        "translateY(0)";

                    revealObserver.unobserve(element);

                    /* Hand control back to the stylesheet so card hover effects work */
                    setTimeout(() => {

                        element.style.opacity = "";
                        element.style.transform = "";
                        element.style.transition = "";

                    }, 800);

                }

            });

        },

        {
            threshold: 0.12
        }

    );


revealElements.forEach(element => {

    revealObserver.observe(element);

});


/* =========================================
   CURRENT YEAR
========================================= */

document.getElementById("currentYear")
    .textContent =
    new Date().getFullYear();
