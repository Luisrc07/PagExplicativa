// Función para cargar un componente o una sección de contenido
async function loadContent(placeholderId, filePath, callback) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            console.warn(`No se pudo cargar ${filePath}. HTTP ${response.status}`);
            return;
        }
        const html = await response.text();
        const placeholder = document.getElementById(placeholderId);
        if (placeholder) {
            placeholder.innerHTML = html;
            if (callback) callback();
        }
    } catch (e) {
        console.error(`Error al cargar ${filePath}:`, e);
    }
}

// Función para mostrar la sección de contenido adecuada basada en el hash de la URL
function navigateToSection(sectionId) {
    const mainContentPlaceholder = document.getElementById('main-content-placeholder');
    if (!mainContentPlaceholder) return;

    let contentPath;
    let title = "Ética Fundamental en la Informática"; // Default title

    // Define paths for content fragments
    switch (sectionId) {
        case 'nociones_basic_section':
            contentPath = 'nociones_basic_section.html';
            title += " - Nociones Basicas";
            break;
        case 'variable_section':
            contentPath = 'variablespython.html';
            title += " - Variables";
            break;
        case 'Condicional_section':
            contentPath = 'Condicionalespython.html';
            title += " - Condicionales";
            break;
        case 'bucles-section':
            contentPath = 'Funtiones.html';
            title += " - Funciones";
            break;
        case 'bucles-section':
            contentPath = 'Buclespython.html';
            title += " - Bucles";
            break;
        case 'home': // Handle explicit home navigation
        case '':     // Handle empty hash (e.g., initial load or root URL)
            contentPath = 'home-content.html'; // A dummy file for the home section content
            title += " - Inicio";
            break;
        default:
            // Fallback for unknown hashes, redirect to home or show 404
            contentPath = 'home-content.html';
            title += " - Inicio";
            sectionId = 'home'; // Treat as home
            break;
    }

    // Update document title
    document.title = title;

    // Load content dynamically
    if (contentPath) {
        // For the home section, we already have it in index.html, just ensure it's visible.
        // For other sections, load them.
        if (sectionId === 'home') {
             // If we navigate back to home, show the initial section content
             const homeSection = document.getElementById('home-section');
             if (homeSection) {
                 mainContentPlaceholder.innerHTML = ''; // Clear placeholder
                 mainContentPlaceholder.appendChild(homeSection); // Append the original home section
                 homeSection.classList.add('active'); // Ensure it's visible
                 // Re-apply animations if needed
                 animateCards();
             }
        } else {
            // Load the specific content fragment into the placeholder
            loadContent('main-content-placeholder', contentPath, () => {
                // Ensure the loaded content has the necessary Bootstrap container class if not already in the fragment
                const loadedSection = mainContentPlaceholder.querySelector('section');
                if (loadedSection && !loadedSection.classList.contains('container')) {
                    loadedSection.classList.add('container', 'py-5'); // Add Bootstrap container classes
                }
                // Re-apply image animations for newly loaded content
                animateImages();
            });
        }
    }

    highlightActiveNavLink(sectionId);
}

// Enlace activo
function highlightActiveNavLink(activeSectionId) {
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        let linkSectionId = '';
        if (linkHref && linkHref.startsWith('#')) {
            linkSectionId = linkHref.substring(1);
        }

        if (linkSectionId === activeSectionId || (activeSectionId === '' && linkSectionId === 'home')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Animación de entrada para las tarjetas (solo en la página de inicio)
function animateCards() {
    const cards = document.querySelectorAll('#home-section .entry-card');
    cards.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, i * 150);
    });
}

// Animación de entrada para las imágenes
function animateImages() {
    const images = document.querySelectorAll('.animated-img');
    images.forEach(img => {
        // Reset animation for new elements
        img.style.animation = 'none';
        img.offsetHeight; // Trigger reflow
        img.style.animation = null;
    });
}


document.addEventListener('DOMContentLoaded', () => {
    const headerPath = window.componentBasePath + 'header.html';
    const footerPath = window.componentBasePath + 'footer.html';

    // Load header and footer components
    loadContent('header-placeholder', headerPath, () => {
        // Add event listener for hamburger menu (Bootstrap 5 already handles it)
        const hamburger = document.querySelector('.hamburger');
        const mainNavUl = document.querySelector('.main-nav ul');
        if (hamburger && mainNavUl) {
            hamburger.addEventListener('click', () => {
                mainNavUl.classList.toggle('show');
            });
        }

        // Delegate click events for navigation links
        document.body.addEventListener('click', (event) => {
            if (event.target.matches('.main-nav a') || event.target.matches('.entry-card a') || event.target.matches('.back-to-top')) {
                event.preventDefault(); // Prevent default link behavior
                const href = event.target.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const sectionId = href.substring(1);
                    history.pushState(null, '', href); // Update URL hash
                    navigateToSection(sectionId);
                } else if (href === 'index.html' || href === '/') { // Handle 'Volver al Inicio' links
                    history.pushState(null, '', 'index.html');
                    navigateToSection('home');
                }
            }
        });
    });

    loadContent('footer-placeholder', footerPath);

    // Initial load based on URL hash or default to home
    const initialHash = window.location.hash.substring(1);
    navigateToSection(initialHash || 'home');

    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
        const hash = window.location.hash.substring(1);
        navigateToSection(hash || 'home');
    });

    // Animate cards on initial home section load
    if (document.getElementById('home-section') && (initialHash === '' || initialHash === 'home')) {
        animateCards();
    }
});