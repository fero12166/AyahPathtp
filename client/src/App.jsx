
import { useEffect, useState } from "react";
import {
  BookOpen, Brain, Compass, Home, Headphones, Bookmark,
  Settings, Search, Bell, ChevronRight, Play, Pause,
  Flame, Clock, Target, Menu, X, Moon, Sun, Volume2,
  Eye, EyeOff, Check, ArrowLeft, ArrowRight, BookMarked,
  Sparkles, Heart, RotateCcw, Languages
} from "lucide-react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const navigation = [
  { name: "Dashboard", icon: Home },
  { name: "Quran Reader", icon: BookOpen },
  { name: "Memorization", icon: Brain },
  { name: "Explore", icon: Compass },
  { name: "My Bookmarks", icon: Bookmark }
];

const surahNames = [
  "Al-Fatihah", "Al-Baqarah", "Aal-Imran", "An-Nisa", "Al-Maidah",
  "Al-Anam", "Al-Araf", "Al-Anfal", "At-Tawbah", "Yunus",
  "Hud", "Yusuf", "Ar-Rad", "Ibrahim", "Al-Hijr", "An-Nahl",
  "Al-Isra", "Al-Kahf", "Maryam", "Ta-Ha", "Al-Anbiya",
  "Al-Hajj", "Al-Muminun", "An-Nur", "Al-Furqan", "Ash-Shuara",
  "An-Naml", "Al-Qasas", "Al-Ankabut", "Ar-Rum", "Luqman",
  "As-Sajdah", "Al-Ahzab", "Saba", "Fatir", "Ya-Sin",
  "As-Saffat", "Sad", "Az-Zumar", "Ghafir", "Fussilat",
  "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiyah",
  "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf",
  "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman",
  "Al-Waqiah", "Al-Hadid", "Al-Mujadilah", "Al-Hashr",
  "Al-Mumtahanah", "As-Saff", "Al-Jumuah", "Al-Munafiqun",
  "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk",
  "Al-Qalam", "Al-Haqqah", "Al-Maarij", "Nuh", "Al-Jinn",
  "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyamah", "Al-Insan",
  "Al-Mursalat", "An-Naba", "An-Naziat", "Abasa", "At-Takwir",
  "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj",
  "At-Tariq", "Al-Ala", "Al-Ghashiyah", "Al-Fajr", "Al-Balad",
  "Ash-Shams", "Al-Layl", "Ad-Duha", "Ash-Sharh", "At-Tin",
  "Al-Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-Adiyat",
  "Al-Qariah", "At-Takathur", "Al-Asr", "Al-Humazah", "Al-Fil",
  "Quraysh", "Al-Maun", "Al-Kawthar", "Al-Kafirun", "An-Nasr",
  "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"
];

