"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import BpmnModeler from "bpmn-js/lib/Modeler";
import { ToastUtils } from "@/utils/toast.utils";
import { handleError } from "@/utils/common.utils";
import styles from "./page.module.css";
import { SaveXMLResult } from "bpmn-js/lib/BaseViewer";
import {
  useGetProcessDetailById,
  useUpdateProcessDetail,
} from "@/hooks/data/process.data";
import { is } from "bpmn-js/lib/util/ModelUtil";
import ConfigNodeDialog from "@/components/dialogs/ConfigNodeDialog";
import { ProcessRequest } from "@/definitions/types/process.type";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";

export default function ProcessConfigPage() {
  const params = useParams();
  const router = useRouter();
  const processId = params?.id ? parseInt(params.id as string) : 0;

  const containerRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<BpmnModeler | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [processName, setProcessName] = useState("");
  const { mutate: updateProcessDetail } = useUpdateProcessDetail();

  // Tạo biến để trigger lại effect khi refetch
  const [refreshKey, setRefreshKey] = useState(0);

  // Sử dụng hook query thay vì mutate để lấy detail
  const {
    data: processData,
    isLoading: isProcessDataLoading,
    isFetched,
    error: processDataError,
    refetch: originalRefetch,
  } = useGetProcessDetailById(processId);

  // Bọc refetch gốc, khi được gọi thì setRefreshKey để force update useEffect ở line 68
  const refetch = async () => {
    const result = await originalRefetch();
    setRefreshKey((prev) => prev + 1);
    return result;
  };

  // Lưu lại xml mới nhất trong bộ nhớ để truy cập lại nếu cần (ví dụ tạo LastXML)
  const lastXMLRef = useRef<string>("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogNodeData, setDialogNodeData] = useState<any>(null);

  // Utility Promise cho saveXML thay vì dùng callback thuần
  const getXML = (modeler: BpmnModeler): Promise<string> => {
    return new Promise((resolve, reject) => {
      modeler
        .saveXML({ format: true })
        .then((result: SaveXMLResult) => {
          const xml = result.xml;
          if (xml) {
            lastXMLRef.current = xml;
            resolve(xml);
          } else {
            reject(new Error("XML is undefined"));
          }
        })
        .catch((err: Error) => {
          reject(err);
        });
    });
  };

  // Chỉ khi đã lấy được processData thì mới init bpmn
  useEffect(() => {
    if (processId && isFetched && !isProcessDataLoading) {
      if (!processData) {
        ToastUtils.error("Lỗi khi lấy chi tiết luồng xử lý");
        if (processDataError) handleError(processDataError);
        setIsInitializing(false);
        return;
      }
      setProcessName(processData.name);
      // Khởi tạo Modeler và lắng nghe sự kiện
      const initializeBpmn = async () => {
        setIsInitializing(true);
        try {
          const bpmnModule = await import("bpmn-js/lib/Modeler");
          const BpmnModeler = bpmnModule.default;
          await new Promise((resolve) => setTimeout(resolve, 100));

          if (!containerRef.current) {
            ToastUtils.error("Không tìm thấy container để hiển thị BPMN");
            return;
          }

          if (!modelerRef.current) {
            modelerRef.current = new BpmnModeler({
              container: containerRef.current,
              bpmnRenderer: {
                defaultFillColor: "#007ad9",
                defaultStrokeColor: "#333",
              },
            });

            const handleImportDone = (event: any) => {
              const error = event?.error;
              if (!error && modelerRef.current) {
                (modelerRef.current.get("canvas") as any).zoom("fit-viewport");

                const eventBus = modelerRef.current.get("eventBus");

                // Cập nhật: debounce & get xml mới nhất bằng Promise (không dùng callback tách rời)
                let saveTimeout: NodeJS.Timeout | null = null;

                (eventBus as any).on(
                  "elements.changed",
                  async (_event: any) => {
                    if (saveTimeout) clearTimeout(saveTimeout);

                    saveTimeout = setTimeout(async () => {
                      if (!modelerRef.current) return;
                      try {
                        const xml = await getXML(modelerRef.current);
                        // (Có thể dùng lastXMLRef.current thay cho xml nếu muốn)
                        const updatedData: any = {
                          ...processData,
                          content: xml,
                          id: processId,
                        };
                        updateProcessDetail(
                          { payload: updatedData },
                          {
                            onSuccess: async () => {
                              await refetch();
                              ToastUtils.success("Cập nhật luồng thành công");
                            },
                            onError: async (error) => {
                              await refetch();
                              if (
                                (
                                  error as any
                                )?.response?.data?.message?.includes(
                                  "varying(255)"
                                )
                              ) {
                                ToastUtils.error("Không nhập quá 225 ký tự");
                              } else {
                                handleError(error);
                              }
                            },
                          }
                        );
                      } catch (error) {
                        await refetch();
                        handleError(error);
                      }
                    }, 200);
                  }
                );

                // Add text annotation as before
                (eventBus as any).on("element.click", (event: any) => {
                  const element = event.element;
                  if (element && element.businessObject) {
                    const isConnection =
                      element.businessObject.type === "bpmn:SequenceFlow" ||
                      element.businessObject.type === "bpmn:MessageFlow";
                    if (isConnection) {
                      const text = prompt(
                        "Nhập text annotation cho connection này:"
                      );
                      if (text && text.trim() && modelerRef.current) {
                        try {
                          const modeling = modelerRef.current.get(
                            "modeling"
                          ) as any;
                          const elementFactory = modelerRef.current.get(
                            "elementFactory"
                          ) as any;
                          const elementRegistry = modelerRef.current.get(
                            "elementRegistry"
                          ) as any;
                          const connectionBounds = element.businessObject.di;
                          let x = 200;
                          let y = 100;
                          if (
                            connectionBounds &&
                            connectionBounds.waypoint &&
                            connectionBounds.waypoint.length > 0
                          ) {
                            const midPoint =
                              connectionBounds.waypoint[
                                Math.floor(connectionBounds.waypoint.length / 2)
                              ];
                            x = midPoint.x - 50;
                            y = midPoint.y - 20;
                          }
                          const textAnnotationShape =
                            elementFactory.createShape({
                              type: "bpmn:TextAnnotation",
                              x,
                              y,
                              width: 100,
                              height: 50,
                            });
                          const bo = elementFactory.createRoot({
                            type: "bpmn:TextAnnotation",
                            text: text.trim(),
                          });
                          textAnnotationShape.businessObject = bo;
                          const canvas = modelerRef.current.get(
                            "canvas"
                          ) as any;
                          canvas.addShape(textAnnotationShape);
                          ToastUtils.success("Đã thêm text annotation");
                        } catch (error) {
                          ToastUtils.error("Lỗi khi thêm text annotation");
                        }
                      }
                    }
                  }
                });

                // Mở dialog khi double click node
                (eventBus as any).on("element.dblclick", (event: any) => {
                  const element = event.element;
                  if (
                    element &&
                    (is(element, "bpmn:Task") || is(element, "bpmn:StartEvent"))
                  ) {
                    setDialogNodeData(element);
                    setDialogOpen(true);
                  }
                });

                setTimeout(() => {
                  removeUnusedPaletteElements();
                  renameTitlePaletteElements();
                  customizePaletteCSS();
                }, 5000);
              }
            };
            (modelerRef.current.on as any)("import.done", handleImportDone);
          }

          if (!modelerRef.current) {
            ToastUtils.error("Không thể khởi tạo BPMN modeler");
            return;
          }

          // Nếu processData đã có content thì load vào, nếu không thì blank diagram
          if (processData?.content && modelerRef.current) {
            await modelerRef.current.importXML(processData.content);
            // Cập nhật xml vào biến lastXMLRef
            try {
              const xml = await getXML(modelerRef.current);
              lastXMLRef.current = xml;
            } catch {
              //
            }
          } else if (modelerRef.current) {
            const xml = createBlankDiagram();
            await modelerRef.current.importXML(xml);
            lastXMLRef.current = xml;
          }
        } catch (error) {
          ToastUtils.error("Lỗi khi tải sơ đồ BPMN");
        } finally {
          setIsInitializing(false);
        }
      };

      initializeBpmn();

      return () => {
        if (modelerRef.current) {
          modelerRef.current.destroy();
          modelerRef.current = null;
        }
      };
    }
  }, [processId, processData, isFetched, isProcessDataLoading, refreshKey]);

  // Customize palette like v1
  const RemovedPalette = {
    "create.intermediate-event": "create.intermediate-event",
    "create.subprocess-expanded": "create.subprocess-expanded",
    "create.data-object": "create.data-object",
    "create.data-store": "create.data-store",
    "create.participant-expanded": "create.participant-expanded",
    "create.group": "create.group",
    "lasso-tool": "lasso-tool",
    "hand-tool": "hand-tool",
    "space-tool": "space-tool",
  };

  const RenamedPalette: Record<string, string> = {
    "create.exclusive-gateway": "Điều kiện",
    "create.start-event": "Khởi tạo",
    "create.end-event": "Kết thúc",
    "global-connect-tool": "Đường Nối",
    "create.task": "Tạo node",
  };

  const removeUnusedPaletteElements = () => {
    for (const item in RemovedPalette) {
      const removedPaletteElement = document.querySelector(
        `[data-action="${CSS.escape(item)}"]`
      ) as HTMLElement;
      if (removedPaletteElement) {
        removedPaletteElement.style.display = "none";
      }
    }
  };

  const renameTitlePaletteElements = () => {
    for (const item in RenamedPalette) {
      const renamedPaletteElement = document.querySelector(
        `[data-action="${CSS.escape(item)}"]`
      ) as HTMLElement;
      if (renamedPaletteElement) {
        renamedPaletteElement.title = RenamedPalette[item];
      }
    }
  };

  const customizePaletteCSS = () => {
    setTimeout(() => {
      const twoColumnElements = document.querySelectorAll(".two-column");
      twoColumnElements.forEach((el: any) => {
        if (el) el.style.display = "none !important";
      });

      const djsPalette = document.querySelector(".djs-palette") as HTMLElement;
      if (djsPalette) {
        djsPalette.style.cssText =
          "left: auto !important; right: 20px !important;";
      }
      const unusedIconClasses = [
        ".bpmn-icon-intermediate-event-none",
        ".bpmn-icon-text-annotation",
      ];

      unusedIconClasses.forEach((className) => {
        const elements = document.querySelectorAll(className);
        elements.forEach((el: any) => {
          if (el) el.style.display = "none !important";
        });
      });

      const poweredBy = document.querySelector(".bjs-powered-by");
      if (poweredBy) {
        (poweredBy as HTMLElement).style.display = "none";
      }

      const removedItems = [
        "create.intermediate-event",
        "create.subprocess-expanded",
        "create.data-object",
        "create.data-store",
        "create.participant-expanded",
        "create.group",
        "lasso-tool",
        "hand-tool",
        "space-tool",
      ];

      removedItems.forEach((item) => {
        const elements = document.querySelectorAll(`[data-action="${item}"]`);
        elements.forEach((el: any) => {
          if (el) el.style.display = "none !important";
        });
      });
    }, 500);
  };

  const createBlankDiagram = () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn">
      <bpmn2:process id="Process_1" isExecutable="false">
        <bpmn2:startEvent id="StartEvent_1"/>
      </bpmn2:process>
      <bpmndi:BPMNDiagram id="BPMNDiagram_1">
        <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
          <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
            <dc:Bounds height="36.0" width="36.0" x="100.0" y="100.0"/>
          </bpmndi:BPMNShape>
        </bpmndi:BPMNPlane>
      </bpmndi:BPMNDiagram>
    </bpmn2:definitions>`;
  };

  const handleBack = () => {
    router.push("/process");
  };

  // Xử lý đóng dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogNodeData(null);
  };

  // Cập nhật content XML khi đổi tên node trong modal ConfigNodeDialog
  const handleUpdateNode = async (updatedData: ProcessRequest) => {
    try {
      if (!modelerRef.current) {
        ToastUtils.error("BPMN Modeler chưa sẵn sàng");
        return;
      }
      // 1. Import lại XML hiện tại của process (updatedData.content)
      await modelerRef.current.importXML(updatedData.content);

      // 2. Tìm node mới đổi tên, cập nhật lại trên modeler và cập nhật XML content
      let newNodeName = "";
      const selectedTaskId = dialogNodeData?.id;

      if (!selectedTaskId) {
        ToastUtils.error("Không xác định được node cần cập nhật.");
        return;
      }

      // Dò lên updatedData.nodes để lấy chính xác tên mới cho node này
      if (Array.isArray((updatedData as any).nodes)) {
        const foundNode = (updatedData as any).nodes.find(
          (node: any) => node.ident === selectedTaskId
        );
        if (foundNode) {
          newNodeName = foundNode.name;
        }
      }

      if (!newNodeName) {
        ToastUtils.error("Không tìm thấy tên mới của node.");
        return;
      }

      const elementRegistry = modelerRef.current.get("elementRegistry");
      const modeling = modelerRef.current.get("modeling");
      const serviceTaskShape = (elementRegistry as any).get(selectedTaskId);

      if (serviceTaskShape) {
        (modeling as any).updateProperties(serviceTaskShape, {
          name: newNodeName,
        });
      } else {
        ToastUtils.error("Không tìm thấy shape node phù hợp trong modeler.");
        return;
      }

      // 3. Lưu lại XML mới nhất sau khi update vào process
      const newXml = await getXML(modelerRef.current);

      // Gọi cập nhật lên BE với content mới nhất
      updateProcessDetail(
        {
          payload: {
            ...updatedData,
            content: newXml,
            id: processId,
          },
        },
        {
          onSuccess: async () => {
            await refetch();
            ToastUtils.success("Cập nhật luồng thành công");
          },
          onError: (error) => {
            handleError(error);
          },
        }
      );
    } catch (error: any) {
      handleError(error);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b px-6 py-4 bg-white space-y-4">
        <BreadcrumbNavigation
          items={[
            {
              href: "/process",
              label: "Danh sách luồng",
            },
          ]}
          currentPage={`Cấu hình luồng`}
          showHome={false}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="h-9"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-xl font-semibold">
                Cấu hình sơ đồ: {processName}
              </h1>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden p-2">
        <div
          ref={containerRef}
          className={`h-full w-full border ${styles.diagramContainer}`}
        />
        {isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải sơ đồ...</p>
            </div>
          </div>
        )}
        {/* Dialog node config */}
        <ConfigNodeDialog
          isOpen={dialogOpen}
          onClose={handleCloseDialog}
          selectedTaskId={dialogNodeData?.id}
          process={processData as ProcessRequest}
          onUpdateProcess={handleUpdateNode}
        />
      </div>
    </div>
  );
}
