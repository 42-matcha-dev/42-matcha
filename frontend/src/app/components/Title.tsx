
interface titleSchema {
  title: string,
  subTitle: string
};

const Title = ({title, subTitle}: titleSchema) => {
  return (
    <div className="w-full flex flex-col">
        <h1 className="w-full text-4xl text-center font-bold">
            {title}
        </h1>
        <p className="w-full text-base text-center text-gray-900">
            {subTitle}
        </p>
    </div>
  );
};

export default Title;