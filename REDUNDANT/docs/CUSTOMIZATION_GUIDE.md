# Customization Guide

## Styling Customization

### Colors and Theme

#### Update Tailwind Theme
Edit `tailwind.config.js` to customize colors:

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // Add your custom colors
      }
    },
  },
  plugins: [],
}
```

#### Brand Colors
Replace indigo colors throughout the app:
- `bg-indigo-600` → `bg-primary-600`
- `text-indigo-700` → `text-primary-700`
- `border-indigo-200` → `border-primary-200`

### Custom Components

#### Creating New Status Colors
Add to `src/App.jsx` in the respective components:

```javascript
const getCustomStatusColor = (status) => {
  switch (status) {
    case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
    case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
```

#### Custom Icons
Replace Lucide icons with your own:

```javascript
import { CustomIcon } from './components/CustomIcon';
// Replace: <Briefcase className="w-6 h-6 text-white" />
// With: <CustomIcon className="w-6 h-6 text-white" />
```

## Feature Customization

### Adding New Fields

#### Case Fields
1. Update the database schema:
```sql
ALTER TABLE cases ADD COLUMN assigned_to TEXT;
ALTER TABLE cases ADD COLUMN due_date TIMESTAMP WITH TIME ZONE;
```

2. Update the form in `AddCaseModal`:
```javascript
const [formData, setFormData] = useState({
  title: '',
  description: '',
  priority: 'medium',
  status: 'open',
  assigned_to: '', // New field
  due_date: ''     // New field
});
```

3. Add form inputs:
```javascript
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
  <input
    type="text"
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
    value={formData.assigned_to}
    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
    placeholder="Enter assignee name"
  />
</div>
```

### New Data Types

#### Adding Comments System
1. Create new table:
```sql
CREATE TABLE case_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
```

2. Add comments component:
```javascript
const Comments = ({ caseId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const addComment = async () => {
    const { data, error } = await supabase
      .from('case_comments')
      .insert([{ case_id: caseId, content: newComment, user_id: user.id }])
      .select();
    
    if (!error && data) {
      setComments([...comments, data[0]]);
      setNewComment('');
    }
  };

  return (
    <div className="mt-4">
      {/* Comments display and input */}
    </div>
  );
};
```

## UI/UX Customization

### Layout Changes

#### Sidebar Customization
Modify the sidebar in the main App component:

```javascript
// Add new navigation items
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'cases', label: 'Cases', icon: AlertCircle },
  { id: 'projects', label: 'Projects', icon: Briefcase },
  { id: 'handovers', label: 'Handovers', icon: Users },
  { id: 'reports', label: 'Reports', icon: BarChart }, // New item
  { id: 'settings', label: 'Settings', icon: Settings } // New item
];
```

#### Dashboard Widgets
Add new dashboard cards:

```javascript
const CustomDashboardCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-8 h-8" />
      </div>
    </div>
  </div>
);
```

### Modal Customization

#### Larger Modal
```javascript
// Change modal size
<div className="bg-white rounded-xl shadow-xl max-w-2xl w-full"> {/* Changed from max-w-md */}
```

#### Multi-step Forms
```javascript
const MultiStepModal = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        {/* Step indicator */}
        <div className="flex justify-between mb-4 p-6 border-b">
          {[1, 2, 3].map((stepNum) => (
            <div
              key={stepNum}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= stepNum ? 'bg-indigo-600 text-white' : 'bg-gray-200'
              }`}
            >
              {stepNum}
            </div>
          ))}
        </div>
        
        {/* Step content */}
        <div className="p-6">
          {step === 1 && <Step1 formData={formData} setFormData={setFormData} />}
          {step === 2 && <Step2 formData={formData} setFormData={setFormData} />}
          {step === 3 && <Step3 formData={formData} setFormData={setFormData} />}
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between p-6 border-t">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={step === 3 ? handleSubmit : nextStep}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {step === 3 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};
```

## Advanced Features

### Real-time Updates
Add real-time subscriptions:

```javascript
useEffect(() => {
  if (!user) return;

  const subscription = supabase
    .channel('cases_changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'cases',
        filter: `user_id=eq.${user.id}` 
      }, 
      (payload) => {
        console.log('Change received!', payload);
        loadCases(); // Refresh cases
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}, [user]);
```

### File Upload
Add file attachments:

```javascript
const FileUpload = ({ caseId }) => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (event) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select a file to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `case-attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Save file reference to database
      const { error: dbError } = await supabase
        .from('case_attachments')
        .insert([
          { case_id: caseId, file_name: file.name, file_path: filePath }
        ]);

      if (dbError) {
        throw dbError;
      }

    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={uploadFile}
        disabled={uploading}
      />
    </div>
  );
};
```

### Export Functionality
Add data export:

```javascript
const exportData = async (type) => {
  let data;
  let filename;
  
  switch (type) {
    case 'cases':
      const { data: casesData } = await supabase
        .from('cases')
        .select('*');
      data = casesData;
      filename = 'cases.json';
      break;
    // Add other types...
  }
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
};
```

## Performance Optimization

### Pagination
Add pagination for large datasets:

```javascript
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const itemsPerPage = 10;

const loadCasesPaginated = async (page = 1) => {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage - 1;
  
  const { data, count, error } = await supabase
    .from('cases')
    .select('*', { count: 'exact' })
    .range(start, end)
    .order('created_at', { ascending: false });
  
  if (!error) {
    setCases(data || []);
    setTotalPages(Math.ceil(count / itemsPerPage));
  }
};
```

### Virtual Scrolling
For very large lists, implement virtual scrolling:

```javascript
import { FixedSizeList as List } from 'react-window';

const VirtualizedList = ({ items }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <CaseCard case_={items[index]} updateCase={updateCase} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={200}
    >
      {Row}
    </List>
  );
};
```

This guide covers the most common customization scenarios. For more specific needs, refer to the React, Tailwind CSS, and Supabase documentation.
