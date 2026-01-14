// "use client";

// import React, { useState } from "react";
// import GoJS from "./GoJS";

// interface GoJSModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   title: string;
//   treeData: any[];
// }

// const GoJSModal: React.FC<GoJSModalProps> = ({
//   isOpen,
//   onClose,
//   title,
//   treeData,
// }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
//         {/* Header */}
//         <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
//           <h5 className="text-lg font-semibold truncate pr-4">{title}</h5>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 text-2xl flex-shrink-0"
//           >
//             ×
//           </button>
//         </div>

//         {/* Content */}
//         <div className="flex-1 overflow-hidden">
//           <GoJS
//             key={`gojs-${title}-${Date.now()}`}
//             treeData={treeData}
//             className="w-full h-full"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default GoJSModal;
