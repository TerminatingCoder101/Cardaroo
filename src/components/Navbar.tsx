import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, Wand2, Beaker, Award, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  hasNewAchievement?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ searchQuery, setSearchQuery, hasNewAchievement }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/ai-generator', icon: Wand2, label: 'Create with AI' },
    { href: '/practice-test', icon: Beaker, label: 'Practice Test' },
    { href: '/achievements', icon: Award, label: 'Achievements', notification: hasNewAchievement },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
              Cardaroo
            </Link>
          </div>


          <div className="hidden md:flex flex-1 justify-center px-8">
            {setSearchQuery && (
              <div className="w-full max-w-md">
                <Input
                  type="text"
                  placeholder="Search study sets..."
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map(link => (
              <Button asChild variant="ghost" key={link.href} className="relative">
                <Link to={link.href}>
                  {link.notification && (
                    <span className="absolute top-1 right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.label}
                </Link>
              </Button>
            ))}
          </div>

          <div className="md:hidden flex items-center">
            <Button onClick={() => setIsMenuOpen(!isMenuOpen)} variant="ghost" size="icon">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {setSearchQuery && (
              <div className="px-2 py-2">
                 <Input
                  type="text"
                  placeholder="Search study sets..."
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
            {navLinks.map(link => (
              <Button asChild variant="ghost" key={link.href} className="w-full justify-start relative">
                <Link to={link.href} onClick={() => setIsMenuOpen(false)}>
                   {link.notification && (
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                  <link.icon className="mr-3 h-5 w-5" />
                  {link.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
