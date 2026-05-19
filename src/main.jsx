import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  ChevronRight,
  Cpu,
  Crosshair,
  DatabaseZap,
  FileScan,
  Gauge,
  Layers3,
  LineChart,
  MapPin,
  Maximize2,
  Microscope,
  Play,
  Radiation,
  ScanLine,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Upload,
  Zap
} from 'lucide-react';
import './styles.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8001';

const defaultMetricValues = {
  noiseReduction: '72%',
  scanConfidence: '94%',
  reconstructionScore: '0.91'
};

const impact = [
  {
    title: 'Rural Healthcare',
    copy: 'Sharper scans on lower-dose equipment where advanced imaging access is limited.',
    icon: MapPin
  },
  {
    title: 'Oncology',
    copy: 'Cleaner longitudinal CT studies for patients who need repeated monitoring.',
    icon: Activity
  },
  {
    title: 'Emergency Care',
    copy: 'Fast reconstruction support when clinicians need readable scans immediately.',
    icon: Zap
  },
  {
    title: 'Diagnostic Labs',
    copy: 'Consistent enhancement workflows that help radiologists compare cases faster.',
    icon: Microscope
  }
];

const defaultScanData = [
  { label: 'Lung window', value: 88 },
  { label: 'Edge preservation', value: 81 },
  { label: 'Artifact control', value: 76 },
  { label: 'Soft tissue clarity', value: 84 }
];

function metricCards(metricValues) {
  return [
    { label: 'Noise Reduction', value: metricValues.noiseReduction, icon: SlidersHorizontal },
    { label: 'Scan Confidence', value: metricValues.scanConfidence, icon: ShieldCheck },
    { label: 'Reconstruction Score', value: metricValues.reconstructionScore, icon: Gauge }
  ];
}

