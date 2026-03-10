"use client";

import { FiUser, FiMail, FiShield, FiTrash2, FiEye } from "react-icons/fi";
import { Badge } from "./badge";
import { Button } from "./button";

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
}

interface UserTableProps {
  users: User[];
  onView?: (user: User) => void;
  onDelete?: (id: number) => void;
  searchTerm?: string;
  startIndex?: number;
  endIndex?: number;
}

export function UserTable({ 
  users, 
  onView, 
  onDelete, 
  searchTerm = "", 
  startIndex = 0, 
  endIndex = users.length 
}: UserTableProps) {
  const paginatedUsers = users.slice(startIndex, endIndex);

  if (paginatedUsers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {searchTerm ? 'No users found matching your search' : 'No users found.'}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User Information
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paginatedUsers.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <FiUser className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">ID: #{user.id}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <FiMail className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{user.email}</span>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <Badge variant={user.role}>
                  {user.role === 'admin' ? 'Administrator' : 'Super Administrator'}
                </Badge>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  {onView && (
                    <button
                      className="text-gray-600 hover:text-gray-900 p-1"
                      onClick={() => onView(user)}
                      title="View user"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="text-red-600 hover:text-red-900 p-1"
                      onClick={() => onDelete(user.id)}
                      title="Delete user"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
