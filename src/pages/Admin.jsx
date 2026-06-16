import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLibrary from '@/components/admin/AdminLibrary';
import AdminAddItem from '@/components/admin/AdminAddItem';
import AdminCSVUpload from '@/components/admin/AdminCSVUpload';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="md:ml-64">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="font-display text-2xl font-semibold text-foreground mb-2">Admin Panel</h1>
        <p className="text-sm text-muted-foreground mb-8">Manage the App Library content that all users see.</p>

        <Tabs defaultValue="library">
          <TabsList className="bg-muted">
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="add">Add Item</TabsTrigger>
            <TabsTrigger value="csv">CSV Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-6">
            <AdminLibrary />
          </TabsContent>

          <TabsContent value="add" className="mt-6">
            <AdminAddItem />
          </TabsContent>

          <TabsContent value="csv" className="mt-6">
            <AdminCSVUpload />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}