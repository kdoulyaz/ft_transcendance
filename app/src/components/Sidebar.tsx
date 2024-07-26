import SidebarData from "./SidebarData";

const Sidebar = () => {
  return (
    <div className="bg-glass h-[80%] w-[5rem] transition-all  relative border  border-solid rounded-3xl border-glass p-4 ml-6">
      <SidebarData />
    </div>
  );
};

export default Sidebar;
