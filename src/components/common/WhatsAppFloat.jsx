import { useState, useEffect } from "react";

const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029VbCRYZN0Qeaep5uwNY3f";

export default function WhatsAppFloat() {
  const [show, setShow] = useState(false);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 1500);
    const pulseTimer = setTimeout(() => setPulse(false), 8000);
    return () => {
      clearTimeout(timer);
      clearTimeout(pulseTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <a
      href={WHATSAPP_CHANNEL_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Join our WhatsApp Channel"
      title="Join our WhatsApp Channel for daily job updates"
      id="whatsapp-float-btn"
    >
      {/* Pulse ring */}
      {pulse && <span className="whatsapp-float-pulse" />}

      {/* WhatsApp Icon */}
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" aria-hidden="true">
        <path
          d="M16.004 2.667A13.28 13.28 0 0 0 2.667 15.89a13.18 13.18 0 0 0 1.78 6.633L2.667 29.333l7.04-1.845A13.28 13.28 0 0 0 16.004 29.2 13.28 13.28 0 0 0 29.333 15.89 13.28 13.28 0 0 0 16.004 2.667Zm0 24.266a11.01 11.01 0 0 1-5.613-1.534l-.403-.24-4.176 1.095 1.115-4.072-.263-.418a10.94 10.94 0 0 1-1.68-5.874A11.02 11.02 0 0 1 16.004 4.93 11.02 11.02 0 0 1 27.07 15.89a11.02 11.02 0 0 1-11.066 11.043Zm6.064-8.275c-.332-.167-1.968-.97-2.273-1.082-.305-.112-.527-.167-.75.167-.221.333-.86 1.082-1.054 1.304-.194.222-.389.25-.721.083-.333-.167-1.404-.517-2.674-1.65-.988-.88-1.656-1.968-1.85-2.3-.194-.333-.02-.513.146-.679.15-.149.333-.389.5-.583.166-.194.221-.333.333-.555.111-.222.055-.417-.028-.583-.083-.167-.75-1.806-1.027-2.472-.271-.65-.546-.561-.75-.572l-.638-.011a1.225 1.225 0 0 0-.888.417c-.305.333-1.166 1.138-1.166 2.775 0 1.638 1.194 3.22 1.36 3.443.166.222 2.35 3.588 5.695 5.032.796.344 1.417.55 1.902.703.799.254 1.527.218 2.102.132.641-.095 1.968-.804 2.246-1.581.277-.778.277-1.444.194-1.583-.083-.14-.305-.222-.638-.389Z"
          fill="currentColor"
        />
      </svg>

      {/* Tooltip */}
      <span className="whatsapp-float-tooltip">
        Join WhatsApp Channel
      </span>
    </a>
  );
}
