import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer footer-center p-10 bg-base-200 text-base-content">
      <div>
        <p className="font-bold text-lg">Inventory AI</p>
        <p>Application d'inventaire assistée par intelligence artificielle</p>
      </div>
      <div>
        <div className="grid grid-flow-col gap-4">
          <Link to="/privacy" className="link link-hover">
            Confidentialité
          </Link>
          <Link to="/terms" className="link link-hover">
            Conditions d'utilisation
          </Link>
          <Link to="/cookies" className="link link-hover">
            Politique des cookies
          </Link>
        </div>
      </div>
      <div>
        <p>© {new Date().getFullYear()} Inventory AI. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
