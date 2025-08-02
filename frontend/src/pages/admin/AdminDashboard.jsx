
import {  Users, Package,  FileText,  ShoppingCart, DollarSign, Eye, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
const AdminDashboard = () => {

    const { isAdmin, isAuthenticated } = useAuth();
     const navigate = useNavigate();
  // Check authorization
    if (!isAuthenticated || !isAdmin()) {
        return (
            <div className="min-h-screen bg-[#E4D4C8] flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
                    <h2 className="text-2xl font-bold text-[#523A28] mb-4 text-center">
                        Access Denied
                    </h2>
                    <p className="text-[#A47551] text-center">
                        Only administrators can access this page.
                    </p>
                </div>
            </div>
        );
    }
  const statsCards = [
    { title: 'Total Revenue', value: '₹2,45,678', change: '+12.5%', icon: DollarSign, trend: 'up' },
    { title: 'Orders', value: '1,234', change: '+8.2%', icon: ShoppingCart, trend: 'up' },
    { title: 'Customers', value: '5,678', change: '+3.1%', icon: Users, trend: 'up' },
    { title: 'Products', value: '89', change: '-2.4%', icon: Package, trend: 'down' }
  ];

  const recentOrders = [
    { id: '#ORD-001', customer: 'Rahul Sharma', amount: '₹2,340', status: 'Completed', date: '2 min ago' },
    { id: '#ORD-002', customer: 'Priya Patel', amount: '₹1,890', status: 'Processing', date: '5 min ago' },
    { id: '#ORD-003', customer: 'Amit Kumar', amount: '₹3,250', status: 'Pending', date: '10 min ago' },
    { id: '#ORD-004', customer: 'Sneha Singh', amount: '₹1,560', status: 'Completed', date: '15 min ago' }
  ];

  const topProducts = [
    { name: 'Premium Coffee Beans', sales: 342, revenue: '₹68,400' },
    { name: 'Artisan Tea Collection', sales: 298, revenue: '₹44,700' },
    { name: 'Organic Spice Mix', sales: 256, revenue: '₹38,400' },
    { name: 'Handcrafted Mugs', sales: 189, revenue: '₹28,350' }
  ];

 
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E4D4C8] to-[#D0B49F]">
      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-[#D0B49F]/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-[#E4D4C8]">
                    <stat.icon size={24} className="text-[#A47551]" />
                  </div>
                  <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#523A28] mb-1">{stat.value}</h3>
                  <p className="text-[#A47551] text-sm">{stat.title}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-lg border border-[#D0B49F]/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#523A28]">Recent Orders</h2>
                <button className="text-[#A47551] hover:text-[#523A28] font-medium text-sm flex items-center space-x-1">
                  <span>View All</span>
                  <Eye size={16} />
                </button>
              </div>
              
              <div className="space-y-4">
                {recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-[#E4D4C8]/40 rounded-lg hover:bg-[#E4D4C8]/60 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-[#A47551] rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">{order.customer.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-[#523A28]">{order.customer}</p>
                        <p className="text-sm text-[#A47551]">{order.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#523A28]">{order.amount}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'Processing' ? 'bg-[#D0B49F] text-white' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                        <span className="text-xs text-[#A47551]">{order.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-[#D0B49F]/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#523A28]">Top Products</h2>
                <button className="p-2 bg-[#A47551] text-white rounded-lg hover:bg-[#523A28] transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#E4D4C8]/40 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-[#523A28] text-sm mb-1">{product.name}</p>
                      <p className="text-xs text-[#A47551]">{product.sales} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#A47551]">{product.revenue}</p>
                      <div className="w-16 bg-[#E4D4C8] rounded-full h-2 mt-1">
                        <div 
                          className="bg-[#A47551] h-2 rounded-full" 
                          style={{ width: `${(product.sales / 350) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border border-[#D0B49F]/20">
            <h2 className="text-xl font-bold text-[#523A28] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <button onClick={() => navigate("/view-all-products")}  className="flex flex-col items-center p-4 bg-gradient-to-br from-[#D0B49F] to-[#A47551] text-white rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105">
                <Package size={24} className="mb-2" />
                <span className="text-sm font-medium">Manage Products</span>
              </button>
               <button onClick={()=>navigate("/get-orders")} className="flex flex-col items-center p-4 bg-gradient-to-br from-[#523A28] to-[#A47551] text-white rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105">
                <Package size={24} className="mb-2" />
                <span className="text-sm font-medium">Manage Orders</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-gradient-to-br from-[#D0B49F] to-[#A47551] text-white rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105">
                <Users size={24} className="mb-2" />
                <span className="text-sm font-medium">Manage Users</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-gradient-to-br from-[#E4D4C8] to-[#D0B49F] text-[#523A28] rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105">
                <FileText size={24} className="mb-2" />
                <span className="text-sm font-medium">View Reports</span>
              </button>
             
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;