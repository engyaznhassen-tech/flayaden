"use client";

import {
  ArrowLeft,
  ArrowUpLeft,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  Headphones,
  MapPin,
  Menu,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

const navigation = [
  { label: "الرئيسية", href: "#home" },
  { label: "احجز رحلتك", href: "#booking" },
  { label: "مسار الرحلة", href: "#routes" },
  { label: "الوجهات", href: "#destinations" },
  { label: "خدماتنا", href: "#services" },
];

const destinations = [
  {
    city: "القاهرة",
    country: "مصر",
    code: "CAI",
    image: "/assets/destination-cairo.webp",
    imageAlt: "نهر النيل وأفق مدينة القاهرة",
    landmark: "على ضفاف النيل",
    duration: "03:30",
    departure: "08:30",
    arrival: "12:00",
    gate: "A2",
    flight: "FA 201",
    tone: "cairo",
    path: "M144 427C238 348 350 347 478 286",
  },
  {
    city: "جدة",
    country: "السعودية",
    code: "JED",
    image: "/assets/destination-jeddah.webp",
    imageAlt: "واجهة جدة البحرية على البحر الأحمر",
    landmark: "واجهة البحر الأحمر",
    duration: "02:10",
    departure: "10:20",
    arrival: "12:30",
    gate: "B4",
    flight: "FA 203",
    tone: "jeddah",
    path: "M144 427C295 376 481 354 612 260C660 226 687 210 725 193",
  },
  {
    city: "عمّان",
    country: "الأردن",
    code: "AMM",
    image: "/assets/destination-amman.webp",
    imageAlt: "إطلالة بانورامية على مدينة عمّان من القلعة",
    landmark: "إطلالة من القلعة",
    duration: "03:00",
    departure: "14:15",
    arrival: "17:15",
    gate: "C1",
    flight: "FA 205",
    tone: "amman",
    path: "M144 427C310 336 467 342 592 244C714 148 805 181 906 104",
  },
];

const cityCodes: Record<string, string> = {
  عدن: "ADE",
  القاهرة: "CAI",
  جدة: "JED",
  عمّان: "AMM",
};

const services = [
  {
    icon: PlaneTakeoff,
    number: "01",
    title: "رحلات منتظمة",
    text: "رحلات للركاب بتجربة سهلة تبدأ من الحجز وتستمر حتى الوصول.",
  },
  {
    icon: Compass,
    number: "02",
    title: "الحج والعمرة",
    text: "خدمة مخصصة لرحلات المناسك تراعي الراحة والتنظيم في كل خطوة.",
  },
  {
    icon: ShieldCheck,
    number: "03",
    title: "رحلات طبية",
    text: "تنسيق مرن للرحلات العلاجية مع عناية أكبر باحتياجات المسافر.",
  },
  {
    icon: Sparkles,
    number: "04",
    title: "رحلات خاصة",
    text: "خيارات سفر خاصة للشركات والمجموعات وفق متطلبات الرحلة.",
  },
];

type SearchState = "idle" | "loading" | "ready" | "error";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function Home() {
  const planeRef = useRef<HTMLDivElement>(null);
  const takeoffShadowRef = useRef<HTMLSpanElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const routePathRef = useRef<SVGPathElement>(null);
  const landingRef = useRef<HTMLElement>(null);
  const landingPlaneRef = useRef<HTMLDivElement>(null);
  const landingShadowRef = useRef<HTMLSpanElement>(null);
  const altitudeValueRef = useRef<HTMLElement>(null);
  const searchTimerRef = useRef<number | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [flightStage, setFlightStage] = useState("جاهزة للإقلاع");
  const [tripType, setTripType] = useState<"round" | "oneway">("round");
  const [from, setFrom] = useState("عدن");
  const [to, setTo] = useState("القاهرة");
  const [departDate, setDepartDate] = useState("2026-08-15");
  const [passengers, setPassengers] = useState("1");
  const [searchState, setSearchState] = useState<SearchState>("idle");

  const routeCity = from === "عدن" ? to : from;
  const selectedDestination =
    destinations.find((destination) => destination.city === routeCity) ??
    destinations[0];
  const formattedDate = new Intl.DateTimeFormat("ar-YE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${departDate}T12:00:00`));

  useEffect(() => {
    let frame = 0;
    let previousScrolled = false;
    let previousStage = "";
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const renderFlight = () => {
      frame = 0;
      const viewportHeight = Math.max(window.innerHeight, 1);
      const viewportWidth = window.innerWidth;
      const rawProgress = reduceMotion
        ? 0
        : clamp(window.scrollY / (viewportHeight * 2.15), 0, 1);
      const eased =
        rawProgress * rawProgress * (3 - 2 * rawProgress);
      const arc = Math.sin(rawProgress * Math.PI);
      const mobile = viewportWidth < 760;

      const x = (mobile ? -28 : -11) + eased * (mobile ? 91 : 84);
      const y =
        (mobile ? 45 : 40) -
        eased * (mobile ? 23 : 27) -
        arc * (mobile ? 20 : 30);
      const rotation = -2 - arc * 10 - rawProgress * 4;
      const scale =
        (mobile ? 0.78 : 1.02) - rawProgress * (mobile ? 0.35 : 0.5);
      const opacity =
        rawProgress < 0.9
          ? 1
          : clamp(1 - (rawProgress - 0.9) / 0.1, 0, 1);

      if (planeRef.current) {
        planeRef.current.style.transform = `translate3d(${x}vw, ${y}vh, 0) rotate(${rotation}deg) scale(${scale})`;
        planeRef.current.style.opacity = String(opacity);
        planeRef.current.style.setProperty(
          "--trail-opacity",
          String(clamp((rawProgress - 0.06) * 2.4, 0, 0.72)),
        );
      }

      if (takeoffShadowRef.current) {
        const shadowScale = 1 - eased * 0.72;
        takeoffShadowRef.current.style.transform = `translate3d(${x + (mobile ? 19 : 28)}vw, ${mobile ? 75 : 76}vh, 0) scale(${shadowScale})`;
        takeoffShadowRef.current.style.opacity = String(
          clamp(0.48 - rawProgress * 0.68, 0, 0.48),
        );
      }

      const routeProgress = clamp(
        (window.scrollY - viewportHeight * 0.48) /
          (viewportHeight * 1.18),
        0,
        1,
      );

      if (routePathRef.current) {
        routePathRef.current.style.strokeDashoffset = String(
          1000 * (1 - routeProgress),
        );
      }

      document.documentElement.style.setProperty(
        "--flight-progress",
        rawProgress.toFixed(4),
      );
      document.documentElement.style.setProperty(
        "--route-progress",
        routeProgress.toFixed(4),
      );

      if (sceneRef.current) {
        sceneRef.current.style.setProperty(
          "--scene-shift",
          `${Math.min(window.scrollY * 0.055, 32)}px`,
        );
      }

      const maxScroll = Math.max(
        document.documentElement.scrollHeight - viewportHeight,
        1,
      );
      const journeyProgress = reduceMotion
        ? 0
        : clamp(window.scrollY / maxScroll, 0, 1);
      const takeoffProgress = clamp(journeyProgress / 0.19, 0, 1);
      const descentProgress = clamp((journeyProgress - 0.72) / 0.28, 0, 1);
      const altitudeProgress =
        journeyProgress < 0.19
          ? takeoffProgress * takeoffProgress * (3 - 2 * takeoffProgress)
          : journeyProgress < 0.72
            ? 1
            : 1 -
              descentProgress *
                descentProgress *
                (3 - 2 * descentProgress);
      const altitude = Math.round((altitudeProgress * 32000) / 100) * 100;

      document.documentElement.style.setProperty(
        "--journey-progress",
        journeyProgress.toFixed(4),
      );
      document.documentElement.style.setProperty(
        "--altitude-progress",
        altitudeProgress.toFixed(4),
      );

      if (altitudeValueRef.current) {
        altitudeValueRef.current.textContent =
          altitude >= 1000
            ? `${(altitude / 1000).toFixed(altitude % 1000 ? 1 : 0)}K ft`
            : `${altitude} ft`;
      }

      if (landingRef.current) {
        const landingBounds = landingRef.current.getBoundingClientRect();
        const landingProgress = reduceMotion
          ? 1
          : clamp(
              (viewportHeight * 0.82 - landingBounds.top) /
                (landingBounds.height * 0.88),
              0,
              1,
            );
        const landingArc = Math.sin(landingProgress * Math.PI);
        const landingCenterX =
          (mobile ? 22 : 27) + landingProgress * (mobile ? 34 : 31);
        const landingY =
          landingBounds.height *
          ((mobile ? -0.035 : -0.06) +
            landingProgress * (mobile ? 0.575 : 0.55) -
            landingArc * (mobile ? 0.05 : 0.06));
        const landingRotation = -5 + landingProgress * 4.2;
        const landingScale =
          (mobile ? 0.4 : 0.46) + landingProgress * (mobile ? 0.22 : 0.26);

        landingRef.current.style.setProperty(
          "--landing-progress",
          landingProgress.toFixed(4),
        );

        if (landingPlaneRef.current) {
          landingPlaneRef.current.style.transform = `translate3d(calc(${landingCenterX}vw - 50%), ${landingY}px, 0) rotate(${landingRotation}deg) scale(${landingScale})`;
          landingPlaneRef.current.style.opacity = String(
            clamp(landingProgress * 4, 0, 1),
          );
        }

        if (landingShadowRef.current) {
          landingShadowRef.current.style.transform = `translate3d(calc(${landingCenterX}vw - 50%), ${landingBounds.height * (mobile ? 0.745 : 0.685)}px, 0) scale(${0.22 + landingProgress * 0.78})`;
          landingShadowRef.current.style.opacity = String(
            clamp((landingProgress - 0.38) * 0.85, 0, 0.5),
          );
        }
      }

      const nextScrolled = window.scrollY > 24;
      if (nextScrolled !== previousScrolled) {
        previousScrolled = nextScrolled;
        setScrolled(nextScrolled);
      }

      const nextStage =
        journeyProgress < 0.045
          ? "جاهزة للإقلاع"
          : journeyProgress < 0.24
            ? "تحلّق الآن"
            : journeyProgress < 0.72
              ? "على ارتفاع 32,000 قدم"
              : journeyProgress < 0.96
                ? "تبدأ مرحلة الهبوط"
                : "وصلت بأمان";

      if (nextStage !== previousStage) {
        previousStage = nextStage;
        setFlightStage(nextStage);
      }
    };

    const requestRender = () => {
      if (!frame) frame = window.requestAnimationFrame(renderFlight);
    };

    renderFlight();
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.16 },
    );

    document.querySelectorAll(".reveal").forEach((element) => {
      observer.observe(element);
    });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", requestRender);
      observer.disconnect();
      if (searchTimerRef.current) {
        window.clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const viewportHeight = Math.max(window.innerHeight, 1);
    const routeProgress = clamp(
      (window.scrollY - viewportHeight * 0.48) /
        (viewportHeight * 1.18),
      0,
      1,
    );
    if (routePathRef.current) {
      routePathRef.current.style.strokeDashoffset = String(
        1000 * (1 - routeProgress),
      );
    }
  }, [selectedDestination.code]);

  const handleScenePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!sceneRef.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    sceneRef.current.style.setProperty("--pointer-x", `${x * 12}px`);
    sceneRef.current.style.setProperty("--pointer-y", `${y * 9}px`);
  };

  const resetScenePointer = () => {
    sceneRef.current?.style.setProperty("--pointer-x", "0px");
    sceneRef.current?.style.setProperty("--pointer-y", "0px");
  };

  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const chooseDestination = (city: string) => {
    setFrom("عدن");
    setTo(city);
    setSearchState("idle");
    scrollToBooking();
  };

  const swapCities = () => {
    setFrom(to);
    setTo(from);
    setSearchState("idle");
  };

  const changeFrom = (city: string) => {
    setFrom(city);
    setSearchState("idle");
  };

  const changeTo = (city: string) => {
    setTo(city);
    setSearchState("idle");
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (from === to) {
      setSearchState("error");
      return;
    }
    setSearchState("loading");
    if (searchTimerRef.current) {
      window.clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = window.setTimeout(() => {
      setSearchState("ready");
    }, 900);
  };

  const resetSearch = () => {
    if (searchTimerRef.current) {
      window.clearTimeout(searchTimerRef.current);
    }
    setSearchState("idle");
  };

  const printBoardingPass = () => {
    window.print();
  };

  return (
    <main className="site-shell">
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <a className="brand" href="#home" aria-label="طيران عدن - الرئيسية">
          <Image
            src="/assets/flyaden-logo-white.png"
            alt="طيران عدن flyaden"
            width={1210}
            height={308}
            priority
            unoptimized
          />
        </a>

        <nav className="desktop-nav" aria-label="التنقل الرئيسي">
          {navigation.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button
            className="header-book-button"
            type="button"
            onClick={scrollToBooking}
          >
            احجز الآن
            <ArrowLeft aria-hidden="true" size={17} />
          </button>
          <button
            className="menu-button"
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>

        <div className={`mobile-panel ${menuOpen ? "is-open" : ""}`}>
          {navigation.map((item) => (
            <a
              href={item.href}
              key={item.href}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
              <ArrowUpLeft aria-hidden="true" size={18} />
            </a>
          ))}
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-ring hero-ring-one" aria-hidden="true" />
        <div className="hero-ring hero-ring-two" aria-hidden="true" />

        <div
          className="scene-window"
          ref={sceneRef}
          onPointerMove={handleScenePointer}
          onPointerLeave={resetScenePointer}
          aria-label="مشهد جوي لمدينة عدن وساحلها"
        >
          <Image
            className="scene-picture"
            src="/assets/aden-hero.webp"
            alt="منظر جوي لساحل ومدينة عدن"
            width={1586}
            height={992}
            priority
            unoptimized
          />
          <span className="scene-glow" aria-hidden="true" />
          <span className="cloud cloud-one" aria-hidden="true" />
          <span className="cloud cloud-two" aria-hidden="true" />
          <div className="scene-caption">
            <span className="caption-dot" />
            <div>
              <strong>عدن، اليمن</strong>
              <small>12°47′N · 45°02′E</small>
            </div>
          </div>
        </div>

        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow">
            <PlaneTakeoff aria-hidden="true" size={18} />
            مرحبًا بك على متن طيران عدن
          </div>
          <h1>
            <span>من عدن…</span>
            نقرّب لك العالم
          </h1>
          <p>
            رحلات آمنة ومريحة تبدأ بخطوة بسيطة، وتجربة رقمية ترافقك من أول
            حجز حتى الوصول.
          </p>
          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={scrollToBooking}>
              احجز رحلتك
              <ArrowLeft aria-hidden="true" size={20} />
            </button>
            <a className="text-link" href="#routes">
              اكتشف الرحلة
              <span className="link-circle">
                <ArrowUpLeft aria-hidden="true" size={16} />
              </span>
            </a>
          </div>
          <div className="hero-trust">
            <span>
              <ShieldCheck aria-hidden="true" size={18} />
              السلامة أولًا
            </span>
            <span>
              <Headphones aria-hidden="true" size={18} />
              دعم للمسافرين
            </span>
          </div>
        </div>

        <form
          className={`booking-panel ${searchState === "ready" ? "has-pass" : ""}`}
          id="booking"
          onSubmit={handleSearch}
        >
          {searchState === "ready" ? (
            <div className="boarding-pass" aria-live="polite">
              <div className="boarding-pass-main">
                <div className="pass-brand-row">
                  <Image
                    src="/assets/flyaden-logo-green.png"
                    alt="طيران عدن flyaden"
                    width={1210}
                    height={308}
                    unoptimized
                  />
                  <div>
                    <span>بطاقة صعود تجريبية</span>
                    <strong>{selectedDestination.flight}</strong>
                  </div>
                </div>

                <div className="pass-route">
                  <div>
                    <strong>{cityCodes[from]}</strong>
                    <span>{from}</span>
                    <small>{selectedDestination.departure}</small>
                  </div>
                  <div className="pass-route-line" aria-hidden="true">
                    <span />
                    <Plane size={23} />
                    <span />
                  </div>
                  <div>
                    <strong>{cityCodes[to]}</strong>
                    <span>{to}</span>
                    <small>{selectedDestination.arrival}</small>
                  </div>
                </div>

                <div className="pass-details">
                  <span>
                    <small>التاريخ</small>
                    <strong>{formattedDate}</strong>
                  </span>
                  <span>
                    <small>البوابة</small>
                    <strong>{selectedDestination.gate}</strong>
                  </span>
                  <span>
                    <small>المسافرون</small>
                    <strong>{passengers}</strong>
                  </span>
                  <span>
                    <small>نوع الرحلة</small>
                    <strong>
                      {tripType === "round" ? "ذهاب وعودة" : "ذهاب فقط"}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="boarding-pass-stub">
                <span className="pass-status">
                  <Check aria-hidden="true" size={15} />
                  المسار جاهز
                </span>
                <QrCode className="pass-qr" aria-hidden="true" size={76} />
                <strong>
                  {cityCodes[from]} — {cityCodes[to]}
                </strong>
                <small>نموذج واجهة توضيحي وليست تذكرة سفر</small>
                <div className="pass-actions">
                  <button type="button" onClick={printBoardingPass}>
                    <Printer aria-hidden="true" size={16} />
                    طباعة
                  </button>
                  <button type="button" onClick={resetSearch}>
                    <RefreshCw aria-hidden="true" size={16} />
                    بحث جديد
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="booking-heading">
                <div>
                  <span className="booking-kicker">احجز مقعدك</span>
                  <strong>إلى أين ستكون رحلتك القادمة؟</strong>
                </div>
                <div className="trip-switch" aria-label="نوع الرحلة">
                  <button
                    className={tripType === "round" ? "is-active" : ""}
                    type="button"
                    onClick={() => setTripType("round")}
                  >
                    ذهاب وعودة
                  </button>
                  <button
                    className={tripType === "oneway" ? "is-active" : ""}
                    type="button"
                    onClick={() => setTripType("oneway")}
                  >
                    ذهاب فقط
                  </button>
                </div>
              </div>

              <div className="booking-fields">
                <label className="booking-field">
                  <span>
                    <MapPin aria-hidden="true" size={17} />
                    من
                  </span>
                  <select
                    value={from}
                    onChange={(event) => changeFrom(event.target.value)}
                  >
                    <option disabled={to === "عدن"}>عدن</option>
                    <option disabled={to === "القاهرة"}>القاهرة</option>
                    <option disabled={to === "جدة"}>جدة</option>
                    <option disabled={to === "عمّان"}>عمّان</option>
                  </select>
                  <ChevronDown
                    className="field-chevron"
                    aria-hidden="true"
                    size={17}
                  />
                </label>

                <button
                  className="swap-button"
                  type="button"
                  onClick={swapCities}
                  aria-label="تبديل مدينتي المغادرة والوصول"
                >
                  <ArrowLeft aria-hidden="true" size={18} />
                </button>

                <label className="booking-field">
                  <span>
                    <MapPin aria-hidden="true" size={17} />
                    إلى
                  </span>
                  <select
                    value={to}
                    onChange={(event) => changeTo(event.target.value)}
                  >
                    <option disabled={from === "القاهرة"}>القاهرة</option>
                    <option disabled={from === "جدة"}>جدة</option>
                    <option disabled={from === "عمّان"}>عمّان</option>
                    <option disabled={from === "عدن"}>عدن</option>
                  </select>
                  <ChevronDown
                    className="field-chevron"
                    aria-hidden="true"
                    size={17}
                  />
                </label>

                <label className="booking-field">
                  <span>
                    <CalendarDays aria-hidden="true" size={17} />
                    تاريخ الذهاب
                  </span>
                  <input
                    type="date"
                    min="2026-07-28"
                    value={departDate}
                    onChange={(event) => {
                      setDepartDate(event.target.value);
                      setSearchState("idle");
                    }}
                  />
                </label>

                <label className="booking-field">
                  <span>
                    <UsersRound aria-hidden="true" size={17} />
                    المسافرون
                  </span>
                  <select
                    value={passengers}
                    onChange={(event) => {
                      setPassengers(event.target.value);
                      setSearchState("idle");
                    }}
                  >
                    <option value="1">مسافر واحد</option>
                    <option value="2">مسافران</option>
                    <option value="3">3 مسافرين</option>
                    <option value="4">4 مسافرين</option>
                  </select>
                  <ChevronDown
                    className="field-chevron"
                    aria-hidden="true"
                    size={17}
                  />
                </label>

                <button
                  className="search-button"
                  type="submit"
                  disabled={searchState === "loading"}
                >
                  {searchState === "loading" ? (
                    <span className="loading-ring" aria-hidden="true" />
                  ) : (
                    <Search aria-hidden="true" size={20} />
                  )}
                  {searchState === "loading"
                    ? "جارٍ تجهيز الرحلة…"
                    : "ابحث عن رحلة"}
                </button>
              </div>

              {searchState === "error" && (
                <div className="search-feedback error" role="alert">
                  اختر مدينتين مختلفتين لإكمال البحث.
                </div>
              )}
            </>
          )}
        </form>

        <a className="scroll-cue" href="#routes" aria-label="مرر لمتابعة الرحلة">
          <span>مرّر للإقلاع</span>
          <span className="scroll-line" />
        </a>
      </section>

      <aside className="flight-altimeter" aria-hidden="true">
        <span className="altimeter-label">ALT</span>
        <span className="altimeter-track">
          <i />
        </span>
        <strong ref={altitudeValueRef}>0 ft</strong>
        <small>{flightStage}</small>
      </aside>

      <span
        className="takeoff-shadow"
        ref={takeoffShadowRef}
        aria-hidden="true"
      />

      <div className="flight-vehicle" ref={planeRef} aria-hidden="true">
        <span className="contrail contrail-one" />
        <span className="contrail contrail-two" />
        <Image
          src="/assets/flyaden-plane.webp"
          alt=""
          width={1600}
          height={879}
          priority
          unoptimized
        />
        <span className="engine-glow" />
      </div>

      <section className="route-story" id="routes">
        <div className="route-copy reveal">
          <div className="eyebrow dark-eyebrow">
            <span className="pulse-dot" />
            {flightStage}
          </div>
          <h2>
            مسار واحد،
            <span>ووجهات أقرب</span>
          </h2>
          <p>
            ننطلق من عدن لنربطك بالمدن التي تهمك. خط رحلة واضح، تجربة أبسط،
            وخدمات مصممة لتكون معك في كل مرحلة.
          </p>
          <a className="outline-button" href="#destinations">
            استكشف الوجهات
            <ArrowLeft aria-hidden="true" size={19} />
          </a>
        </div>

        <div className="route-map reveal" aria-label="خريطة توضيحية لمسار الرحلات">
          <div className="map-grid" aria-hidden="true" />
          <svg viewBox="0 0 1000 560" role="img" aria-label="مسار من عدن إلى ثلاث وجهات">
            <defs>
              <linearGradient id="routeGradient" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#b8d52a" />
                <stop offset="1" stopColor="#f2f7c9" />
              </linearGradient>
              <filter id="routeGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              className="continent-line"
              d="M68 415C159 359 236 330 305 343C371 356 391 313 461 298C533 282 579 229 647 213C716 196 759 147 841 125C886 113 920 93 950 73"
            />
            <path
              key={selectedDestination.code}
              ref={routePathRef}
              className="animated-route"
              d={selectedDestination.path}
              pathLength="1000"
            />
            <g
              className="map-node node-aden is-active"
              transform="translate(144 427)"
            >
              <circle r="31" className="node-halo" />
              <circle r="12" className="node-core" />
              <text x="0" y="-48">ADE</text>
            </g>
            <g
              className={`map-node node-cairo ${selectedDestination.code === "CAI" ? "is-active" : ""}`}
              transform="translate(478 286)"
            >
              <circle r="27" className="node-halo" />
              <circle r="10" className="node-core" />
              <text x="0" y="-42">CAI</text>
            </g>
            <g
              className={`map-node node-jeddah ${selectedDestination.code === "JED" ? "is-active" : ""}`}
              transform="translate(725 193)"
            >
              <circle r="27" className="node-halo" />
              <circle r="10" className="node-core" />
              <text x="0" y="-42">JED</text>
            </g>
            <g
              className={`map-node node-amman ${selectedDestination.code === "AMM" ? "is-active" : ""}`}
              transform="translate(906 104)"
            >
              <circle r="27" className="node-halo" />
              <circle r="10" className="node-core" />
              <text x="-5" y="-42">AMM</text>
            </g>
          </svg>
          <div className="map-flight-card">
            <span className="flight-card-icon">
              <Plane aria-hidden="true" size={20} />
            </span>
            <div>
              <small>المسار المختار · {selectedDestination.flight}</small>
              <strong>
                {from} ← {to}
              </strong>
            </div>
            <div className="flight-time">
              <Clock3 aria-hidden="true" size={16} />
              {selectedDestination.departure}
            </div>
          </div>
        </div>
      </section>

      <section className="destinations-section" id="destinations">
        <div className="section-heading reveal">
          <div>
            <span className="section-index">02 — وجهاتنا</span>
            <h2>اختر وجهتك القادمة</h2>
          </div>
          <p>
            وجهات مختارة تربط عدن بالمنطقة، مع تجربة حجز واضحة ومباشرة.
          </p>
        </div>

        <div className="destination-grid">
          {destinations.map((destination, index) => (
            <article
              className={`destination-card ${destination.tone} ${
                selectedDestination.code === destination.code
                  ? "is-selected"
                  : ""
              } reveal`}
              key={destination.code}
              style={{ transitionDelay: `${index * 90}ms` }}
            >
              <Image
                className="destination-photo"
                src={destination.image}
                alt={destination.imageAlt}
                width={1400}
                height={1000}
                unoptimized
              />
              <div className="destination-top">
                <span>{destination.country}</span>
                <strong>{destination.code}</strong>
              </div>
              {selectedDestination.code === destination.code && (
                <span className="selected-route-tag">
                  <Check aria-hidden="true" size={14} />
                  المسار المختار
                </span>
              )}
              <span className="destination-landmark">
                <MapPin aria-hidden="true" size={14} />
                {destination.landmark}
              </span>
              <div className="destination-bottom">
                <div>
                  <h3>{destination.city}</h3>
                  <span>
                    <Clock3 aria-hidden="true" size={15} />
                    نحو {destination.duration} ساعة
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => chooseDestination(destination.city)}
                  aria-label={`اختيار ${destination.city} كوجهة`}
                >
                  {selectedDestination.code === destination.code ? (
                    <Check aria-hidden="true" size={21} />
                  ) : (
                    <ArrowUpLeft aria-hidden="true" size={21} />
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="services-section" id="services">
        <div className="services-intro reveal">
          <span className="section-index">03 — خدماتنا</span>
          <h2>
            سفر مصمم
            <span>حول احتياجك</span>
          </h2>
          <p>
            سواء كانت رحلتك للعمل أو العلاج أو المناسك، نمنحك خيارات أكثر
            وتجربة أكثر سلاسة.
          </p>
          <a className="outline-button light-outline" href="#booking">
            ابدأ الحجز
            <ArrowLeft aria-hidden="true" size={19} />
          </a>
        </div>

        <div className="services-grid">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <article
                className="service-card reveal"
                key={service.title}
                style={{ transitionDelay: `${index * 75}ms` }}
              >
                <div className="service-card-top">
                  <span className="service-icon">
                    <Icon aria-hidden="true" size={26} />
                  </span>
                  <span className="service-number">{service.number}</span>
                </div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <span className="service-line" />
              </article>
            );
          })}
        </div>
      </section>

      <section
        className="landing-scene"
        ref={landingRef}
        aria-label="مشهد الوصول والهبوط"
      >
        <span className="landing-sun" aria-hidden="true" />
        <span className="landing-cloud landing-cloud-one" aria-hidden="true" />
        <span className="landing-cloud landing-cloud-two" aria-hidden="true" />

        <div className="landing-copy reveal">
          <div className="eyebrow landing-eyebrow">
            <PlaneLanding aria-hidden="true" size={18} />
            مرحلة الوصول
          </div>
          <h2>
            نهاية الرحلة،
            <span>وبداية الحكاية.</span>
          </h2>
          <p>
            كلما اقتربت من نهاية الصفحة، تنخفض الطائرة تدريجيًا حتى تلامس
            المدرج. حرّك الصفحة للأعلى لتشاهدها تعود إلى السماء.
          </p>
        </div>

        <div className="arrival-board" aria-live="polite">
          <span>
            الوصول إلى
            <strong>{selectedDestination.city}</strong>
          </span>
          <span className="arrival-code">{selectedDestination.code}</span>
          <span className="arrival-status">
            <i />
            في الموعد
          </span>
        </div>

        <span
          className="landing-shadow"
          ref={landingShadowRef}
          aria-hidden="true"
        />
        <div
          className="landing-plane"
          ref={landingPlaneRef}
          aria-hidden="true"
        >
          <Image
            src="/assets/flyaden-plane.webp"
            alt=""
            width={1600}
            height={879}
            unoptimized
          />
        </div>

        <div className="runway" aria-hidden="true">
          <span className="touchdown-zone" />
          <span className="touchdown-smoke" />
          <span className="runway-centerline" />
          <div className="runway-lights">
            {Array.from({ length: 12 }).map((_, index) => (
              <i key={index} />
            ))}
          </div>
          <span className="runway-label">27 · ADEN</span>
        </div>
      </section>

      <section className="journey-cta reveal">
        <div>
          <span className="section-index">جاهز للإقلاع؟</span>
          <h2>رحلتك تبدأ من هنا.</h2>
        </div>
        <button className="cta-book-button" type="button" onClick={scrollToBooking}>
          احجز رحلتك الآن
          <span>
            <ArrowUpLeft aria-hidden="true" size={23} />
          </span>
        </button>
      </section>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <Image
              src="/assets/flyaden-logo-white.png"
              alt="طيران عدن flyaden"
              width={1210}
              height={308}
              unoptimized
            />
            <p>
              نربط عدن بالعالم برحلات آمنة، وخدمة موثوقة، وتجربة سفر أسهل.
            </p>
          </div>
          <div className="footer-links">
            <div>
              <strong>روابط سريعة</strong>
              <a href="#booking">احجز رحلتك</a>
              <a href="#routes">مسار الرحلة</a>
              <a href="#destinations">الوجهات</a>
            </div>
            <div>
              <strong>الدعم</strong>
              <a href="#services">خدماتنا</a>
              <a href="mailto:info@fly-aden.com">info@fly-aden.com</a>
              <a href="tel:+9672388895">+967 2 388895</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 طيران عدن. نموذج واجهة تفاعلية.</span>
          <span>من عدن… نقرّب لك العالم</span>
        </div>
      </footer>
    </main>
  );
}
