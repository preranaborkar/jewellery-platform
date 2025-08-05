import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Heart, Shield, Edit3, Camera, Package, Settings, Check, X } from 'lucide-react';
import { useGetProfileData, useUpdateProfile, useChangePassword } from '../../hooks/useAuth';

const ProfilePage = () => {
    const { profileData, loading, error, fetchProfileData } = useGetProfileData();
    const { updateProfile, loading: updateLoading, success, setError } = useUpdateProfile();
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: ''
        }
    });

    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: ''
    });
    const { changePassword, loading: passwordLoading, error: passwordError, success: passwordSuccess, setError: setPasswordError } = useChangePassword();
    // Mock data for demonstration (replace with actual data from profileData)
    const userData = {
        firstName: profileData?.firstName || 'Sarah',
        lastName: profileData?.lastName || 'Johnson',
        email: profileData?.email || 'sarah.johnson@example.com',
        phone: profileData?.phone || '+1 (555) 123-4567',
        avatar: profileData?.avatar || null,
        role: profileData?.role || 'customer',
        isVerified: profileData?.isVerified ?? true,
        createdAt: profileData?.createdAt || '2024-01-15',
        wishlistCount: profileData?.wishlist?.length || 12,
        ordersCount: 8,
        address: profileData?.address || {
            street: '123 Jewelry Lane',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
        }
    };

    useEffect(() => {
        if (success) {
            setIsEditing(false);
            fetchProfileData();
            // Clear success message after 3 seconds
            setTimeout(() => {
                setError(''); // or setSuccess('') if available
            }, 5000);
        }
    }, [success]);

    // Add this useEffect to handle password change success
    useEffect(() => {
        if (passwordSuccess) {
            // Hide the password change form after successful change
            setTimeout(() => {
                setShowPasswordChange(false);
                setPasswordForm({ currentPassword: '', newPassword: '' });
            }, 2000); // Hide after 2 seconds so user can see success message
        }
    }, [passwordSuccess]);
    // Initialize form data when editing starts
    const handleEditStart = () => {
        setFormData({
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            address: {
                street: userData.address[0]?.street || '',
                city: userData.address[0]?.city || '',
                state: userData.address[0]?.state || '',
                zipCode: userData.address[0]?.zipCode || ''
            }
        });
        setIsEditing(true);
    };
    const handleInputChange = (field, value) => {
        if (field.includes('address.')) {
            const addressField = field.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleSaveProfile = async () => {
        await updateProfile(formData);
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'orders', label: 'Orders', icon: Package },
        { id: 'wishlist', label: 'Wishlist', icon: Heart },
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E4D4C8' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#523A28' }}></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#E4D4C8' }}>
            {/* Header */}
            <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #523A28 0%, #A47551 100%)' }}>
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl" style={{ backgroundColor: '#D0B49F' }}>
                                {userData.avatar ? (
                                    <img src={userData.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User size={48} className="text-white opacity-80" />
                                    </div>
                                )}
                            </div>
                            <button className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
                                <Camera size={16} style={{ color: '#523A28' }} />
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                                <h1 className="text-3xl font-bold text-white">
                                    {userData.firstName} {userData.lastName}
                                </h1>
                                {userData.isVerified && (
                                    <Shield size={20} className="text-green-400" />
                                )}
                            </div>
                            <p className="text-white opacity-90 mb-1">{userData.email}</p>
                            <p className="text-white opacity-80 capitalize">{userData.role} Member</p>
                            <div className="flex items-center justify-center md:justify-start space-x-6 mt-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{userData.ordersCount}</div>
                                    <div className="text-white opacity-80 text-sm">Orders</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{userData.wishlistCount}</div>
                                    <div className="text-white opacity-80 text-sm">Wishlist</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:flex lg:space-x-8">
                    {/* Sidebar */}
                    <div className="lg:w-1/4 mb-8 lg:mb-0">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ borderColor: '#D0B49F', borderWidth: '1px' }}>
                            <div className="p-6" style={{ backgroundColor: '#D0B49F' }}>
                                <h2 className="text-xl font-semibold" style={{ color: '#523A28' }}>Account Menu</h2>
                            </div>
                            <nav className="p-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === tab.id
                                                ? 'text-white shadow-lg'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                            style={{
                                                backgroundColor: activeTab === tab.id ? '#A47551' : 'transparent'
                                            }}
                                        >
                                            <Icon size={20} />
                                            <span className="font-medium">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:w-3/4">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ borderColor: '#D0B49F', borderWidth: '1px' }}>
                            {activeTab === 'profile' && (
                                <div>
                                    <div className="p-6 border-b" style={{ backgroundColor: '#D0B49F', borderColor: '#A47551' }}>
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-2xl font-bold" style={{ color: '#523A28' }}>Profile Information</h2>
                                            <button
                                                onClick={handleEditStart}
                                                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors hover:opacity-80"
                                                style={{ backgroundColor: '#523A28', color: 'white' }}
                                            >
                                                <Edit3 size={16} />
                                                <span>Edit</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        {/* Success/Error Messages */}
                                        {success && (
                                            <div className="flex items-center space-x-2 p-4 bg-green-100 border border-green-300 rounded-lg">
                                                <Check size={20} className="text-green-600" />
                                                <span className="text-green-800">Profile updated successfully!</span>
                                            </div>
                                        )}

                                        {(error) && (
                                            <div className="flex items-center space-x-2 p-4 bg-red-100 border border-red-300 rounded-lg">
                                                <X size={20} className="text-red-600" />
                                                <span className="text-red-800">{error}</span>
                                            </div>
                                        )}
                                        {/* Personal Information */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4" style={{ color: '#523A28' }}>Personal Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2" style={{ color: '#A47551' }}>First Name</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={formData.firstName}
                                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                                            className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
                                                            style={{ borderColor: '#D0B49F', focusRingColor: '#A47551' }}
                                                        />
                                                    ) : (
                                                        <div className="px-4 py-3 bg-gray-50 rounded-lg" style={{ backgroundColor: '#E4D4C8' }}>
                                                            {userData.firstName}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2" style={{ color: '#A47551' }}>Last Name</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={formData.lastName}
                                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                            className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
                                                            style={{ borderColor: '#D0B49F', focusRingColor: '#A47551' }}
                                                        />
                                                    ) : (
                                                        <div className="px-4 py-3 bg-gray-50 rounded-lg" style={{ backgroundColor: '#E4D4C8' }}>
                                                            {userData.lastName}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact Information */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4" style={{ color: '#523A28' }}>Contact Information</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2" style={{ color: '#A47551' }}>Email Address</label>
                                                    <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg" style={{ backgroundColor: '#E4D4C8' }}>
                                                        <Mail size={18} style={{ color: '#A47551' }} />
                                                        <span>{userData.email}</span>
                                                        {userData.isVerified && (
                                                            <Shield size={16} className="text-green-500" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2" style={{ color: '#A47551' }}>Phone Number</label>
                                                    {isEditing ? (
                                                        <div className="flex items-center space-x-3">
                                                            <Phone size={18} style={{ color: '#A47551' }} />
                                                            <input
                                                                type="tel"
                                                                value={formData.phone}
                                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                                className="flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
                                                                style={{ borderColor: '#D0B49F', focusRingColor: '#A47551' }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg" style={{ backgroundColor: '#E4D4C8' }}>
                                                            <Phone size={18} style={{ color: '#A47551' }} />
                                                            <span>{userData.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address Information */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4" style={{ color: '#523A28' }}>Address</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2" style={{ color: '#A47551' }}>Street Address</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={formData.address.street}
                                                            onChange={(e) => handleInputChange('address.street', e.target.value)}
                                                            className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
                                                            style={{ borderColor: '#D0B49F', focusRingColor: '#A47551' }}
                                                        />
                                                    ) : (
                                                        <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg" style={{ backgroundColor: '#E4D4C8' }}>
                                                            <MapPin size={18} style={{ color: '#A47551' }} />
                                                            <span>{userData.address[0]?.street || 'No street address'}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2" style={{ color: '#A47551' }}>City</label>
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={formData.address.city}
                                                                onChange={(e) => handleInputChange('address.city', e.target.value)}
                                                                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
                                                                style={{ borderColor: '#D0B49F', focusRingColor: '#A47551' }}
                                                            />
                                                        ) : (
                                                            <div className="px-4 py-3 bg-gray-50 rounded-lg" style={{ backgroundColor: '#E4D4C8' }}>
                                                                {userData.address[0]?.city || 'No city'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2" style={{ color: '#A47551' }}>State</label>
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={formData.address.state}
                                                                onChange={(e) => handleInputChange('address.state', e.target.value)}
                                                                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
                                                                style={{ borderColor: '#D0B49F', focusRingColor: '#A47551' }}
                                                            />
                                                        ) : (
                                                            <div className="px-4 py-3 bg-gray-50 rounded-lg" style={{ backgroundColor: '#E4D4C8' }}>
                                                                {userData.address[0]?.state || 'No state'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2" style={{ color: '#A47551' }}>ZIP Code</label>
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={formData.address.zipCode}
                                                                onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                                                                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
                                                                style={{ borderColor: '#D0B49F', focusRingColor: '#A47551' }}
                                                            />
                                                        ) : (
                                                            <div className="px-4 py-3 bg-gray-50 rounded-lg" style={{ backgroundColor: '#E4D4C8' }}>
                                                                {userData.address[0]?.zipCode || 'No ZIP code'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>


                                        {isEditing && (
                                            <div className="flex justify-end space-x-4 pt-6 border-t" style={{ borderColor: '#D0B49F' }}>
                                                <button
                                                    onClick={() => {
                                                        setIsEditing(false);
                                                        setError('');
                                                    }}
                                                    className="px-6 py-3 border-2 rounded-lg font-medium transition-colors hover:opacity-80"
                                                    style={{ borderColor: '#D0B49F', color: '#A47551' }}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSaveProfile}
                                                    disabled={updateLoading}
                                                    className="px-6 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-80 disabled:opacity-50"
                                                    style={{ backgroundColor: '#523A28' }}
                                                >
                                                    {updateLoading ? 'Saving...' : 'Save Changes'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'orders' && (
                                <div>
                                    <div className="p-6 border-b" style={{ backgroundColor: '#D0B49F', borderColor: '#A47551' }}>
                                        <h2 className="text-2xl font-bold" style={{ color: '#523A28' }}>Order History</h2>
                                    </div>
                                    <div className="p-6">
                                        <div className="text-center py-12">
                                            <Package size={48} className="mx-auto mb-4 opacity-50" style={{ color: '#A47551' }} />
                                            <h3 className="text-lg font-medium mb-2" style={{ color: '#523A28' }}>No Orders Found</h3>
                                            <p className="text-gray-600">You haven't placed any orders yet. Start shopping to see your orders here!</p>
                                            <button
                                                className="mt-4 px-6 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-80"
                                                style={{ backgroundColor: '#523A28' }}
                                            >
                                                Start Shopping
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'wishlist' && (
                                <div>
                                    <div className="p-6 border-b" style={{ backgroundColor: '#D0B49F', borderColor: '#A47551' }}>
                                        <h2 className="text-2xl font-bold" style={{ color: '#523A28' }}>My Wishlist</h2>
                                    </div>
                                    <div className="p-6">
                                        <div className="text-center py-12">
                                            <Heart size={48} className="mx-auto mb-4 opacity-50" style={{ color: '#A47551' }} />
                                            <h3 className="text-lg font-medium mb-2" style={{ color: '#523A28' }}>Your Wishlist is Empty</h3>
                                            <p className="text-gray-600">Save items you love to your wishlist so you can easily find them later!</p>
                                            <button
                                                className="mt-4 px-6 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-80"
                                                style={{ backgroundColor: '#523A28' }}
                                            >
                                                Browse Jewelry
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div>
                                    <div className="p-6 border-b" style={{ backgroundColor: '#D0B49F', borderColor: '#A47551' }}>
                                        <h2 className="text-2xl font-bold" style={{ color: '#523A28' }}>Account Settings</h2>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="bg-gray-50 rounded-xl p-6" style={{ backgroundColor: '#E4D4C8' }}>
                                            <h3 className="text-lg font-semibold mb-4" style={{ color: '#523A28' }}>Security Settings</h3>
                                            <div className="space-y-4">
                                                <div className="bg-gray-50 rounded-xl p-6" style={{ backgroundColor: '#E4D4C8' }}>
                                                    <h3 className="text-lg font-semibold mb-4" style={{ color: '#523A28' }}>Security Settings</h3>
                                                    <div className="space-y-4">
                                                        <div className="bg-white rounded-lg overflow-hidden">
                                                            <button
                                                                onClick={() => {
                                                                    setShowPasswordChange(!showPasswordChange);
                                                                    setPasswordError('');
                                                                    setPasswordForm({ currentPassword: '', newPassword: '' });
                                                                }}
                                                                className="w-full text-left px-4 py-3 hover:shadow-md transition-shadow"
                                                            >
                                                                <div className="font-medium" style={{ color: '#523A28' }}>Change Password</div>
                                                                <div className="text-sm text-gray-600">Update your account password</div>
                                                            </button>

                                                            {showPasswordChange && (
                                                                <div className="px-4 pb-4 border-t" style={{ borderColor: '#D0B49F' }}>
                                                                    {passwordSuccess && (
                                                                        <div className="flex items-center space-x-2 p-3 mb-4 bg-green-100 border border-green-300 rounded-lg">
                                                                            <Check size={16} className="text-green-600" />
                                                                            <span className="text-green-800 text-sm">Password changed successfully!</span>
                                                                        </div>
                                                                    )}

                                                                    {passwordError && (
                                                                        <div className="flex items-center space-x-2 p-3 mb-4 bg-red-100 border border-red-300 rounded-lg">
                                                                            <X size={16} className="text-red-600" />
                                                                            <span className="text-red-800 text-sm">{passwordError}</span>
                                                                        </div>
                                                                    )}

                                                                    <div className="space-y-4 mt-4">
                                                                        <div>
                                                                            <label className="block text-sm font-medium mb-2" style={{ color: '#A47551' }}>Current Password</label>
                                                                            <input
                                                                                type="password"
                                                                                value={passwordForm.currentPassword}
                                                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                                                                className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2"
                                                                                style={{ borderColor: '#D0B49F', focusRingColor: '#A47551' }}
                                                                                placeholder="Enter current password"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-sm font-medium mb-2" style={{ color: '#A47551' }}>New Password</label>
                                                                            <input
                                                                                type="password"
                                                                                value={passwordForm.newPassword}
                                                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                                                                className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2"
                                                                                style={{ borderColor: '#D0B49F', focusRingColor: '#A47551' }}
                                                                                placeholder="Enter new password"
                                                                            />
                                                                        </div>
                                                                        <div className="flex space-x-3">
                                                                            <button
                                                                                onClick={() => {
                                                                                    changePassword(passwordForm.currentPassword, passwordForm.newPassword);
                                                                                }}
                                                                                disabled={passwordLoading || !passwordForm.currentPassword || !passwordForm.newPassword}
                                                                                className="px-4 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-80 disabled:opacity-50"
                                                                                style={{ backgroundColor: '#523A28' }}
                                                                            >
                                                                                {passwordLoading ? 'Changing...' : 'Change Password'}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setShowPasswordChange(false);
                                                                                    setPasswordError('');
                                                                                }}
                                                                                className="px-4 py-2 border-2 rounded-lg font-medium transition-colors hover:opacity-80"
                                                                                style={{ borderColor: '#D0B49F', color: '#A47551' }}
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button className="w-full text-left px-4 py-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                                                            <div className="font-medium" style={{ color: '#523A28' }}>Email Notifications</div>
                                                            <div className="text-sm text-gray-600">Manage your email preferences</div>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;