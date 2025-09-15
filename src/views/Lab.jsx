import React, { useEffect, useState } from 'react';
import NotificationsProbe from '../lab/NotificationsProbe';
import RolesAtRiskTableV2 from '../lab/RolesAtRiskTableV2.jsx';
import { NotificationsProvider } from '../providers/NotificationsProvider';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui';
import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import { Input } from '../ui';
import { Table } from '../ui';
const QuillEditor = React.lazy(() => import('../ui/editor/QuillEditor.jsx'));
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '../ui';
import { flag } from '../config/flags.js';
import { TextField } from '../ui';

export default function Lab() {
  useEffect(() => {
    window.__NYXOPS_READY__ = true;
  }, []);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Simple path-based routing for lab probes
  const path = window.location.pathname;

  if (path === '/lab/notificationsprobe') {
    return (
      <NotificationsProvider>
        <NotificationsProbe />
      </NotificationsProvider>
    );
  }

  if (path === '/lab/roles-at-risk-v2') {
    return (
      <NotificationsProvider>
        <RolesAtRiskTableV2 />
      </NotificationsProvider>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--app-bg)', color: 'var(--text)' }}>
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-2xl font-semibold">Lab — New UI Library Probes</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Flags: NEW_UI_LIB={String(flag('NEW_UI_LIB'))} | NEW_TABLE={String(flag('NEW_TABLE'))} | NEW_EDITOR={String(flag('NEW_EDITOR'))}
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          UI mode: {flag('NEW_UI_LIB') ? 'shadcn (delegated wrappers)' : 'legacy wrappers'}
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button>Default</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger>
                <span className="inline-flex items-center rounded-md border border-[var(--surface-bg)] bg-[var(--card-bg)] px-4 py-2 hover:bg-[var(--hover-bg)] cursor-pointer">Open Dialog</span>
              </DialogTrigger>
              <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sample Dialog</DialogTitle>
                    <DialogDescription>Simple shim until Radix is wired.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <label className="text-sm">Your name</label>
                    <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Type here" />
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={() => setOpen(false)}>Save</Button>
                  </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Text input" />
            <Input placeholder="Disabled" disabled />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Table</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const columns = [
                { header: 'Name', accessorKey: 'name' },
                { header: 'Role', accessorKey: 'role' },
                { header: 'Status', accessorKey: 'status' },
              ];
              const data = [
                { name: 'Alice', role: 'Analyst', status: 'Active' },
                { name: 'Bob', role: 'Manager', status: 'On Leave' },
                { name: 'Carol', role: 'Engineer', status: 'Active' },
              ];
              return <Table columns={columns} data={data} />;
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validated Form (NEW_FORMS)</CardTitle>
          </CardHeader>
          <CardContent>
            {flag('NEW_FORMS') ? (
              (() => {
                const schema = z.object({
                  name: z.string().min(2, 'Name must be at least 2 characters'),
                  email: z.string().email('Enter a valid email'),
                  age: z
                    .preprocess((v) => (v === '' || v === null || v === undefined ? undefined : Number(v)), z
                    .number({ invalid_type_error: 'Age must be a number' })
                    .int('Age must be an integer')
                    .min(18, 'Minimum age is 18')
                    .max(120, 'Maximum age is 120')),
                });

                const { control, handleSubmit, reset } = useForm({
                  resolver: zodResolver(schema),
                  defaultValues: { name: '', email: '', age: '' },
                  mode: 'onBlur',
                });

                const onSubmit = (values) => {
                  console.log('Form submit (lab):', values);
                  setFormSuccess('Saved!');
                  setTimeout(() => setFormSuccess(''), 2000);
                  reset(values);
                };

                return (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    <TextField name="name" label="Name" control={control} placeholder="Your name" />
                    <TextField name="email" label="Email" control={control} placeholder="you@example.com" />
                    <TextField name="age" label="Age" control={control} placeholder="e.g. 34" type="number" />
                    <div className="flex items-center gap-3">
                      <Button type="submit">Submit</Button>
                      {formSuccess ? (
                        <span className="text-sm" style={{ color: 'var(--accent)' }}>{formSuccess}</span>
                      ) : null}
                    </div>
                  </form>
                );
              })()
            ) : (
              <div className="text-sm text-[var(--text-muted)]">
                NEW_FORMS disabled. Enable in .env.local.
                {/* .env.local example: VITE_NEW_FORMS=true */}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Editor (NEW_EDITOR)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {flag('NEW_EDITOR') ? (
              (() => {
                const [editorValue, setEditorValue] = useState('');
                const count = (editorValue || '').replace(/<[^>]*>/g, '').length;

                class EditorBoundary extends React.Component {
                  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
                  static getDerivedStateFromError(error) { return { hasError: true, error }; }
                  componentDidCatch(error) { console.error('Editor crash:', error); }
                  render() {
                    if (this.state.hasError) {
                      return <div className="text-xs text-red-600">Editor failed to load.</div>;
                    }
                    return this.props.children;
                  }
                }

                return (
                  <React.Suspense fallback="Loading editor…">
                    <EditorBoundary>
                      <div className="space-y-2">
                        <QuillEditor value={editorValue} onChange={setEditorValue} />
                        <div className="text-xs text-[var(--text-muted)]">Characters: {count}</div>
                      </div>
                    </EditorBoundary>
                  </React.Suspense>
                );
              })()
            ) : (
              <div className="text-sm text-[var(--text-muted)]">
                NEW_EDITOR disabled. Enable in .env.local.
                {/* .env.local example: VITE_NEW_EDITOR=true */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
