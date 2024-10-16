import React, { useState, useEffect } from "react";
import axios from "axios";
import { studyMaterialEndPoints } from "../../../services/apis";


const Card = ({ children, className = "" }) => (
  <div className={`bg-zinc-900 border border-zinc-700 rounded-lg shadow-md ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="p-4 border-b border-zinc-700">{children}</div>
);

const CardContent = ({ children }) => <div className="p-4">{children}</div>;

export default function AdminCountMock() {
  const [mockTestData, setMockTestData] = useState([]);
  const { ADMIN_MOCK_LIST } = studyMaterialEndPoints;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(ADMIN_MOCK_LIST);
        if (response.data.success) {
          setMockTestData(response.data.data);
        } else {
          console.error("Error fetching data:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const totalUsers = mockTestData.reduce((sum, test) => sum + test.totalUsers, 0);

  return (
    <div className="container mx-auto p-4 space-y-6 bg-zinc-900 text-zinc-100 min-h-screen">
      <h1 className="text-3xl font-bold text-zinc-100">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-zinc-100">Total Users</h2>
            <p className="text-sm text-zinc-400">Number of users who purchased mock tests</p>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-zinc-100">{totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-zinc-100">Total Mock Tests</h2>
            <p className="text-sm text-zinc-400">Number of different mock tests available</p>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-zinc-100">{mockTestData.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-zinc-100">Mock Test Data</h2>
          <p className="text-sm text-zinc-400">Detailed information about mock tests and users</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="p-2 text-zinc-300">#</th> {/* Serial number column */}
                  <th className="p-2 text-zinc-300">Test Name</th>
                  <th className="p-2 text-zinc-300">Total Users</th>
                </tr>
              </thead>
              <tbody>
                {mockTestData.map((test, index) => (
                  <tr key={test.testName} className="border-b border-zinc-700">
                    <td className="p-2 text-zinc-300">{index + 1}</td> {/* Serial number */}
                    <td className="p-2 text-zinc-300">{test.testName}</td>
                    <td className="p-2 text-zinc-300">{test.totalUsers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {mockTestData.map((test, testIndex) => (
        <Card key={test.testName}>
          <CardHeader>
            <h2 className="text-xl font-semibold text-zinc-100">{test.testName}</h2>
            <p className="text-sm text-zinc-400">Users who purchased this mock test</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="p-2 text-zinc-300">#</th> {/* Serial number column */}
                    <th className="p-2 text-zinc-300">Name</th>
                    <th className="p-2 text-zinc-300">Email</th>
                    <th className="p-2 text-zinc-300">Mobile Number</th> {/* Added mobile number column */}
                  </tr>
                </thead>
                <tbody>
                  {test.users.map((user, userIndex) => (
                    <tr key={user.userId} className="border-b border-zinc-700">
                      <td className="p-2 text-zinc-300">{userIndex + 1}</td> {/* Serial number */}
                      <td className="p-2 text-zinc-300">{`${user.firstName} ${user.lastName}`}</td>
                      <td className="p-2 text-zinc-300">{user.email}</td>
                      <td className="p-2 text-zinc-300">{user.mobileNumber}</td> {/* Display mobile number */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
