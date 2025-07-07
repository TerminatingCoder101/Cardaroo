import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, Wand2 } from 'lucide-react';

// Make the search props optional so this Navbar can be used on pages without search functionality.
interface NavbarProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
            Cardaroo
          </Link>
        </div>

        <div className="flex-1 flex justify-center px-8">
          {/* Conditionally render the search bar only if the props are provided */}
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
          {/* This is the new link to your AI Generator page */}
          <Button asChild variant="ghost">
            <Link to="/ai-generator">
              <Wand2 className="mr-2 h-4 w-4" />
              Create with AI
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;



