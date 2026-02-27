import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  History, 
  Code, 
  Leaf, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Trash2,
  Cpu,
  Smartphone,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { TFLiteService } from './services/tfliteService';
import { HistoryService } from './services/historyService';
import { FLUTTER_SNIPPETS } from './flutter_code/snippets';
import { HistoryItem, LeafResult } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'history' | 'flutter'>('scanner');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<LeafResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHistory(HistoryService.getHistory());
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (imageSrc: string) => {
    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      const scanResult = await TFLiteService.runInference(imageSrc);
      
      if (scanResult.confidence < 0.75) {
        setError("Unknown Leaf / Please Capture Clearly (Confidence < 75%)");
      } else {
        setResult(scanResult);
        const saved = HistoryService.saveItem(scanResult);
        setHistory(prev => [saved, ...prev]);
      }
    } catch (err) {
      setError("Failed to process image. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const deleteHistoryItem = (id: string) => {
    HistoryService.deleteItem(id);
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] px-6 py-4 flex items-center justify-between bg-[#E4E3E0] sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#141414] rounded-sm flex items-center justify-center">
            <Leaf className="text-[#E4E3E0] w-5 h-5" />
          </div>
          <h1 className="font-serif italic text-xl font-bold tracking-tight">LeafScan Pro</h1>
        </div>
        
        <nav className="flex gap-1">
          <TabButton 
            active={activeTab === 'scanner'} 
            onClick={() => setActiveTab('scanner')}
            icon={<Camera size={16} />}
            label="Scanner"
          />
          <TabButton 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')}
            icon={<History size={16} />}
            label="History"
          />
          <TabButton 
            active={activeTab === 'flutter'} 
            onClick={() => setActiveTab('flutter')}
            icon={<Code size={16} />}
            label="Flutter Guide"
          />
        </nav>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'scanner' && (
            <motion.div 
              key="scanner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Left Column: Input */}
              <div className="space-y-6">
                <div className="border border-[#141414] p-8 bg-white/50 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#141414] opacity-10 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-[#141414]/20 rounded-sm">
                    <div className="w-16 h-16 bg-[#141414]/5 rounded-full flex items-center justify-center mb-4">
                      <Upload className="text-[#141414]" size={32} />
                    </div>
                    <h3 className="font-serif italic text-lg mb-2">Upload Leaf Image</h3>
                    <p className="text-sm text-[#141414]/60 mb-6 text-center max-w-xs">
                      Select a clear photo of the leaf from your gallery or capture a new one.
                    </p>
                    
                    <div className="flex gap-3">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-2 bg-[#141414] text-[#E4E3E0] text-sm font-medium hover:bg-[#141414]/90 transition-colors flex items-center gap-2"
                      >
                        <Upload size={14} /> Browse Gallery
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FeatureCard icon={<Cpu size={20} />} title="Edge AI" desc="Offline TFLite" />
                  <FeatureCard icon={<Smartphone size={20} />} title="Mobile First" desc="Optimized INT8" />
                  <FeatureCard icon={<ShieldCheck size={20} />} title="Safe" desc="75% Threshold" />
                </div>
              </div>

              {/* Right Column: Results */}
              <div className="border border-[#141414] bg-white min-h-[400px] flex flex-col">
                <div className="border-b border-[#141414] px-4 py-2 bg-[#141414] text-[#E4E3E0] flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-widest font-bold">Inference Engine Output</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                </div>

                <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                  {isScanning ? (
                    <div className="space-y-4 flex flex-col items-center">
                      <div className="w-12 h-12 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" />
                      <p className="font-mono text-xs animate-pulse">RUNNING TFLITE INFERENCE...</p>
                    </div>
                  ) : result ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full space-y-6"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-32 border border-[#141414] p-1 mb-4 bg-[#E4E3E0]">
                          <img src={result.image} alt="Scanned leaf" className="w-full h-full object-cover grayscale" />
                        </div>
                        <div className="flex items-center gap-2 text-green-600 mb-1">
                          <CheckCircle2 size={16} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Detection Successful</span>
                        </div>
                        <h2 className="text-3xl font-serif italic font-bold">{result.plantName}</h2>
                        <p className="text-lg text-[#141414]/70">{result.diseaseName}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t border-b border-[#141414]/10 py-6">
                        <div className="text-center">
                          <p className="text-[10px] uppercase font-bold text-[#141414]/40 mb-1">Confidence</p>
                          <p className="font-mono text-xl">{(result.confidence * 100).toFixed(1)}%</p>
                        </div>
                        <div className="text-center border-l border-[#141414]/10">
                          <p className="text-[10px] uppercase font-bold text-[#141414]/40 mb-1">Status</p>
                          <p className="font-mono text-xl uppercase text-green-600">Verified</p>
                        </div>
                      </div>

                      <div className="text-left space-y-3">
                        <p className="text-[10px] uppercase font-bold text-[#141414]/40">Pesticide Suggestions (Offline JSON)</p>
                        <ul className="space-y-2">
                          {result.pesticideSuggestions.map((s, i) => (
                            <li key={i} className="flex gap-2 text-sm items-start">
                              <ChevronRight size={14} className="mt-1 shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ) : error ? (
                    <div className="flex flex-col items-center text-red-600">
                      <AlertCircle size={48} className="mb-4" />
                      <h3 className="font-serif italic text-lg mb-2">Threshold Alert</h3>
                      <p className="text-sm max-w-xs">{error}</p>
                      <button 
                        onClick={() => setError(null)}
                        className="mt-6 px-4 py-2 border border-red-600 text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <div className="text-[#141414]/30 flex flex-col items-center">
                      <Cpu size={48} className="mb-4 opacity-20" />
                      <p className="font-mono text-xs">AWAITING INPUT SIGNAL...</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-end border-b border-[#141414] pb-4">
                <div>
                  <h2 className="text-3xl font-serif italic font-bold">Scan History</h2>
                  <p className="text-sm text-[#141414]/60">Stored locally using Hive simulation</p>
                </div>
                <p className="font-mono text-xs">{history.length} RECORDS FOUND</p>
              </div>

              {history.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-[#141414]/20">
                  <p className="text-[#141414]/40 italic">No history items found. Start scanning to see results here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {history.map((item) => (
                    <div key={item.id} className="border border-[#141414] bg-white group hover:shadow-xl transition-shadow">
                      <div className="h-40 bg-[#E4E3E0] border-b border-[#141414] relative overflow-hidden">
                        <img src={item.image} alt={item.diseaseName} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        <div className="absolute top-2 right-2 px-2 py-1 bg-[#141414] text-[#E4E3E0] text-[10px] font-mono">
                          {(item.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-sm">{item.plantName}</h4>
                            <p className="text-xs text-[#141414]/60">{item.diseaseName}</p>
                          </div>
                          <button 
                            onClick={() => deleteHistoryItem(item.id)}
                            className="text-[#141414]/20 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#141414]/5">
                          <span className="text-[10px] text-[#141414]/40 uppercase font-bold">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                          <button className="text-[10px] font-bold uppercase tracking-widest hover:underline">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'flutter' && (
            <motion.div 
              key="flutter"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8"
            >
              <div className="bg-[#141414] text-[#E4E3E0] p-8 rounded-sm">
                <h2 className="text-4xl font-serif italic font-bold mb-4">Flutter Implementation Guide</h2>
                <p className="text-[#E4E3E0]/70 max-w-2xl">
                  Complete production-ready code for your offline leaf disease detection app. 
                  Follow the structure below to implement the TFLite inference and Hive storage.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-2">
                  <h3 className="text-[10px] uppercase font-bold tracking-widest mb-4 text-[#141414]/40">Project Structure</h3>
                  <div className="font-mono text-xs space-y-1 bg-white p-4 border border-[#141414]">
                    <p>lib/</p>
                    <p>├── main.dart</p>
                    <p>├── models/</p>
                    <p>│   └── history_item.dart</p>
                    <p>├── services/</p>
                    <p>│   ├── tflite_service.dart</p>
                    <p>│   ├── history_service.dart</p>
                    <p>│   └── data_service.dart</p>
                    <p>└── screens/</p>
                    <p>    ├── detection_screen.dart</p>
                    <p>    └── history_screen.dart</p>
                    <p>assets/</p>
                    <p>├── models/leaf_model.tflite</p>
                    <p>├── labels.txt</p>
                    <p>└── pesticides.json</p>
                  </div>
                  
                  <div className="mt-8 p-4 bg-yellow-100 border border-yellow-400 text-xs">
                    <p className="font-bold mb-1">Optimization Tip:</p>
                    <p>Use INT8 quantization during TFLite conversion to reduce model size by 4x and improve inference speed on mobile CPUs.</p>
                  </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                  <CodeBlock title="pubspec.yaml" code={FLUTTER_SNIPPETS.pubspec} />
                  <CodeBlock title="lib/services/tflite_service.dart" code={FLUTTER_SNIPPETS.tfliteService} />
                  <CodeBlock title="lib/models/history_item.dart" code={FLUTTER_SNIPPETS.hiveModel} />
                  <CodeBlock title="lib/screens/detection_screen.dart" code={FLUTTER_SNIPPETS.mainScreen} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-[#141414] p-6 text-center">
        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#141414]/40">
          LeafScan Pro Engine v1.0.4 • Offline Inference Protocol • Neural Architecture ResNet-Dense-Mobile
        </p>
      </footer>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all",
        active ? "bg-[#141414] text-[#E4E3E0]" : "hover:bg-[#141414]/5 text-[#141414]/60"
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="border border-[#141414] p-4 bg-white/50">
      <div className="mb-2 text-[#141414]/40">{icon}</div>
      <h4 className="text-xs font-bold uppercase tracking-widest mb-1">{title}</h4>
      <p className="text-[10px] text-[#141414]/60">{desc}</p>
    </div>
  );
}

function CodeBlock({ title, code }: { title: string, code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-[#141414] bg-white overflow-hidden">
      <div className="bg-[#141414] text-[#E4E3E0] px-4 py-2 flex justify-between items-center">
        <span className="font-mono text-[10px]">{title}</span>
        <button 
          onClick={copy}
          className="text-[10px] font-bold uppercase tracking-widest hover:text-white/70 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto font-mono text-xs leading-relaxed text-[#141414]/80 max-h-[400px]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
