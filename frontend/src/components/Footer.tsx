import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer footer-center p-4 sm:p-6 md:p-10 bg-base-200 text-base-content">
      <div>
        <p className="font-bold text-lg">Inventory AI</p>
        <p className="text-sm sm:text-base">Application d'inventaire assistée par intelligence artificielle</p>
      </div>
      <div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
          <Link to="/privacy" className="link link-hover text-sm">
            Confidentialité
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link to="/terms" className="link link-hover text-sm">
            Conditions d'utilisation
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link to="/cookies" className="link link-hover text-sm">
            Politique des cookies
          </Link>
        </div>
      </div>
      <div>
        <p className="text-xs sm:text-sm">© {new Date().getFullYear()} Inventory AI. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
