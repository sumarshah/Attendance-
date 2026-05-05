export type ScreenDef = {
  key: string
  title: string
  path: string
  group:
    | 'Onboarding'
    | 'Auth'
    | 'Home'
    | 'Attendance'
    | 'Timesheet'
    | 'Profile'
    | 'Comms'
    | 'Tasks'
    | 'Leave'
    | 'Accounts'
    | 'Requisition'
    | 'Team'
    | 'Settings'
    | 'Help'
}

const slug = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')

export const SCREENS: ScreenDef[] = [
  { key: '01', title: 'Onboarding', path: '/onboarding', group: 'Onboarding' },
  { key: '02', title: 'Onboarding Style 01 (A)', path: `/${slug('Onboarding Style 01 A')}`, group: 'Onboarding' },
  { key: '03', title: 'Onboarding Style 01 (B)', path: `/${slug('Onboarding Style 01 B')}`, group: 'Onboarding' },
  { key: '04', title: 'Onboarding Style 01 (C)', path: `/${slug('Onboarding Style 01 C')}`, group: 'Onboarding' },
  { key: '05', title: 'Onboarding Style 02 (A)', path: `/${slug('Onboarding Style 02 A')}`, group: 'Onboarding' },
  { key: '06', title: 'Onboarding Style 02 (B)', path: `/${slug('Onboarding Style 02 B')}`, group: 'Onboarding' },
  { key: '07', title: 'Onboarding Style 02 (C)', path: `/${slug('Onboarding Style 02 C')}`, group: 'Onboarding' },
  { key: '08', title: 'Login', path: '/login', group: 'Auth' },
  { key: '09', title: 'Forget Password', path: `/${slug('Forget Password')}`, group: 'Auth' },
  { key: '10', title: 'Forget Password (OTP Sent)', path: `/${slug('Forget password OTP Sent')}`, group: 'Auth' },
  { key: '11', title: 'Forget Password (OTP Verify)', path: `/${slug('Forget password OTP verify')}`, group: 'Auth' },
  { key: '12', title: 'Set New Password', path: `/${slug('Set new password')}`, group: 'Auth' },
  { key: '13', title: 'Successfully Password Reset', path: `/${slug('Successfully Password Reset')}`, group: 'Auth' },
  { key: '14', title: 'Signup', path: `/${slug('Signup')}`, group: 'Auth' },
  { key: '15', title: 'Account Created', path: `/${slug('Account Created')}`, group: 'Auth' },
  { key: '16', title: 'Profile Setup', path: `/${slug('Profile Setup')}`, group: 'Profile' },
  { key: '17', title: 'Additional Details', path: `/${slug('Additional Details')}`, group: 'Profile' },
  { key: '18', title: 'Review & Submit', path: `/${slug('Review and Submit')}`, group: 'Profile' },
  { key: '19', title: 'Congratulation', path: `/${slug('Congratulation')}`, group: 'Profile' },
  { key: '20', title: 'Verification & Approval (Identity Check)', path: `/${slug('Verification and Approval Identity Check')}`, group: 'Profile' },
  { key: '21', title: 'Verification & Approval (Add Certificate A)', path: `/${slug('Verification and Approval Add Certificate A')}`, group: 'Profile' },
  { key: '22', title: 'Verification & Approval (Add Certificate B)', path: `/${slug('Verification and Approval Add Certificate B')}`, group: 'Profile' },
  { key: '23', title: 'Add Experience', path: `/${slug('Add Experience')}`, group: 'Profile' },
  { key: '24', title: 'Approval Checklist', path: `/${slug('Approval Checklist')}`, group: 'Profile' },
  { key: '25', title: 'Verification', path: `/${slug('Verification')}`, group: 'Profile' },
  { key: '26', title: 'Terms of Service', path: `/${slug('Terms of Service')}`, group: 'Help' },
  { key: '27', title: 'Home V1', path: '/', group: 'Home' },
  { key: '28', title: 'Home V2', path: `/${slug('Home V2')}`, group: 'Home' },
  { key: '29', title: 'Attendance Style 01', path: `/${slug('Attendance Style 01')}`, group: 'Attendance' },
  { key: '30', title: 'Attendance Style 02', path: `/${slug('Attendance Style 02')}`, group: 'Attendance' },
  { key: '31', title: 'Successfully', path: `/${slug('Successfully')}`, group: 'Attendance' },
  { key: '32', title: 'Manage Break', path: `/${slug('Manage Break')}`, group: 'Attendance' },
  { key: '33', title: 'Attendance Summary (Weekly)', path: `/${slug('Attendance Summary weekly')}`, group: 'Attendance' },
  { key: '34', title: 'Attendance Summary (Monthly)', path: `/${slug('Attendance Summary Monthly')}`, group: 'Attendance' },
  { key: '35', title: 'Attendance Details', path: `/${slug('Attendance Details')}`, group: 'Attendance' },
  { key: '36', title: 'Correction Request', path: `/${slug('Correction Request')}`, group: 'Attendance' },
  { key: '37', title: 'Loan Application', path: `/${slug('Loan Application')}`, group: 'Accounts' },
  { key: '38', title: 'Timesheet', path: `/${slug('Timesheet')}`, group: 'Timesheet' },
  { key: '39', title: 'Edit Time Entry', path: `/${slug('Edit Time Entry')}`, group: 'Timesheet' },
  { key: '40', title: 'Add Time Entry', path: `/${slug('Add Time Entry')}`, group: 'Timesheet' },
  { key: '41', title: 'Profile (About Me)', path: `/${slug('Profile About me')}`, group: 'Profile' },
  { key: '42', title: 'Profile (Calendar)', path: `/${slug('Profile Calender')}`, group: 'Profile' },
  { key: '43', title: 'Profile (Appreciate)', path: `/${slug('Profile Appriciate')}`, group: 'Profile' },
  { key: '44', title: 'Video Call', path: `/${slug('Video Call')}`, group: 'Comms' },
  { key: '45', title: 'Video Call Off', path: `/${slug('Video Call Off')}`, group: 'Comms' },
  { key: '46', title: 'Chat', path: `/${slug('Chat')}`, group: 'Comms' },
  { key: '47', title: 'Voice Message', path: `/${slug('Voice message')}`, group: 'Comms' },
  { key: '48', title: 'Chat Attachment', path: `/${slug('Chat Attachment')}`, group: 'Comms' },
  { key: '49', title: 'Tasks', path: `/${slug('Tasks')}`, group: 'Tasks' },
  { key: '50', title: 'New Task', path: `/${slug('New Task')}`, group: 'Tasks' },
  { key: '51', title: 'Task Details', path: `/${slug('Task Details')}`, group: 'Tasks' },
  { key: '52', title: 'Add Comment', path: `/${slug('Add Comment')}`, group: 'Tasks' },
  { key: '53', title: 'Task Details V2', path: `/${slug('Taks Details V2')}`, group: 'Tasks' },
  { key: '54', title: 'Task Details V3', path: `/${slug('Taks Details V3')}`, group: 'Tasks' },
  { key: '55', title: 'Invite People', path: `/${slug('Invite People')}`, group: 'Team' },
  { key: '56', title: 'Leave', path: `/${slug('leave')}`, group: 'Leave' },
  { key: '57', title: 'My Leave Balance', path: `/${slug('My Leave Balance')}`, group: 'Leave' },
  { key: '58', title: 'Leave Request', path: `/${slug('Leave Request')}`, group: 'Leave' },
  { key: '59', title: 'Apply Leave', path: `/${slug('Apply Leave')}`, group: 'Leave' },
  { key: '60', title: 'Request Submitted', path: `/${slug('Request Submitted')}`, group: 'Leave' },
  { key: '61', title: 'My Accounts', path: `/${slug('My Accounts')}`, group: 'Accounts' },
  { key: '62', title: 'Notifications', path: `/${slug('Notifications')}`, group: 'Accounts' },
  { key: '63', title: 'Profile', path: `/${slug('Profile')}`, group: 'Profile' },
  { key: '64', title: 'New Requisition', path: `/${slug('New Requisition')}`, group: 'Requisition' },
  { key: '65', title: 'Select Request Type', path: `/${slug('Select Request Type')}`, group: 'Requisition' },
  { key: '66', title: 'Request Submitted (Requisition)', path: `/${slug('Request Submitted Requisition')}`, group: 'Requisition' },
  { key: '67', title: 'Calendar', path: `/${slug('Calender')}`, group: 'Profile' },
  { key: '68', title: 'Add Calendar', path: `/${slug('Add Calender')}`, group: 'Profile' },
  { key: '69', title: 'Team Members', path: `/${slug('Team Members')}`, group: 'Team' },
  { key: '70', title: 'Invite Friends', path: `/${slug('Invite Friends')}`, group: 'Team' },
  { key: '71', title: 'Settings', path: `/${slug('Settings')}`, group: 'Settings' },
  { key: '72', title: 'Notifications Settings', path: `/${slug('Notifications Settings')}`, group: 'Settings' },
  { key: '73', title: 'Complains', path: `/${slug('Complains')}`, group: 'Help' },
  { key: '74', title: 'Help Center', path: `/${slug('Help Center')}`, group: 'Help' },
  { key: '75', title: 'Privacy Policy', path: `/${slug('Privacy Policy')}`, group: 'Help' },
  { key: '76', title: 'FAQ', path: `/${slug('FAQ')}`, group: 'Help' },
  { key: '77', title: 'Logout', path: `/${slug('Logout')}`, group: 'Auth' },
]

export const SCREEN_GROUPS: Array<ScreenDef['group']> = [
  'Home',
  'Attendance',
  'Timesheet',
  'Tasks',
  'Comms',
  'Leave',
  'Accounts',
  'Requisition',
  'Team',
  'Profile',
  'Settings',
  'Help',
  'Onboarding',
  'Auth',
]

