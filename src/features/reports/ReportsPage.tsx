import { FileText, Download, Calendar, GraduationCap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function ReportsPage() {
  const navigate = useNavigate()

  const reports = [
    {
      id: 'attendance',
      title: 'Attendance Report',
      description: 'Generate detailed attendance reports by class and date range',
      icon: Calendar,
      color: 'blue',
      path: '/reports/attendance',
    },
    {
      id: 'grades',
      title: 'Grade Report',
      description: 'Generate comprehensive grade reports for students by term',
      icon: GraduationCap,
      color: 'green',
      path: '/reports/grades',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">Generate and download PDF reports for attendance and grades</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon
          return (
            <button
              key={report.id}
              onClick={() => navigate(report.path)}
              className="group relative bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all text-left"
            >
              {/* Icon */}
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${
                  report.color === 'blue'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-green-100 text-green-600'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {report.title}
              </h3>
              <p className="text-gray-600 mb-4">{report.description}</p>

              {/* Action indicator */}
              <div className="flex items-center text-sm text-blue-600 font-medium">
                <FileText className="w-4 h-4 mr-1" />
                Generate Report
                <Download className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          )
        })}
      </div>

      {/* Info card */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">About PDF Reports</h4>
            <p className="text-sm text-blue-800">
              All reports are generated as downloadable PDF files. Select the report type above, choose
              your filters (class, date range, student, term), and click generate to download the report
              to your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
