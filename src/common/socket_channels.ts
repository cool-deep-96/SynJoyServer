export enum SOCKET_CHANNEL {
    REGISTER= "register",  // USED TO REGISTER TO A SOCKET AND ROOM
    USER_REMOVED_CHANNEL = "user-removed-channel", // USED TO NOTIFY ALL USER ON REMOVAL (BY ROOM OWNER) OF A USER
    JOIN_APPROVE_CHANNEL="join-approve-channel", // USED TO LISTEN ACCEPT/REJECT (BY ROOM OWNER) OF JOIN REQUESTS  
    JOIN_REQUEST_CHANNEL = "join-request-channel", // USED TO LISTEN ANY NEW JOIN REQUEST (BY ROOM OWNER)
    SYNC_JOINED_LIST = "sync-joined-list", // NOTIFY ALL TO SYNC JOINED LIST
    SYNC_CHAT_CHANNEL = "sync-chat-channel", // NOTIFY ALL TO SYN CHAT 
    SYNC_VIDEO_CHANNEL = "sync-video-channel" 
}