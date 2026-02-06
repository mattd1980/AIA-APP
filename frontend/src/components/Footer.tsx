import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/40 px-4 py-6 text-center sm:py-10 md:py-10">
      <div>
        <p className="font-bold text-lg">Inventory AI</p>
        <p className="text-sm sm:text-base text-muted-foreground">
          Application d'inventaire assistée par intelligence artificielle
        </p>
      </div>
      <div className="mt-4">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          <Link
            to="/privacy"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Confidentialité
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link
            to="/terms"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Conditions d'utilisation
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link
            to="/support"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Support
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link
            to="/cookies"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Politique des cookies
          </Link>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-muted-foreground text-xs sm:text-sm">
          © {new Date().getFullYear()} Inventory AI. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
