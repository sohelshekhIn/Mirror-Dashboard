import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import AttendanceTable from "../../components/faculty/TakeAttendance";
import Image from "next/image";
import Loading from "../../components/utilities/Loading";
import PageNotFound from "../404";
import { search } from "../../public/images";
import { DashboardContent } from "../../components/faculty/Navbar";

export default function TakeAttendance() {
  const { status, data } = useSession({
    required: true,
    onUnauthenticated() {
      signIn();
    },
  });
  if (status === "loading") {
    return <Loading />;
  }
  if (data.user && data.user.role !== "faculty") {
    return <PageNotFound />;
  }

  const [batch, setBatch] = useState([]);
  const [atteendanceView, setAttendanceView] = useState(<EmptyMessage />);

  useEffect(() => {
    axios
      .get(process.env.NEXT_PUBLIC_STRAPI_API + "/batches?fields[0]=batch", {
        headers: {
          Authorization: `Bearer ${data.user.accessToken}`,
        },
      })
      .then((res) => {
        let tempBatch = [];
        for (let key in res.data.data) {
          tempBatch.push(res.data.data[key].attributes.batch);
        }
        setBatch(tempBatch);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [data]);

  const handleLoadStudents = (e) => {
    e.preventDefault();
    let batch = document.getElementById("selectBatch").value;
    if (batch === "DEFAULT") {
      return;
    }
    axios
      .post(
        process.env.NEXT_PUBLIC_STRAPI_API + "/attendance/students",
        {
          data: {
            batch: batch,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${data.user.accessToken}`,
          },
        }
      )
      .then((res) => {
        setAttendanceView(
          <AttendanceTable
            batch={batch}
            apiData={res.data}
            sessionData={data}
          />
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <DashboardContent>
      <div className="max-w-xl">
        <div className="flex flex-col">
          <div className="flex flex-col">
            <h1 className="heading1 text-primary">Take Attendance</h1>
            <span className="underline w-24 my-4"></span>
          </div>
          <form
            onSubmit={handleLoadStudents}
            className="w-full mt-14 flex flex-col md:flex-row"
          >
            <div className="form-control mx-auto md:mx-0 w-full max-w-xs">
              <label className="label">
                <span className="label-text">Select Batch</span>
              </label>
              <select
                id="selectBatch"
                defaultValue="DEFAULT"
                required
                className="select select-bordered"
              >
                <option value="DEFAULT" disabled>
                  Select Batch
                </option>
                {batch.map((batch) => {
                  return (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="form-control w-full md:w-36 mx-auto md:mx-5 max-w-xs flex justify-end my-5 md:my-0 ">
              <button type="submit" className="btn btn-accent">
                Proceed
              </button>
            </div>
          </form>
          {atteendanceView}
        </div>
      </div>
    </DashboardContent>);
}

const EmptyMessage = () => {
  return (
    <div className="flex flex-col items-center w-96 mt-16 bg-white p-10 rounded-lg shadow-md">
      <span className="w-7/12">
        <Image src={search} />
      </span>
      <span className="text-primary text-2xl font-semibold">
        Select Batch to conitnue!
      </span>
    </div>
  );
};