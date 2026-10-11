/**
 * ImageSlider – dependency-free, infinite-looping image slider.
 * Track layout: [clone of last | slide 1 ... slide n | clone of first]
 * Moving onto a clone animates normally; on transitionend the track jumps
 * (without animation) to the matching real slide.
 */
class ImageSlider {
  constructor(container) {
    this.container = container;
    this.track = container.querySelector('.slider__track');
    this.slides = Array.from(this.track.children);
    this.prevBtn = container.querySelector('.slider__btn--prev');
    this.nextBtn = container.querySelector('.slider__btn--next');
    this.dotsContainer = container.querySelector('.slider__dots');
    this.status = container.querySelector('.slider__status');

    this.slideCount = this.slides.length;
    this.currentIndex = 1;          // track position (1 = first real slide)
    this.isTransitioning = false;   // blocks input while animating

    this.init();
  }

  init() {
    this.setupClones();
    this.createDots();
    this.bindEvents();
    this.updatePosition(false);
    this.updateIndicators();
  }

  setupClones() {
    const firstClone = this.slides[0].cloneNode(true);
    const lastClone = this.slides[this.slideCount - 1].cloneNode(true);
    [firstClone, lastClone].forEach(c => c.setAttribute('aria-hidden', 'true'));
    this.track.append(firstClone);
    this.track.prepend(lastClone);
  }

  createDots() {
    this.dots = this.slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider__dot';
      dot.setAttribute('aria-label', `Go to image ${i + 1}`);
      dot.addEventListener('click', () => this.goToSlide(i));
      this.dotsContainer.append(dot);
      return dot;
    });
  }

  bindEvents() {
    this.nextBtn.addEventListener('click', () => this.nextSlide());
    this.prevBtn.addEventListener('click', () => this.prevSlide());
    this.track.addEventListener('transitionend', e => this.handleTransitionEnd(e));
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') this.nextSlide();
      if (e.key === 'ArrowLeft') this.prevSlide();
    });
    window.addEventListener('resize', () => {
      if (!this.isTransitioning) this.updatePosition(false);
    });
  }

  nextSlide() { this.moveTo(this.currentIndex + 1); }
  prevSlide() { this.moveTo(this.currentIndex - 1); }
  goToSlide(index) { this.moveTo(index + 1); }

  moveTo(target) {
    if (this.isTransitioning || target === this.currentIndex) return;
    this.isTransitioning = true;
    this.currentIndex = target;
    this.updatePosition(true);
    this.updateIndicators();
  }

  handleTransitionEnd(e) {
    if (e.target !== this.track || e.propertyName !== 'transform') return;
    if (this.currentIndex === 0) this.currentIndex = this.slideCount;
    else if (this.currentIndex === this.slideCount + 1) this.currentIndex = 1;
    this.updatePosition(false);
    this.isTransitioning = false;
  }

  updatePosition(animate = true) {
    this.track.classList.toggle('is-instant', !animate);
    this.track.style.transform = `translateX(${-this.currentIndex * 100}%)`;
    if (!animate) void this.track.offsetWidth;   // flush so next move animates
  }

  updateIndicators() {
    const active = (this.currentIndex - 1 + this.slideCount) % this.slideCount;
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === active);
      dot.setAttribute('aria-current', i === active ? 'true' : 'false');
    });
    this.status.textContent = `Image ${active + 1} of ${this.slideCount}`;
  }
}