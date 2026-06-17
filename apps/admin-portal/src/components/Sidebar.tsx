import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  Plug,
  FileSearch,
  Shield,
  BookOpen,
  CheckSquare,
  Settings,
  BarChart3,
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Connectors', href: '/connectors', icon: Plug },
  { label: 'Discovery', href: '/discovery', icon: FileSearch },
  { label: 'Governance', href: '/governance', icon: BookOpen },
  { label: 'Compliance', href: '/compliance', icon: CheckSquare },
  { label: 'Security', href: '/security', icon: Shield },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const router = useRouter();

  return (
    <aside
      className={`bg-gray-900 text-white w-64 h-full flex flex-col transition-all duration-300 ${
        !open ? '-translate-x-full' : ''
      }`}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold">UnifyOS</h1>
        <p className="text-gray-400 text-sm">Admin Portal</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = router.pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-400">v1.0.0</p>
      </div>
    </aside>
  );
}
