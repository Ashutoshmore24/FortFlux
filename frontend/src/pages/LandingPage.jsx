import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useFortStore } from "../store/useFortStore";
import { FORT_LOCAL_IMAGES, UNESCO_FORTS } from "../data/fortHistoryData";
import {
  Compass,
  Shield,
  Mountain,
  Droplets,
  CloudRain,
  Award,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  MapPin,
  Activity,
  Zap,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Sliders,
  Navigation,
  Wind,
  Thermometer,
  Camera,
  AlertTriangle,
  ChevronDown,
  Info,
  Clock,
  Compass as CompassIcon,
  HelpCircle,
  Eye,
  Check,
} from "lucide-react";

// Static comprehensive directory of all 18 forts for instant, zero-latency rendering
const FORTS_DIRECTORY = [
  { slug: "rajgad", name: "Rajgad Fort", district: "Pune", elevation: 1376, region: "inland", peak: "Balekilla", desc: "The Sovereign Capital & Citadel of Chhatrapati Shivaji Maharaj for over 26 years.", historicHighlight: "Padmavati Machi, Suvela Machi, and the sheer vertical bastion of Balekilla." },
  { slug: "torna", name: "Torna Fort", district: "Pune", elevation: 1403, region: "inland", peak: "Budhla Machi", desc: "The highest fort in Pune district; captured by Shivaji Maharaj at the young age of 16.", historicHighlight: "Known as Prachandagad for its massive circumference and dramatic ridges." },
  { slug: "purandar", name: "Purandar Fort", district: "Pune", elevation: 1387, region: "inland", peak: "Kedareshwar", desc: "Treaty Fort & Birthplace of Chhatrapati Sambhaji Maharaj with companion fort Vajragad.", historicHighlight: "Site of the historic 1665 Treaty of Purandar and heroic stand of Murarbaji Deshpande." },
  { slug: "sinhagad", name: "Sinhagad Fort", district: "Pune", elevation: 1312, region: "inland", peak: "Kalyan Darwaja", desc: "Legendary fortress of Tanaji Malusare's nighttime scaling of vertical basalt cliffs.", historicHighlight: "Natural fortress guarding the Mutha river basin and ancient trade passes." },
  { slug: "harishchandragad", name: "Harishchandragad", district: "Ahmednagar", elevation: 1422, region: "inland", peak: "Taramati", desc: "Ancient 6th-century fortress renowned for the colossal concave cliff Konkan Kada.", historicHighlight: "Kedareshwar cave with ancient pillars and breathtaking reverse cloud waterfalls." },
  { slug: "raigad", name: "Raigad Fort", district: "Raigad", elevation: 820, region: "konkan", peak: "Hirkani Buruj", desc: "The Imperial Coronation Capital where Chhatrapati Shivaji Maharaj was crowned in 1674.", historicHighlight: "Ganga Sagar lake, Queen's chambers, royal market, and Jagadishwar temple." },
  { slug: "pratapgad", name: "Pratapgad Fort", district: "Satara", elevation: 1080, region: "inland", peak: "Bhavani Temple", desc: "Dramatic mountain bastion built high above the dense, treacherous Jawali forest canopy.", historicHighlight: "Site of the legendary historic meeting and victory against Afzal Khan in 1659." },
  { slug: "lohagad", name: "Lohagad Fort", district: "Pune", elevation: 1033, region: "inland", peak: "Vinchukata", desc: "The 'Iron Fort' featuring the famous scorpion-tail cliff extending into Pavana valley.", historicHighlight: "Preserved double-curved battlements and multi-layered gateway architecture." },
  { slug: "visapur", name: "Visapur Fort", district: "Pune", elevation: 1084, region: "inland", peak: "Peshwa Palace", desc: "Twin companion to Lohagad, celebrated for its cascading monsoon waterfall stone staircases.", historicHighlight: "Massive plateau with stone ruins, ancient cannons, and natural cistern network." },
  { slug: "shivneri", name: "Shivneri Fort", district: "Pune", elevation: 1067, region: "inland", peak: "Shivkunj", desc: "Birthplace of Chhatrapati Shivaji Maharaj in 1630, guarded by seven fortified gates.", historicHighlight: "Badami Talav, Shivai temple, and fortified triangle cliff configuration." },
  { slug: "panhala", name: "Panhala Fort", district: "Kolhapur", elevation: 977, region: "inland", peak: "Sajja Kothi", desc: "Largest fort in the Deccan, where Shivaji Maharaj made his historic midnight escape to Vishalgad.", historicHighlight: "Teen Darwaja, Amberkhana granaries, and serpentine 14km perimeter walls." },
  { slug: "ajinkyatara", name: "Ajinkyatara Fort", district: "Satara", elevation: 1006, region: "inland", peak: "Mangalai Devi", desc: "The 'Impregnable Star Fort' overlooking Satara city and the Sahyadri valleys.", historicHighlight: "Historic headquarters of Shahu Maharaj with sweeping 360-degree panoramic views." },
  { slug: "tikona", name: "Tikona Fort", district: "Pune", elevation: 1060, region: "inland", peak: "Trimbakeshwar", desc: "Distinctive triangular pyramidal summit standing sentinel over the blue Pawna reservoir.", historicHighlight: "Steep rock-cut stairs, cave temples, and strategic observation over ancient routes." },
  { slug: "rajmachi", name: "Rajmachi Fort", district: "Pune", elevation: 825, region: "inland", peak: "Shrivardhan", desc: "Historic trading pass outpost featuring twin bastions Shrivardhan and Manaranjan.", historicHighlight: "Spectacular monsoon firefly phenomenon and sweeping vistas of the Ulhas river gorge." },
  { slug: "korigad", name: "Korigad Fort", district: "Pune", elevation: 929, region: "inland", peak: "Koraidevi", desc: "Expansive high plateau with fully intact defensive ramparts and six natural lakes.", historicHighlight: "Complete continuous perimeter wall that can be traversed safely in entirety." },
  { slug: "sindhudurg", name: "Sindhudurg Fort", district: "Sindhudurg", elevation: 10, region: "sea", peak: "Sea Bastion", desc: "Masterpiece naval fortress constructed directly on a 48-acre submerged rocky reef.", historicHighlight: "Over 70,000 kg of molten lead used in its foundations against fierce Arabian Sea waves." },
  { slug: "vijaydurg", name: "Vijaydurg Fort", district: "Sindhudurg", elevation: 15, region: "sea", peak: "Admiral Tower", desc: "The 'Eastern Gibraltar' and premier naval shipyard of Kanhoji Angre's Maratha fleet.", historicHighlight: "Triple concentric battlements and an ingenious submerged defense wall in the sea." },
  { slug: "murud-janjira", name: "Murud-Janjira Fort", district: "Raigad", elevation: 8, region: "sea", peak: "Kalal Bangadi", desc: "Legendary undefeated island citadel surrounded entirely by the crashing Arabian sea.", historicHighlight: "Features the massive third-largest cannon in India and 19 intact rounded bastions." },
];

