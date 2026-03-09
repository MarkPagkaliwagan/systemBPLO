"use client";

import { 
  IoClose, 
  IoArrowBack, 
  IoBusinessOutline, 
  IoWarningOutline, 
  IoCalendarOutline, 
  IoTimeOutline, 
  IoMailOutline, 
  IoDocumentTextOutline,
  IoTimerOutline,
  IoFlagOutline
} from "react-icons/io5";

interface DetailsFerBusesFormProps {
  violation: any;
  onClose: () => void;
}

export default function DetailsFerBusesForm({ violation, onClose }: DetailsFerBusesFormProps) {
  const InfoRow = ({ 
    label, 
    value, 
    icon: Icon,
    isStatus = false
  }: { 
    label: string; 
    value: string | number; 
    icon?: any;
    isStatus?: boolean;
  }) => (
    <div className="flex justify-between items-center py-2 px-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="text-gray-400 text-sm" />}
        <span className="text-gray-600 text-sm">{label}</span>
      </div>
      <span className={`text-sm font-medium ${
        isStatus ? 'px-2 py-1 rounded-full text-xs' : 'text-gray-900'
      } ${
        isStatus && value === 'Active' ? 'bg-green-50 text-green-700' :
        isStatus && value === 'Pending' ? 'bg-yellow-50 text-yellow-700' :
        isStatus && value === 'Overdue' ? 'bg-red-50 text-red-700' :
        isStatus ? 'bg-gray-50 text-gray-700' : ''
      }`}>
        {value ?? "-"}
      </span>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden border border-gray-200 relative">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <IoWarningOutline className="text-gray-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Violation Details</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <IoClose size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex h-[calc(90vh-73px)]">
        {/* Left Column - Business Info */}
        <div className="flex-1 p-4 border-r border-gray-200 overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Business Information</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="space-y-1">
                <InfoRow 
                  label="Business ID" 
                  value={violation.business_id ?? violation.id} 
                  icon={IoDocumentTextOutline}
                />
                <InfoRow 
                  label="Business Name" 
                  value={violation.buses?.business_name} 
                  icon={IoBusinessOutline}
                />
                <InfoRow 
                  label="Violation Type" 
                  value="Fire Safety" 
                  icon={IoWarningOutline}
                />
                <InfoRow 
                  label="Violation Date" 
                  value="March 4, 2026" 
                  icon={IoCalendarOutline}
                />
                <InfoRow 
                  label="Deadline" 
                  value="February 28, 2026" 
                  icon={IoTimeOutline}
                />
                <InfoRow 
                  label="Status" 
                  value={violation.status || 'Active'} 
                  icon={IoFlagOutline}
                  isStatus
                />
                <InfoRow 
                  label="Days Remaining" 
                  value="0" 
                  icon={IoTimerOutline}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Timeline & Countdown */}
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Notice Timeline */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Notice Timeline</h3>
            <div className="space-y-2">
              {/* Notice 1 */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <IoMailOutline className="text-gray-400 mt-0.5" size={16} />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium text-gray-900">Notice 1</h4>
                      <span className="text-xs text-gray-500">March 4, 2026</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Initial violation notice</p>
                    <div className="mt-1">
                      <span className={`text-xs font-medium ${
                        violation.status === "resolved" ? "text-gray-600" :
                        violation.notice_level >= 1 ? "text-green-600" : "text-yellow-600"
                      }`}>
                        {violation.status === "resolved" ? "Resolved" :
                         violation.notice_level >= 1 ? "Sent" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notice 2 */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <IoMailOutline className="text-gray-400 mt-0.5" size={16} />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium text-gray-900">Notice 2</h4>
                      <span className="text-xs text-gray-500">March 2, 2026</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Follow-up notice</p>
                    <div className="mt-1">
                      <span className={`text-xs font-medium ${
                        violation.status === "resolved" ? "text-gray-600" :
                        violation.notice_level >= 2 ? "text-green-600" : "text-yellow-600"
                      }`}>
                        {violation.status === "resolved" ? "Resolved" :
                         violation.notice_level >= 2 ? "Sent" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notice 3 */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <IoMailOutline className="text-gray-400 mt-0.5" size={16} />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium text-gray-900">Notice 3</h4>
                      <span className="text-xs text-gray-500">March 7, 2026</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Final notice</p>
                    <div className="mt-1">
                      <span className={`text-xs font-medium ${
                        violation.status === "resolved" ? "text-gray-600" :
                        violation.notice_level >= 3 ? "text-green-600" : "text-yellow-600"
                      }`}>
                        {violation.status === "resolved" ? "Resolved" :
                         violation.notice_level >= 3 ? "Sent" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Countdown Timer</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center mb-3">
                <div className="text-2xl font-semibold text-gray-900 mb-1">0</div>
                <div className="text-xs text-gray-600">Days Remaining</div>
                <div className="mt-2 text-xs text-red-600 font-medium">Deadline Expired</div>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <InfoRow 
                  label="Overall Deadline" 
                  value="March 10, 2026" 
                  icon={IoCalendarOutline}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}