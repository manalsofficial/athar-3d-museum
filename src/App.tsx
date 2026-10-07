import { Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import AppHome from "./pages/AppHome";
import Explore from "./pages/Explore";
import FindPerson from "./pages/FindPerson";
import Person from "./pages/Person";
import ShareStory from "./pages/ShareStory";
import VoiceMode from "./pages/VoiceMode";
import { VoiceProvider } from "./context/VoiceContext";

export default function App() {
  return (
    <VoiceProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<AppHome />} />
        <Route path="/app/explore" element={<Explore />} />
        <Route path="/app/find" element={<FindPerson />} />
        <Route path="/app/person/:id" element={<Person />} />
        <Route path="/app/share" element={<ShareStory />} />
        <Route path="/app/voice" element={<VoiceMode />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </VoiceProvider>
  );
}
