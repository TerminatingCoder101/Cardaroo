
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StudyPage from "./pages/StudyPage";
import AiGeneratorPage from "./pages/AiGeneratorPage";
import NotFound from "./pages/NotFound";
import PracticeTestPage from "./pages/PracticeTestPage";
import AchievementsPage from "./pages/AchievementsPage";

const queryClient = new QueryClient();

const App = () => (
<div className="bg-slate-100 min-h-screen">
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index/>} />
          <Route path="/study/:setId" element={<StudyPage />} />
          <Route path="/ai-generator" element={<AiGeneratorPage />} />
          <Route path="/practice-test" element={<PracticeTestPage />} />
          <Route path="/achievements" element={<AchievementsPage />} /> 
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
</div>
);

export default App;

