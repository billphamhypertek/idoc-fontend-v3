// "use client";

// import React, { useEffect, useRef, useMemo } from "react";
// import * as go from "gojs";

// interface GoJSProps {
//   treeData: any[];
//   className?: string;
// }

// const GoJS: React.FC<GoJSProps> = ({ treeData, className = "" }) => {
//   const treeContainerRef = useRef<HTMLDivElement>(null);
//   const diagramRef = useRef<go.Diagram | null>(null);

//   // Tạo unique ID cho div
//   const divId = useMemo(
//     () =>
//       `gojs-diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
//     [],
//   );

//   useEffect(() => {
//     if (!treeContainerRef.current || !treeData || treeData.length === 0) return;

//     initFamilyTree();

//     // Cleanup function để xóa diagram khi component unmount
//     return () => {
//       if (diagramRef.current) {
//         diagramRef.current.div = null;
//         diagramRef.current = null;
//       }
//     };
//   }, [treeData]);

//   const initFamilyTree = () => {
//     if (!treeContainerRef.current) return;

//     // Xóa diagram cũ nếu có
//     if (diagramRef.current) {
//       diagramRef.current.div = null;
//       diagramRef.current = null;
//     }

//     const $ = go.GraphObject.make;
//     const diagram = $(go.Diagram, treeContainerRef.current, {
//       "undoManager.isEnabled": true,
//       initialContentAlignment: go.Spot.Center,
//       isReadOnly: true,
//       layout: $(go.TreeLayout, {
//         angle: 90,
//         layerSpacing: 50,
//         layerSpacingParentOverlap: 1.5,
//       }),
//     });

//     // Định nghĩa mẫu node
//     diagram.nodeTemplate = $(
//       go.Node,
//       "Auto",
//       $(
//         go.Shape,
//         "RoundedRectangle",
//         {
//           strokeWidth: 0, // Bỏ viền
//         },
//         new go.Binding("fill", "execute", (execute) =>
//           execute ? "lavender" : "lightblue",
//         ), // Màu xanh nếu có mainProcess, xám nếu không
//       ),
//       // Panel chứa nội dung
//       $(
//         go.Panel,
//         "Table",
//         { margin: 8 },
//         $(go.RowColumnDefinition, { row: 0, separatorStroke: "black" }),

//         // 🔹 Tiến trình (Hiển thị góc trên)
//         $(
//           go.Panel,
//           "Vertical",
//           { row: 0, width: 200, alignment: go.Spot.TopLeft },
//           $(
//             go.TextBlock,
//             {
//               textAlign: "left",
//               width: 200,
//               font: "italic 12px Arial",
//               stroke: "red",
//               visible: false,
//             },
//             new go.Binding("text", "execute", (val) =>
//               val ? "Xử lý chính" : "",
//             ),
//             new go.Binding("visible", "execute", (val) => !!val),
//           ),
//           $(
//             go.TextBlock,
//             {
//               textAlign: "left",
//               width: 200,
//               font: "italic 12px Arial",
//               stroke: "green",
//               visible: false,
//             },
//             new go.Binding("text", "execute", (val) =>
//               !val ? "Phối hợp" : "",
//             ),
//             new go.Binding("visible", "execute", (val) => !val),
//           ),
//         ),
//         // 🔹 Hiển thị tên
//         $(
//           go.TextBlock,
//           {
//             row: 1,
//             textAlign: "center",
//             width: 200,
//             wrap: go.TextBlock.WrapFit,
//             font: "bold 14px Arial",
//           },
//           new go.Binding("text", "name"),
//         ),

//         // 🔹 Hiển thị chức vụ
//         $(
//           go.TextBlock,
//           {
//             row: 2,
//             textAlign: "center",
//             width: 200,
//             wrap: go.TextBlock.WrapFit,
//             font: "12px Arial",
//             stroke: "black",
//           },
//           new go.Binding("text", "position"),
//         ),

//         // 🔹 Hiển thị phòng ban
//         $(
//           go.TextBlock,
//           {
//             row: 3,
//             textAlign: "center",
//             width: 200,
//             wrap: go.TextBlock.WrapFit,
//             font: "12px Arial",
//             stroke: "black",
//             margin: new go.Margin(5, 0, 5, 0),
//           },
//           new go.Binding("text", "org"),
//         ),

//         // 🔹 Kết quả thực hiện (Chỉ hiển thị nếu là xử lý chính cuối cùng)
//         $(
//           go.TextBlock,
//           {
//             row: 4,
//             textAlign: "center",
//             width: 200,
//             wrap: go.TextBlock.WrapFit,
//             font: "12px Arial",
//             stroke: "blue",
//             visible: false,
//           },
//           new go.Binding("text", "result", (res) =>
//             res ? `Kết quả thực hiện: ${res}` : "",
//           ),
//           new go.Binding("visible", "result", (res) => !!res),
//         ),
//       ),
//     );

//     // 🔹 Dữ liệu cây
//     diagram.model = new go.TreeModel(treeData);

//     // Lưu reference đến diagram
//     diagramRef.current = diagram;
//   };

//   return (
//     <div
//       ref={treeContainerRef}
//       id={divId}
//       className={`w-full h-full ${className}`}
//       style={{ minHeight: "400px" }}
//     />
//   );
// };

// export default GoJS;
