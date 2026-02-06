import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const { user, logout } = useAuth();

  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'Utilisateur';

  return (
    <header className="sticky top-0 z-50 flex min-h-16 w-full items-center gap-4 border-b bg-background px-4 shadow-sm">
      <div className="flex flex-1">
        <a href="/">
          <Button variant="ghost" className="text-xl font-semibold">
            <FontAwesomeIcon icon={faBox} className="mr-2 text-primary" />
            Inventory AI
          </Button>
        </a>
      </div>
      <div className="flex items-center gap-2">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 rounded-full px-2 py-1.5"
                aria-label="Menu utilisateur"
              >
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-primary text-sm">
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                  )}
                </div>
                <span className="hidden max-w-[120px] truncate font-medium sm:inline">
                  {displayName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <span className="text-muted-foreground text-xs">{user.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={logout}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
