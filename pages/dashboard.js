export default function Dashboard() {
  return (
    <div className="flex flex-col h-screen w-full fixed">
      <div className="flex w-100 bg-primary lg:px-16">
        <span className="flex flex-col mx-auto w-6/12 lg:w-3/12 p-5">
          <span className="w-1/2 lg:w-4/12 mx-auto">
            {/* <Image src={logo} /> */}
          </span>

          <h1 className="text-xl uppercase text-base-100 font-semibold m-auto">
            Dashboard
          </h1>
        </span>
      </div>
    </div>
  );
}
