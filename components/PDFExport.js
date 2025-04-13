'use client';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportRoomToPDF = (roomData, items) => {
  // Create new jsPDF instance
  const pdf = new jsPDF();
  
  // Set document properties
  pdf.setProperties({
    title: `Room Report - ${roomData.name}`,
    author: 'School Inventory System',
    creator: 'School Inventory System'
  });
  
  // Add logo based on school_id
  let logoUrl = '/images/menara-kasih.png'; // default logo
  
  // Use different logo based on school_id
  // Convert to number first to ensure comparison works correctly
  const schoolId = parseInt(roomData.school_id);
  
  if (schoolId === 1) {
    logoUrl = '/images/menara-tirza.png';
  } else if (schoolId === 2) {
    logoUrl = '/images/menara-kasih.png';
  }
  
  // Define a variable to store the timeout ID
  let timeoutId;
  
  try {
    // Add logo at top center
    // NOTE: In a client-side app, we need to convert the relative URL to an absolute URL
    const logoImg = new Image();
    logoImg.src = window.location.origin + logoUrl;
    
    // Wait for the image to load
    logoImg.onload = function() {
      // Calculate dimensions to maintain aspect ratio and not make it too large
      const imgWidth = 17; // Width in mm
      const imgHeight = imgWidth * (logoImg.height / logoImg.width);
      
      // Center the image
      const pageWidth = pdf.internal.pageSize.getWidth();
      const xPosition = (pageWidth - imgWidth) / 2;
      
      // Add the image
      pdf.addImage(logoImg, 'JPEG', xPosition, 10, imgWidth, imgHeight);
      
      // Continue with the rest of the PDF
      addPdfContent();
    };
    
    // Handle error loading image
    logoImg.onerror = function() {
      console.error('Error loading logo image');
      // Continue with the rest of the PDF without the logo
      addPdfContent();
    };
    
    // In case the image doesn't load, we need a way to generate the PDF directly
    // We'll use a setTimeout to give the image a chance to load first
    timeoutId = setTimeout(() => {
      // If we reach here, it means the image is taking too long or failed to load
      // So we'll generate the PDF without waiting for the image
      addPdfContent();
    }, 2000); // 2 seconds timeout
    
  } catch (error) {
    console.error('Error adding logo to PDF:', error);
    // Continue with the rest of the PDF without the logo
    addPdfContent();
  }
  
  // Function to add the rest of the PDF content
  function addPdfContent() {
    // Add current date
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('id-ID', {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    const timeFormatted = now.toLocaleTimeString('id-ID');
  
    pdf.setFontSize(10);
    
    // Create room details table
    autoTable(pdf, {
      startY: 35,
      body: [
        ['Room Name', roomData.name],
        ['Responsible Person', roomData.responsible_user_name || 'Not assigned'],
        ['Building', roomData.building || '-'],
        ['Floor', roomData.floor || '-'],
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [66, 139, 202],
        textColor: 255
      },
      styles: {
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 'auto' }
      }
    });
    
    // Add items table
    pdf.setFontSize(14);
    pdf.text('Items in Room', 14, pdf.lastAutoTable.finalY + 15);
    
    // Prepare data for items table
    const itemsData = items.map(item => [
      item.name,
      item.category_name,
      item.quantity.toString(),
      item.condition
    ]);
    
    // Create items table
    autoTable(pdf, {
      startY: pdf.lastAutoTable.finalY + 20,
      head: [['Item Name', 'Category', 'Quantity', 'Condition']],
      body: itemsData.length > 0 
        ? itemsData 
        : [['No items found in this room', '', '', '']],
      theme: 'grid',
      headStyles: { 
        fillColor: [66, 139, 202],
        textColor: 255
      },
      styles: {
        overflow: 'linebreak'
      }
    });
    
    // Add generated date at the bottom
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${dateFormatted} ${timeFormatted}`, 105, pdf.lastAutoTable.finalY + 20, { align: 'center' });
    
  
    
    // Create filename prefix based on school_id
    let filePrefix = "";
    if (schoolId === 1) {
      filePrefix = "MT";
    } else if (schoolId === 2) {
      filePrefix = "MK";
    } else {
      filePrefix = "Room";
    }
    
    // Save the PDF with a filename based on prefix, room name and date
    const fileName = `${filePrefix}_${roomData.name.replace(/\s+/g, '_')}_${now.toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    // Clear the timeout since we've successfully generated the PDF
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

// Export PDF button component
const PDFExportButton = ({ room, items }) => {
  const handleExport = () => {
    if (room) {
      exportRoomToPDF(room, items);
    }
  };
  
  return (
    <button
      onClick={handleExport}
      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5 mr-2" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
        />
      </svg>
      Export PDF
    </button>
  );
};

export default PDFExportButton;