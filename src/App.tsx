import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect } from "react"
import ErrorBoundary from "@/components/ErrorBoundary"
import Layout from "@/components/Layout"
import HomePage from "@/pages/HomePage"
import LoginPage from "@/pages/LoginPage"
import FeedPage from "@/pages/FeedPage"
import WritePage from "@/pages/WritePage"
import WhisperDetailPage from "@/pages/WhisperDetailPage"
import FriendsPage from "@/pages/FriendsPage"
import ChatPage from "@/pages/ChatPage"
import RoomsPage from "@/pages/RoomsPage"
import RoomChatPage from "@/pages/RoomChatPage"
import ProfilePage from "@/pages/ProfilePage"
import RulesPage from "@/pages/RulesPage"
import FavoritesPage from "@/pages/FavoritesPage"
import DraftsPage from "@/pages/DraftsPage"
import NotFoundPage from "@/pages/NotFoundPage"

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const pageTransition = {
  duration: 0.3,
  ease: "easeInOut"
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
      >
        <Routes location={location}>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/write" element={<WritePage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/whisper/:id" element={<WhisperDetailPage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/chat/:friendId" element={<ChatPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/room/:roomId" element={<RoomChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/drafts" element={<DraftsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('mask01_theme') as 'dark' | 'light'
    if (savedTheme === 'dark' || savedTheme === 'light') {
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
  }, [])

  return (
    <Router>
      <ErrorBoundary>
        <AnimatedRoutes />
      </ErrorBoundary>
    </Router>
  )
}
