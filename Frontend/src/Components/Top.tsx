import { Link } from "react-router-dom";
import { FaRegUserCircle } from "react-icons/fa";
import logo from "../assets/logo.png"
import { Image, Typography } from "antd";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useState } from "react";
import { FaUsers } from "react-icons/fa6";
import { AiFillDashboard } from "react-icons/ai";
import { IoDocumentTextOutline } from "react-icons/io5";
import { FaFileUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// links
type SideLink = {
  id: number;
  name: any;
  path: any;
  icon: React.ReactNode; // Type for JSX elements
};


 const Top = ({isAdmin} : {isAdmin: boolean}) => {
  const [toggle, setToggle] =  useState(false)
  const [name] = useState("faruq oloyede")
  const navigate = useNavigate();

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
      path: isAdmin ? "/manageusers" : "/upload",
      icon: isAdmin ?<FaUsers /> : <FaFileUpload />
    },
  ]

   return (
    <header className="h-[100px] flex items-center justify-between fixed top-0 z-40 w-full bg-white px-6 py-4 max-sm:px-2 nav">
        <Image src={logo} alt="logo" width={150}></Image>
          <div className="flex gap-3 max-sm:hidden ">
            <FaRegUserCircle className="text-4xl max-sm:text-2xl" />
              <Typography.Paragraph className=" text-[20px] max-sm:text-[16px]">{isAdmin ? "Admin" : "Faruq Oloyede"}</Typography.Paragraph>
            <Link to='/login' className="text-[20px] max-sm:text-[16px] font-medium text-yellow-400">Logout</Link>
            </div>
           
            <div className="hidden max-sm:flex flex-1 items-center justify-end">
            <span className="text-2xl" onClick={()=> setToggle((prev)=> !prev)}>{toggle ?<CloseOutlined /> :<MenuOutlined />}</span>
              <div className={`${toggle ? 'right-0' : 'right-[-600px]'} bg-white shadow-md fixed top-24  p-6 h-screen w-64 sidenav`}>
              <div className="flex flex-col items-center justify-center">
                <Avatar size={100} icon={<UserOutlined />}></Avatar>
                <span className="text-[18px] font-bold mt-5">{isAdmin ? "Admin" : name}</span>
              </div>
              <ul className="list-none flex flex-col items-center justify-center gap-5 mt-10">
                  {SideLink.map(({id, name, path})=>(
                    <li key={id} className="text-[#5A5C69] text-[18px] font-normal" onClick={()=> setToggle(false)}><Link to={path}>{name}</Link></li>
                  ))}
              </ul>
                  <div className="flex flex-col items-center justify-center">
                    <button className="bg-yellow-400 px-10 py-3 mt-5 text-white" onClick={()=> navigate("/login")}>Logout</button>
                  </div>
              </div>
            </div>
    </header>
   )
 }
 
 export default Top