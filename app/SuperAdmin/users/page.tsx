"use client";



import { useState, useEffect } from "react";

import { FiPlus, FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";

import { UserTable } from "../../components/ui/user-table";

import { UserForm } from "../../components/ui/user-form";

import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";

import { Button } from "../../components/ui/button";

import Sidebar from "../../components/sidebar";



interface User {

  id: number;

  name: string;

  email: string;

  role: 'admin' | 'super_admin';

  createdAt: string;

}



interface FormData {

  name: string;

  email: string;

  password: string;

  role: 'admin' | 'super_admin';

}



export default function SuperAdminUsersPage() {

  const [users, setUsers] = useState<User[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [itemsPerPage] = useState(10);



  // Sidebar state

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);



  // Check if mobile on mount and resize

  useEffect(() => {

    const checkMobile = () => {

      setIsMobile(window.innerWidth < 768);

    };

    

    checkMobile();

    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);

  }, []);



  // Fetch users from API

  const fetchUsers = async () => {

    try {

      const res = await fetch('/api/users');

      const data = await res.json();

      

      if (res.ok && Array.isArray(data)) {

        setUsers(data);

      } else {

        console.error('Invalid response from API:', data);

        setUsers([]);

      }

    } catch (err) {

      console.error('Error fetching users:', err);

      setUsers([]);

    }

  };



  useEffect(() => {

    fetchUsers();

  }, []);



  // Create user via API

  const handleCreateUser = async (formData: FormData) => {

    setIsLoading(true);

    try {

      const res = await fetch('/api/users', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify(formData),

      });



      const newUser = await res.json();

      if (res.ok) {

        setUsers([...users, newUser]);

        setIsCreatingUser(false);

      } else {

        alert(newUser.error || 'Failed to create user');

      }

    } catch (err) {

      console.error('Error creating user:', err);

      alert('Failed to create user');

    } finally {

      setIsLoading(false);

    }

  };



  // Delete user via API

  const handleDeleteUser = async (id: number) => {

    if (!confirm('Are you sure you want to delete this user?')) return;



    try {

      const res = await fetch('/api/users', {

        method: 'DELETE',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ id }),

      });



      const result = await res.json();

      if (res.ok) {

        setUsers(users.filter((u) => u.id !== id));

      } else {

        alert(result.error || 'Failed to delete user');

      }

    } catch (err) {

      console.error('Error deleting user:', err);

      alert('Failed to delete user');

    }

  };



  // Filter users based on search

 const filteredUsers = users.filter(user => 

  (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||

  (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||

  (user.role?.toLowerCase() || '').includes(searchTerm.toLowerCase())

);



  // Pagination calculations

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const endIndex = startIndex + itemsPerPage;



  const handlePageChange = (page: number) => {

    setCurrentPage(page);

  };



  return (

    <>

      <Sidebar

        isCollapsed={isCollapsed}

        setIsCollapsed={setIsCollapsed}

        isMobile={isMobile}

        isMobileMenuOpen={isMobileMenuOpen}

        setIsMobileMenuOpen={setIsMobileMenuOpen}

      />

      <div className={`min-h-screen bg-gray-50 transition-all duration-300 ${isMobile ? 'p-3' : 'p-6'}`}>

        <div className={`mx-auto ${isMobile ? 'max-w-full' : 'max-w-7xl'}`}>

          <div className="mb-6">

            <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-2`}>User Management</h1>

            <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>Manage system users and their administrative permissions</p>

          </div>



          {/* Create User Section */}

          <Card className="mb-6">

            <CardHeader>

              <div className={`flex items-center ${isMobile ? 'justify-between' : 'justify-between'}`}>

                <CardTitle className={`${isMobile ? 'text-sm' : ''}`}>Create New User</CardTitle>

                {!isCreatingUser && (

                  <Button

                    variant="outline"

                    onClick={() => setIsCreatingUser(!isCreatingUser)}

                    className={`${isMobile ? 'px-3 py-2 text-sm' : ''}`}

                  >

                    <FiPlus className="w-4 h-4 mr-2" />

                    Add User

                  </Button>

                )}

              </div>

            </CardHeader>

            {isCreatingUser && (

              <CardContent>

                <UserForm

                  onSubmit={handleCreateUser}

                  onCancel={() => setIsCreatingUser(false)}

                  isLoading={isLoading}

                />

              </CardContent>

            )}

          </Card>



          {/* Users List */}

          <Card>

            <CardHeader>

              <div className={`flex items-center justify-between`}>

                <CardTitle className={`${isMobile ? 'text-sm' : ''}`}>System Users</CardTitle>

                <div className="flex flex-col items-end">

                  <div className="relative">

                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

                    <input

                      type="text"

                      placeholder="Search users..."

                      value={searchTerm}

                      onChange={(e) => setSearchTerm(e.target.value)}

                      className={`pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isMobile ? 'w-32 text-xs' : 'w-64'}`}

                    />

                  </div>

                  <div className={`text-sm text-gray-500 ${isMobile ? 'hidden' : 'mt-1'}`}>

                    Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users

                  </div>

                </div>

              </div>

              <div className={`text-sm text-gray-500 ${isMobile ? 'text-center mt-3' : 'hidden'}`}>

                Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users

              </div>

            </CardHeader>

            <CardContent>

              <UserTable

                users={filteredUsers}

                onDelete={handleDeleteUser}

                searchTerm={searchTerm}

                startIndex={startIndex}

                endIndex={endIndex}

              />



              {/* Pagination */}

              {totalPages > 1 && (

                <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50">

                  <div className={`flex items-center ${isMobile ? 'flex-col space-y-2 space-x-0' : 'justify-between space-x-3'}`}>

                    <div className={`text-sm text-gray-700 ${isMobile ? 'text-center' : ''}`}>

                      Page {currentPage} of {totalPages}

                    </div>

                    <div className={`flex items-center ${isMobile ? 'justify-center' : 'space-x-2'}`}>

                      <button

                        onClick={() => handlePageChange(currentPage - 1)}

                        disabled={currentPage === 1}

                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"

                      >

                        <FiChevronLeft className="w-4 h-4" />

                      </button>



                      {/* Page numbers */}

                      <div className={`flex ${isMobile ? 'space-x-1' : 'space-x-1'}`}>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (

                          <button

                            key={pageNum}

                            onClick={() => handlePageChange(pageNum)}

                            className={`px-3 py-1 text-sm rounded-md ${currentPage === pageNum

                              ? 'bg-green-600 text-white'

                              : 'bg-white border border-gray-300 hover:bg-gray-50'

                              }`}

                          >

                            {pageNum}

                          </button>

                        ))}

                      </div>



                      <button

                        onClick={() => handlePageChange(currentPage + 1)}

                        disabled={currentPage === totalPages}

                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"

                      >

                        <FiChevronRight className="w-4 h-4" />

                      </button>

                    </div>

                  </div>

                </div>

              )}

            </CardContent>

          </Card>

        </div>

      </div>

    </>

  );

}