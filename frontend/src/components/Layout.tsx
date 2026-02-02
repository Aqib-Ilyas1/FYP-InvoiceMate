import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useAuthStore } from '@/store/authStore';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { User, LogOut, Settings } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex-1 lg:ml-0 ml-12">
              {/* Breadcrumb or page title can go here */}
            </div>

            {/* User menu */}
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                      {user?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium">{user?.fullName || 'User'}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
