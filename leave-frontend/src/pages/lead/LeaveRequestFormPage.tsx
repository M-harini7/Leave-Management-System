import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import api from "../../api/axios";

interface LeaveType {
  id: number;
  name: string;
}

interface LeaveRequestFormData {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  lastDayHalf: boolean;
}

export default function LeaveRequestForm() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [formData, setFormData] = useState<LeaveRequestFormData>({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
    lastDayHalf: false,
  });
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const response = await api.get("/leave-types");
        setLeaveTypes(response.data);
      } catch (error) {
        console.error("Failed to fetch leave types:", error);
      }
    };

    fetchLeaveTypes();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    const { startDate, endDate } = formData;
    if (new Date(endDate) < new Date(startDate)) {
      setMessage("End date cannot be before start date.");
      return;
    }
    try {
      const response = await api.post("/leave-request", formData);
      setMessage(response.data.message);

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      const errMsg =
        error.response?.data?.error || "Failed to submit leave request";
      setMessage(errMsg);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Submit Leave Request
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Leave Type
          </label>
          <select
            name="leaveTypeId"
            value={formData.leaveTypeId}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select Leave Type --</option>
            {leaveTypes.map((type) => (
              <option key={type.id} value={type.id.toString()}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block text-gray-700 font-medium mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="w-1/2">
            <label className="block text-gray-700 font-medium mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="lastDayHalf"
            name="lastDayHalf"

            checked={formData.lastDayHalf}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                lastDayHalf: e.target.checked,
              }))
            }
            className="h-4 w-4"
          />
          <label htmlFor="lastDayHalf" className="text-gray-700 font-medium">
           Half day
          </label>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Reason</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            rows={3}
            placeholder="e.g., Medical, Family function..."
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
        >
          Submit Request
        </button>

      </form>

      {message && (
        <div
          className={`mt-4 p-3 text-center rounded-lg font-medium ${
            message.toLowerCase().includes("success")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
