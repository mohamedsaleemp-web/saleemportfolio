/* =========================================
   MOBILE MENU
========================================= */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.querySelector(".nav-links");

menuToggle.addEventListener("click", () => {

    navLinks.classList.toggle("active");

    const icon = menuToggle.querySelector("i");

    if (navLinks.classList.contains("active")) {

        icon.classList.remove("fa-bars");
        icon.classList.add("fa-xmark");

    } else {

        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");

    }

});


/* =========================================
   CLOSE MOBILE MENU
========================================= */

document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", () => {

        navLinks.classList.remove("active");

        const icon = menuToggle.querySelector("i");

        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");

    });

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
   ACTIVE NAVIGATION FOR HORIZONTAL PANELS
========================================= */

const horizontalPortfolio = document.querySelector(".horizontal-portfolio");
const horizontalTrack = document.querySelector(".horizontal-track");
const navigationLinks = document.querySelectorAll(".nav-links a");

function getPanelForTarget(target) {
    if (!target || !horizontalTrack) return null;
    return target.closest(".horizontal-track > section, .horizontal-track > .career-section, .horizontal-track > .strength-section");
}

function setActiveNavigation(id) {
    navigationLinks.forEach(link => {
        const isActive = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("active", isActive);
        if (isActive) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
    });
}

function navigateToTarget(target, options = {}) {
    const panel = getPanelForTarget(target);
    if (!panel || !horizontalPortfolio) return false;

    const behavior = options.behavior || "smooth";
    horizontalPortfolio.scrollTo({ left: panel.offsetLeft, behavior });

    // Reset the selected panel to its top when changing main sections.
    if (target === panel) panel.scrollTo({ top: 0, behavior });

    panel.classList.remove("slide-entering");
    void panel.offsetWidth;
    panel.classList.add("slide-entering");
    window.setTimeout(() => panel.classList.remove("slide-entering"), 500);

    if (target.id) setActiveNavigation(target.id);
    return true;
}

function updateActiveNavigation() {
    if (!horizontalPortfolio || !horizontalTrack) return;
    const currentLeft = horizontalPortfolio.scrollLeft;
    const panels = Array.from(horizontalTrack.children).filter(el =>
        el.matches("section, .career-section, .strength-section")
    );
    let closest = null;
    let distance = Infinity;
    panels.forEach(panel => {
        const nextDistance = Math.abs(panel.offsetLeft - currentLeft);
        if (nextDistance < distance) { distance = nextDistance; closest = panel; }
    });
    if (closest && closest.id) setActiveNavigation(closest.id);
}

if (horizontalPortfolio) {
    horizontalPortfolio.addEventListener("scroll", updateActiveNavigation, { passive: true });
    window.addEventListener("resize", updateActiveNavigation);
}

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

                    entry.target.style.opacity = "1";

                    entry.target.style.transform =
                        "translateY(0)";

                    revealObserver.unobserve(
                        entry.target
                    );

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


/* =========================================
   CLICK-BASED NAVIGATION + BROWSER HISTORY
========================================= */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", event => {
        const href = anchor.getAttribute("href");
        if (!href || href === "#") return;
        const target = document.querySelector(href);
        if (!target) return;

        const panel = getPanelForTarget(target);
        if (!panel) return;
        event.preventDefault();

        navigateToTarget(target);
        if (target.id && window.location.hash !== `#${target.id}`) {
            history.pushState({ section: target.id }, "", `#${target.id}`);
        }
    });
});

window.addEventListener("popstate", () => {
    const id = window.location.hash.slice(1) || "home";
    const target = document.getElementById(id);
    if (target) navigateToTarget(target);
});

// Support direct links such as portfolio.html#skills.
window.addEventListener("load", () => {
    const id = window.location.hash.slice(1);
    const target = id ? document.getElementById(id) : document.getElementById("home");
    if (target) navigateToTarget(target, { behavior: "auto" });
    updateActiveNavigation();
});

// Mouse wheel advances between panels only when the current panel has no
// more vertical content in the direction of travel.
if (horizontalPortfolio) {
    horizontalPortfolio.addEventListener("wheel", event => {
        if (event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
        const panel = event.target.closest(".horizontal-track > section, .horizontal-track > .career-section, .horizontal-track > .strength-section");
        if (!panel) return;
        const canScrollVertically = panel.scrollHeight > panel.clientHeight + 2;
        const atTop = panel.scrollTop <= 0;
        const atBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 2;
        if (!canScrollVertically || (event.deltaY > 0 && atBottom) || (event.deltaY < 0 && atTop)) {
            event.preventDefault();
            horizontalPortfolio.scrollBy({ left: event.deltaY > 0 ? window.innerWidth : -window.innerWidth, behavior: "smooth" });
        }
    }, { passive: false });
}
