import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ContentProvider } from './contexts/ContentContext'
import { DarkModeProvider } from './contexts/DarkModeContext'
import Sidebar from './components/minimal/Sidebar'
import Home from './pages/Home'
import Tour from './components/minimal/Tour'

const ProjectPage = lazy(() => import('./pages/projects/ProjectPage'))
const AllProjects = lazy(() => import('./pages/AllProjects'))

function App() {
  return (
    <DarkModeProvider>
      <ContentProvider>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <Sidebar />
        <main id="main-content" className="with-sidebar">
          <Suspense fallback={<div className="page micro">loading…</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<AllProjects />} />
              <Route path="/projects/:slug" element={<ProjectPage />} />
              {/* old /contact link now lives on the home page */}
              <Route path="/contact" element={<Navigate to="/#contact" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <Tour />
      </ContentProvider>
    </DarkModeProvider>
  )
}

export default App
