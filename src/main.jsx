
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Heart,
  MapPin,
  Volume2,
  VolumeX,
  Flower2,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 155;

const FRAME_URL = (number) =>
  `/wedding-frames/ezgif-frame-${String(number).padStart(3, '0')}.png`;

const photos = Array.from(
  { length: 16 },
  (_, i) => `${import.meta.env.BASE_URL}images/img${i + 1}.jpg`
);

const wedding = {
  groom: 'Rahul Krishnan',
  bride: 'Sruthi Chandran',
  date: 'Thursday, 03 December 2026',
  dateShort: '03 · 12 · 2026',
  time: 'Muhurtham Between : 11:35 to 11:50 am',
  venue: 'Kulanada Devi Temple',
  location: 'Kulanada, Pathanamthitta, Kerala',
  map: 'https://www.google.com/maps/search/?api=1&query=Kulanada+Devi+Temple+Kerala',
};

function App() {
  const [opened, setOpened] = useState(false);
  const [muted, setMuted] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, complete: false });

  // Live countdown to the wedding muhurtham (Kerala / India time, UTC+05:30).
  useEffect(() => {
    const weddingMoment = new Date('2026-12-03T11:35:00+05:30').getTime();

    const updateCountdown = () => {
      const difference = weddingMoment - Date.now();

      if (difference <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, complete: true });
        return;
      }

      setCountdown({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        complete: false,
      });
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const audioRef = useRef(null);
  const heroRef = useRef(null);

  // Cinematic finale refs
  const filmSectionRef = useRef(null);
  const filmCanvasRef = useRef(null);
  const filmIntroRef = useRef(null);
  const saveDateRef = useRef(null);
  const filmMessageRef = useRef(null);

  // Prevent the browser from restoring a previous scroll position.
  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });

    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  // Reveal effects and magnetic buttons
  useEffect(() => {
    const nodes = document.querySelectorAll('[data-reveal]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -6% 0px',
      }
    );

    nodes.forEach((node) => observer.observe(node));

    const magnets = document.querySelectorAll('.magnetic');

    const handleMove = (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const offsetX = event.clientX - (rect.left + rect.width / 2);
      const offsetY = event.clientY - (rect.top + rect.height / 2);

      event.currentTarget.style.setProperty('--tx', `${offsetX * 0.12}px`);
      event.currentTarget.style.setProperty('--ty', `${offsetY * 0.12}px`);
      event.currentTarget.style.setProperty(
        '--rx',
        `${(-offsetY / 18).toFixed(2)}deg`
      );
      event.currentTarget.style.setProperty(
        '--ry',
        `${(offsetX / 18).toFixed(2)}deg`
      );
    };

    const handleLeave = (event) => {
      event.currentTarget.style.setProperty('--tx', '0px');
      event.currentTarget.style.setProperty('--ty', '0px');
      event.currentTarget.style.setProperty('--rx', '0deg');
      event.currentTarget.style.setProperty('--ry', '0deg');
    };

    magnets.forEach((node) => {
      node.addEventListener('pointermove', handleMove);
      node.addEventListener('pointerleave', handleLeave);
    });

    return () => {
      observer.disconnect();

      magnets.forEach((node) => {
        node.removeEventListener('pointermove', handleMove);
        node.removeEventListener('pointerleave', handleLeave);
      });
    };
  }, [opened]);

  // Cinematic frame-by-frame scroll animation
  useEffect(() => {
    if (
      !opened ||
      !filmSectionRef.current ||
      !filmCanvasRef.current
    ) {
      return;
    }

    const section = filmSectionRef.current;
    const canvas = filmCanvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    let images = [];
    let disposed = false;

    const playhead = { frame: 0 };

    const drawCurrentFrame = () => {
      if (disposed) return;

      const requestedIndex = Math.max(
        0,
        Math.min(FRAME_COUNT - 1, Math.round(playhead.frame))
      );

      let image = images[requestedIndex];

      // Find the nearest loaded frame if the requested frame isn't ready.
      if (!image?.complete || !image.naturalWidth) {
        image = null;

        for (let distance = 1; distance < FRAME_COUNT; distance++) {
          const before = images[requestedIndex - distance];
          const after = images[requestedIndex + distance];

          if (before?.complete && before.naturalWidth) {
            image = before;
            break;
          }

          if (after?.complete && after.naturalWidth) {
            image = after;
            break;
          }
        }
      }

      if (!image?.naturalWidth) return;

      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = rect.width;
      const height = rect.height;

      const targetWidth = Math.round(width * dpr);
      const targetHeight = Math.round(height * dpr);

      if (
        canvas.width !== targetWidth ||
        canvas.height !== targetHeight
      ) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Cover-fit without stretching the image.
      const scale = Math.max(
        width / image.naturalWidth,
        height / image.naturalHeight
      );

      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;

      ctx.drawImage(
        image,
        (width - drawWidth) / 2,
        (height - drawHeight) / 2,
        drawWidth,
        drawHeight
      );
    };

    const resizeCanvas = () => drawCurrentFrame();

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);

    window.addEventListener('resize', resizeCanvas);

    // Preload all cinematic frames.
    images = Array.from({ length: FRAME_COUNT }, (_, index) => {
      const image = new Image();
      image.decoding = 'async';

      image.onload = () => {
        if (disposed) return;

        if (
          index === 0 ||
          Math.round(playhead.frame) === index
        ) {
          drawCurrentFrame();
        }

        if (index === FRAME_COUNT - 1) {
          ScrollTrigger.refresh();
        }
      };

      image.src = FRAME_URL(index + 1);
      return image;
    });

    drawCurrentFrame();

    const timeline = gsap.timeline({
  scrollTrigger: {
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.5,
    invalidateOnRefresh: true,
  },
});

    // Scrolling controls the image frame.
    timeline.to(
      playhead,
      {
        frame: FRAME_COUNT - 1,
        duration: 1,
        ease: 'none',
        onUpdate: drawCurrentFrame,
      },
      0
    );

    // Hide the opening instruction.
    if (filmIntroRef.current) {
      timeline.to(
        filmIntroRef.current,
        {
          autoAlpha: 0,
          y: -12,
          duration: 0.08,
          ease: 'power1.out',
        },
        0.18
      );
    }

    // Reveal SAVE THE DATE as the hands meet.
    if (saveDateRef.current) {
      timeline.fromTo(
        saveDateRef.current,
        {
          autoAlpha: 0,
          y: 25,
          scale: 0.97,
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.12,
          ease: 'power2.out',
        },
        0.76
      );
    }

    // Reveal the final romantic message.
    if (filmMessageRef.current) {
      timeline.fromTo(
        filmMessageRef.current,
        {
          autoAlpha: 0,
          y: 14,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.08,
          ease: 'power2.out',
        },
        0.89
      );
    }

    ScrollTrigger.refresh();

    return () => {
      disposed = true;

      timeline.scrollTrigger?.kill();
      timeline.kill();

      resizeObserver.disconnect();
      window.removeEventListener('resize', resizeCanvas);

      images.forEach((image) => {
        image.onload = null;
      });
    };
  }, [opened]);

  // OPEN INVITATION: reset scroll and animate the curtain away.
  const openInvitation = () => {
    if (opened) return;

    // Immediately reset any saved scroll position.
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });

    setOpened(true);

    // Reset once React has applied the opened state.
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
    });

    // Let the curtain animation finish before enabling the page.
    window.setTimeout(() => {
      document.body.classList.add('invitation-open');

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });

      ScrollTrigger.refresh();
    }, 1150);
  };

  const toggleMusic = async () => {
    if (!audioRef.current) return;

    if (muted) {
      try {
        await audioRef.current.play();
        setMuted(false);
      } catch {
        setMuted(true);
      }
    } else {
      audioRef.current.pause();
      setMuted(true);
    }
  };

  const goTo = (id) => {
    setMenuOpen(false);

    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <>
      <audio
        ref={audioRef}
        loop
        src="/music/soft-wedding-music.mp3"
      />

      {/* Opening invitation curtain */}
      <div
        className={`curtain-intro ${
          opened ? 'curtain-intro--open' : ''
        }`}
        ref={heroRef}
      >
        <div className="curtain-image" />
        <div className="curtain-shade" />
        <div className="curtain-fold curtain-fold--left" />
        <div className="curtain-fold curtain-fold--right" />

        <div className="intro-content">
          <div className="intro-ornament">
            <Flower2 size={22} strokeWidth={1.2} />
            <span>WITH JOY IN OUR HEARTS</span>
            <Flower2 size={22} strokeWidth={1.2} />
          </div>

          <p className="intro-kicker">A CELEBRATION OF LOVE</p>

          <h1 className="intro-title">
            <span>Two hearts.</span>
            <br />
            <em>One forever.</em>
          </h1>

          <div className="intro-names">
            {wedding.groom.split(' ')[0]}{' '}
            <span>&</span>{' '}
            {wedding.bride.split(' ')[0]}
          </div>

          <p className="intro-date">{wedding.dateShort}</p>

          <button
            className="open-button magnetic lux-button"
            onClick={openInvitation}
            disabled={opened}
          >
            <span>
              {opened ? 'WELCOME' : 'OPEN YOUR INVITATION'}
            </span>
            <ArrowUpRight size={16} />
          </button>

          <p className="intro-hint">
            <span className="hint-line" />
            TAP TO UNVEIL OUR STORY
            <span className="hint-line" />
          </p>
        </div>

        <div className="intro-bottom">
          <span>AN INVITATION TO CELEBRATE</span>
          <span>KERALA · INDIA</span>
        </div>
      </div>

      <main className={`site ${opened ? 'site--active' : ''}`}>
        <header className="topbar">
          <button
            className="monogram"
            onClick={() => goTo('home')}
            aria-label="Back to top"
          >
            R<span>&</span>S
          </button>

          <nav className={menuOpen ? 'nav nav--open' : 'nav'}>
            {[
              ['Our Story', 'story'],
              ['The Details', 'details'],
              ['Gallery', 'gallery'],
              ['Venue', 'venue'],
            ].map(([label, id]) => (
              <button key={id} onClick={() => goTo(id)}>
                {label}
              </button>
            ))}
          </nav>

          <div className="top-actions">
            

            <button
              className="menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </header>

        {/* Cinematic finale — last section */}
        <section
          className="wedding-film"
          id="film-finale"
          ref={filmSectionRef}
          aria-label="Rahul and Sruthi's cinematic save the date"
        >
          <div className="wedding-film__stage">
            <canvas
              ref={filmCanvasRef}
              className="wedding-film__canvas"
              aria-label="Cinematic sequence of two hands coming together"
            />

            <div className="wedding-film__shade" />

            <div
              className="wedding-film__intro"
              ref={filmIntroRef}
            >
              <span className="film-intro-line" />
              <p>A MOMENT THAT CHANGES EVERYTHING</p>
              <span className="film-intro-hint">
                SCROLL SLOWLY TO REVEAL OUR FOREVER
                <span className="film-scroll-arrow">↓</span>
              </span>
            </div>

            <div
              className="wedding-film__save-date"
              ref={saveDateRef}
            >
              <span className="film-eyebrow">
                THE BEGINNING OF FOREVER
              </span>

              <h2>
                SAVE THE
                <br />
                <em>DATE</em>
              </h2>

              <div className="film-divider">
                <span />
                <Heart size={14} />
                <span />
              </div>

              <p className="film-couple-names">
                RAHUL <i>&</i> SRUTHI
              </p>

              <span className="film-date">
                {wedding.dateShort}
              </span>

              
            </div>

            <div
              className="wedding-film__message"
              ref={filmMessageRef}
            >
              <span className="film-message-ornament">✳</span>
              
              <span className="film-message-small">
                WITH THE BLESSINGS OF OUR FAMILIES
              </span>
            </div>

            <div className="wedding-film__bottom">
              <span>RAHUL & SRUTHI</span>
              <span>03 December 2026</span>
            </div>
          </div>
        </section>

        {/* Hero */}
        <section className="hero section-wrap" id="home">
          <div className="hero-copy" data-reveal>
            <p className="eyebrow">
              <span />
              THE BEGINNING OF FOREVER
              <span />
            </p>

            <h2 className="lux-title">
              With love,
              <br />
              we invite you to
              <br />
              <em className="metallic-text" data-text="our forever.">
                our forever.
              </em>
            </h2>

            <p className="hero-description">
              Some stories are written in the stars. Ours brought
              us here — to a day filled with blessings, laughter,
              and the people we love most.
            </p>

            <button
              className="text-link magnetic"
              onClick={() => goTo('details')}
            >
              DISCOVER THE DETAILS <ArrowDown size={16} />
            </button>
          </div>

          <div className="hero-visual ambient-wrap" data-reveal>
            <div className="ambient-layer" aria-hidden="true">
              <span className="sparkle" />
              <span className="sparkle" />
              <span className="sparkle" />
              <span className="petal" />
              <span className="petal" />
              <span className="orb" />
            </div>

            <div className="hero-photo-frame magnetic">
              <img
                src={photos[0]}
                alt="Rahul and Sruthi — wedding portrait"
              />
              <div className="photo-overlay" />
            </div>

            <div className="hero-photo-label">
              <span>R</span>
              <i />
              <span>S</span>
              <small>EST. 2026</small>
            </div>

            <div className="vertical-note">
              A LOVE STORY IN BLOOM · 03.12.2026
            </div>

            <div className="floating-seal pulse-heartbeat">
              <Heart size={18} />
              <span>
                FOREVER
                <br />
                STARTS HERE
              </span>
            </div>
          </div>

          <div className="hero-foot">
            <span>01 / A NEW CHAPTER</span>
            <span>SCROLL TO EXPLORE ↓</span>
          </div>
        </section>

        {/* Quote */}
        <section className="quote-section" id="story">
          <div className="quote-flower flower-one">✳</div>
          <div className="quote-flower flower-two">✳</div>

          <div className="quote-inner" data-reveal>
            <span className="quote-mark">“</span>
            <p>
              And suddenly, all the love songs
              <br />
              made sense.
            </p>
            <span className="quote-byline">
              OUR STORY · OUR FOREVER
            </span>
          </div>
        </section>

        {/* Couple story */}
        <section className="story-section section-wrap">
          <div className="section-heading" data-reveal>
            <p className="eyebrow">A LITTLE ABOUT US</p>
            <h2>
              Two paths, one <em>beautiful journey.</em>
            </h2>
          </div>

          <div className="couple-grid">

            <article
              className="person-card person-card--bride"
              data-reveal
            >
              <div className="person-photo">
                <img src={photos[2]} alt="Bride portrait" />
                <span className="photo-index">02</span>
              </div>

              <div className="person-info">
  <span className="person-role">THE BRIDE</span>
  <h3>{wedding.bride}</h3>
  <p>
    D/o. Sri Chandrasekharan Pillai (Late) <br />
    Smt. Sobha M.K <br />
    Ullannoor P.O Kulanada <br />
    Ph. 9744985167
  </p>

  <a
    className="person-signature"
    href="https://www.instagram.com/sru.t.hy_/"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Follow Sruthi on Instagram"
  >
    Sruthi
  </a>
</div>
            </article>

            <div className="between-hearts" data-reveal>
              <span />
              <Heart size={25} strokeWidth={1.2} />
              <span />
            </div>

            <article
              className="person-card person-card--groom"
              data-reveal
            >
              <div className="person-photo">
                <img src={photos[15]} alt="Groom portrait" />
                <span className="photo-index">01</span>
              </div>

              <div className="person-info">
                <span className="person-role">THE GROOM</span>
                <h3>{wedding.groom}</h3>
                <p>
                  S/o. Mr. Sreekumar M.G.(Late) <br /> Mrs. Sujakumari S <br /> Maniyattethil, Ullannoor P.O Kulanada
                </p>
                <span className="person-signature">Rahul</span>
              </div>
            </article>

            <div className="between-hearts" data-reveal>
              <span />
              <Heart size={25} strokeWidth={1.2} />
              <span />
            </div>

            
          </div>

          <p className="story-note" data-reveal>
            <Sparkles size={16} />
            Two families, countless blessings, and a lifetime of
            memories waiting to happen.
          </p>
        </section>

        {/* Wedding details */}
        <section className="details-section" id="details">
          <div className="details-bg" />

          <div className="details-inner section-wrap">
            <div
              className="section-heading section-heading--light"
              data-reveal
            >
              <p className="eyebrow">SAVE THE DATE</p>
              <h2>
                The day our <em>forever begins.</em>
              </h2>
              <p>
                We would be honoured to have you with us as we
                begin this beautiful new chapter.
              </p>
            </div>

            <div className="countdown-block" data-reveal aria-live="polite">
              <p className="countdown-eyebrow">COUNTING DOWN TO OUR FOREVER</p>
              <h3 className="countdown-heading">Until we say <em>“I do”</em></h3>
              {countdown.complete ? (
                <p className="countdown-complete">Today is the day we begin our forever. We can’t wait to celebrate with you.</p>
              ) : (
                <div className="countdown-grid">
                  {[
                    ['DAYS', countdown.days],
                    ['HOURS', countdown.hours],
                    ['MINUTES', countdown.minutes],
                    ['SECONDS', countdown.seconds],
                  ].map(([label, value]) => (
                    <div className="countdown-unit" key={label}>
                      <strong>{String(value).padStart(2, '0')}</strong>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="countdown-note">03 December 2026 · Muhurtham at 11:35 AM</p>
            </div>

            <div className="date-card" data-reveal>
              <div className="date-side">
                <span className="date-small">THURSDAY</span>
                <strong>03</strong>
                <span className="date-month">DECEMBER · 2026</span>
                <span className="date-divider" />
                <span className="date-year">A DAY TO REMEMBER</span>
              </div>

              <div className="date-info">
                <div className="detail-line">
                  <span className="detail-icon">
                    <CalendarDays size={19} />
                  </span>
                  <div>
                    <small>THE DATE</small>
                    <strong>{wedding.date}</strong>
                  </div>
                </div>

                <div className="detail-line">
                  <span className="detail-icon">
                    <Clock3 size={19} />
                  </span>
                  <div>
                    <small>THE TIME</small>
                    <strong>{wedding.time}</strong>
                  </div>
                </div>

                <div className="detail-line">
                  <span className="detail-icon">
                    <MapPin size={19} />
                  </span>
                  <div>
                    <small>THE PLACE</small>
                    <strong>{wedding.venue}</strong>
                    <span>{wedding.location}</span>
                  </div>
                </div>

                <a
                  className="map-button magnetic"
                  href={wedding.map}
                  target="_blank"
                  rel="noreferrer"
                >
                  GET DIRECTIONS <ArrowUpRight size={16} />
                </a>
              </div>
            </div>

            <div className="details-foot" data-reveal>
              <span>YOUR PRESENCE IS OUR PRESENT</span>
              <span>WITH LOVE, RAHUL & SRUTHI</span>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="gallery-section section-wrap" id="gallery">
          <div className="gallery-heading" data-reveal>
            <div>
              <p className="eyebrow">LITTLE MOMENTS, BIG LOVE</p>
              <h2>
                Frames from <em>our story.</em>
              </h2>
            </div>

            <p>
              A few moments we hold close — and a thousand more
              we can’t wait to make.
            </p>
          </div>

          <div className="photo-grid">
            {photos.slice(3).map((src, i) => (
              <button
                className={`gallery-photo gallery-photo--${i % 6}`}
                key={src}
                onClick={() => setActivePhoto(src)}
                data-reveal
                aria-label={`Open memory ${i + 4}`}
              >
                <img
                  src={src}
                  alt={`Rahul and Sruthi memory ${i + 4}`}
                  loading="lazy"
                />
                <span className="gallery-zoom">
                  <ArrowUpRight size={18} />
                </span>
                <span className="gallery-number">
                  {String(i + 4).padStart(2, '0')}
                </span>
              </button>
            ))}
          </div>

          <p className="gallery-caption" data-reveal>
            <span>✳</span>
            THE BEST IS YET TO COME
            <span>✳</span>
          </p>
        </section>

        {/* Venue */}
        <section className="venue-section" id="venue">
          <div className="venue-image" data-reveal>
            <img
              src={photos[3]}
              alt="A beautiful moment from the couple's story"
            />
            <div className="venue-image-caption">
              A BLESSING FOR OUR BEGINNING
            </div>
          </div>

          <div className="venue-copy" data-reveal>
            <p className="eyebrow">WHERE WE SAY “I DO”</p>

            <h2>
              A sacred place.
              <br />
              <em>A beautiful beginning.</em>
            </h2>

            <p>
              With the blessings of the divine and our beloved families, we warmly invite you to join us as we begin our journey of togetherness.
               It would mean the world to us to have you by our side on this special morning as we celebrate the beginning of our forever.
            </p>

            <div className="venue-address">
              <MapPin size={20} />
              <div>
                <strong>{wedding.venue}</strong>
                <span>{wedding.location}</span>
              </div>
            </div>

            <a
              className="venue-link magnetic"
              href={wedding.map}
              target="_blank"
              rel="noreferrer"
            >
              FIND THE TEMPLE <ArrowUpRight size={16} />
            </a>

            <div className="venue-doodle sway">
              R <span>&</span> S
            </div>
          </div>
        </section>

        {/* Closing invitation */}
        <section className="closing-section">
          <div className="closing-ornament">
            <Flower2 size={23} />
            <span>WITH ALL OUR LOVE</span>
            <Flower2 size={23} />
          </div>

          <p className="closing-small">
            THE NEXT CHAPTER STARTS WITH YOU
          </p>

          <h2>
            Come celebrate
            <br />
            <em>our forever.</em>
          </h2>

          <p className="closing-names">
            {wedding.groom} <span>&</span> {wedding.bride}
          </p>

          <p className="closing-date">
            {wedding.date} · {wedding.time}
          </p>

          <a
            className="closing-button magnetic lux-button"
            href={wedding.map}
            target="_blank"
            rel="noreferrer"
          >
            JOIN US AT THE TEMPLE <ArrowUpRight size={16} />
          </a>

          <div className="closing-bottom">
            <span>MADE WITH LOVE</span>
            <Heart size={14} fill="currentColor" />
            <span>FOREVER & ALWAYS</span>
          </div>
        </section>

        

        
      </main>

      {/* Image lightbox */}
      {activePhoto && (
        <div
          className="lightbox"
          onClick={() => setActivePhoto(null)}
          role="presentation"
        >
          <button
            className="lightbox-close"
            onClick={() => setActivePhoto(null)}
            aria-label="Close image"
          >
            <X />
          </button>

          <img
            src={activePhoto}
            alt="Selected wedding memory"
            onClick={(event) => event.stopPropagation()}
          />

          <span>RAHUL & SRUTHI · A MOMENT TO KEEP</span>
        </div>

        
      )}
<footer className="footer">
  <button
    className="monogram"
    onClick={() => goTo('home')}
  >
    R<span>&</span>S
  </button>

  <p>Thank you for being part of our story.</p>

  <button
    className="back-top"
    onClick={() => goTo('home')}
  >
    BACK TO TOP ↑
  </button>

  <div className="footer-credit">
    <span>CRAFTED WITH CARE BY </span>
      
    <a
  href="https://www.instagram.com/leaf2.logic/"
  target="_blank"
  rel="noopener noreferrer"
>
  LEAF <span>2</span> LOGIC
</a>
  </div>
</footer>
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
