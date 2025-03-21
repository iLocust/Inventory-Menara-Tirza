import { requireRole } from '../../lib/auth';

export default async function UsersLayout({ children }) {
  // Only allow 'admin' users to access this layout and all its children
  await requireRole('admin');
  
  return (
    <div>
      {children}
    </div>
  );
}
