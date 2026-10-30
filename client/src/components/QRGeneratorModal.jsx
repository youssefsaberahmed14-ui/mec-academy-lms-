import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  RefreshCw, 
  Download, 
  Maximize2, 
  CheckCircle2, 
  Users,
  Copy,
  Check
} from 'lucide-react';
import { apiRequest } from '../utils/api';

export default function QRGeneratorModal({ isOpen, onClose, session, groupId, onSessionUpdated }) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [qrData, setQrData] = useState(null);

  // Generate on open or regenerate
  const generateQRCode = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await apiRequest(`/instructor/session/${session.id}/generate-qr`, {
        method: 'POST'
      });
      setQrData(res);
      if (onSessionUpdated) {
        onSessionUpdated(res.session);
      }
    } catch (err) {
      console.error('Error generating QR code:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && session) {
      generateQRCode();
    }
  }, [isOpen, session?.id]);

  const copyToken = () => {
    if (!qrData?.token) return;
    navigator.clipboard.writeText(qrData.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    if (!qrData?.qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrData.qrDataUrl;
    a.download = `MEC_Session_${session.sessionNumber}_QR.png`;
    a.click();
  };

  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 transition-all ${
        fullscreen ? 'fixed inset-4 max-w-none max-h-none flex flex-col' : 'max-w-md w-full'
      }`}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">
                Session {session.sessionNumber} Attendance QR
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-[240px]">{session.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              title={fullscreen ? 'Exit Fullscreen' : 'Projector Fullscreen'}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`p-6 text-center flex-1 flex flex-col items-center justify-center ${fullscreen ? 'scale-110' : ''}`}>
          {loading ? (
            <div className="py-16 space-y-3">
              <RefreshCw className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
              <p className="text-sm font-medium text-slate-600">Generating secure session check-in QR...</p>
            </div>
          ) : qrData ? (
            <div className="space-y-4 max-w-sm w-full">
              {/* QR Image */}
              <div className="p-4 bg-white rounded-2xl border-2 border-indigo-100 shadow-md inline-block">
                <img 
                  src={qrData.qrDataUrl} 
                  alt="Session Attendance QR Code" 
                  className="w-56 h-56 mx-auto object-contain rounded-lg"
                />
              </div>

              {/* Instructions */}
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Live & Ready for Check-In
                </span>
                <p className="text-xs text-slate-500 mt-2">
                  Students can scan this code from their Student Portal or enter the token passcode below.
                </p>
              </div>

              {/* Token Code */}
              <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left">
                <div className="truncate">
                  <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">Passcode</span>
                  <span className="text-xs font-mono font-bold text-indigo-900 select-all">{qrData.token}</span>
                </div>
                <button
                  onClick={copyToken}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-700 transition-colors flex items-center gap-1 shrink-0"
                  title="Copy token"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={downloadQR}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" /> Save Image
                </button>
                <button
                  onClick={generateQRCode}
                  className="flex-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" /> Refresh Code
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-rose-600">Failed to load QR code.</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            {session.roster ? `${session.roster.filter(r => r.attended).length} of ${session.roster.length} registered students checked in` : 'Scanning active'}
          </span>
          <button 
            onClick={onClose}
            className="text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
