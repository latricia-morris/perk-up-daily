import { Link } from 'react-router-dom';

export default function LegalLinks() {
  return (
    <div className="flex flex-wrap justify-center gap-4 text-xs">
      <Link to="/privacy-policy" className="hover:underline" style={{ color: '#E8A838' }}>
        Privacy Policy
      </Link>
      <Link to="/terms" className="hover:underline" style={{ color: '#E8A838' }}>
        Terms &amp; Conditions
      </Link>
    </div>
  );
}