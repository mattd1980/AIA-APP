import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faPlus, faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar bg-base-100 shadow-md sticky top-0 z-50">
      <div className="flex-1">
        <a href="/" className="btn btn-ghost text-xl">
          <FontAwesomeIcon icon={faBox} className="text-primary mr-2" />
          Inventory AI
        </a>
      </div>
      <div className="flex-none gap-2">
        {user && (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                {user.picture ? (
                  <img src={user.picture} alt={user.name || user.email} />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center text-white">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                )}
              </div>
            </div>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li>
                <div className="px-4 py-2">
                  <p className="font-semibold">{user.name || user.email}</p>
                  <p className="text-xs text-base-content/70">{user.email}</p>
                </div>
              </li>
              <li><div className="divider my-1"></div></li>
              <li>
                <a onClick={logout} className="text-error">
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                  Déconnexion
                </a>
              </li>
            </ul>
          </div>
        )}
        <a href="/location/new" className="btn btn-primary">
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Nouveau lieu
        </a>
        {user && (
          <button
            type="button"
            onClick={logout}
            className="btn btn-ghost gap-2"
            title="Déconnexion"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        )}
      </div>
    </header>
  );
}
