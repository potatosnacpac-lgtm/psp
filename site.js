(() => {
  'use strict';
  document.documentElement.classList.add('js');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.site-header');
  const brandIcon = document.querySelector('.brand-icon');
  if (brandIcon && window.lottie) {
    const brandAnimation = window.lottie.loadAnimation({
      container: brandIcon.querySelector('.brand-lottie'),
      renderer: 'svg',
      loop: true,
      autoplay: !prefersReducedMotion.matches,
      path: 'assets/logo-anim.json',
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
    });
    brandAnimation.addEventListener('DOMLoaded', () => {
      brandIcon.classList.add('is-ready');
      if (prefersReducedMotion.matches) brandAnimation.goToAndStop(41, true);
    });
    header.querySelector('.brand').addEventListener('mouseenter', () => {
      if (!prefersReducedMotion.matches) brandAnimation.goToAndPlay(0, true);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) brandAnimation.pause();
      else if (!prefersReducedMotion.matches) brandAnimation.play();
    });
    prefersReducedMotion.addEventListener('change', event => {
      if (event.matches) brandAnimation.goToAndStop(41, true);
      else if (!document.hidden) brandAnimation.play();
    });
  }
  const progress = document.querySelector('.site-progress');
  const features = [...document.querySelectorAll('.feature')];
  const timeline = document.querySelector('.featured-list');
  const previewVideos = [...document.querySelectorAll('.feature-media video[data-src]')];
  let scrollPending = false;

  function updateScrollState() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    header.classList.toggle('is-scrolled', window.scrollY > 40);
    if (timeline && features.length) {
      const rect = timeline.getBoundingClientRect();
      const playhead = window.innerHeight * 0.48;
      const position = Math.max(0, Math.min(1, (playhead - rect.top) / rect.height));
      timeline.style.setProperty('--timeline-progress', `${(position * 100).toFixed(2)}%`);
      let closest = 0;
      let distance = Infinity;
      features.forEach((feature, index) => {
        const marker = feature.getBoundingClientRect().top + 16;
        const delta = Math.abs(marker - playhead);
        if (delta < distance) { distance = delta; closest = index; }
      });
      features.forEach((feature, index) => feature.classList.toggle('is-current', index === closest));
    }
    if (!prefersReducedMotion.matches) {
      features.forEach(feature => {
        const rect = feature.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const distance = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        feature.style.setProperty('--feature-shift', `${Math.max(-24, Math.min(24, distance * -32))}px`);
      });
    }
    scrollPending = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollPending) {
      scrollPending = true;
      requestAnimationFrame(updateScrollState);
    }
  }, { passive: true });
  window.addEventListener('resize', updateScrollState);
  updateScrollState();

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px 80px 0px' });
    features.forEach(feature => revealObserver.observe(feature));
  } else {
    features.forEach(feature => feature.classList.add('is-visible'));
  }

  const motionStage = document.querySelector('[data-motion-stage]');
  if (motionStage) {
    const headline = document.getElementById('reel-heading');
    const counter = document.getElementById('motion-count');
    const remixButton = motionStage.querySelector('.motion-remix');
    const timelineFill = motionStage.querySelector('.motion-timeline-fill');
    const timelinePlayhead = motionStage.querySelector('.motion-playhead');
    const currentTime = document.getElementById('motion-current-time');
    const easePath = document.getElementById('motion-ease-path');
    const easeRunner = document.getElementById('motion-ease-runner');
    const easeName = document.getElementById('motion-ease-name');
    const easeValue = document.getElementById('motion-ease-value');
    const liveIndicator = motionStage.querySelector('.motion-live-indicator');
    const phrases = [
      ['Ideas deserve', 'to move people.', 1],
      ['Every frame', 'can feel alive.', 1],
      ['Motion turns', 'thought into feeling.', 1],
      ['Good stories', 'never stand still.', 1],
      ['Make the small', 'feel monumental.', 1],
      ['Timing gives', 'ideas their pulse.', 1],
      ['Design moves', 'when it means more.', 2],
      ['A new frame', 'changes everything.', 1]
    ];
    const styles = [
      { style: 'rise', name: 'EXPO OUT', points: [.16, 1, .3, 1] },
      { style: 'slide', name: 'QUINT OUT', points: [.22, 1, .36, 1] },
      { style: 'bloom', name: 'SOFT OVERSHOOT', points: [.34, 1.12, .55, 1] },
      { style: 'flip', name: 'CUBIC OUT', points: [.33, 1, .68, 1] },
      { style: 'wipe', name: 'QUART IN OUT', points: [.76, 0, .24, 1] },
      { style: 'cascade', name: 'QUART OUT', points: [.25, 1, .5, 1] },
      { style: 'stretch', name: 'BACK OUT', points: [.18, 1.15, .32, 1] },
      { style: 'sweep', name: 'CUBIC IN OUT', points: [.65, 0, .35, 1] }
    ];
    const phraseDuration = 6200;
    let phraseIndex = 0;
    let visible = false;
    let changing = false;
    let rotationTimer = null;
    let progressFrame = null;
    let cycleStarted = 0;

    function cubic(a, b, t) {
      const inverse = 1 - t;
      return 3 * inverse * inverse * t * a + 3 * inverse * t * t * b + t * t * t;
    }

    function easingAt(progress, points) {
      let low = 0;
      let high = 1;
      for (let step = 0; step < 14; step++) {
        const middle = (low + high) / 2;
        if (cubic(points[0], points[2], middle) < progress) low = middle;
        else high = middle;
      }
      return cubic(points[1], points[3], (low + high) / 2);
    }

    function renderEasing() {
      const { name, points } = styles[phraseIndex];
      const value = `cubic-bezier(${points.join(', ')})`;
      motionStage.style.setProperty('--motion-ease', value);
      if (easeName) easeName.textContent = name;
      if (easeValue) easeValue.textContent = value;
      if (easePath) easePath.setAttribute('d', `M12 88 C${12 + 176 * points[0]} ${88 - 76 * points[1]} ${12 + 176 * points[2]} ${88 - 76 * points[3]} 188 12`);
    }

    function renderProgress(progress) {
      if (!timelineFill) return;
      const clamped = Math.max(0, Math.min(1, progress));
      timelineFill.style.width = `${clamped * 100}%`;
      timelinePlayhead.style.left = `${clamped * 100}%`;
      currentTime.textContent = `00:${String(Math.min(6, Math.floor(clamped * 6.2))).padStart(2, '0')}`;
      easeRunner.setAttribute('cx', String(12 + 176 * clamped));
      easeRunner.setAttribute('cy', String(88 - 76 * easingAt(clamped, styles[phraseIndex].points)));
    }

    function animateProgress(now) {
      renderProgress((now - cycleStarted) / phraseDuration);
      if (now - cycleStarted < phraseDuration && visible && !document.hidden) {
        progressFrame = requestAnimationFrame(animateProgress);
      }
    }

    function renderPhrase() {
      const [first, second, accentFrom] = phrases[phraseIndex];
      const fragment = document.createDocumentFragment();
      let wordIndex = 0;
      [first, second].forEach((lineText, lineIndex) => {
        const line = document.createElement('span');
        line.className = 'motion-line';
        lineText.split(' ').forEach((wordText, index) => {
          const word = document.createElement('span');
          word.className = 'motion-word';
          if (lineIndex === 1 && index >= accentFrom) word.classList.add('motion-accent');
          word.style.setProperty('--word-index', wordIndex++);
          word.textContent = wordText;
          line.append(word, document.createTextNode(' '));
        });
        fragment.append(line);
      });
      headline.replaceChildren(fragment);
      headline.setAttribute('aria-label', `${first} ${second}`);
      if (counter) counter.textContent = `${String(phraseIndex + 1).padStart(2, '0')} / ${String(phrases.length).padStart(2, '0')}`;
      renderEasing();
      renderProgress(0);
    }

    function schedulePhrase() {
      clearTimeout(rotationTimer);
      cancelAnimationFrame(progressFrame);
      const playing = visible && !document.hidden && !prefersReducedMotion.matches;
      if (liveIndicator) liveIndicator.textContent = playing ? 'PLAYING' : 'READY';
      if (liveIndicator) liveIndicator.classList.toggle('is-playing', playing);
      if (playing) {
        cycleStarted = performance.now();
        renderProgress(0);
        progressFrame = requestAnimationFrame(animateProgress);
        rotationTimer = setTimeout(changePhrase, phraseDuration);
      }
    }

    function changePhrase() {
      clearTimeout(rotationTimer);
      cancelAnimationFrame(progressFrame);
      if (changing) return;
      changing = true;
      motionStage.classList.remove('is-entering');
      motionStage.classList.add('is-leaving');
      setTimeout(() => {
        phraseIndex = (phraseIndex + 1) % phrases.length;
        motionStage.dataset.style = styles[phraseIndex].style;
        renderPhrase();
        motionStage.classList.remove('is-leaving');
        motionStage.classList.add('is-entering');
        changing = false;
        schedulePhrase();
      }, prefersReducedMotion.matches ? 0 : 300);
    }

    remixButton.addEventListener('click', changePhrase);
    renderEasing();
    motionStage.addEventListener('click', event => {
      if (!event.target.closest('a, button')) changePhrase();
    });
    document.addEventListener('visibilitychange', schedulePhrase);
    if ('IntersectionObserver' in window) {
      const motionObserver = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (visible && !prefersReducedMotion.matches) motionStage.classList.add('is-entering');
        schedulePhrase();
      }, { threshold: 0.25 });
      motionObserver.observe(motionStage);
    } else {
      visible = true;
      schedulePhrase();
    }
  }

  const dialog = document.getElementById('film-dialog');
  const player = document.getElementById('film-player');
  const closeButton = document.getElementById('film-close');
  const allTriggers = [...document.querySelectorAll('.media-trigger[data-video]')];
  const filmItems = [...document.querySelectorAll('.archive-card[data-video]')].map(el => el.dataset);
  let filmIndex = 0;
  let returnFocus = null;

  function syncPreview(video, shouldPlay) {
    if (dialog.getAttribute('aria-hidden') === 'false' || !shouldPlay || prefersReducedMotion.matches) {
      video.pause();
      video.parentElement.classList.remove('is-playing');
      return;
    }
    if (!video.src) video.src = video.dataset.src;
    video.play().then(() => video.parentElement.classList.add('is-playing')).catch(() => {});
  }
  if ('IntersectionObserver' in window) {
    const previewObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => syncPreview(entry.target, entry.isIntersecting));
    }, { threshold: 0.45, rootMargin: '0px 0px 100px 0px' });
    previewVideos.forEach(video => previewObserver.observe(video));
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) previewVideos.forEach(video => video.pause());
  });

  function showFilm(index) {
    filmIndex = (index + filmItems.length) % filmItems.length;
    const item = filmItems[filmIndex];
    player.pause();
    player.src = item.video;
    player.load();
    document.getElementById('film-index').textContent = `FRAME ${String(filmIndex + 1).padStart(2, '0')} / ${String(filmItems.length).padStart(2, '0')}`;
    document.getElementById('film-category').textContent = item.category || 'Motion film';
    document.getElementById('film-title').textContent = item.title || 'Project film';
    document.getElementById('film-description').textContent = item.description || '';
    document.getElementById('film-brief').textContent = item.brief || '';
    document.getElementById('film-approach').textContent = item.approach || '';
    player.play().catch(() => {});
  }
  function openFilm(trigger) {
    returnFocus = trigger;
    filmIndex = filmItems.findIndex(item => item.video === trigger.dataset.video);
    if (filmIndex < 0) return;
    previewVideos.forEach(video => video.pause());
    dialog.setAttribute('aria-hidden', 'false');
    document.body.classList.add('dialog-open');
    showFilm(filmIndex);
    closeButton.focus();
  }
  function closeFilm() {
    if (dialog.getAttribute('aria-hidden') === 'true') return;
    dialog.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('dialog-open');
    player.pause();
    player.removeAttribute('src');
    player.load();
    if (returnFocus) returnFocus.focus();
    previewVideos.forEach(video => {
      const rect = video.getBoundingClientRect();
      syncPreview(video, rect.top < window.innerHeight * .65 && rect.bottom > window.innerHeight * .35);
    });
  }
  allTriggers.forEach(trigger => trigger.addEventListener('click', event => {
    event.preventDefault();
    openFilm(trigger);
  }));
  closeButton.addEventListener('click', closeFilm);
  document.querySelector('[data-close-dialog]').addEventListener('click', closeFilm);
  document.getElementById('film-prev').addEventListener('click', () => showFilm(filmIndex - 1));
  document.getElementById('film-next').addEventListener('click', () => showFilm(filmIndex + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); closeFilm(); }
    if (event.key === 'ArrowLeft' && event.target !== player) { event.preventDefault(); showFilm(filmIndex - 1); }
    if (event.key === 'ArrowRight' && event.target !== player) { event.preventDefault(); showFilm(filmIndex + 1); }
    if (event.key === 'Tab') {
      const controls = [...dialog.querySelectorAll('button, video[controls]')].filter(el => el.getClientRects().length);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  const archiveCards = [...document.querySelectorAll('.archive-card')];
  const archiveGrid = document.getElementById('archive-grid');
  const archiveSequencer = document.querySelector('.archive-sequencer');
  const archiveSequenceTrack = document.getElementById('archive-sequencer-track');
  const archiveSequenceStatus = document.getElementById('archive-sequence-status');
  let archiveSequenceTicks = [];
  let archiveScrollPending = false;

  archiveCards.forEach((card, index) => {
    const head = document.createElement('span');
    head.className = 'archive-card-head';
    const frame = document.createElement('span');
    frame.className = 'archive-card-frame';
    frame.textContent = `KEYFRAME ${String(index + 1).padStart(2, '0')} / ${String(archiveCards.length).padStart(2, '0')}`;
    const duration = document.createElement('span');
    const seconds = Math.round(Number(card.dataset.duration));
    duration.textContent = `DURATION ${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    head.append(frame, duration);
    card.prepend(head);
  });

  function updateArchiveSequence() {
    const visibleCards = archiveCards.filter(card => !card.hidden);
    const count = visibleCards.length;
    if (!count) {
      archiveSequenceStatus.textContent = 'NO FRAMES FOUND';
      archiveSequencer.style.setProperty('--sequence-progress', '0%');
      archiveCards.forEach(card => card.classList.remove('is-current'));
      return;
    }
    const rect = archiveGrid.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (window.innerHeight * .5 - rect.top) / Math.max(1, rect.height)));
    const activeIndex = Math.min(count - 1, Math.floor(progress * count));
    archiveSequencer.style.setProperty('--sequence-progress', `${(progress * 100).toFixed(2)}%`);
    archiveSequenceStatus.textContent = `FRAME ${String(activeIndex + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`;
    archiveSequenceTicks.forEach((tick, index) => tick.classList.toggle('is-current', index === activeIndex));
    archiveCards.forEach(card => card.classList.toggle('is-current', card === visibleCards[activeIndex]));
  }

  function rebuildArchiveSequence() {
    const count = archiveCards.filter(card => !card.hidden).length;
    archiveSequenceTicks = Array.from({ length: count }, () => {
      const tick = document.createElement('span');
      tick.className = 'archive-sequencer-tick';
      return tick;
    });
    archiveSequenceTrack.replaceChildren(Object.assign(document.createElement('span'), { className: 'archive-sequencer-progress' }), ...archiveSequenceTicks);
    updateArchiveSequence();
  }

  window.addEventListener('scroll', () => {
    if (archiveScrollPending) return;
    archiveScrollPending = true;
    requestAnimationFrame(() => { updateArchiveSequence(); archiveScrollPending = false; });
  }, { passive: true });
  window.addEventListener('resize', updateArchiveSequence);
  rebuildArchiveSequence();
  if ('IntersectionObserver' in window) {
    const cardObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px 80px 0px' });
    archiveCards.forEach(card => cardObserver.observe(card));
  } else {
    archiveCards.forEach(card => card.classList.add('is-visible'));
  }
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const archiveSearch = document.getElementById('archive-search');
  document.getElementById('archive-count').textContent = archiveCards.length;
  let activeFilter = 'All';
  function filterArchive() {
    const term = archiveSearch.value.trim().toLowerCase();
    let shown = 0;
    archiveCards.forEach(card => {
      const matches = (activeFilter === 'All' || card.dataset.filterCategory === activeFilter) && card.dataset.search.includes(term);
      card.hidden = !matches;
      if (matches) shown++;
    });
    document.getElementById('archive-empty').hidden = shown !== 0;
    rebuildArchiveSequence();
  }
  filterButtons.forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    filterArchive();
  }));
  archiveSearch.addEventListener('input', filterArchive);

})();

