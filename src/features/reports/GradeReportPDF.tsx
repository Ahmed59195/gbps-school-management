import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { format } from 'date-fns'

// Types for report data
interface SubjectGrade {
  subject_name: string
  marks: number
  max_marks: number
  grade_letter: string
  percentage: number
}

interface GradeReportData {
  studentName: string
  className: string
  termName: string
  termDates: {
    start: string
    end: string
  }
  grades: SubjectGrade[]
  summary: {
    totalSubjects: number
    averagePercentage: number
    overallGrade: string
  }
}

interface GradeReportPDFProps {
  data: GradeReportData
}

// PDF styles
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
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 18,
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
    borderBottomWidth: 2,
    borderBottomColor: '#d1d5db',
    padding: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    padding: 10,
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
  col1: { width: '35%' },
  col2: { width: '20%', textAlign: 'center' },
  col3: { width: '20%', textAlign: 'center' },
  col4: { width: '25%', textAlign: 'center' },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gradeA: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  gradeB: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  gradeC: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  gradeD: {
    backgroundColor: '#fed7aa',
    color: '#9a3412',
  },
  gradeF: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
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
  studentInfo: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 4,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    width: '30%',
  },
  infoValue: {
    fontSize: 10,
    color: '#1f2937',
  },
})

function getGradeBadgeStyle(grade: string) {
  if (grade.startsWith('A')) return styles.gradeA
  if (grade.startsWith('B')) return styles.gradeB
  if (grade.startsWith('C')) return styles.gradeC
  if (grade.startsWith('D')) return styles.gradeD
  return styles.gradeF
}

export function GradeReportPDF({ data }: GradeReportPDFProps) {
  const generatedDate = format(new Date(), 'PPP')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Grade Report</Text>
          <Text style={styles.subtitle}>Student: {data.studentName}</Text>
          <Text style={styles.subtitle}>Class: {data.className}</Text>
          <Text style={styles.subtitle}>Generated: {generatedDate}</Text>
        </View>

        {/* Student & Term Information */}
        <View style={styles.studentInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Academic Term:</Text>
            <Text style={styles.infoValue}>{data.termName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Term Period:</Text>
            <Text style={styles.infoValue}>
              {format(new Date(data.termDates.start), 'PP')} - {format(new Date(data.termDates.end), 'PP')}
            </Text>
          </View>
        </View>

        {/* Summary Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Performance</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Subjects</Text>
              <Text style={styles.summaryValue}>{data.summary.totalSubjects}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Average Score</Text>
              <Text style={styles.summaryValue}>{data.summary.averagePercentage.toFixed(1)}%</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Overall Grade</Text>
              <Text style={styles.summaryValue}>{data.summary.overallGrade}</Text>
            </View>
          </View>
        </View>

        {/* Grades Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subject-wise Performance</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.col1]}>Subject</Text>
              <Text style={[styles.tableHeaderCell, styles.col2]}>Marks</Text>
              <Text style={[styles.tableHeaderCell, styles.col3]}>Percentage</Text>
              <Text style={[styles.tableHeaderCell, styles.col4]}>Grade</Text>
            </View>

            {/* Table Rows */}
            {data.grades.map((grade, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col1]}>{grade.subject_name}</Text>
                <Text style={[styles.tableCell, styles.col2]}>
                  {grade.marks} / {grade.max_marks}
                </Text>
                <Text style={[styles.tableCell, styles.col3]}>{grade.percentage.toFixed(1)}%</Text>
                <View style={styles.col4}>
                  <Text style={[styles.gradeBadge, getGradeBadgeStyle(grade.grade_letter)]}>
                    {grade.grade_letter}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Grading Scale Reference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grading Scale</Text>
          <View style={{ fontSize: 9, color: '#6b7280', lineHeight: 1.5 }}>
            <Text>A+ (90-100%) | A (80-89%) | B (70-79%) | C (60-69%) | D (50-59%) | F (Below 50%)</Text>
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
