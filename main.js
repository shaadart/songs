// --- Video Scroll Logic ---
const video = document.getElementById('scroll-video');
const purposeHeadline = document.getElementById('purpose-headline');
const purposeText = document.getElementById('purpose-text');
const mainHeadline = document.getElementById('main-headline');

let duration = 3; // default fallback duration
let isVideoLoaded = false;

// Enhanced video loading
video.addEventListener('loadedmetadata', () => {
  duration = video.duration;
  isVideoLoaded = true;
  video.classList.add('loaded');
  console.log('Video loaded, duration:', duration);
});

video.addEventListener('canplaythrough', () => {
  video.classList.add('loaded');
  isVideoLoaded = true;
  console.log('Video can play through');
});

// Handle video loading errors
video.addEventListener('error', (e) => {
  console.error('Video loading error:', e);
  // Fallback: show content without video
  video.style.display = 'none';
});

// Log video play and pause events
video.addEventListener('play', () => {
  console.log('Video is playing');
});

video.addEventListener('pause', () => {
  console.log('Video is paused');
});

// Force video to load
video.load();

function handleScroll() {
  const scrollTop = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const scrollFraction = scrollTop / maxScroll;
  
  // Calculate video progress (0 to 1) for the first 70% of scroll
  const videoScrollEnd = 0.7; // Video plays during first 70% of scroll
  const videoProgress = Math.min(scrollFraction / videoScrollEnd, 1);
  
  // Video control - only when video is loaded
  if (isVideoLoaded && !isNaN(video.duration)) {
    const frameTime = Math.min(videoProgress * duration, duration - 0.1);
    video.currentTime = frameTime;
    
    // Activate video overlay when scrolling begins
    const videoOverlay = document.getElementById('video-overlay');
    if (scrollFraction > 0.05) {
      videoOverlay.classList.add('active');
    } else {
      videoOverlay.classList.remove('active');
    }
  }

  // Text transitions based on video progress (80% of video = 56% of total scroll)
  const textTransitionStart = 0.56; // 80% of 70% = 56%
  
  if (scrollFraction > textTransitionStart) {
    // Start fading out main headline at 80% video completion
    const fadeOutProgress = Math.min((scrollFraction - textTransitionStart) / 0.1, 1);
    mainHeadline.style.opacity = 1 - fadeOutProgress;
    
    // Start fading in purpose content right after main headline starts fading
    if (scrollFraction > textTransitionStart + 0.05) {
      const fadeInProgress = Math.min((scrollFraction - textTransitionStart - 0.05) / 0.15, 1);
      purposeHeadline.style.opacity = fadeInProgress;
      purposeText.style.opacity = fadeInProgress;
    }
  } else {
    mainHeadline.style.opacity = 1;
    purposeHeadline.style.opacity = 0;
    purposeText.style.opacity = 0;
  }
}

// Enhanced scroll handling with throttling
let ticking = false;
function optimizedScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      handleScroll();
      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener('scroll', optimizedScroll);
window.addEventListener('load', handleScroll);

// Initial call to set up the page
handleScroll();

// --- Slideshow Logic ---
// const slideshowTexts = [
//   "jo likh rahe hai kitaabein who padhte nahi hai\n jo padh rahe kitaabein woh likhte nahi hai",
//   "mai chahta hoon yeh kalam mera laaye farq \n yeh chukaaye karz, yeh nibhaaaye farz",
//   "I am feelin like a pen mera kaam zimmedaar hai",
//   "I am feelin like a pen koi likh raha  hai kuch mar raha hai",
//   "I am feelin like a pen mujhpar maut ke nishaan hai"
// ];

let currentTextIndex = 0;
const slideshowTextElement = document.getElementById('slideshow-text');

function updateSlideshowText() {
  if (slideshowTextElement) {
    slideshowTextElement.textContent = slideshowTexts[currentTextIndex];
    currentTextIndex = (currentTextIndex + 1) % slideshowTexts.length;
  }
}

if (slideshowTextElement) {
  setInterval(updateSlideshowText, 3000); // Change text every 3 seconds
  updateSlideshowText();
}

// --- Terminal Quote Section Logic ---
const terminalQuotes = [
  "May what you do\n be what keeps you alive.",
  "You are the story you write with your hands.",
  "Ink remembers what memory forgets.",
  "Between pixels and bones, truth lingers.",
  "Not broken. Reassembled.",
  "Some lines are drawn from loss."
];

const terminalQuoteText = document.getElementById('terminal-quote-text');
const terminalSection = document.querySelector('.terminal-section');

function getTerminalSectionScrollIndex() {
  if (!terminalSection) return 0;
  const rect = terminalSection.getBoundingClientRect();
  const vh = window.innerHeight;
  // Section is in view: calculate progress 0-1
  const progress = Math.min(Math.max((vh - rect.top) / (rect.height + vh), 0), 1);
  // Snap to quote index
  return Math.round(progress * (terminalQuotes.length - 1));
}

function updateTerminalQuoteByScroll() {
  if (!terminalSection || !terminalQuoteText) return;
  const idx = getTerminalSectionScrollIndex();
  terminalQuoteText.textContent = terminalQuotes[idx];
}

window.addEventListener('scroll', updateTerminalQuoteByScroll);
window.addEventListener('load', updateTerminalQuoteByScroll);

// --- Floating Action Button Show/Hide on Scroll ---
(function() {
  const fab = document.getElementById('fab');
  let lastScrollY = window.scrollY;
  let ticking = false;
  let hideTimeout = null;

  // Ensure FAB is always accessible
  if (fab) {
    fab.setAttribute('tabindex', '0');
    fab.setAttribute('role', 'button');
    fab.setAttribute('aria-label', 'Play on YouTube');
    fab.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        fab.click();
      }
    });
  }

  function showFab() {
    if (fab) fab.classList.remove('hide');
  }
  function hideFab() {
    if (fab) fab.classList.add('hide');
  }

  function updateFabVisibility() {
    if (!fab) return;
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY + 10) {
      // Scrolling down, hide FAB
      hideFab();
      if (hideTimeout) clearTimeout(hideTimeout);
    } else if (currentScrollY < lastScrollY - 10) {
      // Scrolling up, show FAB
      showFab();
      if (hideTimeout) clearTimeout(hideTimeout);
    }
    lastScrollY = currentScrollY;
    // Auto-hide after 2.5s of inactivity
    if (!fab.classList.contains('hide')) {
      if (hideTimeout) clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        hideFab();
      }, 2500);
    }
  }

  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateFabVisibility();
        ticking = false;
      });
      ticking = true;
    }
  });
  // Show FAB on load
  if (fab) showFab();

  // Always show FAB on focus (keyboard navigation)
  if (fab) {
    fab.addEventListener('focus', showFab);
    fab.addEventListener('blur', function() {
      // Hide after short delay if not hovered
      hideTimeout = setTimeout(hideFab, 2000);
    });
    fab.addEventListener('mouseenter', showFab);
    fab.addEventListener('mouseleave', function() {
      hideTimeout = setTimeout(hideFab, 2000);
    });
  }
})();
