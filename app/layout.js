import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'School Inventory Management',
  description: 'A system for managing school inventory across multiple locations',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}