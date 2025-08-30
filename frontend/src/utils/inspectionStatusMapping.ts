export const getInspectionStatusLabel = (status: number | string): string => {
  // If status is already a string, return it as is
  if (typeof status === 'string') {
    return status;
  }

  // Map integer status to labels
  switch (status) {
    case 0:
      return "Pending";
    case 1:
      return "Waiting for speciality approval";
    case 2:
      return "Inspector Assigned";
    case 3:
      return "Inspection started";
    case 4:
      return "Inspection Completed";
    case 5:
      return "On Auction";
    case 6:
      return "Waiting for buyer confirmation";
    case 7:
      return "Payment pending";
    case 8:
      return "Delivered";
    default:
      return "Unknown";
  }
};

export const getInspectionStatusColor = (status: number | string): string => {
  const statusLabel = getInspectionStatusLabel(status);
  
  switch (statusLabel) {
    case "Pending":
      return "default";
    case "Waiting for speciality approval":
      return "orange";
    case "Inspector Assigned":
      return "blue";
    case "Inspection started":
      return "processing";
    case "Inspection Completed":
      return "success";
    case "On Auction":
      return "green";
    case "Waiting for buyer confirmation":
      return "warning";
    case "Payment pending":
      return "default";
    case "Delivered":
      return "green";
    default:
      return "default";
  }
}; 