import { useThemeStore } from "../../store/useThemeStore.js";
import SidebarChat from "./SideBarChat";
import NoChatSelected from "./NoChatSelected";
import ChatContainer from "./ChatContainer";
import { useChatStore } from "../../store/useChatStore.js";

function Chat() {
  const { theme } = useThemeStore();
  const { selectedUser } = useChatStore();

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      data-theme={theme}
    >
      {/*   <NavBarChat />*/}
      <div className="pt-16 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden h-[calc(100vh-8rem)]">
            <div className="flex h-full rounded-2xl overflow-hidden">
              <SidebarChat />
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
