import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, Search, Bell, User } from 'lucide-react';

interface SearchLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Search', href: '/search' },
  { label: 'Collections', href: '/collections' },
  { label: 'Insights', href: '/insights' },
  { label: 'Settings', href: '/settings' },
];

export default function SearchLayout({ children }: SearchLayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              UnifyOS
            </Link>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Bell size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <User size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 border-b-2 border-blue-600 pb-2'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="py-8">
        {children}
      </main>
    </div>
  );
}
