import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, Heart, User, LogOut, PlusSquare, HelpCircle, Phone, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-terra-bg border-b border-terra-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-terra-green rounded-full flex items-center justify-center shadow-lg shadow-terra-green/20">
              <div className="w-4 h-4 bg-white/20 rounded-full"></div>
            </div>
            <span className="text-2xl font-serif italic tracking-tight text-terra-green">NestFinder</span>
          </Link>

          <div className="hidden md:flex items-center space-x-10">
            <Link to="/search" className="text-[10px] font-bold uppercase tracking-[0.2em] text-terra-text-muted hover:text-terra-green transition-colors">Explorer</Link>
            <Link to="/" className="text-[10px] font-bold uppercase tracking-[0.2em] text-terra-text-muted hover:text-terra-green transition-colors">Communities</Link>
            <Link to="/onboarding" className="text-[10px] font-bold uppercase tracking-[0.2em] text-terra-text-muted hover:text-terra-green transition-colors">AI Matchmaker</Link>
            
            <div className="relative group">
              <button className="flex items-center space-x-1 text-[10px] font-bold uppercase tracking-[0.2em] text-terra-text-muted hover:text-terra-green transition-colors">
                <span>Need Help?</span>
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-[60]">
                <div className="bg-white rounded-[24px] border border-terra-border shadow-2xl p-6 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-terra-text-muted uppercase tracking-widest">Speak with us</p>
                    <a href="tel:9902132933" className="flex items-center space-x-3 group/item">
                      <div className="w-8 h-8 bg-terra-sidebar rounded-full flex items-center justify-center text-terra-green group-hover/item:bg-terra-green group-hover/item:text-white transition-all">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-terra-text">9902132933</span>
                    </a>
                  </div>
                  <div className="h-px bg-terra-border/50"></div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-terra-text-muted uppercase tracking-widest">WhatsApp Chat</p>
                    <a href="https://wa.me/919902132933" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 group/item">
                      <div className="w-8 h-8 bg-[#25D366]/10 rounded-full flex items-center justify-center text-[#25D366] group-hover/item:bg-[#25D366] group-hover/item:text-white transition-all">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-terra-text">Chat with Experts</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {user?.role !== 'BUYER' && (
              <Link to="/dashboard" className="text-[10px] font-bold uppercase tracking-[0.2em] text-terra-text-muted hover:text-terra-green transition-colors">Greenhouse</Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="w-10 h-10 border border-terra-border rounded-full flex items-center justify-center p-1 hover:bg-terra-sidebar transition-colors">
                  <div className="w-full h-full bg-terra-green-light rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-terra-green" />
                  </div>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-terra-text-muted hover:text-terra-green transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-6">
                <Link to="/auth" className="text-terra-text-muted font-medium hover:text-terra-green">Login</Link>
                <Link to="/auth?mode=register" className="bg-terra-green text-white px-6 py-2.5 rounded-2xl font-medium hover:bg-terra-green/90 transition-all shadow-lg shadow-terra-green/20">
                  Join Community
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
