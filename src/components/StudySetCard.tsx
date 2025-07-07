
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Play, MoreVertical, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FlashcardSet } from '@/pages/Index';

interface StudySetCardProps {
  set: FlashcardSet;
  onDelete: (setId: string) => void;
  onRename: (id: string) => void;
  onStudy: () => void;
}

const StudySetCard = ({ set, onDelete, onRename, onStudy }: StudySetCardProps) => {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this study set?')) {
      onDelete(set.id)
    }
  };

const handleRename = () => {
    onRename(set.id)
};


  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
              {set.title}
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm">
              {set.description}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
              <DropdownMenuItem onClick={handleRename} className="text-black hover:bg-red-50">
                <BookOpen className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4" />
              <span>{set.cards.length} cards</span>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {new Date(set.createdAt).toLocaleDateString()}
            </Badge>
          </div>
          
          {set.studyProgress !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">{set.studyProgress}%</span>
              </div>
              <Progress value={set.studyProgress} className="h-2" />
            </div>
          )}
          
          <Button 
            onClick={onStudy}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-blue-700 hover:to-blue-700 text-white transition-all duration-300"
          >
            <Play className="mr-2 h-4 w-4" />
            Study
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudySetCard;

