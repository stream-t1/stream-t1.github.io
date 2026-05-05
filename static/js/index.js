window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        button.classList.add('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (container && !container.contains(event.target)) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');
    
    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            // Success feedback
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');
    
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => {
                    // Autoplay failed, probably due to browser policy
                    console.log('Autoplay prevented:', e);
                });
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
        slidesToScroll: 1,
        slidesToShow: 1,
        loop: true,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 5000,
        pauseOnHover: true,
        navigation: true,
        pagination: true,
        navigationSwipe: true,
        navigationKeys: true,
    }

	// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Setup video autoplay for carousel
    setupVideoCarouselAutoplay();

})

// r1-style video marquees and synchronized comparison playback
function streamSafePlay(video) {
    if (!video) return;
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
        promise.catch(function() {});
    }
}

function setupStreamVideoPlayback() {
    const videos = document.querySelectorAll('.stream-marquee-video video, .stream-method-cell video, .stream-compare-cell video');
    if (videos.length === 0) return;

    videos.forEach(function(video, index) {
        video.addEventListener('loadedmetadata', function() {
            if (Number.isFinite(video.duration) && video.duration > 1) {
                try {
                    video.currentTime = (index * 0.47) % Math.min(video.duration, 8);
                } catch (e) {}
            }
        }, { once: true });
    });

    if (!('IntersectionObserver' in window)) {
        videos.forEach(streamSafePlay);
        return;
    }

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            const video = entry.target;
            if (entry.isIntersecting) {
                if (video.preload === 'metadata') video.preload = 'auto';
                streamSafePlay(video);
            } else {
                video.pause();
            }
        });
    }, {
        threshold: 0.18,
        rootMargin: '120px 0px 120px 0px'
    });

    videos.forEach(function(video) {
        observer.observe(video);
    });

    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            videos.forEach(function(video) {
                video.pause();
            });
        }
    });
}

function setupStreamFullscreen() {
    const targets = document.querySelectorAll('[data-stream-fullscreen]');
    if (targets.length === 0) return;

    function requestFullscreen(element) {
        const request = element.requestFullscreen ||
            element.webkitRequestFullscreen ||
            element.webkitEnterFullscreen ||
            element.msRequestFullscreen ||
            element.mozRequestFullScreen;
        if (!request) return;
        try {
            const result = request.call(element);
            if (result && typeof result.catch === 'function') result.catch(function() {});
        } catch (e) {}
    }

    targets.forEach(function(target) {
        target.addEventListener('click', function(event) {
            event.preventDefault();
            const video = target.querySelector('video');
            if (!video) return;
            try {
                video.currentTime = 0;
            } catch (e) {}
            video.muted = true;
            video.playsInline = true;
            requestFullscreen(video);
            requestFullscreen(target);
            streamSafePlay(video);
        });
    });
}

function setupStreamComparison() {
    const rows = document.querySelectorAll('.stream-compare-row');
    if (rows.length === 0 || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            const row = entry.target;
            const videos = row.querySelectorAll('video');
            if (entry.isIntersecting) {
                row.classList.add('is-active');
                videos.forEach(function(video) {
                    try {
                        video.currentTime = 0;
                    } catch (e) {}
                    streamSafePlay(video);
                });
            } else {
                row.classList.remove('is-active');
                videos.forEach(function(video) {
                    video.pause();
                });
            }
        });
    }, {
        threshold: 0.45
    });

    rows.forEach(function(row) {
        observer.observe(row);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setupStreamVideoPlayback();
    setupStreamFullscreen();
    setupStreamComparison();
});
