"use client";

import { FiUser, FiMail, FiPhone, FiTrash2, FiEye, FiEdit } from "react-icons/fi";
import { Badge } from "./badge";

interface User {
  id: number;
  name: string;
  email: string;
  contact_no?: string;
  role: 'admin' | 'staff';
  createdAt: string;
}

interface UserTableProps {
  users: User[];
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (id: number) => void;
  searchTerm?: string;
  startIndex?: number;
  endIndex?: number;
}

// Formats to: 2026-03-10 08:51:38.548
function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '—';

  const yyyy = date.getFullYear();
  const mm   = String(date.getMonth() + 1).padStart(2, '0');
  const dd   = String(date.getDate()).padStart(2, '0');
  const hh   = String(date.getHours()).padStart(2, '0');
  const min  = String(date.getMinutes()).padStart(2, '0');
  const ss   = String(date.getSeconds()).padStart(2, '0');
  const ms   = String(date.getMilliseconds()).padStart(3, '0');

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}.${ms}`;
}

export function UserTable({
  users,
  onView,
  onEdit,
  onDelete,
  searchTerm = "",
}: UserTableProps) {
  const paginatedUsers = users;

  if (paginatedUsers.length === 0) {
    return (
      // ✅ extra bottom padding on mobile so empty state isn't hidden by bottom nav
      <div className="text-center py-8 pb-24 md:pb-8 text-gray-500">
        {searchTerm ? 'No users found matching your search' : 'No users found.'}
      </div>
    );
  }

  return (
    // ✅ pb-24 on mobile gives clearance above the bottom nav bar (~80px tall + buffer)
    <div className="overflow-x-auto pb-24 md:pb-0">
      <table className="w-full min-w-[600px]">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
              User Information
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
              Email
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
              Contact Number
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
              Role
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
              Created
            </th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paginatedUsers.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">

              {/* User Info */}
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center min-w-[100px]">
                  <div className="h-10 w-10 flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <FiUser className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                    <div className="text-sm text-gray-500">ID: #{user.id}</div>
                  </div>
                </div>
              </td>

              {/* Email */}
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center min-w-[200px]">
                  <FiMail className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-900 truncate">{user.email}</span>
                </div>
              </td>

              {/* Contact */}
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center min-w-[150px]">
                  <FiPhone className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-900">
                    {user.contact_no || 'Not provided'}
                  </span>
                </div>
              </td>

              {/* Role */}
              <td className="px-4 py-3 whitespace-nowrap">
                <Badge variant={user.role}>
                  {user.role === 'admin' ? 'Administrator' : 'Staff'}
                </Badge>
              </td>

              {/* Created */}
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 min-w-[180px] font-mono">
                {formatDate(user.createdAt)}
              </td>

              {/* Actions */}
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium min-w-[120px]">
                <div className="flex items-center justify-end space-x-2">
                  {onView && (
                    <button
                      className="text-gray-600 hover:text-gray-900 p-1 flex-shrink-0"
                      onClick={() => onView(user)}
                      title="View user"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      className="text-blue-600 hover:text-blue-900 p-1 flex-shrink-0"
                      onClick={() => onEdit(user)}
                      title="Edit user"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="text-red-600 hover:text-red-900 p-1 flex-shrink-0"
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