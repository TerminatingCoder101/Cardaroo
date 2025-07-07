import React from 'react';
import { Button } from "@/components/ui/button";
import { BookOpen, Home, Plus, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';




interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ searchQuery, setSearchQuery }) =>{
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div 
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
                Cardaroo
              </span>
            </div>
          </div>

          <div className="w-1/3">
              <input
                type="text"
                placeholder="Search study sets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

