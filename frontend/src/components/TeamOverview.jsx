import { useState, useEffect } from 'react';
import { Users, AlertCircle } from 'lucide-react';
import { getTeamMembers } from '../services/api';

const TeamOverview = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await getTeamMembers();
      setTeamMembers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setLoading(false);
    }
  };

  const getWorkloadColor = (taskCount, capacity) => {
    const percentage = (taskCount / capacity) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getWorkloadStatus = (taskCount, capacity) => {
    const percentage = (taskCount / capacity) * 100;
    if (percentage >= 100) return { text: 'Overloaded', color: 'text-red-600' };
    if (percentage >= 70) return { text: 'High Load', color: 'text-orange-600' };
    return { text: 'Available', color: 'text-green-600' };
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Users className="text-blue-600" size={32} />
        <h1 className="text-3xl font-bold text-gray-900">Team Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => {
          const workloadPercentage = (member.taskCount / member.capacity) * 100;
          const status = getWorkloadStatus(member.taskCount, member.capacity);
          
          return (
            <div
              key={member.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <span className={`text-sm font-medium ${status.color}`}>
                    {status.text}
                  </span>
                </div>
                {workloadPercentage >= 100 && (
                  <AlertCircle className="text-red-500" size={24} />
                )}
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Active Tasks</span>
                  <span className="font-semibold">
                    {member.taskCount} / {member.capacity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all ${getWorkloadColor(member.taskCount, member.capacity)}`}
                    style={{ width: `${Math.min(workloadPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capacity</span>
                  <span className="font-semibold text-gray-900">
                    {Math.round(workloadPercentage)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {teamMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 text-lg">No team members found</p>
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Workload Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-700">
              <strong>Available:</strong> Less than 70% capacity
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-gray-700">
              <strong>High Load:</strong> 70-99% capacity
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-700">
              <strong>Overloaded:</strong> 100% or more capacity
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamOverview;