export const LandingPage = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { fetchForts } = useFortStore();

  const [activeTab, setActiveTab] = useState("all");
  const [selectedSpotlightSlug, setSelectedSpotlightSlug] = useState("rajgad");
  const [simulationRainfall, setSimulationRainfall] = useState(45); // mm/h slider
  const [activePillarTab, setActivePillarTab] = useState("reroute");
  const [faqOpenIndex, setFaqOpenIndex] = useState(0);

  const carouselRef = useRef(null);

  // Animated counters state
  const [counts, setCounts] = useState({ forts: 0, trails: 0, cisterns: 0, sync: 0 });

  useEffect(() => {
    fetchForts();
  }, [fetchForts]);

  // Smooth count-up animation on load
  useEffect(() => {
    let startTimestamp = null;
    const duration = 1500;
    const targets = { forts: 18, trails: 72, cisterns: 54, sync: 100 };

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      setCounts({
        forts: Math.floor(ease * targets.forts),
        trails: Math.floor(ease * targets.trails),
        cisterns: Math.floor(ease * targets.cisterns),
        sync: Math.floor(ease * targets.sync),
      });

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, []);

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Filtered forts for carousel
  const filteredForts = FORTS_DIRECTORY.filter((f) => {
    if (activeTab === "unesco") return UNESCO_FORTS.has(f.slug);
    if (activeTab === "high") return f.elevation >= 1200;
    if (activeTab === "sea") return f.region === "sea";
    return true;
  });

  const spotlightFort = FORTS_DIRECTORY.find((f) => f.slug === selectedSpotlightSlug) || FORTS_DIRECTORY[0];

  // Dynamic simulation calculations
  const simRiskScore = Math.min(100, Math.round(15 + (simulationRainfall / 120) * 80));
  const isTrailSevered = simRiskScore >= 75;
  const simSlipperiness = Math.min(100, Math.round(simulationRainfall * 0.95));

  const faqs = [
    {
      q: "Why do standard weather apps fail in the Sahyadri mountain range?",
      a: "Standard forecasts report city-level observations (e.g. Pune or Satara city centers), which miss the violent orographic lift that occurs when moist Arabian Sea monsoon winds collide with the 1,400m vertical Western Ghats scarp. FortFlux ingests localized Open-Meteo elevation-interpolated telemetry specifically for high-altitude fort summits.",
    },
    {
      q: "How does Dynamic Dijkstra Trail Severance work?",
      a: "FortFlux models each fortress trail system as a directed weighted graph. When localized rainfall or crowdsourced landslide reports push a trail segment's risk score above 75%, our algorithm automatically eliminates that edge and computes the safest alternate descent path before trekkers reach the hazard zone.",
    },
    {
      q: "What role do ancient Maratha cisterns play in modern safety?",
      a: "Constructed over 350 years ago by rock-cut stone artisans, these 54 cisterns hold perennial potable water across desolate ridgelines. FortFlux maps water level, potability status, and emergency access points so stranded trekkers can locate hydration even during severe weather delays.",
    },
    {
      q: "How does crowdsourced citizen telemetry verify real incidents?",
      a: "Trekkers can submit geo-tagged field reports with photos when they encounter fallen boulders, washed-out stone steps, or flooded gorges. Forest Department rangers verify or triage these reports from their command console, automatically updating trail warnings across the platform.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F8F4] text-slate-800 selection:bg-emerald-100 selection:text-emerald-900 font-sans">

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 1. HERO SECTION: Cinematic Sahyadri Fortress Sunset Backdrop   */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#07170E] text-white pt-10 pb-24 md:pt-14 md:pb-32 border-b border-[#143321]">
        {/* High-Impact Sahyadri Background: Living Mountain Fortress at Sunset */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/bg-image_for_landingpage.jpg"
            alt="Sahyadri Living Heritage Fortress Landscape"
            className="w-full h-full object-cover object-[center_35%] scale-105 contrast-[1.08] brightness-[0.82] saturate-[1.15] transition-transform duration-1000"
          />
          {/* Natural Atmospheric Gradient Layers: Deep protective contrast on text side, crystal-clear panorama on the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#06150C]/95 via-[#06150C]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07170E] via-transparent to-[#07170E]/40" />
          {/* Subtle Ambient Warm & Emerald Glow Cones */}
          <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 left-10 w-[500px] h-[350px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Pill: Sahyadri Platform Mission */}
          <div className="flex flex-wrap items-center gap-3 mb-6 animate-fade-in-down">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-950/85 border border-emerald-400/40 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-black/30">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="tracking-wide">PCCOE IGC 2026 • Sahyadri Living Heritage Platform</span>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-200 bg-amber-950/60 border border-amber-500/30 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-xs">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              18 Living Fortresses • UNESCO Maratha Military Landscapes
            </span>
          </div>

          {/* Expansive Hero Content Container */}
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] drop-shadow-xl">
              Living Mountain Heritage <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300">
                Protected by Micro-Climate Intelligence
              </span>
            </h1>

            <div className="p-5 sm:p-6 rounded-3xl bg-black/40 border border-white/15 backdrop-blur-xl shadow-xl space-y-2.5 ring-1 ring-white/10 max-w-2xl">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm sm:text-base">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
                Micro-Climate Resilience & Dynamic Trail Safety for Living Heritage
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                FortFlux bridges 350+ years of Maratha architectural legacy with modern environmental telemetry. We detect localized cloudbursts, autonomously sever compromised trails via topological Dijkstra graphs, and catalog ancient rock-cut cisterns for emergency hydration.
              </p>
            </div>

            {/* User-Friendly Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                to={authUser ? "/dashboard" : "/login"}
                className="px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-bold shadow-xl shadow-emerald-950/70 hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5 group ring-2 ring-emerald-400/30 cursor-pointer"
              >
                <Compass className="w-5 h-5 text-emerald-100 group-hover:rotate-45 transition-transform" />
                <span>{authUser ? "Open Trekker Dashboard" : "Explore Fortress Trails"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#interactive-simulation"
                className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-emerald-400/50 text-sm font-bold transition-all duration-200 hover:scale-[1.02] flex items-center gap-2.5 backdrop-blur-md shadow-lg"
              >
                <Sliders className="w-4 h-4 text-amber-300" />
                <span>Try Live Simulation</span>
              </a>

              <Link
                to="/forts/rajgad/history"
                className="px-4 py-4 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1.5"
              >
                <span>View 18 Forts Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Quick Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs text-slate-200 font-medium max-w-2xl">
              <div className="flex items-center gap-2 bg-black/30 px-3.5 py-2.5 rounded-xl border border-white/10 backdrop-blur-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Real-Time Open-Meteo Sync</span>
              </div>
              <div className="flex items-center gap-2 bg-black/30 px-3.5 py-2.5 rounded-xl border border-white/10 backdrop-blur-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dynamic Dijkstra Rerouting</span>
              </div>
              <div className="flex items-center gap-2 bg-black/30 px-3.5 py-2.5 rounded-xl border border-white/10 backdrop-blur-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>54 Ancient Cisterns</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 2. LIVE IMPACT TICKER: 4 Environmental Telemetry Metrics        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative -mt-10 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

          {/* Metric 1 */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2ECE4] shadow-md hover-lift transition-all group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform">
                <Mountain className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                100% DEM Mapped
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-black text-[#132A22] tracking-tight">
                {counts.forts}
              </div>
              <div className="text-xs font-bold text-[#132A22] mt-1">Living Fortresses</div>
              <p className="text-[11px] text-[#52685E] mt-0.5 leading-snug">
                Covering Pune, Raigad, Satara, and Konkan mountain ridges.
              </p>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2ECE4] shadow-md hover-lift transition-all group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 group-hover:scale-110 transition-transform">
                <Navigation className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                Dynamic Mesh
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-black text-[#132A22] tracking-tight">
                {counts.trails}+
              </div>
              <div className="text-xs font-bold text-[#132A22] mt-1">Monitored Trails</div>
              <p className="text-[11px] text-[#52685E] mt-0.5 leading-snug">
                Real-time slope, rainfall runoff & footfall hazard indexing.
              </p>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2ECE4] shadow-md hover-lift transition-all group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 group-hover:scale-110 transition-transform">
                <Droplets className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                Hydraulic Legacy
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-black text-[#132A22] tracking-tight">
                {counts.cisterns}
              </div>
              <div className="text-xs font-bold text-[#132A22] mt-1">Ancient Cisterns</div>
              <p className="text-[11px] text-[#52685E] mt-0.5 leading-snug">
                Rock-cut tanks tracked for potability & emergency hydration.
              </p>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2ECE4] shadow-md hover-lift transition-all group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Sub-km Accuracy
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-black text-[#132A22] tracking-tight">
                {counts.sync}%
              </div>
              <div className="text-xs font-bold text-[#132A22] mt-1">Open-Meteo Sync</div>
              <p className="text-[11px] text-[#52685E] mt-0.5 leading-snug">
                Zero-latency micro-weather forecast models for cloudbursts.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 3. INTERACTIVE SIMULATION & HOW FORTFLUX WORKS                   */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section id="interactive-simulation" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
            Interactive Safety Sandbox
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#132A22] tracking-tight mt-3">
            See FortFlux In Action
          </h2>
          <p className="text-xs sm:text-sm text-[#52685E] mt-2">
            Experience how our dynamic algorithm responds when high-altitude rainfall spikes on narrow basalt ridges.
          </p>
        </div>

        {/* Interactive Simulation Sandbox Container */}
        <div className="bg-white border border-[#E2ECE4] rounded-3xl p-6 sm:p-10 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Col: Interactive Controls Slider */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-[#132A22]">
                  Monsoon Cloudburst Simulation Slider
                </h3>
              </div>
              <p className="text-xs text-[#52685E] leading-relaxed">
                Drag the rainfall simulator below. Watch how localized torrential rainfall alters rock face slipperiness and automatically triggers Dijkstra trail severance when risk exceeds 75%.
              </p>

              {/* Slider Control */}
              <div className="p-5 rounded-2xl bg-[#F8FAF8] border border-[#E2ECE4] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#132A22] flex items-center gap-1.5">
                    <CloudRain className="w-4 h-4 text-teal-600" />
                    Simulated Hourly Precipitation:
                  </span>
                  <span className="text-base font-black text-emerald-700 bg-white px-3 py-1 rounded-xl border border-emerald-200 shadow-xs">
                    {simulationRainfall} mm/h
                  </span>
                </div>

                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={simulationRainfall}
                  onChange={(e) => setSimulationRainfall(Number(e.target.value))}
                  className="w-full accent-emerald-600 h-2 bg-[#D5E2D8] rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-[#52685E] font-medium">
                  <span>5 mm/h (Light Mist)</span>
                  <span>45 mm/h (Steady Rain)</span>
                  <span>80 mm/h (Heavy Cloudburst)</span>
                  <span>120 mm/h (Ghats Deluge)</span>
                </div>
              </div>

              {/* Calculated Outputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#E2ECE4] shadow-xs">
                  <div className="text-[10px] font-bold text-[#52685E] uppercase">Basalt Slipperiness</div>
                  <div className="text-xl font-extrabold text-[#132A22] mt-1">{simSlipperiness}%</div>
                  <div className="text-[10px] text-amber-700 mt-1 flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-amber-600" />
                    {simSlipperiness > 60 ? "High slick hazard on stone stairs" : "Normal basalt friction"}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E2ECE4] shadow-xs">
                  <div className="text-[10px] font-bold text-[#52685E] uppercase">Trail Hazard Index</div>
                  <div className={`text-xl font-extrabold mt-1 ${isTrailSevered ? "text-rose-600" : "text-emerald-700"}`}>
                    {simRiskScore}%
                  </div>
                  <div className="text-[10px] mt-1 flex items-center gap-1">
                    {isTrailSevered ? (
                      <span className="text-rose-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" /> CRITICAL — SEVERED
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" /> PASSABLE / SAFE
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Live Topological Graph Response Visualizer */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl p-6 bg-[#0E2017] text-white border border-emerald-900 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-emerald-400" />
                    Topological Route Solver (Rajgad Fort)
                  </span>
                  <span className="text-[10px] font-mono text-slate-300">Dijkstra Engine</span>
                </div>

                {/* Visual Route Nodes */}
                <div className="space-y-3">
                  
                  {/* Trail 1: Gunjawane via Chor Darwaja */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    isTrailSevered
                      ? "bg-rose-950/40 border-rose-500/50 text-rose-200"
                      : "bg-white/5 border-white/10 text-slate-200"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold">
                        Trail A: Gunjawane → Chor Darwaja (Steep Basalt)
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isTrailSevered ? "bg-rose-600 text-white animate-pulse" : "bg-emerald-900/60 text-emerald-300"
                      }`}>
                        {isTrailSevered ? "SEVERED & BLOCKED" : "ACTIVE ROUTE"}
                      </span>
                    </div>
                    <div className="text-[11px] mt-1 text-slate-400">
                      {isTrailSevered
                        ? "⚠️ Flash flood risk >= 75%. Edge pruned from graph. Trekkers rerouted."
                        : "✓ Slope stable. Safe for standard trekking ascent."}
                    </div>
                  </div>

                  {/* Trail 2: Pali Gate Main Highway */}
                  <div className="p-3.5 rounded-xl border bg-emerald-950/40 border-emerald-500/40 text-emerald-200">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold">
                        Trail B: Pali Darwaja (Paved Royal Highway)
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                        {isTrailSevered ? "AUTONOMOUS ESCAPE PATH" : "RECOMMENDED PATH"}
                      </span>
                    </div>
                    <div className="text-[11px] mt-1 text-emerald-300/80">
                      Broad stone steps with drainage canals. Selected by Dijkstra algorithm as primary safe path.
                    </div>
                  </div>

                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-[11px] text-slate-300 flex items-center justify-between">
                  <span>Graph Compute Time: <strong>14ms</strong></span>
                  <span className="text-emerald-400 font-bold">100% Fail-safe Trail Routing</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 4. INTERACTIVE FORT SHOWCASE CAROUSEL (18 Heritage Forts)      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-[#EDF3EE] border-y border-[#E2ECE4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  Maratha Military Landscapes of India
                </span>
                <span className="text-xs text-[#52685E] font-medium hidden sm:inline">UNESCO Nominated / Inscribed</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#132A22] tracking-tight">
                Explore All 18 Sahyadri Fortresses
              </h2>
              <p className="text-xs sm:text-sm text-[#52685E] mt-1">
                Click any fortress to inspect its historical spotlight, live summit altitude, and regional significance.
              </p>
            </div>

            {/* Filter Tabs & Scroll Arrows */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex p-1 bg-white border border-[#E2ECE4] rounded-2xl shadow-xs">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "all" ? "bg-emerald-600 text-white shadow-xs" : "text-[#52685E] hover:text-[#132A22]"
                  }`}
                >
                  All (18)
                </button>
                <button
                  onClick={() => setActiveTab("unesco")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "unesco" ? "bg-emerald-600 text-white shadow-xs" : "text-[#52685E] hover:text-[#132A22]"
                  }`}
                >
                  UNESCO (8)
                </button>
                <button
                  onClick={() => setActiveTab("high")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "high" ? "bg-emerald-600 text-white shadow-xs" : "text-[#52685E] hover:text-[#132A22]"
                  }`}
                >
                  &gt;1200m
                </button>
                <button
                  onClick={() => setActiveTab("sea")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "sea" ? "bg-emerald-600 text-white shadow-xs" : "text-[#52685E] hover:text-[#132A22]"
                  }`}
                >
                  Sea Forts (3)
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={() => scrollCarousel("left")}
                  aria-label="Scroll left"
                  className="p-2 rounded-xl bg-white border border-[#E2ECE4] hover:bg-slate-50 text-[#132A22] shadow-xs transition cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollCarousel("right")}
                  aria-label="Scroll right"
                  className="p-2 rounded-xl bg-white border border-[#E2ECE4] hover:bg-slate-50 text-[#132A22] shadow-xs transition cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Carousel Cards */}
          <div
            ref={carouselRef}
            className="flex gap-5 overflow-x-auto pb-6 scrollbar-thin scroll-smooth snap-x snap-mandatory"
          >
            {filteredForts.map((fort) => {
              const isUnesco = UNESCO_FORTS.has(fort.slug);
              const imageSrc = FORT_LOCAL_IMAGES[fort.slug] || `/forts/${fort.slug}.jpg`;
              const isSelected = fort.slug === selectedSpotlightSlug;

              return (
                <div
                  key={fort.slug}
                  onClick={() => setSelectedSpotlightSlug(fort.slug)}
                  className={`flex-shrink-0 w-72 sm:w-80 rounded-3xl overflow-hidden bg-white border transition-all duration-300 group snap-start flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? "border-emerald-600 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/20"
                      : "border-[#E2ECE4] shadow-sm hover:shadow-lg hover:border-emerald-300"
                  }`}
                >
                  {/* Image & Badges */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={imageSrc}
                      alt={fort.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/forts/rajgad.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      {isUnesco ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/90 text-white backdrop-blur-md shadow-xs border border-amber-300">
                          <Award className="w-3 h-3 text-amber-200" /> UNESCO Heritage
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/50 text-white backdrop-blur-md border border-white/20">
                          Heritage Fortress
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-black/60 text-emerald-300 backdrop-blur-md border border-white/20">
                        <Mountain className="w-3 h-3 text-emerald-400" />
                        {fort.elevation}m
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-lg font-bold drop-shadow-sm group-hover:text-emerald-300 transition-colors">
                        {fort.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {fort.district} District
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <p className="text-xs text-[#52685E] leading-relaxed line-clamp-2">
                      {fort.desc}
                    </p>

                    <div className="pt-2 border-t border-[#E2ECE4] flex items-center justify-between">
                      <Link
                        to={`/forts/${fort.slug}/history`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
                      >
                        Inspect History
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>

                      <span className="text-[10px] font-bold text-slate-400">
                        Peak: {fort.peak}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Fortress Spotlight Box */}
          <div className="mt-8 bg-white border border-[#E2ECE4] rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-4 relative rounded-2xl overflow-hidden h-60 bg-slate-100 border border-[#E2ECE4]">
                <img
                  src={FORT_LOCAL_IMAGES[spotlightFort.slug] || `/forts/${spotlightFort.slug}.jpg`}
                  alt={spotlightFort.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/forts/rajgad.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <div className="text-lg font-black">{spotlightFort.name}</div>
                  <div className="text-xs text-emerald-300 font-semibold">{spotlightFort.district} • {spotlightFort.elevation}m Altitude</div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Fortress Spotlight
                    </span>
                    {UNESCO_FORTS.has(spotlightFort.slug) && (
                      <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-600" /> Official UNESCO Nominated
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/forts/${spotlightFort.slug}/history`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 transition"
                  >
                    Open Deep History Guide <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <h3 className="text-xl font-bold text-[#132A22]">
                  {spotlightFort.name} — Strategic Significance
                </h3>
                <p className="text-xs sm:text-sm text-[#52685E] leading-relaxed">
                  {spotlightFort.desc} {spotlightFort.historicHighlight}
                </p>

                <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#F8FAF8] border border-[#E2ECE4]">
                    <span className="text-[10px] text-[#52685E] font-medium">Summit Peak</span>
                    <div className="font-bold text-[#132A22]">{spotlightFort.peak}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F8FAF8] border border-[#E2ECE4]">
                    <span className="text-[10px] text-[#52685E] font-medium">Regional Belt</span>
                    <div className="font-bold text-[#132A22] capitalize">{spotlightFort.region} Sahyadri</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F8FAF8] border border-[#E2ECE4]">
                    <span className="text-[10px] text-[#52685E] font-medium">Digital Model</span>
                    <div className="font-bold text-emerald-700">High-Res DEM Active</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 5. THE SAHYADRI CHALLENGE & OUR SOLUTION                       */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
            Real-World Impact
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#132A22] tracking-tight mt-3">
            The Problem We Are Solving
          </h2>
          <p className="text-xs sm:text-sm text-[#52685E] mt-2">
            Every monsoon season, over 500,000 adventure seekers ascend the Western Ghats with outdated city forecasts, leading to preventable injuries, flash flood strandings, and search & rescue emergencies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-6 border border-[#E2ECE4] shadow-xs hover-lift transition">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 mb-4">
              <CloudRain className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#132A22] mb-2">Unpredicted Cloudbursts</h3>
            <p className="text-xs text-[#52685E] leading-relaxed">
              City forecasts predict gentle showers while high ridges like Torna and Harishchandragad experience 90mm/h deluges that transform walking trails into roaring boulder cascades.
            </p>
            <div className="mt-4 pt-3 border-t border-[#E2ECE4] text-[11px] font-bold text-emerald-700 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> FortFlux tracks sub-km elevation radar
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 border border-[#E2ECE4] shadow-xs hover-lift transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#132A22] mb-2">Static Paper Trail Maps</h3>
            <p className="text-xs text-[#52685E] leading-relaxed">
              Existing trekking apps treat mountain trails as static lines. When a key staircase is submerged or blocked by a landslide, trekkers are left stranded with no alternate escape route.
            </p>
            <div className="mt-4 pt-3 border-t border-[#E2ECE4] text-[11px] font-bold text-emerald-700 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Autonomous topological Dijkstra graph severance
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 border border-[#E2ECE4] shadow-xs hover-lift transition">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 mb-4">
              <Droplets className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#132A22] mb-2">Neglected Hydraulic Heritage</h3>
            <p className="text-xs text-[#52685E] leading-relaxed">
              350-year-old rock-cut cisterns capable of saving lives are unmonitored and suffer from contamination or algae buildup without structured telemetry and citizen reporting.
            </p>
            <div className="mt-4 pt-3 border-t border-[#E2ECE4] text-[11px] font-bold text-emerald-700 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> 54 Cisterns with potability telemetry
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 6. INTERACTIVE FAQ ACCORDION                                    */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-[#EDF3EE] border-t border-[#E2ECE4]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#132A22] tracking-tight mt-2">
              Everything You Need to Know About FortFlux
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((item, idx) => {
              const isOpen = faqOpenIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#E2ECE4] overflow-hidden shadow-xs transition"
                >
                  <button
                    type="button"
                    onClick={() => setFaqOpenIndex(isOpen ? -1 : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-bold text-sm text-[#132A22] flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      {item.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-[#52685E] leading-relaxed border-t border-slate-100">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 7. PROPER, COMPREHENSIVE FOOTER                                 */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <footer className="bg-white border-t border-[#E2ECE4] pt-14 pb-8 text-[#52685E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-[#E2ECE4]">
            
            {/* Brand & Mission */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-600/30 p-0.5 bg-white shadow-sm ring-2 ring-emerald-600/15">
                  <img
                    src="/fortflux_logo.jpeg"
                    alt="FortFlux Logo"
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/logo.png";
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg text-[#132A22]">FortFlux</span>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      v1.0
                    </span>
                  </div>
                  <p className="text-[11px] text-[#52685E]">Sahyadri Mountain Micro-Climate & Dynamic Trail Platform</p>
                </div>
              </div>

              <p className="text-xs text-[#52685E] leading-relaxed max-w-md">
                An innovative environmental safety system dedicated to the preservation of Maharashtra's 18 historic Maratha fortresses and the protection of over 500,000 annual high-altitude Sahyadri trekkers.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <Link
                  to={authUser ? "/dashboard" : "/login"}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Launch Trekker Portal
                </Link>
                <Link
                  to="/forts/rajgad/history"
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
                >
                  Browse Fort Directory
                </Link>
              </div>
            </div>

            {/* Col 2: Top Fortresses */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-extrabold text-[#132A22] uppercase tracking-wider">
                Featured Forts
              </h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/forts/rajgad/history" className="hover:text-emerald-700 transition">Rajgad Fort (1376m)</Link></li>
                <li><Link to="/forts/raigad/history" className="hover:text-emerald-700 transition">Raigad Fort (820m)</Link></li>
                <li><Link to="/forts/torna/history" className="hover:text-emerald-700 transition">Torna Fort (1403m)</Link></li>
                <li><Link to="/forts/purandar/history" className="hover:text-emerald-700 transition">Purandar Fort (1387m)</Link></li>
                <li><Link to="/forts/sinhagad/history" className="hover:text-emerald-700 transition">Sinhagad Fort (1312m)</Link></li>
                <li><Link to="/forts/harishchandragad/history" className="hover:text-emerald-700 transition">Harishchandragad (1422m)</Link></li>
              </ul>
            </div>

            {/* Col 3: Architecture & Tech */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-extrabold text-[#132A22] uppercase tracking-wider">
                Core Capabilities
              </h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Open-Meteo Micro-Weather</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Dynamic Dijkstra Rerouting</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                  <span>54 Ancient Cistern Reserves</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Citizen Hazard Crowdsourcing</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>UNESCO Military Landscapes</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Hackathon Attribution */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-extrabold text-[#132A22] uppercase tracking-wider">
                Hackathon Event
              </h4>
              <p className="text-xs leading-relaxed">
                Developed for <strong>PCCOE IGC 2026</strong>. Built with React 19, MapLibre GL, Node/Express, MongoDB, and Open-Meteo API.
              </p>
              <div className="pt-1 text-[11px] text-emerald-800 font-bold">
                Maharashtra Living Heritage Protection
              </div>
            </div>

          </div>

          {/* Safety & Emergency Disclaimer Notice */}
          <div className="my-6 p-4 rounded-2xl bg-[#F8FAF8] border border-[#E2ECE4] text-[11px] text-[#52685E] leading-relaxed flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Mountain Safety Advisory:</strong> FortFlux is an informational micro-climate safety platform. Mountain weather in the Western Ghats can change within minutes. Always carry physical topographic compasses, emergency rain gear, and adhere to official Maharashtra Forest Department red alerts and trail closures.
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#52685E] gap-4 pt-4 border-t border-[#E2ECE4]">
            <div>
              © 2026 FortFlux — Sahyadri Mountain Fort Micro-Climate & Dynamic Trail Safety Platform.
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-emerald-800">PCCOE IGC 2026 Innovation</span>
              <span>•</span>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="hover:text-emerald-700 font-bold transition cursor-pointer"
              >
                Back to Top ↑
              </button>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
