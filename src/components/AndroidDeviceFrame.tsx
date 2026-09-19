import React from 'react';
import { Wifi, BatteryMedium, Signal, ArrowLeft } from 'lucide-react';

interface AndroidDeviceFrameProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  onHomePress?: () => void;
  children: React.ReactNode;
}

export const AndroidDeviceFrame: React.FC<AndroidDeviceFrameProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  onHomePress,
  children,
}) => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-2 sm:p-6 font-sans">
      {/* Marco de Dispositivo Android (Emulador Android Studio) */}
      <div className="w-full max-w-[430px] h-[860px] max-h-[96vh] bg-slate-100 rounded-[38px] shadow-2xl border-[10px] border-slate-800 flex flex-col overflow-hidden relative">
        
        {/* Notch / Cámara frontal de Android */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-30 flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-slate-950 rounded-full" />
        </div>

        {/* 1. Android Status Bar (Barra de estado del sistema) */}
        <div className="bg-[#1565C0] text-white px-5 pt-3 pb-1 flex items-center justify-between text-[11px] font-medium select-none z-20">
          <span>12:00</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <BatteryMedium className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* 2. Android ActionBar / TopAppBar (Theme.MaterialComponents.DayNight.DarkActionBar) */}
        <div className="bg-[#1976D2] text-white px-4 py-3 flex items-center gap-3 shadow-md z-20 select-none">
          {showBackButton && (
            <button
              onClick={onBackPress}
              className="p-1 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
              title="Atrás (finish())"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          )}
          <h1 className="text-base font-semibold tracking-wide truncate">
            {title}
          </h1>
        </div>

        {/* 3. Android Activity Viewport (ScrollView / LinearLayout del Activity activo) */}
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          {children}
        </div>

        {/* 4. Android System Navigation Bar (Barra de navegación de 3 botones) */}
        <div className="bg-slate-900 text-slate-400 py-2.5 px-10 flex items-center justify-around select-none z-20 border-t border-slate-800">
          <button
            onClick={onBackPress}
            className="p-2 text-slate-400 hover:text-white active:scale-90 transition-transform cursor-pointer"
            title="Atrás"
          >
            {/* Triángulo Atrás ◀ */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 19L5 12L19 5V19Z" />
            </svg>
          </button>

          <button
            onClick={onHomePress}
            className="p-2 text-slate-400 hover:text-white active:scale-90 transition-transform cursor-pointer"
            title="Inicio (MainActivity)"
          >
            {/* Círculo Home ⬤ */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="7" />
            </svg>
          </button>

          <button
            className="p-2 text-slate-400 hover:text-white active:scale-90 transition-transform cursor-pointer"
            title="Recientes"
          >
            {/* Cuadrado Recientes ◼ */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};
