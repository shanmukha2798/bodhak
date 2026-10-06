import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import LearnerPage from "@/pages/LearnerPage";
import ProfilePage from "@/pages/ProfilePage";
import TeachPage from "@/pages/TeachPage";
import PlatformPage from "@/pages/PlatformPage";

function App() {
  return (
    <div className="App">
      <TooltipProvider delayDuration={150}>
        <BrowserRouter>
          <Nav />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LearnerPage />} />
              <Route path="/instructor/:id" element={<ProfilePage />} />
              <Route path="/teach" element={<TeachPage />} />
              <Route path="/platforms" element={<PlatformPage />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
        <Toaster position="bottom-center" richColors />
      </TooltipProvider>
    </div>
  );
}

export default App;
