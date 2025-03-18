'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Breadcrumb() {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    const generateBreadcrumbs = () => {
      // Remove any trailing slash and then split the path
      const pathWithoutQuery = pathname.split('?')[0];
      const pathArray = pathWithoutQuery.split('/').filter(x => x);
      
      // Maps to store friendly names for each route segment
      const routeMappings = {
        'items': 'Inventory Items',
        'rooms': 'Rooms',
        'schools': 'Schools',
        'transfers': 'Transfers',
      };
      
      // Generate breadcrumb items, adding Home at the beginning
      const breadcrumbItems = [{ href: '/', label: 'Dashboard' }];
      
      let path = '';
      pathArray.forEach((segment, index) => {
        path += `/${segment}`;
        
        // Check for dynamic routes (e.g., [id])
        const isIdSegment = segment.match(/^\d+$/);
        if (isIdSegment && index > 0) {
          // This is likely an ID, so use the previous segment's name + Detail
          const previousSegment = pathArray[index - 1];
          breadcrumbItems.push({
            href: path,
            label: `${routeMappings[previousSegment] || previousSegment} Detail`,
          });
        } else {
          breadcrumbItems.push({
            href: path,
            label: routeMappings[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
          });
        }
      });
      
      setBreadcrumbs(breadcrumbItems);
    };
    
    generateBreadcrumbs();
  }, [pathname]);

  // Don't render breadcrumbs on homepage
  if (pathname === '/') return null;

  return (
    <nav className="bg-white px-4 py-3 rounded-md shadow mb-4">
      <ol className="flex flex-wrap items-center space-x-2 text-sm">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg className="mx-2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-600 font-medium">{breadcrumb.label}</span>
            ) : (
              <Link href={breadcrumb.href} className="text-blue-600 hover:text-blue-800">
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