function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [apiStatus, setApiStatus] = useState("checking");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [surahNumber, setSurahNumber] = useState(1);
  const [surah, setSurah] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [audio, setAudio] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [hideVerses, setHideVerses] = useState(false);
  const [revealed, setRevealed] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookmarks, setBookmarks] = useState(() =>
    JSON.parse(localStorage.getItem("ayahpath-bookmarks") || "[]")
  );
  const [completed, setCompleted] = useState(() =>
    JSON.parse(localStorage.getItem("ayahpath-completed") || "[]")
  );
  const [readingTime, setReadingTime] = useState(
    Number(localStorage.getItem("ayahpath-minutes") || 0)
  );
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/health`)
      .then(r => {
        if (!r.ok) throw new Error("Offline");
        return r.json();
      })
      .then(() => setApiStatus("connected"))
      .catch(() => setApiStatus("offline"));
  }, []);

  async function loadSurah(number) {
    const n = Math.min(114, Math.max(1, Number(number) || 1));
    setSurahNumber(n);
    setLoading(true);
    setError("");
    setRevealed([]);
    try {
      const response = await fetch(`${API}/api/quran/surah/${n}`);
      if (!response.ok) throw new Error("Unable to retrieve this surah.");
      const result = await response.json();
      if (!result.success || !result.data?.data?.surah) {
        throw new Error("Unexpected Quran API response.");
      }
      setSurah(result.data.data);
      setActiveTab("Quran Reader");
      setMobileMenu(false);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSurah(1);
  }, []);

  useEffect(() => {
    if (!audio) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onPause);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onPause);
    };
  }, [audio]);

  function toggleAudio(url) {
    if (audio) {
      audio.pause();
      if (audio.src === url) {
        setAudio(null);
        setPlaying(false);
        return;
      }
    }
    const player = new Audio(url);
    setAudio(player);
    player.play().catch(() => setError("Audio could not be played."));
  }

  function changeTab(tab) {
    setActiveTab(tab);
    setMobileMenu(false);
    if (tab === "Quran Reader" && !surah) loadSurah(surahNumber);
  }

  function toggleBookmark(verse) {
    const key = verse.verse_key;
    const updated = bookmarks.some(b => b.verse_key === key)
      ? bookmarks.filter(b => b.verse_key !== key)
      : [...bookmarks, {
          ...verse,
          surahNumber,
          surahName: surah?.surah?.name_english || surahNames[surahNumber - 1]
        }];
    setBookmarks(updated);
    localStorage.setItem("ayahpath-bookmarks", JSON.stringify(updated));
  }

  function markCompleted() {
    if (!surah) return;
    const updated = completed.includes(surahNumber)
      ? completed
      : [...completed, surahNumber];
    setCompleted(updated);
    localStorage.setItem("ayahpath-completed", JSON.stringify(updated));
    const minutes = readingTime + 1;
    setReadingTime(minutes);
    localStorage.setItem("ayahpath-minutes", String(minutes));
  }

  function toggleReveal(index) {
    setRevealed(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  }

  const verses = surah?.verses || [];
  const surahInfo = surah?.surah;
  const reciter = surah?.audio?.[0];
  const bookmarked = (verse) =>
    bookmarks.some(b => b.verse_key === verse.verse_key);

  const memorizedCount = completed.reduce((total, number) => {
    return total + (number === surahNumber ? verses.length : 0);
  }, 0);

  const filteredVerses = verses.filter(v => {
    const term = searchTerm.toLowerCase();
    return !term ||
      v.translation?.toLowerCase().includes(term) ||
      v.transliteration?.toLowerCase().includes(term) ||
      v.arabic?.includes(searchTerm);
  });

  const progress = Math.round((completed.length / 114) * 100);

  return (
    <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><BookOpen size={25} /></div>
          <div>
            <h2>AyahPath<span>.</span></h2>
            <span className="brand-caption">YOUR QURAN JOURNEY</span>
          </div>
          <button className="mobile-close" onClick={() => setMobileMenu(false)}>
            <X size={20}/>
          </button>
        </div>

        <div className="sidebar-section">
          <p className="menu-label">YOUR SPACE</p>
          <nav>
            {navigation.map(item => {
              const Icon = item.icon;
              return (
                <button key={item.name}
                  className={`nav-item ${activeTab === item.name ? "active" : ""}`}
                  onClick={() => changeTab(item.name)}>
                  <Icon size={19}/>
                  <span>{item.name}</span>
                  {activeTab === item.name && <span className="nav-indicator"/>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-quote">
            <div className="quote-ornament">۞</div>
            <span>DAILY REMINDER</span>
            <p>“And remember your Lord much.”</p>
            <small>Surah Al-Imran · 3:41</small>
          </div>
          <button className="nav-item settings-button"
            onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun size={19}/> : <Moon size={19}/>}
            <span>{darkMode ? "Light appearance" : "Dark appearance"}</span>
          </button>
          <div className="sidebar-footer">Made with purpose and care ♡</div>
        </div>
      </aside>

      {mobileMenu && <div className="sidebar-overlay" onClick={() => setMobileMenu(false)}/>}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu-button" onClick={() => setMobileMenu(true)}>
            <Menu size={22}/>
          </button>
          <div className="topbar-heading">
            <span className="welcome-label">YOUR PERSONAL QURAN SPACE</span>
            <h1>{activeTab === "Dashboard" ? "Assalamu Alaikum" : activeTab}</h1>
            <p>{activeTab === "Dashboard"
              ? "A moment with the Quran can change your day."
              : "Take your time. Learn at your own pace."}</p>
          </div>
          <div className="topbar-actions">
            <div className={`api-status ${apiStatus}`}>
              <span className="status-dot"/>
              {apiStatus === "connected" ? "Connected" :
                apiStatus === "offline" ? "Offline" : "Connecting"}
            </div>
            <button className="icon-button" title="Toggle appearance"
              onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={19}/> : <Moon size={19}/>}
            </button>
          </div>
        </header>

        {error && <div className="error-banner">{error}
          <button onClick={() => setError("")}>Dismiss</button>
        </div>}

        {activeTab === "Dashboard" && (
          <div className="page-content">
            <section className="hero">
              <div className="hero-pattern"/>
              <div className="hero-content">
                <span className="hero-label"><Sparkles size={14}/> A JOURNEY OF REFLECTION</span>
                <h2>Let the Quran<br/>guide your <em>way.</em></h2>
                <p>Read, reflect, and grow closer to the words<br className="desktop-break"/> that bring light to your heart.</p>
                <button className="primary-button" onClick={() => changeTab("Quran Reader")}>
                  <BookOpen size={18}/> Begin Reading <ArrowRight size={17}/>
                </button>
              </div>
              <div className="hero-art">
                <div className="hero-ring ring-one"/>
                <div className="hero-ring ring-two"/>
                <div className="hero-medallion">
                  <span className="medallion-top">۞</span>
                  <span className="medallion-arabic">اقْرَأْ</span>
                  <span className="medallion-bottom">READ · REFLECT · REMEMBER</span>
                </div>
                <span className="hero-star star-one">✳</span>
                <span className="hero-star star-two">✧</span>
              </div>
              <div className="hero-bottom-note">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            </section>

            <div className="section-intro">
              <div>
                <span className="section-eyebrow">YOUR PROGRESS</span>
                <h3>Your journey, one verse at a time.</h3>
              </div>
              <span className="progress-label">{progress}% completed</span>
            </div>

            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-top"><span>Surahs read</span><div className="stat-icon sage"><BookOpen size={19}/></div></div>
                <h3>{completed.length}<small> / 114</small></h3>
                <div className="stat-foot">Your reading journey</div>
              </div>
              <div className="stat-card">
                <div className="stat-top"><span>Daily streak</span><div className="stat-icon gold"><Flame size={19}/></div></div>
                <h3>{completed.length > 0 ? "1" : "0"}<small> days</small></h3>
                <div className="stat-foot">Keep the momentum</div>
              </div>
              <div className="stat-card">
                <div className="stat-top"><span>Bookmarks</span><div className="stat-icon lavender"><Bookmark size={19}/></div></div>
                <h3>{bookmarks.length}<small> saved</small></h3>
                <div className="stat-foot">Verses to revisit</div>
              </div>
              <div className="stat-card">
                <div className="stat-top"><span>Learning sessions</span><div className="stat-icon blue"><Clock size={19}/></div></div>
                <h3>{readingTime}<small> min</small></h3>
                <div className="stat-foot">Every moment matters</div>
              </div>
            </section>

            <section className="dashboard-grid">
              <div className="section-card continue-card">
                <div className="card-heading">
                  <div><span className="section-eyebrow">PICK UP WHERE YOU LEFT OFF</span><h3>Continue your reading</h3></div>
                  <span className="heading-icon"><BookOpen size={20}/></span>
                </div>
                <div className="surah-preview">
                  <div className="surah-number">01</div>
                  <div className="surah-details">
                    <h4>Al-Fatihah</h4>
                    <p>The Opening · 7 verses</p>
                  </div>
                  <span className="arabic-name">الفاتحة</span>
                </div>
                <button className="text-button" onClick={() => loadSurah(1)}>
                  Open Quran Reader <ChevronRight size={16}/>
                </button>
              </div>

              <div className="section-card goal-card">
                <div className="card-heading">
                  <div><span className="section-eyebrow">A LITTLE EVERY DAY</span><h3>Your reading goal</h3></div>
                  <Target size={20} className="muted-icon"/>
                </div>
                <div className="goal-content">
                  <div className="goal-circle" style={{"--progress": `${progress}%`}}>
                    <div><strong>{progress}%</strong><span>complete</span></div>
                  </div>
                  <div className="goal-text">
                    <h4>{completed.length ? "Beautiful progress!" : "Your journey starts here."}</h4>
                    <p>{completed.length ? `${completed.length} surah(s) completed. Keep going.` : "Take your first step. Every verse counts."}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="quick-section">
              <div className="card-heading">
                <div><span className="section-eyebrow">DISCOVER MORE</span><h3>Explore your tools</h3></div>
                <span className="small-note">Made for your journey</span>
              </div>
              <div className="quick-grid">
                <button className="quick-card quick-memorize" onClick={() => changeTab("Memorization")}>
                  <div className="quick-icon"><Brain size={22}/></div>
                  <div><h4>Memorization Lab</h4><p>Practice and recall verses</p></div>
                  <ChevronRight size={18}/>
                </button>
                <button className="quick-card quick-explore" onClick={() => changeTab("Explore")}>
                  <div className="quick-icon"><Compass size={22}/></div>
                  <div><h4>Verse Explorer</h4><p>Search and reflect on verses</p></div>
                  <ChevronRight size={18}/>
                </button>
                <button className="quick-card quick-listen" onClick={() => changeTab("Quran Reader")}>
                  <div className="quick-icon"><Headphones size={22}/></div>
                  <div><h4>Listen & Reflect</h4><p>Listen to Quran recitation</p></div>
                  <ChevronRight size={18}/>
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === "Quran Reader" && (
          <div className="page-content">
            <section className="reader-banner">
              <span className="section-eyebrow">THE NOBLE QURAN</span>
              <h2>Read. Reflect. Remember.</h2>
              <p>Take a moment to connect with the words of Allah.</p>
              <div className="reader-select">
                <label htmlFor="surah-select">Choose a Surah</label>
                <select id="surah-select" value={surahNumber}
                  onChange={e => loadSurah(Number(e.target.value))}>
                  {surahNames.map((name, i) =>
                    <option value={i + 1} key={name}>{String(i + 1).padStart(3, "0")} · {name}</option>
                  )}
                </select>
              </div>
            </section>

            {loading ? <div className="loading-state"><div className="loader"/>Loading Quran verses...</div> :
              surahInfo && (
                <>
                  <section className="surah-title-card">
                    <div><span className="section-eyebrow">SURAH {surahNumber}</span>
                      <h2>{surahInfo.name_english}</h2>
                      <p>{surahInfo.name_translation} · {surahInfo.revelation_place} · {surahInfo.verses_count} verses</p>
                    </div>
                    <div className="surah-title-arabic">{surahInfo.name_arabic}</div>
                    <button className="audio-button" onClick={() => reciter && toggleAudio(reciter.surah_audio)}>
                      {playing ? <Pause size={17}/> : <Play size={17}/>}
                      {playing ? "Pause" : "Listen"}
                    </button>
                  </section>

                  <div className="reader-tools">
                    <span>{verses.length} verses</span>
                    <button onClick={() => setHideVerses(!hideVerses)}>
                      {hideVerses ? <Eye size={16}/> : <EyeOff size={16}/>}
                      {hideVerses ? "Show all verses" : "Hide translations"}
                    </button>
                    <button onClick={markCompleted}><Check size={16}/> Mark as read</button>
                  </div>

                  {verses.map((verse, index) => (
                    <article className="verse-card" key={verse.verse_key}>
                      <div className="verse-top">
                        <span className="verse-number">{verse.ayah}</span>
                        <span className="verse-reference">{verse.verse_key}</span>
                        <div className="verse-actions">
                          <button title="Play verse" onClick={() => verse.audio?.ayah_audio && toggleAudio(verse.audio.ayah_audio)}>
                            <Play size={16}/>
                          </button>
                          <button title="Bookmark verse" onClick={() => toggleBookmark(verse)}>
                            <Bookmark size={16} fill={bookmarked(verse) ? "currentColor" : "none"}/>
                          </button>
                        </div>
                      </div>
                      <p className={`arabic-verse ${hideVerses ? "hidden-verse" : ""}`} dir="rtl">
                        {verse.arabic}
                      </p>
                      {!hideVerses && (
                        <div className="verse-translation">
                          <p className="transliteration">{verse.transliteration}</p>
                          <p className="translation">{verse.translation}</p>
                        </div>
                      )}
                    </article>
                  ))}
                  <div className="surah-navigation">
                    <button disabled={surahNumber === 1} onClick={() => loadSurah(surahNumber - 1)}>
                      <ArrowLeft size={17}/> Previous
                    </button>
                    <button disabled={surahNumber === 114} onClick={() => loadSurah(surahNumber + 1)}>
                      Next Surah <ArrowRight size={17}/>
                    </button>
                  </div>
                </>
              )}
          </div>
        )}

        {activeTab === "Memorization" && (
          <div className="page-content">
            <section className="feature-banner memorization-banner">
              <div className="feature-banner-icon"><Brain size={29}/></div>
              <span className="section-eyebrow">YOUR MEMORIZATION SPACE</span>
              <h2>Learn it. Recall it. Remember it.</h2>
              <p>Practice recalling Quranic verses at your own pace.</p>
              <button className="primary-button" onClick={() => loadSurah(surahNumber)}>
                <BookOpen size={17}/> Open practice reader
              </button>
            </section>
            <div className="section-intro"><div><span className="section-eyebrow">ACTIVE PRACTICE</span><h3>Memorization exercise</h3></div></div>
            {loading ? <div className="loading-state"><div className="loader"/>Loading...</div> :
              verses.length > 0 && (
                <>
                  <div className="practice-controls">
                    <label>Practice surah</label>
                    <select value={surahNumber} onChange={e => loadSurah(Number(e.target.value))}>
                      {surahNames.map((name, i) => <option key={name} value={i + 1}>{i + 1}. {name}</option>)}
                    </select>
                    <button className="secondary-button" onClick={() => setRevealed([])}><RotateCcw size={16}/> Reset exercise</button>
                  </div>
                  {verses.map((verse, index) => (
                    <article className="verse-card practice-card" key={verse.verse_key}>
                      <div className="verse-top"><span className="verse-number">{verse.ayah}</span><span className="verse-reference">{verse.verse_key}</span></div>
                      <p className={`arabic-verse practice-arabic ${revealed.includes(index) ? "" : "practice-hidden"}`} dir="rtl">
                        {revealed.includes(index) ? verse.arabic : "••••••••••••••••••••••••"}
                      </p>
                      <div className="practice-actions">
                        <button className="secondary-button" onClick={() => toggleReveal(index)}>
                          {revealed.includes(index) ? <EyeOff size={16}/> : <Eye size={16}/>}
                          {revealed.includes(index) ? "Hide verse" : "Reveal verse"}
                        </button>
                        <button className="secondary-button" onClick={() => toggleBookmark(verse)}>
                          <Bookmark size={16}/> Save
                        </button>
                      </div>
                    </article>
                  ))}
                </>
              )}
          </div>
        )}

        {activeTab === "Explore" && (
          <div className="page-content">
            <section className="feature-banner explore-banner">
              <div className="feature-banner-icon"><Compass size={29}/></div>
              <span className="section-eyebrow">DISCOVER THE QURAN</span>
              <h2>Explore words of wisdom.</h2>
              <p>Search through the verses of the currently selected Surah in Arabic, transliteration or French.</p>
              <button className="primary-button" onClick={() => loadSurah(surahNumber)}>
                <BookOpen size={17}/> Browse Quran
              </button>
            </section>
            <div className="explore-search">
              <Search size={19}/>
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search Arabic, transliteration or French translation..."/>
              {searchTerm && <button onClick={() => setSearchTerm("")}><X size={17}/></button>}
            </div>
            <div className="explore-meta">
              <span>Searching in {surahInfo?.name_english || "Al-Fatihah"}</span>
              <span>{filteredVerses.length} results</span>
            </div>
            {filteredVerses.map(verse => (
              <article className="verse-card" key={verse.verse_key}>
                <div className="verse-top"><span className="verse-number">{verse.ayah}</span><span className="verse-reference">{verse.verse_key}</span>
                  <button className="verse-action" onClick={() => toggleBookmark(verse)}><Bookmark size={16}/></button>
                </div>
                <p className="arabic-verse" dir="rtl">{verse.arabic}</p>
                <p className="transliteration">{verse.transliteration}</p>
                <p className="translation">{verse.translation}</p>
              </article>
            ))}
            <p className="info-note">Note: Search currently covers the selected Surah, using the data loaded from UmmahAPI.</p>
          </div>
        )}

        {activeTab === "My Bookmarks" && (
          <div className="page-content">
            <section className="feature-banner bookmark-banner">
              <div className="feature-banner-icon"><BookMarked size={29}/></div>
              <span className="section-eyebrow">YOUR PERSONAL COLLECTION</span>
              <h2>Verses close to your heart.</h2>
              <p>Keep meaningful verses close and return to them whenever you wish.</p>
            </section>
            <div className="section-intro"><div><span className="section-eyebrow">SAVED VERSES</span><h3>{bookmarks.length} bookmarked verses</h3></div></div>
            {bookmarks.length === 0 ? (
              <div className="empty-state"><Bookmark size={32}/><h3>Your collection starts here.</h3><p>Save verses from the Quran Reader to find them here.</p><button className="primary-button" onClick={() => changeTab("Quran Reader")}>Explore Quran <ArrowRight size={16}/></button></div>
            ) : bookmarks.map(verse => (
              <article className="verse-card" key={verse.verse_key}>
                <div className="verse-top">
                  <span className="verse-number">{verse.ayah}</span>
                  <span className="verse-reference">{verse.surahName || "Quran"} · {verse.verse_key}</span>
                  <button className="verse-action" onClick={() => toggleBookmark(verse)}><Bookmark size={16} fill="currentColor"/></button>
                </div>
                <p className="arabic-verse" dir="rtl">{verse.arabic}</p>
                <p className="transliteration">{verse.transliteration}</p>
                <p className="translation">{verse.translation}</p>
                <button className="text-button" onClick={() => {
                  loadSurah(verse.surahNumber || 1);
                }}>Open Surah <ChevronRight size={16}/></button>
              </article>
            ))}
          </div>
        )}

        <footer className="app-footer">
          <div className="footer-brand"><BookOpen size={17}/> AyahPath</div>
          <span>Your Quran journey, one verse at a time.</span>
          <span className="footer-api">{apiStatus === "connected" ? "● API Connected" : "● API status: " + apiStatus}</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
