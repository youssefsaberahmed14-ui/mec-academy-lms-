import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Keyboard, 
  RefreshCw,
  QrCode
} from 'lucide-react';
import { apiRequest } from '../utils/api';

export default function QRScannerModal({ isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'file' | 'manual'
  const [manualToken, setManualToken] = useState('');
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [cameraError, setCameraError] = useState('');
  
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    setCameraError('');
    setErrorMessage('');
    setScanning(true);

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-container');
      }

      const qrCodeSuccessCallback = (decodedText) => {
        stopCamera();
        handleTokenSubmit(decodedText);
      };

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        config,
        qrCodeSuccessCallback,
        (errorMessage) => {
          // Frame read non-matches are ignored
        }
      );
    } catch (err) {
      console.warn('Camera start error:', err);
      setCameraError('Unable to access camera. Please check camera permissions, or switch to Manual Token / Photo Upload.');
      setScanning(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.warn('Camera stop error:', err);
      }
    }
    setScanning(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setErrorMessage('');
    try {
      const html5QrCode = new Html5Qrcode('qr-reader-file-temp');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleTokenSubmit(decodedText);
    } catch (err) {
      setErrorMessage('Could not decode QR code from the uploaded image. Please try a clearer picture or enter the token.');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenSubmit = async (tokenValue) => {
    const token = (tokenValue || manualToken).trim();
    if (!token) {
      setErrorMessage('Please enter or scan a valid session token.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const res = await apiRequest('/student/check-in', {
        method: 'POST',
        body: JSON.stringify({ qrCodeToken: token })
      });

      setScanResult(res);
      if (onSuccess) {
        onSuccess(res);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Check-in failed. Please verify the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setErrorMessage('');
    setManualToken('');
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Session Attendance Check-In</h3>
              <p className="text-xs text-slate-500">Scan QR Code or Enter Session Passcode</p>
            </div>
          </div>
          <button 
            onClick={() => { stopCamera(); onClose(); }}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {scanResult ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-slate-900">
                {scanResult.alreadyRecorded ? 'Attendance Already Verified' : 'Check-In Confirmed!'}
              </h4>
              <p className="text-sm text-slate-600 mt-1 max-w-sm mx-auto">
                {scanResult.message}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Session:</span>
                <span className="font-semibold text-slate-800">
                  Session {scanResult.session.sessionNumber}: {scanResult.session.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Course / Group:</span>
                <span className="font-medium text-slate-700">{scanResult.courseTitle} ({scanResult.groupName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Progress:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {scanResult.attendanceSummary}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { stopCamera(); onClose(); }}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-indigo-200"
              >
                Done
              </button>
              <button
                onClick={handleReset}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-colors"
              >
                Scan Another
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
              <button
                onClick={() => setActiveTab('camera')}
                className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'camera'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Camera className="w-4 h-4" /> Live Camera
              </button>
              <button
                onClick={() => setActiveTab('file')}
                className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'file'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Upload className="w-4 h-4" /> Upload Image
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'manual'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Keyboard className="w-4 h-4" /> Enter Token
              </button>
            </div>

            <div className="p-6">
              {/* Error Banner */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Camera Tab */}
              {activeTab === 'camera' && (
                <div className="space-y-4">
                  <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-slate-700">
                    <div id="qr-reader-container" className="w-full h-full" />
                    {cameraError && (
                      <div className="absolute inset-0 bg-slate-900/90 p-4 text-center flex flex-col items-center justify-center text-slate-300">
                        <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
                        <p className="text-xs max-w-xs">{cameraError}</p>
                        <button
                          onClick={() => setActiveTab('manual')}
                          className="mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium"
                        >
                          Use Code Entry Instead
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-center text-xs text-slate-500">
                    Align the instructor's QR code within the frame to verify attendance.
                  </p>
                </div>
              )}

              {/* 2. File Upload Tab */}
              {activeTab === 'file' && (
                <div className="space-y-4 text-center">
                  <div id="qr-reader-file-temp" style={{ display: 'none' }} />
                  <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 hover:bg-indigo-50/30">
                    <Upload className="w-10 h-10 text-slate-400 mb-2" />
                    <span className="text-sm font-semibold text-slate-700">Choose QR Code screenshot or photo</span>
                    <span className="text-xs text-slate-400 mt-1">PNG, JPG, or WEBP</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      disabled={loading}
                    />
                  </label>
                  {loading && (
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                      Analyzing QR image...
                    </div>
                  )}
                </div>
              )}

              {/* 3. Manual Token Tab */}
              {activeTab === 'manual' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Session Check-In Passcode
                    </label>
                    <input
                      type="text"
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      placeholder="e.g. MEC-QR-ALPHA-15-ACTIVE-9921"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      Tip: For testing, Session 15's token is <code className="bg-slate-100 text-indigo-700 px-1 py-0.5 rounded font-mono">MEC-QR-ALPHA-15-ACTIVE-9921</code>
                    </p>
                  </div>

                  <button
                    onClick={() => handleTokenSubmit()}
                    disabled={loading || !manualToken.trim()}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-indigo-200 flex items-center justify-center gap-2"
                  >
                    {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    Confirm Check-In
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
