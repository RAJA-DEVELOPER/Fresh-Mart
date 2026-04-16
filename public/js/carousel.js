/**
 * FreshMart Carousel Logic
 */

class Carousel {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.track = this.container.querySelector('.carousel-track');
        this.slides = Array.from(this.track.children);
        this.nextBtn = this.container.querySelector('.carousel-arrow-right');
        this.prevBtn = this.container.querySelector('.carousel-arrow-left');
        this.dotContainer = this.container.querySelector('.carousel-dots');
        
        this.currentIndex = 0;
        this.autoPlayInterval = null;

        this.init();
    }

    init() {
        // Create Dots
        this.slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(i));
            this.dotContainer.appendChild(dot);
        });

        this.dots = Array.from(this.dotContainer.children);

        // Buttons
        this.nextBtn.addEventListener('click', () => {
            this.next();
            this.resetAutoPlay();
        });

        this.prevBtn.addEventListener('click', () => {
            this.prev();
            this.resetAutoPlay();
        });

        // First slide initialization
        this.updateSlideState();
        this.startAutoPlay();

        // Pause on hover
        this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.container.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    updateSlideState() {
        const amountToMove = -100 * this.currentIndex;
        this.track.style.transform = `translateX(${amountToMove}%)`;
        
        this.dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentIndex);
        });

        this.slides.forEach((slide, i) => {
            slide.classList.toggle('active-slide', i === this.currentIndex);
        });
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.updateSlideState();
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.updateSlideState();
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateSlideState();
        this.resetAutoPlay();
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => this.next(), 5000);
    }

    stopAutoPlay() {
        clearInterval(this.autoPlayInterval);
    }

    resetAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Carousel('home-carousel');
});
