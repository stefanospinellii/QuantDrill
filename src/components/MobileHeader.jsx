import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function MobileHeader({ title, onBack }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div
      className="relative flex items-end justify-center bg-background border-b border-border"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        minHeight: 'calc(44px + env(safe-area-inset-top, 0px))',
      }}
    >
      {/* Back button — pinned to bottom-left of the bar */}
      <button
        onClick={handleBack}
        className="absolute left-0 bottom-0 flex items-center gap-0.5 px-3 py-3 text-primary no-select active:opacity-60 transition-opacity"
      >
        <ChevronLeft size={22} strokeWidth={2.5} />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Title — centered in the bottom portion of the bar */}
      {title && (
        <h1 className="text-base font-grotesk font-semibold text-foreground truncate max-w-[60%] pb-3 leading-none">
          {title}
        </h1>
      )}
      {/* Spacer when no title to keep height consistent */}
      {!title && <div className="pb-3" />}
    </div>
  );
}