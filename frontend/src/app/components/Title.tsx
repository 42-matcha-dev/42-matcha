

const Title = ({title, sub_title}) => {
  return (
    <div className="w-full flex flex-col">
        <h1 className="w-full text-4xl text-left font-bold">
            {title}
        </h1>
        <p className="w-full text-base text-left text-gray-900">
            {sub_title}
        </p>
    </div>
  );
};

export default Title;