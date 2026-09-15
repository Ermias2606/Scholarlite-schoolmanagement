import React, { useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="btn-install-pwa"
        onClick={install}
        className={`inline-flex items-center gap-2 rounded-lg bg-[#FFC300] hover:bg-[#ffd140] text-[#003366] px-3.5 py-1.5 text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 ${className}`}
        title="Install ScholarLite PWA to your device"
      >
        <Download className="w-4 h-4" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="btn-install-ios"
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 text-xs font-semibold backdrop-blur-sm transition ${className}`}
          title="Install on iPhone / iPad"
        >
          <Share className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <img src="/icon.svg" alt="ScholarLite Logo" className="w-10 h-10 rounded-xl" />
                <div>
                  <h3 className="text-base font-bold text-[#003366]">Install ScholarLite</h3>
                  <p className="text-xs text-gray-500">Run offline on iPhone or iPad</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-700 mb-5">
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50">
                  <div className="p-1.5 bg-[#003366]/10 text-[#003366] rounded-md mt-0.5">
                    <Share className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">1. Tap Share</span>
                    <p className="text-xs text-gray-600">In Safari bottom toolbar</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50">
                  <div className="p-1.5 bg-[#003366]/10 text-[#003366] rounded-md mt-0.5">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">2. Add to Home Screen</span>
                    <p className="text-xs text-gray-600">Scroll down and tap &quot;Add to Home Screen&quot;</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-[#003366] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#002244] transition"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
