const asBool = (value?: string): boolean => {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
};

export class Constant {
  public static ITEMS_PER_PAGE = 10;

  public static MAX_FILES_UPLOAD = 100;

  public static API_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`;

  public static PORTAL_URL = process.env.NEXT_PUBLIC_REACT_APP_PORTAL_URL;

  public static EMAIL_URL = process.env.NEXT_PUBLIC_REACT_APP_EMAIL_URL;

  public static LOGOUT = `${process.env.NEXT_PUBLIC_BACKEND_URL}/logout`;

  public static LOGOUT_WSO = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/saml/logout`;

  public static LOGIN = `${process.env.NEXT_PUBLIC_BACKEND_URL}/secured`;

  public static LOGIN_WSO = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/saml/login`;

  public static ALLOWED_FILE_EXTENSION =
    ".doc, .docx, .xls, .xlsx, .ppt, .pptx, .odt, .ods, .jpg, .png, .pdf, .rar, .zip";

  public static ALLOWED_DRAFT_FILE_EXTENSION =
    ".doc, .docx, .odt, .pdf, .xls, .xlsx";

  public static ALLOWED_CONVERT_EXTENSION = ".doc, .docx, .odt";

  public static ALLOWED_VIEW_EDIT_EXTENSION =
    ".doc, .docx, .odt, .xls, .xlsx, .ods";

  public static ALLOWED_FILE_IMAGE = ".jpg, .png, .jpeg";

  public static API_AUTHEN = `${Constant.API_ENDPOINT}/users/login`;

  public static API_AUTHEN_USB = `${Constant.API_ENDPOINT}/users/login/tk`;

  public static API_AUTHEN_CAS = `${Constant.API_ENDPOINT}/users/login/cas`;

  public static ADD_PERMISSION = "/permission/updateAuthorizeModule/";

  public static ADD_PERMISSION_CABINET =
    "/permission/updateAuthModule4Cabinet/";

  public static GET_ROLE = "/role/getAll";

  public static GET_ROLE_ECABINET = "/role/getAll/cabinet";

  public static GET_USER_BY_ROLE = "/role/getUserActiveByRole/";

  public static ADD_USER_ROLE_PATCH = "/permission/addAuthorizeUserList/";

  public static ACTIVE_USER_ROLE = "/permission/inactiveAuthorizeUser/";

  public static UPDATE_ROLE = "/role/updateRole/";

  public static ACTIVE_ROLE = "/role/active/";

  public static DEACTIVE_ROLE = "/role/deactive/";

  public static DELETE_ROLE = "/role/delete/";

  public static ADD_ROLE = "/role/add";

  public static GET_CLIENTS = "/clients";

  public static ADD_DOCUMENT_BOOK = "/document-book/add";

  public static UPDATE_DOCUMENT_BOOK = "/document-book/update/";

  public static GET_DOCUMENT_BOOK = "/document-book/getAll/";

  public static DEACTIVE_DOCUMENT_BOOK = "/document-book/deactive/";

  public static ACTIVE_DOCUMENT_BOOK = "/document-book/active/";

  public static SEARCH_DOCUMENT_BOOK = `${Constant.API_ENDPOINT}/document-book/searchDocumentBook`;

  public static GET_DOCUMENT_BOOK_BY_TYPE = "/document-book/getByType/";

  public static GET_DOCUMENT_BOOK_BY_TYPE_FLOWING =
    "/document-book/getByTypeFlowing/";

  public static MAX_SIZE_FILE_UPLOAD = 3000 * 1024 * 1024;

  public static TIME_MILISECOND_24H = 24 * 60 * 60 * 1000;

  public static GET_POSITION_BY_ROLE = "/role/getPositionActiveByRole/";

  public static ADD_POSITION_ROLE_PATCH =
    "/permission/addAuthorizePositionList/";

  public static ACTIVE_POSITION_ROLE = "/permission/inactiveAuthorizePosition/";

  public static LINK_SIGN = "/";

  public static AUTHEN_CAS = asBool(process.env.NEXT_PUBLIC_AUTHEN_CAS);
  public static AUTHEN_WSO = asBool(process.env.NEXT_PUBLIC_AUTHEN_WSO);

  public static AUTHEN_SSO =
    asBool(process.env.NEXT_PUBLIC_AUTHEN_CAS) ||
    asBool(process.env.NEXT_PUBLIC_AUTHEN_WSO);

  public static IMPORT_DOC_BOOK_BCY = asBool(
    process.env.NEXT_PUBLIC_IMPORT_DOC_BOOK_BCY
  );

  public static ORG_CONFIG_BCY = asBool(process.env.NEXT_PUBLIC_ORG_CONFIG_BCY);

  public static UPDATE_DEADLINE_BCY = asBool(
    process.env.NEXT_PUBLIC_UPDATE_DEADLINE_BCY
  );

  public static UPDATE_TRANSFER_BCY = asBool(
    process.env.NEXT_PUBLIC_UPDATE_TRANSFER_BCY
  );

  public static ORG_MULTI_TRANSFER_BCY = asBool(
    process.env.NEXT_PUBLIC_ORG_MULTI_TRANSFER_BCY
  );

  public static DEADLINE_CHECKBOX_TRANSFER_BCY = asBool(
    process.env.NEXT_PUBLIC_DEADLINE_CHECKBOX_TRANSFER_BCY
  );

  public static SWITCH_AND_ADD_USER_BCY = asBool(
    process.env.NEXT_PUBLIC_SWITCH_AND_ADD_USER_BCY
  );

  public static RETURN_NODE_BCY = asBool(
    process.env.NEXT_PUBLIC_RETURN_NODE_BCY
  );

  public static RETAKE_BY_STEP_BCY = asBool(
    process.env.NEXT_PUBLIC_RETAKE_BY_STEP_BCY
  );

  public static HIDE_BTN_RETAKE_H05 = asBool(
    process.env.NEXT_PUBLIC_HIDE_BTN_RETAKE_H05
  );

  public static EVALUTE_BCY = asBool(process.env.NEXT_PUBLIC_EVALUTE_BCY);

  public static ORG_DOC_OUT_SEARCH_BCY = asBool(
    process.env.NEXT_PUBLIC_ORG_DOC_OUT_SEARCH_BCY
  );

  public static ORG_CONFIG_SIGNER_BCY = asBool(
    process.env.NEXT_PUBLIC_ORG_CONFIG_SIGNER_BCY
  );

  public static ASK_IDEA_H05 = asBool(process.env.NEXT_PUBLIC_ASK_IDEA_H05);

  public static MULTI_TRANSFER_H05 = asBool(
    process.env.NEXT_PUBLIC_MULTI_TRANSFER_H05
  );

  public static NUMBER_SIGN_DRAFT_HIDE_H05 = asBool(
    process.env.NEXT_PUBLIC_NUMBER_SIGN_DRAFT_HIDE_H05
  );

  public static UNLINK_INFO_USER_H05 = asBool(
    process.env.NEXT_PUBLIC_UNLINK_INFO_USER_H05
  );

  public static FIX_SHOW_COMMENT_H05 = asBool(
    process.env.NEXT_PUBLIC_FIX_SHOW_COMMENT_H05
  );

  public static FIX_DEADLINE_WARNING_H05 = asBool(
    process.env.NEXT_PUBLIC_FIX_DEADLINE_WARNING_H05
  );

  public static BCY_ADD_SIGN_IN_ISSUED = asBool(
    process.env.NEXT_PUBLIC_BCY_ADD_SIGN_IN_ISSUED
  );

  public static BCY_FIX_CLOSE_POPUP_WHEN_CLICK_OUTSIDE = asBool(
    process.env.NEXT_PUBLIC_BCY_FIX_CLOSE_POPUP_WHEN_CLICK_OUTSIDE
  );

  public static BCY_COMMENT_WITH_TOKEN = asBool(
    process.env.NEXT_PUBLIC_BCY_COMMENT_WITH_TOKEN
  );

  public static FIX_LAYOUT_AND_ADD_ATTACH_BUTTON_H05 = asBool(
    process.env.NEXT_PUBLIC_FIX_LAYOUT_AND_ADD_ATTACH_BUTTON_H05
  );

  public static LEADER_TRANSFER_CHECK_H05 = asBool(
    process.env.NEXT_PUBLIC_LEADER_TRANSFER_CHECK_H05
  );

  public static BCY_ADD_EDIT_BUTTON_FOR_CLERICAL = asBool(
    process.env.NEXT_PUBLIC_BCY_ADD_EDIT_BUTTON_FOR_CLERICAL
  );

  public static SWITCH_TRANSFER_LOAD_ORG_USER_FOR_SUPPORT = asBool(
    process.env.NEXT_PUBLIC_SWITCH_TRANSFER_LOAD_ORG_USER_FOR_SUPPORT
  );

  public static ADD_SEARCH_FOLLOW_DAYLEFT = asBool(
    process.env.NEXT_PUBLIC_ADD_SEARCH_FOLLOW_DAYLEFT
  );

  public static PDF_OPEN_IN_NEW_TAB = asBool(
    process.env.NEXT_PUBLIC_PDF_OPEN_IN_NEW_TAB
  );

  public static ADD_TOP_NAV_MENU = asBool(
    process.env.NEXT_PUBLIC_ADD_TOP_NAV_MENU
  );

  public static FIX_BACKGROUND_LOGIN = asBool(
    process.env.NEXT_PUBLIC_FIX_BACKGROUND_LOGIN
  );

  public static ENCRYPTION_TWD = asBool(process.env.NEXT_PUBLIC_ENCRYPTION_TWD);

  public static AUTHEN_IAM = asBool(process.env.NEXT_PUBLIC_AUTHEN_IAM);

  public static SHOW_ALL_ORG_DOCUMENT_OUT_TRANSFER = asBool(
    process.env.NEXT_PUBLIC_SHOW_ALL_ORG_DOCUMENT_OUT_TRANSFER
  );

  public static BCY_EXPANDED_TREE_TRANSFER = asBool(
    process.env.NEXT_PUBLIC_BCY_EXPANDED_TREE_TRANSFER
  );

  public static SHOW_HSLT_BCY = asBool(process.env.NEXT_PUBLIC_SHOW_HSLT_BCY);

  public static RETAKE_DONE_DOCUMENT_BCY = asBool(
    process.env.NEXT_PUBLIC_RETAKE_DONE_DOCUMENT_BCY
  );

  public static CREATE_TASK_AT_DOC_DETAIL_H05 = asBool(
    process.env.NEXT_PUBLIC_CREATE_TASK_AT_DOC_DETAIL_H05
  );

  public static BTN_NEW_DRAFT_FROM_DOC_IN_DETAIL_H05 = asBool(
    process.env.NEXT_PUBLIC_BTN_NEW_DRAFT_FROM_DOC_IN_DETAIL_H05
  );

  public static HIGHLIGHT_MENU_H05 = asBool(
    process.env.NEXT_PUBLIC_HIGHLIGHT_MENU_H05
  );

  public static BCY_VERIFY_TOKEN = asBool(
    process.env.NEXT_PUBLIC_BCY_VERIFY_TOKEN
  );

  public static BCY_ADD_TOKEN_INFO = asBool(
    process.env.NEXT_PUBLIC_BCY_ADD_TOKEN_INFO
  );

  public static SHOW_CALENDAR_AUTHORITY_BCY = asBool(
    process.env.NEXT_PUBLIC_SHOW_CALENDAR_AUTHORITY_BCY
  );

  public static CONTACT_GROUP_TASK_BCY = asBool(
    process.env.NEXT_PUBLIC_CONTACT_GROUP_TASK_BCY
  );

  public static AUTO_NUMBER_IN_BOOK_DOC_OUT = asBool(
    process.env.NEXT_PUBLIC_AUTO_NUMBER_IN_BOOK_DOC_OUT
  );

  public static ENABLE_BTN_EDIT_FILE_DOCUMENT_ISSUED = asBool(
    process.env.NEXT_PUBLIC_ENABLE_BTN_EDIT_FILE_DOCUMENT_ISSUED
  );

  public static LOGIN_INTERNET = asBool(process.env.NEXT_PUBLIC_LOGIN_INTERNET);

  public static CHAT = asBool(process.env.NEXT_PUBLIC_CHAT);

  public static URL_ENCRYPT_CHECK_TOKEN =
    process.env.NEXT_PUBLIC_URL_ENCRYPT_CHECK_TOKEN;
  public static SIGN_SERVICE_URL = process.env.NEXT_PUBLIC_SIGN_SERVICE_URL;
  public static URL_SINGNATURE = process.env.NEXT_PUBLIC_URL_SINGNATURE;
  public static URL_ENCRYPT_FILE = process.env.NEXT_PUBLIC_URL_ENCRYPT_FILE;
  public static BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  public static URL_SERVER_SCAN = process.env.NEXT_PUBLIC_URL_SERVER_SCAN;
  public static EXPORT_TRACKING_BCY =
    process.env.NEXT_PUBLIC_EXPORT_TRACKING_BCY;
  public static URL_CHECK_UPLOAD_FILE_ENCRYPT =
    process.env.NEXT_PUBLIC_URL_CHECK_UPLOAD_FILE_ENCRYPT;
  public static URL_SIGN_AND_ENCRYPT_FILE =
    process.env.NEXT_PUBLIC_URL_SIGN_AND_ENCRYPT_FILE;
  public static URL_SIGN_ISSUED_ENCRYPT_FILE =
    process.env.NEXT_PUBLIC_URL_SIGN_ISSUED_ENCRYPT_FILE;
  public static URL_SIGN_COMMENT_ENCRYPT_FILE =
    process.env.NEXT_PUBLIC_URL_SIGN_COMMENT_ENCRYPT_FILE;

  public static LOGIN_IAM = `${Constant.API_ENDPOINT}/users/loginIAM`;
  public static URL_DECRYPT_FILE = process.env.NEXT_PUBLIC_URL_DECRYPT_FILE;
  public static URL_DECRYPT_FILE_DOWNLOAD =
    process.env.NEXT_PUBLIC_URL_DECRYPT_FILE_DOWNLOAD;

  public static CATEGORY_TYPE_CODE = {
    SECURITY: "DMVB",
    URGENT: "DKVB",
    ORG_TYPE: "LDV",
    DOC_TYPE: "LVB",
    DOC_FIELDS: "LVVB",
    BOOK: "SVB",
    METHOD_RECEIPT: "PTNVB",
    ORG_SEND: "DVN",
    DOC_STATUS: "TTVB",
    USER_POSITION: "CVND",
    CALENDAR_CATEGORY: "CALENDARCAT",
    ROOM_CATEGORY: "PH",
    TASK_FIELD: "LVCV",
    PRIORITY: "UT",
    DEADLINE_FOLDER: "THHS",
    ADDRESS_ROOM: "DDPH",
    LEVEL_OF_COMPLEXITY: "MDPTCV",
  };

  public static DOCUMENT_IN_FILE_TYPE = {
    DRAFT: "DRAFT",
    DOCUMENT: "DOCUMENT",
    COMMENT: "COMMENT",
  };

  public static DOCUMENT_INTERNAL_FILE_TYPE = {
    DOC_FILE: "VAN_BAN",
    ADDENDUM_FILE: "PHU_LUC",
    DA_KY: "DA_KY",
  };

  public static PAGING = {
    SIZE: 10,
    PREVIOUS: "Trang trước",
    NEXT: "Trang sau",
  };

  public static ERROR_STATUS = {
    NOT_FOUND: "404",
    SERVER_ERROR: "500",
    INPUT_ERROR: "422",
  };

  public static PAGE_SIZE_OPTION = [
    { name: "5", value: 5 },
    { name: "10", value: 10 },
    { name: "25", value: 25 },
    { name: "50", value: 50 },
  ];

  public static SYSTEM_PARAM = {
    NAME_SYSTEM: "Quản lý văn bản",
    PRESENT_SYSTEM: "Hệ thống Quản lý văn bản và Điều hành tác nghiệp",
  };

  public static DOCUMENT_BOOK_TYPE = [
    {
      name: "Văn bản đến",
      code: 0,
      documentStatus: [
        {
          key: "RETURN_DOC",
          value: "Trả lại văn bản",
        },
        {
          key: "RETAKE_DOC",
          value: "Thu hồi văn bản",
        },
        {
          key: "DOING",
          value: "Đang xử lý",
        },
        {
          key: "NOT_YET",
          value: "Chờ xử lý",
        },
        {
          key: "DONE",
          value: "Hoàn thành",
        },
      ],
    },
    {
      name: "Văn bản đi",
      code: 1,
      documentStatus: [
        {
          key: "DU_THAO",
          value: "Dự thảo",
        },
        {
          key: "DANG_XU_LY",
          value: "Đang xử lý",
        },
        {
          key: "CHO_BAN_HANH",
          value: "Chờ ban hành",
        },
        {
          key: "DA_BAN_HANH",
          value: "Đã ban hành",
        },
        {
          key: "BI_TRA_LAI",
          value: "Bị trả lại",
        },
        {
          key: "THU_HOI_XL",
          value: "Thu hồi",
        },
        {
          key: "THU_HOI_BH",
          value: "Thu hồi",
        },
      ],
    },
  ];

  public static DOCUMENT_TYPE = [
    {
      name: "Văn bản đến",
      code: 0,
      documentStatus: [
        {
          key: "RETURN_DOC",
          value: "Trả lại văn bản",
        },
        {
          key: "RETAKE_DOC",
          value: "Thu hồi văn bản",
        },
        {
          key: "DOING",
          value: "Đang xử lý",
        },
        {
          key: "NOT_YET",
          value: "Chờ xử lý",
        },
        {
          key: "DONE",
          value: "Hoàn thành",
        },
        {
          key: "DELEGATE_DOC",
          value: "Văn bản ủy quyền",
        },
      ],
    },
    {
      name: "Văn bản đi",
      code: 1,
      documentStatus: [
        {
          key: "DU_THAO",
          value: "Dự thảo",
        },
        {
          key: "DANG_XU_LY",
          value: "Đang xử lý",
        },
        {
          key: "CHO_BAN_HANH",
          value: "Chờ ban hành",
        },
        {
          key: "DA_BAN_HANH",
          value: "Đã ban hành",
        },
        {
          key: "BI_TRA_LAI",
          value: "Bị trả lại",
        },
        {
          key: "THU_HOI_XL",
          value: "Thu hồi xử lý",
        },
        {
          key: "THU_HOI_BH",
          value: "Thu hồi ban hành",
        },
      ],
    },
  ];

  public static DOCUMENT_STATUS = {
    WAIT_PROCESS: "Chờ xử lý",
    IN_PROCESS: "Đang xử lý",
    DONE: "Hoàn thành",
    REJECT: "Trả lại",
    DRAFT: "Dự thảo",
    DRAFT_REJECT: "Bị trả lại",
    WAIT_ISSUED: "Chờ ban hành",
    DONE_ISSUED: "Đã ban hành",
  };

  public static DOCUMENT_OUT_STATUS = {
    // // for document in
    RETURN_DOC: "Trả lại văn bản",
    RETAKE_DOC: "Thu hồi văn bản",
    DOING: "Đang xử lý",
    NOT_YET: "Chờ xử lý",
    DONE: "Hoàn thành",
  };

  public static DOCUMENT_IN_STATUS = {
    DU_THAO: "Dự thảo",
    DANG_XU_LY: "Đang xử lý",
    CHO_BAN_HANH: "Chờ ban hành",
    DA_BAN_HANH: "Đã ban hành",
    BI_TRA_LAI: "Bị trả lại",
    THU_HOI_XL: "Thu hồi",
    THU_HOI_BH: "Thu hồi",
  };

  public static DOCUMENT_STATUS_TYPE = {
    HANDLED: 0,
    WAIT_HANDLE: 1,
    HANDLING: 2,
  };

  public static PERSON_HANDLE_TYPE = {
    MAIN: 0,
    COMBINE: 1,
    SHOW: 2,
    MAIN_AND_COMBINE: 3,
  };

  public static STATUS = [
    {
      name: "Hoạt động",
      value: true,
    },
    {
      name: "Không hoạt động",
      value: false,
    },
  ];

  public static CATEGORYTYPE_CODE = {
    SECURITY: "DMVB",
    URGENT: "DKVB",
    ORG_TYPE: "LDV",
    DOC_TYPE: "LVB",
    DOC_FIELDS: "LVVB",
    BOOK: "SVB",
    METHOD_RECEIPT: "PTNVB",
    ORG_SEND: "DVN",
    DOC_STATUS: "TTVB",
    USER_POSITION: "CVND",
    CALENDAR_CATEGORY: "CALENDARCAT",
    ROOM_CATEGORY: "PH",
    TASK_FIELD: "LVCV",
    PRIORITY: "UT",
    FONT: "MP",
    COMPLEXITY: "MDPTCV",
    QLSH: "QLSH",
  };

  public static CATEGORYTYPE = {
    GET_ALL: "/category-type/getAllSort/",
    GET_ALL_WITH_PAGING: "/category-type/getAllSortAndPage/",
    GET_ONCE: "/category-type/getById/",
    ADD: "/category-type/add",
    UPDATE: "/category-type/update/",
    DELETE: "/category-type/delete/",
    ACTIVE: "/category-type/active/",
    DEACTIVE: "/category-type/deactive/",
  };

  public static CATEGORY = {
    GET_ALL: "/categories/getAllSort/",
    GET_ONCE: "/categories/getById/",
    GET_BY_CATEGORY_TYPE_ID: "/categories/getAllByCategoryTypeId/",
    GET_BY_CATEGORY_TYPE_ID_PAGING: "/categories/getAllByCategoryTypeIdPaging/",
    GET_BY_CATEGORY_TYPE_CODE: "/categories/getAllByCategoryTypeCode/",
    ADD: "/categories/add",
    UPDATE: "/categories/update/",
    DELETE: "/categories/delete/",
    ACTIVE: "/categories/active/",
    DEACTIVE: "/categories/deactive/",
  };

  public static MAP_CATEGORY = {
    GET_ALL: "/map_category/getAll/",
  };

  public static ORGANIZATION = {
    GET_ALL: "/org/getAllSort/",
    GET_ROOT: "/org/findByNoParent/",
    GET_LIST_ROOT: "/org/findByNoParent/",
    GET_ONCE: "/org/getById/",
    ADD: "/org/add",
    UPDATE: "/org/update/",
    DELETE: "/org/delete/",
    ACTIVE: "/org/active/",
    DEACTIVE: "/org/deactive/",
    SEARCH: "/org/search/",
    SEARCH_NAME: "/org/search-org",
    USER_IN_ORG: "/org/getTreeOrg",
    ORG_CVV: "/org/findByOrgCVV",
    GET_ALL_VANTHU: "/clerical/getTreeOrgByChil",
  };

  public static DOCUMENT_OUT = {
    GET_ALL: "/document/getAll",
    GET_ALL_WAITING: "/document/getNotDoneDocsByUser",
    GET_ALL_DONE: "/document/getDoneDocsByUser",
    GET_BY_ID: "/document/getById/",
    GET_DETAIL_BY_ID: "/document/getDetailById/",
    GET_ARRIVAL: "/document/getNumberArrival",
    ADD: "/document/add",
    UPDATE: "/document/update/",
    DELETE: "/document/delete/",
    ACTIVE: "/document/active/",
    DEACTIVE: "/document/deactive/",
    REJECT: "/document/returnDoc/",
    RETAKE: "/document/retake/",
    TRANSFER: "/document/transferHandle/",
    TRANSFER_TRACKING: "/doc_in_process/listTracking/",
    LOG_TRACKING: "/doc_in_tracking/follow/",
    ALL_LOG_TRACKING: "/doc_in_tracking/all/",
    INCOMMING_BASIC_SEARCH: "/document/findBasic?",
    INCOMMING_ADVANCE_SEARCH: "/document/findAdvance?",
    WAITING_SEARCH: "/document/getWaitToReceive?",
    DONE_DOC_BASIC_SEARCH: "/document/findBasicDoneDoc?",
    DONE_DOC_ADVANCE_SEARCH: "/document/findAdvanceDoneDoc?",
    WAIT_DOC_BASIC_SEARCH: "/document/findBasicExeDoc?",
    WAIT_DOC_ADVANCE_SEARCH: "/document/findAdvanceExeDoc?",
    HANDLING_DOC_SEARCH: "/document/find_process_doc?",
    BASIC_ALL_SEARCH: "/document/findBasicAllDoc?",
    ADVANCE_ALL_SEARCH: "/document/findAllDoc?",
    EXPORT_EXCEL: "/document/exportExcel?",
    EXPORT_EXCEL_FlOWING: "/document/ExcelFlowingIn?",
    FIND_DOC_REPLY: "/document/findDocReply",
    UPDATE_DEADLINE: "/document/updateDeadline/",
    FIND_DOC_BY_TYPE: "/document/findDocByTypeHandle/",
    TRANSFER_LIST: "/document/transferHandleList/",
    UPDATE_PROGRESS: "/doc_in_process/progress_report/",
    TRANSFER_MULTI_LIST: "/document/orgTransfer/",
    GET_COMMENT_DOCUMENT_LIST: "/doc_in_manipulation/get?",
    REQUEST_COMMENT: "/document/request_comment/",
    SEND_COMMENT: "/document/reply_comment/",
    SWITCH_MAIN_ADD_SUPPORT: "/document/switchOrAddUser/",
  };

  public static ROLES = {
    CLERICAL: "Văn thư",
  };

  public static MODULE = {
    MODULECLERICAL: "Việc đã giao",
  };

  public static ROLESDASH = {
    TRUONGDONVI: "Trưởng đơn vị",
    DEPUTYORG: "Phó đơn vị",
    NHANVIENORG: "Nhân viên",
    LEADERSHIP: "LEADERSHIP",
    LEADERSHIP_UNIT: "LEADERSHIP_UNIT",
  };

  public static DOCUMENT_PROCESS = {
    DONE: "/doc_in_process/done/",
    // HANDLE_TYPE: '/process_doc/getTypeHandleByUsername/'
    HANDLE_TYPE: "/doc_in_process/getTypeHandleByUsername/",
    USER_EXIST_NODE: "/doc_in_process/users/",
    RETAKE_DONE: "/document/retake_done/",
  };

  public static HANDLE_TYPE = {
    MAIN: "MAIN",
    SUPPORT: "SUPPORT",
    SHOW: "SHOW",
    DIRECTION: "DIRECTION",
  };

  public static DOCUMENT_OUT_COMMENT = {
    GET_ALL_BY_DOC_ID: "/comment_doc/getListByDocId/",
    ADD: "/comment_doc/addDoc",
    ADD_ATTACHMENT: "/attachment_comment/addAttachmentComment/",
  };

  public static SAVE_ACTION = {
    SAVE_AND_CLOSE: 1,
    SAVE_AND_COPY: 2,
    SAVE_AND_NEW: 3,
    SAVE_OF_TRANSFER: 4,
    SAVE_OF_DONE: 5,
    SAVE_OF_CONSULT: 6,
  };

  public static BUSINESS_LOG = {
    SEARCH: "/log/search",
    EXPORT: "/log/export",
  };

  public static ATTACHMENT = {
    GET_BY_ID: "/attachment/getById/",
    ADD: "/attachment/add",
    UPDATE: "/attachment/update/",
    ACTIVE: "/attachment/active/",
    DEACTIVE: "/attachment/deactive/",
    DELETE: "/attachment/delete/",
    DELETE_BY_DOC: "/attachment/deleteByDoc/",
    DOWNLOAD: "/attachment/download/",
  };

  public static PROCESS = {
    SEARCH: "/bpmn2/search",
    GET_ALL: "/bpmn2/getAll",
    GET_BY_ID: "/bpmn2/getById/",
    DELETE: "/bpmn2/delete/",
    ACTIVE: "/bpmn2/update/",
    DEACTIVE: "/bpmn2/update/",
    UPDATE: "/bpmn2/update/",
    ADD: "/bpmn2/add",
  };

  public static RETAKE = {
    GET_DOCUMENT_IN: "/document_out/getListIssued/",
    GET_DOCUMENT_OUT: "",
    RETAKE_DOCUMENT_IN: "",
    RETAKE_DOCUMENT_OUT: "",
  };

  public static DIRECTION = {
    ASC: "ASC",
    DESC: "DESC",
  };

  public static THREAD = {
    GET_BPMN_BY_TYPE: "/bpmn2/type/",
  };

  public static TASK_NEW = {
    ADD_TASK_ASSIGN: "/task/addTaskAssign",
    GET_BY_USER_EXECUTE: "/task/findByUserExecute",
    GET_BY_USER_COMBINATION: "/task/findByUserCombination",
    GET_BY_USER_ASSIGN: "/task/findByUserAssign",
    UPDATE_STATUS: "/task/update/status/",
    ADD_COMMENT: "/taskComment/add",
    ADD_COMMENT_ATTACHMENT: "/taskAtt/add/",
    DOWNLOAD_ATTACHMENT: "/files/",
    GET_COMMENT: "/taskComment/getComment/",
    SEARCH_DOC_OUT: "/document_out/find_all/",
    SEARCH_DOC_IN: "/document/find_all/",
    UPDATE_COMPLETED: "/task/updateCompleted/",
    FIND_BY_ID: "/task/findById/",
    GET_ASSIGN: "/task/getByAssign/",
    SEARCH: "/task/findByTaskName/",
    ADD_USER_APPROVE: "/task/addUserApprove",
    DELETE_TASK_EXECUTE: "/task/deleteTaskExecute/",
    FIND_BY_CLIENT_ID: "/task/findByClientId/",
    DELETE_TASK_ACTIVE: "/task/delete/",
    ADD_TASK_DOC: "/task/addTaskDoc",
    UPDATE_PROGRESS: "/task/progress_report/",
    GET_ALL_TASK_USER_LEAD: "/task/getListTaskUserLead",
    UPDATE_IMPORTANT_TASK: "/task/updateImportant",
    UPDATE_TASK_EXECUTE_IMPORTANT: "/task/updateImportantTaskExecute",
    ADD_ATTACHMENT: "/taskAtt/add/",
    DELETE_TASK_ATT: "/taskAtt/deleteById/",
    DOWNLOAD_TASK_ATT: "/taskAtt/download/",
    EXTEND_DEADLINE: "/task/extend/",
    HISTORY: "/task-history/findByTaskId/",
    GET_ACTION: "/task/detail/action/",
    GET_TRACKING: "/task/tracking/list/",
    GET_ALL_TRACKING: "/task/tracking/listAll/",
    REAL_TIME: "/task/excute",
    GET_USER_FLOW: "/task/tracking/listAllExceptCreator/",
    GET_LIST_MAIN: "/task/list/main/",
    GET_LIST_COMBINATION: "/task/list/support/",
    UPDATE_FOLLOWER: "/task/update-follow/",
    ADD_TRANSFER: "/task/add-transfer/",
    TRANSFER: "/task/transfer/",
    TASK_INACTIVE_TRANSFER: "/task/users/",
  };

  public static TASK_NEW_V2 = {
    ADD_TASK_ASSIGN: "/task2/addTaskAssign",
    GET_BY_USER_EXECUTE: "/task2/findByUserExecute",
    GET_BY_USER_COMBINATION: "/task2/findByUserCombination",
    GET_BY_USER_ASSIGN: "/task2/findByUserAssign",
    UPDATE_STATUS: "/task2/updateStatus",
    ADD_COMMENT: "/taskComment2/add",
    ADD_COMMENT_ATTACHMENT: "/taskAtt2/add/",
    DOWNLOAD_ATTACHMENT: "/files/",
    GET_COMMENT: "/taskComment2/getComment/",
    SEARCH_DOC_OUT: "/document_out/find_all/",
    SEARCH_DOC_IN: "/document/find_all/",
    UPDATE_COMPLETED: "/task2/updateCompleted/",
    FIND_BY_ID: "/task2/findById/",
    GET_ASSIGN: "/task2/getByAssign/",
    SEARCH: "/task2/findByTaskName/",
    ADD_USER_APPROVE: "/task2/addUserApprove",
    DELETE_TASK_EXECUTE: "/task2/deleteTaskExecute/",
    FIND_BY_CLIENT_ID: "/task2/findByClientId/",
    DELETE_TASK_ACTIVE: "/task2/delete",
    ADD_TASK_DOC: "/task2/addTaskDoc",
    UPDATE_PROGRESS: "/task2/progress_report/",
    GET_ALL_TASK_USER_LEAD: "/task2/getListTaskUserLead",
    UPDATE_IMPORTANT_TASK: "/task2/updateImportant",
    UPDATE_TASK_EXECUTE_IMPORTANT: "/task2/updateImportantTaskExecute",
    ADD_ATTACHMENT: "/taskAtt2/add/",
    DELETE_TASK_ATT: "/taskAtt2/deleteById/",
    DOWNLOAD_TASK_ATT: "/taskAtt2/download/",
    EXTEND_DEADLINE: "/task2/extend/",
    HISTORY: "/task-history2/findByTaskId/",
    GET_ACTION: "/task2/detail/action/",
    GET_TRACKING: "/task2/tracking/list/",
    GET_ALL_TRACKING: "/task2/tracking/listAll/",
    REAL_TIME: "/task2/excute",
    GET_USER_FLOW: "/task2/tracking/listAllExceptCreator/",
    GET_LIST_MAIN: "/task2/list/main/",
    GET_LIST_COMBINATION: "/task2/list/support/",
  };

  public static GROUP = {
    GET_ALL: "/group/getAllGroup",
  };
  public static THREAD_TYPE = {
    INCOMING: "INCOMING",
    OUTCOMING: "OUTCOMING",
    ASSIGN: "ASSIGN",
    EXAM_FOR_OTHERS: "EXAM_FOR_OTHERS",
    WORD_EDITOR: "WORD_EDITOR",
    CONSULT: "CONSULT",
  };

  public static POSITION = {
    PAGINATED: "/categories/findPosition/",
  };

  public static USER = {
    SEARCH_USER_ACTIVE: "/users/search",
    SEARCH_USER_ORG: "/users/all-user-in-org",
    SEARCH_USER_ACTIVE1: "/users/search1",
    SEARCH_USER_CALENDAR: "/users/all-user-in-org-type",
    SEARCH_USER_CALENDAR_PAGING: "/users/all-user-in-org-type-paging",
    SEARCH_USER_ORG_PAGING: "/users/all-user-in-org-paging?",
    ADD_ADDITIONAL_POSITION: "/users/additionalPosition/add",
    REMOVE_ADDITIONAL_POSITION: "/users/additionalPosition/remove",
    SEARCH_USER_SIGN_ORG: "/users/search-sign-org",
  };

  public static CALENDAR = {
    ADD: "/calendar/addCalendar",
    ADD_JOIN: "/calendar/addlistJoin/",
    GET_USER_JOIN: "/calendar/getCalendarJoin/",
    GET: "/calendar/getByMonth",
    GET_TIME: "/calendar/getTimes",
    FIND_BY_BOOK_BY: "/calendar/findByBookBy",
    FIND_BY_TITLE: "/calendar/findByName",
    ADD_BUSINESS: "/calendar2/addCalendar2/",
    ADD_JOIN_BUSINESS: "/calendar2/addlistJoin/",
    GET_CALENDAR_LIST: "/calendar2/findByOrg/",
    GET_CALENDAR_BUSINESS: "/calendar2/getByMonth/",
    GET_CALENDAR_DASHBROAD: "/calendar2/getByDate/",
    UPDATE_STATUS: "/calendar2/updateCalendar/",
    CALENDAR_JOIN: "/calendar2/getCalendarJoin/",
    GET_CALENDAR_BY_ID: "/calendar2/getCalendar/",
    UPDATE_CALENDAR: "/calendar2/updateCalendarBody/",
    GET_PERSONAL_CALENDAR: "/calendar2/invitation",
    GET_CALENDAR_CATEGORY: "/calendar2/get-calendar-info/category",
    GET_CALENDAR_ROOM: "/calendar2/get-calendar-info/room",
    EXPORT_CALENDAR: "/calendar2/export",
    EXPORT_EXCEL_CALENDAR: "/calendar2/export-excel",
    GET_CALENDAR_BY_WEEK: "/calendar2/getByWeek/",
    DELETE_CALENDAR: "/calendar2/del/",

    MEETING_DETAIL: "/calendar2/getMeetingCalendar/",
    MEETING_UPLOAD: "/calendar2/meeting/attachment/",
    MEETING_UPDATE: "/calendar2/meeting/update/",
    MEETING_DELETE: "/calendar2/meeting/attachment/deleteBy/",
    MEETING_DOWNLOAD: "/calendar2/download/",
    MEETING_REMOVE: "/calendar2/meeting/attachment/",
    IS_PERMISSON_BAN: "/calendar2/ban/create",

    MEETING_ROOM: "/meeting-room/import",

    MEETING_ORG: "/meetingRoomAddress/import",

    EXPORT_ROOM: "/meeting-room/export",

    EXPORT_ORG: "/meetingRoomAddress/export",

    getListDocDash: "/document/dashBoard/",
  };

  public static ROOM = {
    GET_ALL: "/room/getAll",
    ADD_ROOM: "/room/addRoom",
    UPDATE_ROOM: "/room/updateRoom/",
    findByName: "/room/findByName",
    findById: "/room/findById/",
    GET_BY_ORG: "/room/getRoomByOrg/",
  };

  public static DOCUMENT_IN_DRAFT = {
    GET_DATA_INIT: "/document_out/getDataInit/",
  };

  public static DOCUMENT_IN_MENU = {
    DRAFT: 1,
    HANDLE: 2,
    ISSUED: 3,
    DOC_IN: 4,
    SEARCH: 5,
  };

  public static DOCUMENT_OUT_MENU = {
    MAIN: 1,
    SUPPORT: 2,
    TO_KNOW: 3,
    SEARCH: 4,
    LIST: 5,
    ASK: 6,
    DIRECTIVE: 7,
    IMPORTANT: 8,
  };

  public static ATTACHMENT_DOWNLOAD_TYPE = {
    DOCUMENT_IN: "VAN_BAN_DI",
    DOCUMENT_OUT_COMMENT: "document_out_comment",
    DOCUMENT_OUT: "document_out",
    DELEGATE: "delegate",
    WORD_EDITOR: "VAN_BAN_SOAN_THAO",
    DOCUMENT_RECORD: "document_record",
    TEMPLATE: "template",
    CALENDAR: "calendar",
    TASK: "GIAO_VIEC",
    TASK_2: "GIAO_VIEC_2",
    DOCUMENT_INTERNAL: "VAN_BAN_NOI_BO",
    REPORT: "BAO_CAO",
    DOCUMENT_VEHICLE: "VAN_BAN_XIN_XE",
    DOCUMENT_VEHICLE_COMMENT: "VAN_BAN_XIN_XE_COMMENT",
    DYNAMIC_FORM: "DYNAMIC_FORM",
  };

  public static SORT_TYPE = {
    INCREASE: "ASC",
    DECREASE: "DESC",
    NO_SORT: "NO_SORT",
  };

  public static DELEGATE = {
    IN_REJECT: "/document/delegate_reject/",
    IN_TRANSFER: "/document/delegate_transfer/",
    IN_TRANSFER_ORG: "/document/orgTransfer/",
    IN_TRANSFER_DONE: "/doc_in_process/delegate_finish/",

    OUT_REJECT: "/document/delegate_reject/",
    OUT_TRANSFER: "/document/delegate_transfer/",
    OUT_TRANSFER_DONE: "/document/delegate_finish/",
  };

  public static DRAFT_TAB = {
    DANH_SACH_VAN_BAN_DI: "DANH_SACH_VAN_BAN_DI",
  };

  // sub is combine
  // show is to know
  // public static PERSON_HANDLE_TYPE = {
  //   MAIN: 'MAIN',
  //   SUB: 'SUB',
  //   SHOW: 'SHOW'
  // }
  public static USE_DELEGATE_FROM_USER_LIST = false;

  public static DOCUMENT_OUT_HANDLE_TYPE = {
    DIRECTIVE: 3,
  };

  public static SESSION_EXPIRED =
    process.env.NEXT_PUBLIC_SESSION_EXPIRED || 30 * 60;

  public static IDLE_TIMEOUT = process.env.NEXT_PUBLIC_IDLE_TIMEOUT || 30;

  public static DOC_INTERNAL_TAB_INDEX = {
    WAIT: "1",
    DOING: "2",
    RETURN: "3",
    PUBLISH: "4",
    DRAFT: "5",
    DOING_APPROVE: "6",
    SEARCH: "7",
    PENDING_PUBLISH: "8",
    PENDING_COMPLETE: "9",
  };

  public static HSTL_DOCUMENT_TYPE = {
    VAN_BAN_DEN: "VAN_BAN_DEN",
    VAN_BAN_DI: "VAN_BAN_DI",
  };

  public static TYPE_TEMPLATE = {
    VAN_BAN_DI: "VAN_BAN_DI",
    VAN_BAN_NOI_BO: "VAN_BAN_NOI_BO",
    VAN_BAN_SOAN_THAO: "VAN_BAN_SOAN_THAO",
    GIAO_VIEC: "GIAO_VIEC",
    VAN_BAN_MAU: "VAN_BAN_MAU",
  };

  public static KPI = {
    KPI_GET_ALL: "/kpi/all",
    KPI_GET_PAGE: "/kpi/list",
    KPI_GET_TYPE_OBJ: "/kpi/type_obj",
    KPI_GET_FREQUENCY: "/kpi/frequency",
    KPI_ADD: "/kpi/add",
    KPI_DEL_ID: "/kpi/del",

    FORMULAR_ALL: "/formula/all",
    FORMULAR_PAGE: "/formula/list",
    FORMULAR_ADD: "/formula/add",
    FORMULAR_DETAIL_ADD: "/formula/detail/add",
    FORMULAR_GET_BY_ID: "/formula",
    FORMULAR_DEL_ID: "/formula/del",
    FORMULAR_DEL_DETAIL_ID: "/formula/detail/del",

    KPI_SET_GET_PAGE: "/kpi/set/list",
    KPI_SET_GET_ALL: "/kpi/set/all",
    KPI_SET_GET_BY_ID: "/kpi/set",
    KPI_SET_ADD: "/kpi/set/add",
    KPI_SET_DEL_ID: "/kpi/set/del",
    KPI_SET_DEL_TARGET_ID: "/kpi/set/del/target",

    KPI_ASSIGN_GET_PAGE: "/kpi/app/list",
    KPI_ASSIGN_GET_ALL: "/kpi/app/all",
    KPI_ASSIGN_ADD: "/kpi/app/add",
    KPI_ASSIGN_GET_BY_ID: "/kpi/app",
    KPI_ASSIGN_DEL_ID: "/kpi/app/del",
    KPI_USER_UPDATE: "/kpi/kpi_user/update",

    KPI_GET_USER_TRACKING: "/kpi/statistical",
  };

  public static DAILY_REPORT = {
    UNCONFIRMED_REPORT: "/report/search",
    VERIFIED_REPORT: "/report/search",
    TITLE_LIST: "/categories/getAllByCategoryTypeCode/CVND",
    LIST_OF_SIGNER: "/hello/world",
    ADD_REPORT: "/report/add",
    UPDATE_REPORT: "/report/update",
    ADD_ATTACHMENT_REPORT: "/report/add/attachment",
    GET_REPORT: "/report/getReport",
    DELETE_REPORT: "/report/delete",
    DELETE_FILE_REPORT: "/report/deleteFile",
    EXPORT_FILE_REPORT: "/report/exportData",
    EXPORT_FILE_REPORT_ALL: "/report/exportData-all",
    APPROVE_REPORT: "/report/report-approve",
    TYPE: {
      WEEK: "WEEK",
      MONTH: "MONTH",
      QUARTER: "QUARTER",
      FIRST_6_MONTH: "FIRST_6_MONTH",
      YEAR: "YEAR",
      LAST_6_MONTH: "LAST_6_MONTH",
    },
  };

  public static REPORT_TYPE = {
    REPORT_GOV: "BAO_CAO_CHINH_QUYEN",
    REPORT_PAR: "BAO_CAO_DANG",
  };

  public static ID_CHANH_VAN_PHONG = 320;

  public static VEHICLE = {
    CREATE: "/vehicle-usage-plan/create",
    GET_ALL: "/vehicle-usage-plan/list-all",
    FIND_ALL: "/vehicle-usage-plan/find-all",
    GET_DETAIL: "/vehicle-usage-plan/getDetailToShow/",
    GET_DETAIL_TO_EDIT: "/vehicle-usage-plan/getDetailToEdit/",
    TRANSFER: "/vehicle-usage-plan/transferHandleList",
    ACCEPT: "/vehicle-usage-plan/accept",
    COMPLETE: "/vehicle-usage-plan/finish",
    UPDATE_DRAFT: "/vehicle-usage-plan/update",
    GET_DOCUMENT_VEHICLE: "/vehicle-usage-plan/attachment/download/",
    GET_CALENDER_VEHICLE: "/vehicle-usage-plan/getByWeek/",
    DELETE_DRAFT: "/vehicle-usage-plan/delete",
    RETAKE_DRAFT: "/vehicle-usage-plan/retake",
    REJECT_DRAFT: "/vehicle-usage-plan/reject",
    TRACKING_DRAFT: "/vehicle-tracking/follow/",
    COMMENT_DRAFT: "/vehicle-usage-plan/vehicle-comment/",
    LIST_USER_REJECT: "/vehicle-usage-plan/node-return/list/",
    RETURN_DRAFT: "/vehicle-usage-plan/return/",
    EXPORT_EXCEL: "/vehicle-usage-plan/export-excel",
    EXPORT_EXCEL_VEHICLE: "/vehicle-usage-plan/export",
    GET_LIST_DRIVER_DETAIL: "/vehicle-usage-plan/get-list-vehicle",
  };

  public static WATCH_LIST = {
    GET_ALL: "/work-schedule/get-all",
    UPDATE: "/work-schedule/update",
    ACCEPT: "/work-schedule/accept",
    FINISH: "/work-schedule/finish",
    EXPORT: "/work-schedule/export",
    EXPORT_EXCEL: "/work-schedule/export-excel",
    REJECT: "/work-schedule/reject",
    RETURN: "/work-schedule/return",
    SEND_NOTE: "/work-schedule/note",
    STATUS: "/work-schedule/check-status",
    DELETE: "/work-schedule/delete",
    LIST_WAIT_FINISH: "/work-schedule/get-list-accepted",
  };

  public static SHARE_DATA = {
    DOWNLOAD_SUCCESS: "DOWNLOAD_SUCCESS",
    CLOSE_POPUP: "closePopup",
  };

  public static LIST_CODE_MENU_MAT = [
    "DOCUMENT_OUT",
    "DOCUMENT_IN",
    "DOC_INTERNAL",
  ];

  public static SHOW_WORK_EDITOR_ON_TASK_BCY_129 = asBool(
    process.env.SHOW_WORK_EDITOR_ON_TASK_BCY_129
  );
}
