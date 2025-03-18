'use client';

import { useState, useEffect } from 'react';

export default function TransferHistory({ roomId, itemId }) {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        setLoading(true);
        
        let url = '/api/transfers';
        const params = new URLSearchParams();
        
        if (roomId) {
          params.append('room_id', roomId);
        }
        
        if (itemId) {
          params.append('item_id', itemId);
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        setTransfers(data);
      } catch (error) {
        console.error('Error fetching transfer history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransfers();
  }, [roomId, itemId]);
  
  if (loading) {
    return <div className="text-center p-4">Loading transfer history...</div>;
  }
  
  if (transfers.length === 0) {
    return (
      <div className="bg-gray-50 p-4 text-center rounded-md">
        <p className="text-gray-500">No transfer history found.</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">By</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transfers.map((transfer) => (
            <tr key={transfer.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(transfer.transfer_date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {transfer.item_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {transfer.quantity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="font-medium">{transfer.from_room_name}</div>
                <div className="text-xs text-gray-400">{transfer.from_school_name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="font-medium">{transfer.to_room_name}</div>
                <div className="text-xs text-gray-400">{transfer.to_school_name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {transfer.transferred_by_name || 'N/A'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                {transfer.notes || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}