import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { format } from 'date-fns'

// Types for report data
interface AttendanceRecord {
  student_name: string
  date: string
  status: 'present' | 'absent' | 'late'
}

interface AttendanceReportData {
  className: string
  startDate: string
  endDate: string
  records: AttendanceRecord[]
  stats: {
    totalDays: number
    totalPresent: number
    totalAbsent: number
    totalLate: number
    presentRate: string
  }
}

interface AttendanceReportPDFProps {
  data: AttendanceReportData
}

// PDF styles using Tailwind-inspired design
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#1f2937',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 3,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    marginHorizontal: 5,
  },
  statLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    padding: 8,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableCell: {
    fontSize: 9,
    color: '#1f2937',
  },
  col1: { width: '40%' },
  col2: { width: '30%' },
  col3: { width: '30%' },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 8,
    fontWeight: 'bold',
  },
  statusPresent: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  statusAbsent: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  statusLate: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTop: 1,
    borderTopColor: '#e5e7eb',
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
  },
})

export function AttendanceReportPDF({ data }: AttendanceReportPDFProps) {
  const generatedDate = format(new Date(), 'PPP')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Attendance Report</Text>
          <Text style={styles.subtitle}>Class: {data.className}</Text>
          <Text style={styles.subtitle}>
            Period: {format(new Date(data.startDate), 'PP')} - {format(new Date(data.endDate), 'PP')}
          </Text>
          <Text style={styles.subtitle}>Generated: {generatedDate}</Text>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Records</Text>
              <Text style={styles.statValue}>{data.stats.totalDays}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Present</Text>
              <Text style={styles.statValue}>{data.stats.totalPresent}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Absent</Text>
              <Text style={styles.statValue}>{data.stats.totalAbsent}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Late</Text>
              <Text style={styles.statValue}>{data.stats.totalLate}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Attendance Rate</Text>
              <Text style={styles.statValue}>{data.stats.presentRate}%</Text>
            </View>
          </View>
        </View>

        {/* Attendance Records Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance Records</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.col1]}>Student Name</Text>
              <Text style={[styles.tableHeaderCell, styles.col2]}>Date</Text>
              <Text style={[styles.tableHeaderCell, styles.col3]}>Status</Text>
            </View>

            {/* Table Rows */}
            {data.records.map((record, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col1]}>{record.student_name}</Text>
                <Text style={[styles.tableCell, styles.col2]}>
                  {format(new Date(record.date), 'PP')}
                </Text>
                <View style={styles.col3}>
                  <Text
                    style={[
                      styles.statusBadge,
                      record.status === 'present'
                        ? styles.statusPresent
                        : record.status === 'absent'
                          ? styles.statusAbsent
                          : styles.statusLate,
                    ]}
                  >
                    {record.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>GBPS D-1 Area School Management System</Text>
          <Text>This is a computer-generated document. No signature required.</Text>
        </View>
      </Page>
    </Document>
  )
}
