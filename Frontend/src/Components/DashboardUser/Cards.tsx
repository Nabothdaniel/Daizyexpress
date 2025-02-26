interface CardProps {
  title: string;
  icon: JSX.Element; 
  number: React.ReactNode
}

const Cards: React.FC<CardProps> = ({ title, icon, number }) => {
  return (
    <div className="flex items-start justify-between bg-white box max-w-[500px] p-6 max-lg:max-w-[250px]">
      <div className="flex flex-col gap-3">
        <h5 className="text-[#5A5C69] font-bold text-xl">{title}</h5>
        <span className="text-[#5A5C69] font-semibold text-2xl">{number}</span>
      </div>
      <div className="text-3xl text-[#007BFF] ml-5">{icon}</div>
    </div>
  );
};

export default Cards;
