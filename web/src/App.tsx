import { useState } from 'react'
import { Dashboard } from './components/Dashboard'
import { ProblemList } from './components/ProblemList'
import { ProblemView } from './components/ProblemView'
import { Login } from './components/Login'
import { Register } from './components/Register'
import { Profile } from './components/Profile'
import { Duel } from './components/Duel'
import { Collaboration } from './components/Collaboration'
import { PairProgramming } from './components/PairProgramming'

type Page = 'login' | 'register' | 'dashboard' | 'problems' | 'problem-view' | 'profile' | 'duel' | 'collaboration' | 'pair-programming';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleRegister = (userData: any) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
  };

  const handleSelectProblem = (problemId: string) => {
    setSelectedProblem(problemId);
    setCurrentPage('problem-view');
  };

  const handleBackToProblems = () => {
    setSelectedProblem(null);
    setCurrentPage('problems');
  };

  // Not authenticated
  if (!user) {
    if (currentPage === 'register') {
      return <Register onRegister={handleRegister} onSwitchToLogin={() => setCurrentPage('login')} />;
    }
    return <Login onLogin={handleLogin} onSwitchToRegister={() => setCurrentPage('register')} />;
  }

  // Authenticated - render pages
  return (
    <div className="min-h-screen">
      {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} user={user} />}
      {currentPage === 'problems' && <ProblemList onSelectProblem={handleSelectProblem} />}
      {currentPage === 'problem-view' && selectedProblem && (
        <ProblemView problemId={selectedProblem} onBack={handleBackToProblems} />
      )}
      {currentPage === 'profile' && <Profile user={user} onLogout={handleLogout} onBack={() => setCurrentPage('dashboard')} />}
      {currentPage === 'duel' && <Duel onBack={() => setCurrentPage('dashboard')} user={user} />}
      {currentPage === 'collaboration' && <Collaboration onBack={() => setCurrentPage('dashboard')} user={user} />}
      {currentPage === 'pair-programming' && <PairProgramming onBack={() => setCurrentPage('dashboard')} user={user} />}
    </div>
  )
}

export default App
