import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function MobileHeader({ title, onBack }) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  return (
    <div
      className="flex items-center px-4 h-14 bg-background border-b border-border relative"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <button
        onClick={handleBack}
        className="absolute left-3 flex items-center gap-1 text-primary no-select"
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      >
        <ChevronLeft size={20} />
        <span className="text-sm font-medium">Back</span>
      </button>
      <h1 className="flex-1 text-center text-base font-grotesk font-semibold text-foreground truncate px-20">
        {title}
      </h1>
    </div>
  );
}