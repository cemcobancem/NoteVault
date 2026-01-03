import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import NotesPage from "./pages/Index";
import TasksPage from "./pages/tasks";
import SearchPage from "./pages/search";
import SettingsPage from "./pages/settings";
import NoteEditor from "./pages/note-editor";
import TaskEditor from "./pages/task-editor";
import NotebooksPage from "./pages/notebooks";
import { BottomNav } from "./components/ui/bottom-nav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/notebooks/:notebookId" element={<NotesPage />} />
          <Route path="/notebooks" element={<NotebooksPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/notes/new" element={<NoteEditor />} />
          <Route path="/notes/:id" element={<NoteEditor />} />
          <Route path="/tasks/new" element={<TaskEditor />} />
          <Route path="/tasks/:id" element={<TaskEditor />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;