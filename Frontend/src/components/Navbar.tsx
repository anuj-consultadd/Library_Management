import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { logoutUser } from '../store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, User, LogOut, Home, BookOpen, History, Library } from 'lucide-react';

import { AppDispatch } from '../store/store';

const Navbar = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  console.log("User from Redux:", user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  
  const navLinks = isAdmin 
    ? [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <Home className="mr-2 h-4 w-4" /> },
        { path: '/admin/books', label: 'Manage Books', icon: <BookOpen className="mr-2 h-4 w-4" /> },
        { path: '/admin/borrowed-books', label: 'Borrowed Books', icon: <Library className="mr-2 h-4 w-4" /> },
      ]
    : [
        { path: '/dashboard', label: 'Dashboard', icon: <Home className="mr-2 h-4 w-4" /> },
        { path: '/books', label: 'Browse Books', icon: <BookOpen className="mr-2 h-4 w-4" /> },
        { path: '/history', label: 'My History', icon: <History className="mr-2 h-4 w-4" /> },
      ];

  return (
    <nav className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAdmin ? '/admin/dashboard' : '/dashboard'} className="flex items-center space-x-2">
            <Library className="h-6 w-6" />
            <span className="text-xl font-bold">Library App</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  location.pathname === link.path
                    ? 'bg-primary-foreground/20 text-white'
                    : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-white'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Dropdown Menu (Desktop) */}
          <div className="hidden md:block">
          <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button id="user-menu-button" variant="ghost" className="relative h-8 w-8 rounded-full">
      <User className="h-5 w-5" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent id="user-menu-content" align="end">
    <DropdownMenuLabel id="user-menu-label">
      <div className="flex flex-col">
        <span id="user-menu-username" className="font-semibold">{user?.username}</span>
        <span id="user-menu-email" className="text-xs text-muted-foreground">{user?.email || 'No email available'}</span>
        <span id="user-menu-role" className="text-xs text-muted-foreground">
          {isAdmin ? 'Administrator' : 'Member'}
        </span>
      </div>
    </DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem id="user-menu-logout" onClick={handleLogout} className="text-red-500 cursor-pointer">
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 sm:w-72">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-lg font-semibold ml-3">Menu</span>
                  <Button variant="outline" size="icon" onClick={() => setIsMenuOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Mobile Navigation Links */}
                <div className="flex flex-col gap-3 mt-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center px-3 py-2 rounded-md transition ${
                        location.pathname === link.path
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-primary-foreground/10'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Logout Button in Mobile Menu */}
                <div className="mt-auto border-t pt-3">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-start gap-2"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
