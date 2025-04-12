'use client';

import { useState, useEffect } from 'react';

export default function History({ roomId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/history?room_id=${roomId}`);
        if (!res.ok) throw new Error('Failed to fetch history');
        const data = await res.json();
        setHistory(data);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (roomId) {
      fetchHistory();
    }
  }, [roomId]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Loading history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 text-center">
          <p className="text-gray-500">No history found for this room.</p>
        </div>
      </div>
    );
  }

  const getActionBadge = (action) => {
    switch (action) {
      case 'add': return 'bg-green-100 text-green-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'transfer': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionText = (action) => {
    switch (action) {
      case 'add': return 'Added';
      case 'delete': return 'Deleted';
      case 'transfer': return 'Transferred';
      default: return action;
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Item
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created By
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notes
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {history.map((entry) => {
            const isSource = entry.source_room_id === parseInt(roomId);
            const isDestination = entry.destination_room_id === parseInt(roomId);
            
            // Determine the background color based on action type and room's role
            let rowBgClass = '';
            if (entry.action_type === 'transfer') {
              if (isSource) rowBgClass = 'bg-red-50';
              if (isDestination) rowBgClass = 'bg-green-50';
            } else if (entry.action_type === 'add') {
              rowBgClass = 'bg-green-50';
            } else if (entry.action_type === 'delete') {
              rowBgClass = 'bg-red-50';
            }
            
            return (
              <tr key={entry.id} className={`hover:bg-gray-50 ${rowBgClass}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(entry.action_date).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadge(entry.action_type)}`}>
                    {getActionText(entry.action_type)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{entry.item_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{entry.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {entry.action_type === 'transfer' ? (
                    <div className="text-sm">
                      <div className={isSource ? 'font-semibold text-red-700' : 'text-gray-900'}>
                        From: {entry.source_room_name}
                      </div>
                      <div className={isDestination ? 'font-semibold text-green-700' : 'text-gray-900'}>
                        To: {entry.destination_room_name}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">-</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{entry.user_name || 'Not Recorded'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{entry.notes || '-'}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
