import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faPlus } from '@fortawesome/free-solid-svg-icons';

export default function Header() {
  return (
    <header className="navbar bg-base-100 shadow-md sticky top-0 z-50">
      <div className="flex-1">
        <a href="/" className="btn btn-ghost text-xl">
          <FontAwesomeIcon icon={faBox} className="text-primary mr-2" />
          Inventory AI
        </a>
      </div>
      <div className="flex-none gap-2">
        <a href="/new" className="btn btn-primary">
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Nouvel Inventaire
        </a>
      </div>
    </header>
  );
}
