import { Popconfirm, message } from "antd";
import { useAuth } from "../context/AuthContext";
import { LogOutIcon } from "../assets/icons";

const LogoutButton = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout(); 
    message.success("Logged out successfully!");
  };

  return (
    <Popconfirm 
      title="Chiqishni Xohlaysizmi"
      onConfirm={handleLogout}
      okText="Ha"
      cancelText="Yo'q"
      placement="top"
    >
      <li className="flex items-center gap-3 py-5 cursor-pointer">
        <div className="p-3 rounded-full bg-red-200">
          <LogOutIcon />
        </div>
        <strong className="text-[24px] font-semibold">Log Out</strong>
      </li>
    </Popconfirm>
  );
};

export default LogoutButton;
