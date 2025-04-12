'use client';

import { useState, useEffect } from 'react';

export default function TransferHistory({ roomId }) {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransfers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/transfers?room_id=${roomId}`);
        if (!res.ok) throw new Error('Failed to fetch transfers');
        const data = await res.json();
        setTransfers(data);
      } catch (error) {
        console.error('Error fetching transfers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (roomId) {
      fetchTransfers();
    }
  }, [roomId]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Loading transfer history...</p>
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 text-center">
          <p className="text-gray-500">No transfer history found for this room.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Item
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              From
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              To
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
          {transfers.map((transfer) => {
            const isSource = transfer.source_room_id === parseInt(roomId);
            const isDestination = transfer.destination_room_id === parseInt(roomId);
            
            return (
              <tr key={transfer.id} className={`hover:bg-gray-50 ${isSource ? 'bg-red-50' : ''} ${isDestination ? 'bg-green-50' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(transfer.transfer_date).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{transfer.item_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{transfer.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${isSource ? 'font-semibold text-red-700' : 'text-gray-900'}`}>
                    {transfer.source_room_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${isDestination ? 'font-semibold text-green-700' : 'text-gray-900'}`}>
                    {transfer.destination_room_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{transfer.user_name || 'Not Recorded'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{transfer.notes || '-'}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}