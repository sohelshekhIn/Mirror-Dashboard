import { DashboardContent } from "../../components/faculty/Navbar";

export default function TableDemo() {
  return (
    <DashboardContent>
      <div className="flex flex-col">
        <h1 className="heading1 text-primary">Shortcuts</h1>
        <span className="underline w-24 my-4"></span>
      </div>

      <div className="flex flex-row flex-wrap px-10 lg:p-0 justify-center lg:justify-start space-y-5 space-x-2 lg:space-y-0 lg:space-x-5 w-full mt-10">
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-5 w-full lg:w-auto">
          <code className=" bg-gray-400 text-white font-bold p-4 rounded-lg shadow-xl">
            Alt + Q
          </code>
          <p>To focus first input in a form</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-5 w-full lg:w-auto">
          <code className=" bg-gray-400 text-white font-bold p-4 rounded-lg shadow-xl">
            Alt + S
          </code>
          <p>To Submit form</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-5 w-full lg:w-auto">
          <code className=" bg-gray-400 text-white font-bold p-4 rounded-lg shadow-xl">
            Alt + W
          </code>
          <p>To search in a table</p>
        </div>
      </div>
    </DashboardContent>
  );
}
