import { useEffect } from "react";

export default function Dashboard() {
  // const user = useStore((state) => state.user);
  // const fetchUserStatus = useStore((state) => state.fetchUserStatus);

  // useEffect(() => {
  //   // if fetchUserStatus is false, wait for it to be true before rendering
  //   if (fetchUserStatus === false) {
  //     return;
  //   }
  // }, [fetchUserStatus]);

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
      {/* show data from user */}
      {/* if user is not null then only shoe user data */}
      {/* <div className="flex flex-col mx-auto w-6/12 lg:w-3/12 p-5">
        <h1 className="text-xl uppercase text-base-100 font-semibold m-auto">
          {user.username}
        </h1>
        <h1 className="text-xl uppercase text-base-100 font-semibold m-auto">
          {user.email}
        </h1>
        <h1 className="text-xl uppercase text-base-100 font-semibold m-auto">
          {user.id}
        </h1>
        <h1 className="text-xl uppercase text-base-100 font-semibold m-auto">
          {user.role.type}
        </h1>
      </div> */}
    </div>
  );
}
