import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLibrary from './AdminLibrary';
import AdminAddItem from './AdminAddItem';
import AdminCSVUpload from './AdminCSVUpload';
import AdminMindsetPrompts from './AdminMindsetPrompts';
import AdminSMSSender from './AdminSMSSender';
import SchemaRegistryTable from './SchemaRegistryTable';

export default function AdminContent() {
  return (
    <Tabs defaultValue="library">
      <TabsList className="bg-muted">
        <TabsTrigger value="library">Library</TabsTrigger>
        <TabsTrigger value="add">Add Item</TabsTrigger>
        <TabsTrigger value="prompts">Mindset Prompts</TabsTrigger>
        <TabsTrigger value="sms">SMS Sender</TabsTrigger>
        <TabsTrigger value="csv">CSV Upload</TabsTrigger>
        <TabsTrigger value="schema">Schema Registry</TabsTrigger>
      </TabsList>

      <TabsContent value="library" className="mt-6">
        <AdminLibrary />
      </TabsContent>

      <TabsContent value="add" className="mt-6">
        <AdminAddItem />
      </TabsContent>

      <TabsContent value="prompts" className="mt-6">
        <AdminMindsetPrompts />
      </TabsContent>

      <TabsContent value="sms" className="mt-6">
        <AdminSMSSender />
      </TabsContent>

      <TabsContent value="csv" className="mt-6">
        <AdminCSVUpload />
      </TabsContent>

      <TabsContent value="schema" className="mt-6">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-semibold text-foreground text-sm">Content Type Schema Registry</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Single source of truth for all content types and their field visibility across the app.</p>
          </div>
          <SchemaRegistryTable />
        </div>
      </TabsContent>
    </Tabs>
  );
}