import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, Wand2, Beaker, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  hasNewAchievement?: boolean; 
}

const Navbar: React.FC<NavbarProps> = ({ searchQuery, setSearchQuery, hasNewAchievement }) => {
  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
            Cardaroo
          </Link>
        </div>

        <div className="flex-1 flex justify-center px-8">

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

        <div className="flex items-center space-x-2">
          <Button asChild variant="ghost">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/ai-generator">
              <Wand2 className="mr-2 h-4 w-4" />
              Create with AI
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/practice-test">
              <Beaker className="mr-2 h-4 w-4" />
              Practice Test
            </Link>
          </Button>
          
          <Button asChild variant="ghost" className="relative">
            <Link to="/achievements">
              {hasNewAchievement && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
              <Award className="mr-2 h-4 w-4" />
              Achievements
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
