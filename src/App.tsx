
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WordsProvider } from "./context/WordsContext";
import Index from "./pages/Index";
import AddWord from "./pages/AddWord";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Auth from "./components/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <WordsProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Auth><Index /></Auth>} />
            <Route path="/add" element={<Auth><AddWord /></Auth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </WordsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
