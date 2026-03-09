
interface titleSchema {
  title: string,
  subTitle: string
};

const Title = ({title, subTitle}: titleSchema) => {
  return (
    <div className="w-full">
        <h1 className="w-full text-4xl font-bold mb-2">
            {title}
        </h1>
        <p className="w-full text-base text-gray-900">
            {subTitle}
        </p>
    </div>
  );
};

export default Title;