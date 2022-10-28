const { hostname, protocol } = window.location;

const BASE_URL = `https://calm-bull-stole.cyclic.app`
// const BASE_URL = `http://localhost:5000`

const apiRoutes = {
    userAuth: `${BASE_URL}/api/auth/users/register`,
    adminAuth: `${BASE_URL}/api/auth/admin_auth/register`,
    logIn: `${BASE_URL}/api/auth/users/logIn`,
    approveRegRequest: `${BASE_URL}/api/users/request/registeration`,
    rejectRegRequest: `${BASE_URL}/api/users/request/registeration/reject`,
    setPermission: `${BASE_URL}/api/staff/permission/set`,
    setRoles: `${BASE_URL}/api/user/permission/roles/set`,
    getAllUsers: `${BASE_URL}/api/users/all`,
    getUsersById: `${BASE_URL}/api/users/id`,
    updateAccount: `${BASE_URL}/api/users/account/update`,
    deleteAccount: `${BASE_URL}/api/users/account/delete`,
    createToken: `${BASE_URL}/api/token/generate`,
    getTokens: `${BASE_URL}/api/token/getToken`,
    deleteToken: `${BASE_URL}/api/token/deleteToken`,
    sendMail: `${BASE_URL}/api/user/sendMail`,
    getGroupByUserId: `${BASE_URL}/api/user/groups/all`,
    getGroupMembers: `${BASE_URL}/api/user/groups/members`,
    createGroup: `${BASE_URL}/api/user/groups/create`,
    addGroupMembers: `${BASE_URL}/api/user/groups/addMembers`,
    editGroup: `${BASE_URL}/api/user/groups/edit`,
    deleteGroupMembers: `${BASE_URL}/api/user/groups/deleteMemebers`,
    deleteGroup: `${BASE_URL}/api/user/groups/deleteGroup`,
    addDocument: `${BASE_URL}/api/user/documents/add`,
    addFeedback: `${BASE_URL}/api/documents/feedback/add`,
    deleteFeedback: `${BASE_URL}/api/documents/feedback/delete`,
    getDocFeedBack: `${BASE_URL}/api/documents/feedback/all`,
    editDocument: `${BASE_URL}/api/user/documents/edit`,
    deleteDocument: `${BASE_URL}/api/user/documents/delete`,
    getAllDocs: `${BASE_URL}/api/documents/all`,
    getDocsById: `${BASE_URL}/api/documents/id`,
    getDocsGroupId: `${BASE_URL}/api/documents/groups/id`,
    approveDocument: `${BASE_URL}/api/document/approve`,
    rejectDocument: `${BASE_URL}/api/document/reject`,
    getSignatures: `${BASE_URL}/api/signature/get`,
    addSignature: `${BASE_URL}/api/signature/add`,
    deleteSignature: `${BASE_URL}/api/signature/delete`,
    getNotifications: `${BASE_URL}/api/notifications/get`,
    updateNotification: `${BASE_URL}/api/notification/update`,
    deleteNotification: `${BASE_URL}/api/notification/delete`,
};

export default apiRoutes;
