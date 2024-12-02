
import { NavLink } from "react-router-dom"
import { FaUsers } from "react-icons/fa6";
import { AiFillDashboard } from "react-icons/ai";
import { IoDocumentTextOutline } from "react-icons/io5";
import { FaFileUpload } from "react-icons/fa";

type SideLink = {
  id: number;
  name: any;
  path: any;
  icon: React.ReactNode; // Type for JSX elements
};

const Sidebar = ({isAdmin}: {isAdmin : boolean}) => {

  const SideLink: SideLink[]  = [
    {
      id: 1,
      name: "Dashboard",
      path: isAdmin ? "/admin" : "/userdashboard",
      icon: <AiFillDashboard />
    },
    {
      id: 2,
      name: "Documents",
      path: isAdmin ? "/totaldocuments" : "/document",
      icon: <IoDocumentTextOutline />
    },
    {
      id: 3,
      name: isAdmin ? "Users" : "Create",
      path: isAdmin ? "/users" : "/upload",
      icon: isAdmin ?<FaUsers /> : <FaFileUpload />
    },
  ]
  const linkclass = ({ isActive }: {isActive: boolean}) =>
    isActive ? "flex items-center px-6 max-sm:px-3 max-sm:py-2 ml-5 max-sm:ml-1" : "flex items-center px-6 max-sm:px-3 max-sm:py-2 ml-5 max-sm:ml-1 ";

  return (
    <div className=''>
      <aside className='sticky top-0 left-0 z-0 w-64 h-screen bg-white border-r border-gray-200 max-md:w-60 max-sm:w-[60px]'>
        <div className='h-full pb-4 overflow-y-auto'>
         
          <div className='bg-[#407BBB] h-[1px] w-full mb-10'/>
          <ul className="list-none flex flex-col gap-10 mt-36">
            {SideLink.map(({name, id, path, icon})=>(
              <NavLink to={path} key={id} className={linkclass}>
                <span className='text-2xl mr-4 text-[#5A5C69] font-bold '>{icon}</span>
                <span className='flex-1 me-3 text-[18px] text-[#5A5C69] max-sm:hidden'>{name}</span>
              </NavLink>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}

export default Sidebar