import React, { useEffect, useState } from "react";
import { activityService } from "../services/api";
import "../styles/activity.css";

export default function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchActivities();
  }, [page]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await activityService.getLog({ page, limit: 50 });
      setActivities(response.data.activities);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="activity-page">
      <h1>Activity Log</h1>

      <div className="activity-table">
        <table>
          <thead>
            <tr>
              <th>Activity Type</th>
              <th>Description</th>
              <th>Date & Time</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity._id}>
                <td className={`activity-type ${activity.activityType}`}>
                  {activity.activityType}
                </td>
                <td>{activity.description}</td>
                <td>{new Date(activity.createdAt).toLocaleString()}</td>
                <td>{JSON.stringify(activity.details || {})}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
