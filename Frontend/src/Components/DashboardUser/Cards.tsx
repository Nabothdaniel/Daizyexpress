interface CardProps {
  title: string;
  icon: JSX.Element; 
  number: string
}

const Cards: React.FC<CardProps> = ({ title, icon, number }) => {
  return (
    <div className="flex items-start justify-between bg-white box min-w-[500px] p-6 max-sm:min-w-[350px]">
      <div className="flex flex-col gap-3">
        <h5 className="text-[#5A5C69] font-bold text-xl">{title}</h5>
        <span className="text-[#5A5C69] font-semibold text-2xl">{number}</span>
      </div>
      <div className="text-3xl text-[#007BFF]">{icon}</div>
    </div>
  );
};

export default Cards;
