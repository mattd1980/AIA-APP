import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'Utilisateur';

  return (
    <header className="navbar bg-base-100 shadow-md sticky top-0 z-50 min-h-[4rem]">
      <div className="flex-1">
        <a href="/" className="btn btn-ghost text-xl">
          <FontAwesomeIcon icon={faBox} className="text-primary mr-2" />
          Inventory AI
        </a>
      </div>
      <div className="flex-none flex items-center gap-2">
        {user && (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-base-200 transition-colors cursor-pointer min-h-0"
              aria-label="Menu utilisateur"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-base-300 flex-shrink-0">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary text-sm">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                )}
              </div>
              <span className="hidden sm:inline font-medium max-w-[120px] truncate leading-none">
                {displayName}
              </span>
            </div>
            <ul
              tabIndex={0}
              className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-56 border border-base-300"
            >
              <li className="menu-title px-4 pt-2 pb-1">
                <span className="text-base-content/70 text-xs">{user.email}</span>
              </li>
              <li>
                <button
                  type="button"
                  onClick={logout}
                  className="text-error gap-2"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  Déconnexion
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
