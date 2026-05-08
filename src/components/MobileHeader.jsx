import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function MobileHeader({ title, onBack }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
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
      {/* Back button — spans full height so entire left area is tappable */}
      <button
        onClick={handleBack}
        className="absolute inset-y-0 left-0 flex items-end gap-0.5 px-5 pb-3 text-primary no-select active:opacity-60 transition-opacity"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)', minWidth: '80px' }}
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