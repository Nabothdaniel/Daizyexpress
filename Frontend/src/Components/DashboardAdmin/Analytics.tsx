import Card from "../../Components/DashboardAdmin/Card"
import { IoDocumentTextOutline } from "react-icons/io5";
import { FaUsers } from "react-icons/fa6";


const Analytic = () => {
  return (
    <section className="mt-32 px-6">
        <div className="flex flex-col">
            <h1 className="font-bold text-3xl text-[#5A5C69]">Dashboard</h1>
            <div className="flex items-center gap-10 mt-10 max-sm:flex-col max-sm:items-start">
                <Card title="Total Document"  icon={<IoDocumentTextOutline />} number= "5" />
                <Card title="Processed Document" icon={<IoDocumentTextOutline />} number= "4" />
                <Card title="Total User" icon={<FaUsers />} number= "4" />
            </div>
        </div>
    </section>
  )
}

export default Analytic