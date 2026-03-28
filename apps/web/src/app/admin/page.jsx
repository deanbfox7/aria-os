"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  AlertTriangle,
  BarChart3,
  LogOut,
} from "lucide-react";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      window.location.href = "/login";
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      window.location.href = "/dashboard";
      return;
    }

    setUser(parsedUser);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, clientsRes] = await Promise.all([
        fetch("/api/admin/analytics"),
        fetch("/api/admin/clients"),
      ]);

      const analyticsData = await analyticsRes.json();
      const clientsData = await clientsRes.json();

      setAnalytics(analyticsData);
      setClients(clientsData.clients);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#1A1F3A] to-[#0A0F1C]">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">ARIA Admin</h1>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
              Admin Portal
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <DollarSign className="text-green-400" size={24} />
              </div>
              <TrendingUp className="text-green-400" size={20} />
            </div>
            <h3 className="text-gray-400 text-sm mb-1">
              Monthly Recurring Revenue
            </h3>
            <p className="text-3xl font-bold text-white">
              €{analytics?.overview.mrr.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              ARR: €{analytics?.overview.arr.toLocaleString() || 0}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Users className="text-blue-400" size={24} />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Active Clients</h3>
            <p className="text-3xl font-bold text-white">
              {analytics?.overview.active_clients || 0}
            </p>
            <p className="text-sm text-green-400 mt-2">
              +{analytics?.overview.new_clients_this_month || 0} this month
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Activity className="text-purple-400" size={24} />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Trial Conversions</h3>
            <p className="text-3xl font-bold text-white">
              {analytics?.overview.trial_conversions_this_month || 0}
            </p>
            <p className="text-sm text-gray-400 mt-2">This month</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <BarChart3 className="text-yellow-400" size={24} />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Estimated Profit</h3>
            <p className="text-3xl font-bold text-white">
              €{analytics?.overview.estimated_profit.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Costs: €
              {analytics?.overview.estimated_costs.toLocaleString() || 0}
            </p>
          </div>
        </div>

        {/* Revenue by Tier */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Revenue by Tier
            </h3>
            <div className="space-y-4">
              {analytics?.revenue_by_tier.map((tier) => (
                <div
                  key={tier.name}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-semibold">{tier.name}</p>
                    <p className="text-sm text-gray-400">
                      {tier.subscribers} subscribers
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">
                      €{tier.revenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400">€{tier.price}/mo</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Feature Usage</h3>
            <div className="space-y-3">
              {analytics?.feature_usage.map((feature) => (
                <div
                  key={feature.service}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="text-white capitalize">
                      {feature.service.replace("_", " ")}
                    </p>
                    <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-[#00D9FF] to-[#7B2FFF] h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, (feature.total_usage / 100) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-white ml-4">{feature.total_usage}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Churn Risk Alerts */}
        {analytics?.churn_risk_clients &&
          analytics.churn_risk_clients.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-red-400" size={24} />
                <h3 className="text-xl font-bold text-white">
                  Churn Risk Alert
                </h3>
              </div>
              <p className="text-gray-400 mb-4">
                These clients have low usage in the last 7 days
              </p>
              <div className="space-y-2">
                {analytics.churn_risk_clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                  >
                    <div>
                      <p className="text-white font-semibold">{client.email}</p>
                      <p className="text-sm text-gray-400">
                        {client.tier} • {client.recent_usage} actions
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Recent Clients */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Clients</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 py-3 px-4">Email</th>
                  <th className="text-left text-gray-400 py-3 px-4">Tier</th>
                  <th className="text-left text-gray-400 py-3 px-4">Status</th>
                  <th className="text-left text-gray-400 py-3 px-4">
                    Usage (30d)
                  </th>
                  <th className="text-left text-gray-400 py-3 px-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {clients.slice(0, 10).map((client) => (
                  <tr key={client.id} className="border-b border-white/5">
                    <td className="py-3 px-4 text-white">{client.email}</td>
                    <td className="py-3 px-4 text-white">
                      {client.tier_name || "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          client.subscription_status === "active"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-yellow-500/20 text-yellow-300"
                        }`}
                      >
                        {client.subscription_status || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white">
                      {client.usage_last_30_days}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(client.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
