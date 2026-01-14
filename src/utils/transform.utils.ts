export const transformTaskDocument = (taskDocument: any[]) => {
  if (!taskDocument || taskDocument.length === 0) return [];

  return taskDocument.map((doc: any) => {
    if (doc.docId !== undefined && (doc.documentIn || doc.documentOut)) {
      return doc;
    }

    const isDocumentIn = doc.typeDocument !== false;

    return {
      docId: doc.docId || doc.id || 0,
      typeDocument: isDocumentIn,
      documentIn: isDocumentIn ? doc : null,
      documentOut: !isDocumentIn ? doc : null,
    };
  });
};

export const transformTaskRelateds = (taskRelateds: any[]) => {
  if (!taskRelateds || taskRelateds.length === 0) return [];

  return taskRelateds.map((related: any) => ({
    id: related.id || 0,
    createDate: related.createDate || Date.now(),
    taskName: related.taskName || "",
    status: related.status || 1,
    startDate: related.startDate || Date.now(),
    endDate: related.endDate || Date.now(),
    progress: related.progress || 0,
    important: related.important || false,
    description: related.description || "",
    taskFieldId: related.taskFieldId || 0,
    priorityId: related.priorityId || 0,
    codeTask: related.codeTask || "",
    approveStatus: related.approveStatus || 1,
    userAssignId: related.userAssignId || 0,
    orgId: related.orgId || 0,
    taskCombination: related.taskCombination || null,
    userExcutePrimaryId: related.userExcutePrimaryId || 0,
    taskExecute: related.taskExecute || null,
    taskDocument: related.taskDocument || null,
    userFollows: related.userFollows || null,
    parentId: related.parentId || 0,
    taskCombinationStatus: related.taskCombinationStatus || 0,
    attachments: related.attachments || null,
    taskRelateds: related.taskRelateds || [],
    listDocOutReply: related.listDocOutReply || null,
    weList: related.weList || null,
    subTasks: related.subTasks || [],
    weListId: related.weListId || [],
    jobAssignerId: related.jobAssignerId || [],
    subTask: related.subTask || null,
    taskHistorys: related.taskHistorys || [],
    nextNode: related.nextNode || null,
    complexityId: related.complexityId || null,
    nodeId: related.nodeId || null,
    fieldName: related.fieldName || "",
    complexityName: related.complexityName || "",
    parentName: related.parentName || "",
    userAssignName: related.userAssignName || "",
    priorityName: related.priorityName || "",
    taskRelatedId: related.id || related.taskRelatedId || 0,
  }));
};