function App() {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [backendReady, setBackendReady] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const workstationRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (!response.ok) throw new Error('Backend unavailable');
        setBackendReady(true);
      } catch (error) {
        setBackendReady(false);
      }
    };

    checkBackend();
  }, []);

  useEffect(() => {
    if (!processing) return undefined;
    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 92) return current;
        return Math.min(current + Math.floor(Math.random() * 6) + 4, 92);
      });
    }, 180);

    return () => window.clearInterval(interval);
  }, [processing]);

  const scrollToWorkstation = () => {
    workstationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const triggerUpload = () => {
    setErrorMessage('');
    scrollToWorkstation();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setSelectedFileName(file.name);
    setErrorMessage('');
    setProcessing(true);
    setProgress(8);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/reconstruct`, {
        method: 'POST',
        body: formData
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.detail ?? 'Reconstruction failed.');
      }

      setResult(payload);
      setBackendReady(true);
      setProgress(100);
      window.setTimeout(() => setProcessing(false), 320);
    } catch (error) {
      setProcessing(false);
      setProgress(0);
      setBackendReady(false);
      setErrorMessage(error.message ?? 'Unable to reconstruct the scan.');
    }
  };

  const activeMetrics = metricCards(result?.metrics ?? defaultMetricValues);
  const activeScanData = result?.scanData ?? defaultScanData;

  return (
    <main className="app-shell">
      <input
        ref={fileInputRef}
        type="file"
        accept=".dcm,.dicom,image/png,image/jpeg,image/webp,image/bmp,.png,.jpg,.jpeg,.webp,.bmp"
        className="sr-only-input"
        onChange={handleFileChange}
      />
      <RadiologyBackground />
      <Navigation onDemo={scrollToWorkstation} />
      <Hero
        backendReady={backendReady}
        onUpload={triggerUpload}
        onDemo={scrollToWorkstation}
        selectedFileName={selectedFileName}
        summary={result?.summary}
        result={result}
        metrics={activeMetrics}
      />
      <section ref={workstationRef} className="section workstation-section" id="workstation">
        <SectionHeader
          eyebrow="AI Reconstruction Demo"
          title="A diagnostic console for low-dose CT clarity."
          copy="Simulate the full reconstruction path from noisy acquisition to enhanced clinical output with live quality indicators."
        />
        <Workstation
          processing={processing}
          progress={progress}
          onProcess={triggerUpload}
          result={result}
          errorMessage={errorMessage}
          selectedFileName={selectedFileName}
          scanData={activeScanData}
        />
      </section>
      <RadiationTradeoff />
      <GanFlow />
      <ImpactSection />
    </main>
  );
}

function Navigation({ onDemo }) {
  return (
    <header className="nav-wrap">
      <a className="brand" href="#top" aria-label="RayDiagnostics home">
        <span className="brand-mark"><ScanLine size={20} /></span>
        <span>RayDiagnostics</span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#workstation">Workstation</a>
        <a href="#tradeoff">Safety</a>
        <a href="#gan">Model</a>
        <a href="#impact">Impact</a>
      </nav>
      <button className="nav-action" onClick={onDemo}>
        <Play size={16} />
        View Demo
      </button>
    </header>
  );
}

function Hero({ backendReady, onUpload, onDemo, selectedFileName, summary, result, metrics }) {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <motion.div
          className="status-pill"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="live-dot" />
          {backendReady ? 'Low-dose CT reconstruction engine online' : 'Backend connection warming up'}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08 }}
        >
          RayDiagnostics
          <span>AI-Powered Low-Dose CT Reconstruction</span>
        </motion.h1>
        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.16 }}
        >
          Enhancing diagnostic clarity while reducing radiation exposure through a cinematic,
          radiologist-ready reconstruction interface.
        </motion.p>
        {(selectedFileName || summary) && (
          <motion.p
            className="hero-subtitle hero-status"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {summary ?? `Ready with ${selectedFileName}`}
          </motion.p>
        )}
        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24 }}
        >
          <button className="primary-btn" onClick={onUpload}>
            <Upload size={18} />
            Upload Scan
          </button>
          <button className="secondary-btn" onClick={onDemo}>
            <Maximize2 size={18} />
            View Demo
          </button>
        </motion.div>
      </div>
      <motion.div
        className="hero-visual"
        initial={{ opacity: 0, scale: 0.94, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.12 }}
      >
        <ComparisonScanner result={result} metrics={metrics} />
      </motion.div>
    </section>
  );
}

function ComparisonScanner({ result, metrics }) {
  const [position, setPosition] = useState(56);

  return (
    <div className="scanner-card">
      <div className="scanner-topline">
        <div>
          <span>CT-RECON-04</span>
          <strong>Before / After</strong>
        </div>
        <div className="scanner-chip">Live Preview</div>
      </div>
      <div className="comparison-frame">
        <CtSlice variant="low" imageSrc={result?.lowDoseImage ?? result?.sourcePreviewImage} altText="Low dose CT preview" />
        <div className="enhanced-layer" style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
          <CtSlice variant="enhanced" imageSrc={result?.enhancedImage} altText="Enhanced CT preview" />
        </div>
        <div className="comparison-line" style={{ left: `${position}%` }}>
          <span />
        </div>
        <input
          aria-label="Compare low dose and enhanced scan"
          type="range"
          min="8"
          max="92"
          value={position}
          onChange={(event) => setPosition(event.target.value)}
          className="comparison-range"
        />
        <div className="frame-label low">Low Dose</div>
        <div className="frame-label enhanced">Enhanced</div>
      </div>
      <div className="scan-readouts">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label}>
            <Icon size={17} />
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function CtSlice({ variant = 'low', imageSrc, altText }) {
  const enhanced = variant === 'enhanced';
  const isRealImage = Boolean(imageSrc);
  return (
    <div className={`ct-slice ${enhanced ? 'ct-enhanced' : 'ct-low'} ${imageSrc ? 'ct-image-frame' : ''}`}>
      {imageSrc ? (
        <img className="ct-image" src={imageSrc} alt={altText} />
      ) : (
        <>
          <div className="ct-ring ring-one" />
          <div className="ct-ring ring-two" />
          <div className="ct-ring ring-three" />
          <div className="ct-spine" />
          <div className="ct-lesion lesion-one" />
          <div className="ct-lesion lesion-two" />
        </>
      )}
      {!isRealImage && <div className="ct-grid" />}
      {!isRealImage && <div className="scanline" />}
    </div>
  );
}

function Workstation({ processing, progress, onProcess, result, errorMessage, selectedFileName, scanData }) {
  return (
    <div className="workstation">
      <div className="viewport-strip">
        <ScanPanel
          title="Low Dose Scan"
          label={selectedFileName ? 'Uploaded acquisition' : 'Noisy acquisition'}
          icon={Radiation}
          tone="low"
          imageSrc={result?.lowDoseImage ?? result?.sourcePreviewImage}
        />
        <div className="process-column">
          <div className="pulse-core">
            <BrainCircuit size={34} />
            <span />
          </div>
          <ArrowRight size={26} />
          <button className="primary-btn compact" onClick={onProcess}>
            <Cpu size={17} />
            Reconstruct
          </button>
        </div>
        <ScanPanel
          title="AI Reconstruction"
          label={processing ? 'Inference active' : 'Denoised anatomy'}
          icon={Sparkles}
          tone="ai"
          imageSrc={result?.enhancedImage}
        />
        <div className="process-column desktop-only">
          <ArrowRight size={26} />
        </div>
        <ScanPanel
          title="Enhanced Output"
          label={result ? 'Clinical clarity' : 'Awaiting upload'}
          icon={ShieldCheck}
          tone="enhanced"
          imageSrc={result?.enhancedImage}
        />
      </div>
      <div className="analysis-grid">
        <div className="glass-panel upload-panel">
          <div className="panel-title">
            <FileScan size={19} />
            Upload Simulation
          </div>
          <div className={`drop-zone ${processing ? 'is-processing' : ''}`} onClick={onProcess}>
            <ScanLine size={34} />
            <strong>{processing ? 'Reconstructing anatomy...' : selectedFileName || 'Drop DICOM / CT slice'}</strong>
            <span>
              {processing
                ? `${progress}% complete`
                : errorMessage || result?.summary || 'Click to upload and reconstruct'}
            </span>
            <div className="progress-track">
              <div style={{ width: `${processing ? progress : 18}%` }} />
            </div>
          </div>
        </div>
        <div className="glass-panel">
          <div className="panel-title">
            <LineChart size={19} />
            Quality Readout
          </div>
          <div className="readout-list">
            {scanData.map((item) => (
              <div className="readout-item" key={item.label}>
                <span>{item.label}</span>
                <div>
                  <i style={{ width: `${item.value}%` }} />
                </div>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel heatmap-panel">
          <div className="panel-title">
            <Crosshair size={19} />
            Difference Heatmap
          </div>
          <div className="heatmap">
            {result?.heatmapImage ? (
              <CtSlice variant="enhanced" imageSrc={result.heatmapImage} altText="Difference heatmap" />
            ) : (
              <>
                <span className="heat a" />
                <span className="heat b" />
                <span className="heat c" />
                <CtSlice variant="enhanced" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScanPanel({ title, label, icon: Icon, tone, imageSrc }) {
  return (
    <article className={`scan-panel ${tone}`}>
      <div className="scan-panel-head">
        <div>
          <Icon size={18} />
          <span>{title}</span>
        </div>
        <strong>{label}</strong>
      </div>
      <div className="mini-scan">
        <CtSlice variant={tone === 'low' ? 'low' : 'enhanced'} imageSrc={imageSrc} altText={title} />
      </div>
    </article>
  );
}

function RadiationTradeoff() {
  return (
    <section className="section" id="tradeoff">
      <SectionHeader
        eyebrow="Radiation Trade-off"
        title="Higher Quality should not mean High Radiation Exposure."
        copy="The interface frames the clinical compromise clearly: safer acquisition, smarter reconstruction, better readability."
      />
      <div className="tradeoff">
        <TradeCard
          title="High Dose"
          stat="Clearer"
          copy="Higher photon count improves signal but increases exposure burden."
          icon={Radiation}
        />
        <div className="balance-core">
          <div className="balance-ring">
            <ShieldCheck size={42} />
          </div>
          <span>Your Solution</span>
        </div>
        <TradeCard
          title="Low Dose"
          stat="Safer"
          copy="Reduced radiation can introduce noise that obscures anatomical detail."
          icon={ShieldCheck}
        />
      </div>
    </section>
  );
}

function TradeCard({ title, stat, copy, icon: Icon }) {
  return (
    <div className="glass-panel trade-card">
      <Icon size={24} />
      <h3>{title}</h3>
      <strong>{stat}</strong>
      <p>{copy}</p>
    </div>
  );
}

function GanFlow() {
  const steps = [
    { title: 'Noisy CT', icon: FileScan },
    { title: 'Generator', icon: Cpu },
    { title: 'Discriminator', icon: DatabaseZap },
    { title: 'Enhanced Image', icon: Sparkles }
  ];

  return (
    <section className="section" id="gan">
      <SectionHeader
        eyebrow="Model Flow"
        title="GAN logic without the lecture."
        copy="A clean flow explains how the system learns the difference between noisy acquisition and diagnostically useful reconstruction."
      />
      <div className="gan-flow">
        {steps.map(({ title, icon: Icon }, index) => (
          <React.Fragment key={title}>
            <motion.div
              className="gan-node glass-panel"
              whileHover={{ y: -6, borderColor: 'rgba(143, 211, 255, 0.72)' }}
            >
              <Icon size={28} />
              <span>{title}</span>
            </motion.div>
            {index < steps.length - 1 && (
              <div className="flow-arrow">
                <ChevronRight size={24} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

function ImpactSection() {
  return (
    <section className="section impact-section" id="impact">
      <SectionHeader
        eyebrow="Clinical Impact"
        title="Designed for places where clarity changes outcomes."
        copy="A polished project experience that still communicates the real-world healthcare motivation."
      />
      <div className="impact-grid">
        {impact.map(({ title, copy, icon: Icon }) => (
          <motion.article
            className="glass-panel impact-card"
            key={title}
            whileHover={{ y: -8 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          >
            <Icon size={25} />
            <h3>{title}</h3>
            <p>{copy}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, copy }) {
  return (
    <div className="section-header">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{copy}</p>
    </div>
  );
}

function RadiologyBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 45, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 45, damping: 18 });
  const x = useTransform(springX, [0, 1], [-18, 18]);
  const y = useTransform(springY, [0, 1], [-12, 12]);

  useEffect(() => {
    const onMove = (event) => {
      mouseX.set(event.clientX / window.innerWidth);
      mouseY.set(event.clientY / window.innerHeight);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [mouseX, mouseY]);

  const particles = useMemo(
    () => Array.from({ length: 24 }, (_, index) => ({ id: index, left: (index * 37) % 100, top: (index * 53) % 100 })),
    []
  );

  return (
    <div className="radiology-bg" aria-hidden="true">
      <motion.div className="bg-scan-orbit" style={{ x, y }} />
      <div className="grid-overlay" />
      <div className="noise-overlay" />
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.id * -0.7}s`
          }}
        />
      ))}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
