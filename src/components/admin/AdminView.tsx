"use client";

import { useEffect, useState } from "react";
import { GripVertical, Save } from "lucide-react";

interface Component {
  id: number;
  name: string;
}

interface ComponentItem {
  id: number;
  component: Component;
}

interface PageData {
  id: number;
  pageNumber: number;
  components: ComponentItem[];
}

interface UpdatePagesRequest {
  pages: {
    pageId: number;
    componentIds: number[];
  }[];
}

export default function AdminView() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState<ComponentItem | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8082/onboarding/pages');
      if (!response.ok) throw new Error('Failed to fetch pages data');
      const data = await response.json();
      setPages(data);
    } catch (error) {
      console.error('Error fetching pages:', error);
      setError('Failed to load pages data');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePageSettings = async (updatedPages: PageData[]) => {
    try {
      setIsSaving(true);
      const requestBody: UpdatePagesRequest = {
        pages: updatedPages.map(page => ({
          pageId: page.id,
          componentIds: page.components.map(comp => comp.component.id)
        }))
      };

      const response = await fetch('http://localhost:8082/admin/component/setting', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error('Failed to update page settings');
      await fetchPages();
    } catch (error) {
      console.error('Error updating page settings:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const validatePages = (updatedPages: PageData[]): boolean => {
    const isValid = updatedPages.every(page => page.components.length >= 1);
    
    if (!isValid) {
      alert('Each page must have at least one component');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validatePages(pages)) {
      return;
    }

    try {
      setIsSaving(true);
      const requestBody: UpdatePagesRequest = {
        pages: pages.map(page => ({
          pageId: page.id,
          componentIds: page.components.map(comp => comp.component.id)
        }))
      };

      const response = await fetch('http://localhost:8082/admin/component/setting', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error('Failed to update page settings');
      
      setHasUnsavedChanges(false);
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error updating page settings:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, item: ComponentItem, sourcePageNumber: number) => {
    setDraggedItem(item);
    e.dataTransfer.setData('sourcePageNumber', sourcePageNumber.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    if (target.classList.contains('drop-zone')) {
      target.classList.add('bg-gray-100');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('drop-zone')) {
      target.classList.remove('bg-gray-100');
    }
  };

  const handleDrop = (e: React.DragEvent, targetPageNumber: number) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    target.classList.remove('bg-gray-100');

    if (!draggedItem) return;

    const sourcePageNumber = parseInt(e.dataTransfer.getData('sourcePageNumber'));
    const newPages = [...pages];

    const sourcePage = newPages.find(p => p.pageNumber === sourcePageNumber);
    const targetPage = newPages.find(p => p.pageNumber === targetPageNumber);

    if (!sourcePage || !targetPage) return;

    if (sourcePage.components.length <= 1 && sourcePageNumber !== targetPageNumber) {
      alert('Each page must have at least one component');
      return;
    }

    sourcePage.components = sourcePage.components.filter(
      comp => comp.id !== draggedItem.id
    );

    if (!targetPage.components.find(comp => comp.id === draggedItem.id)) {
      targetPage.components.push(draggedItem);
    }

    setPages(newPages);
    setHasUnsavedChanges(true);
    setDraggedItem(null);
  };

  const getComponentIcon = (componentName: string) => {
    switch (componentName) {
      case 'about_me':
        return '📝';
      case 'address':
        return '🏠';
      case 'date_of_birth':
        return '📅';
      default:
        return '📋';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button 
            onClick={fetchPages}
            className="mt-4 bg-cyan-400 hover:bg-cyan-500 text-white py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            Onboarding Customization
          </h1>
          <div className="flex items-center gap-4">
            {hasUnsavedChanges && (
              <span className="text-sm text-amber-600">
                You have unsaved changes
              </span>
            )}
            {isSaving ? (
              <span className="text-sm text-gray-500">
                Saving changes...
              </span>
            ) : (
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-white
                  ${hasUnsavedChanges 
                    ? 'bg-cyan-500 hover:bg-cyan-600' 
                    : 'bg-gray-300 cursor-not-allowed'
                  } transition-colors`}
              >
                <Save size={20} />
                Save Changes
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[2, 3].map((pageNumber) => {
            const pageData = pages.find(p => p.pageNumber === pageNumber);
            
            return (
              <div key={pageNumber} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    Page {pageNumber - 1}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {pageData?.components.length || 0} component(s)
                  </span>
                </div>

                <div
                  className="drop-zone space-y-3 min-h-[200px] rounded-lg transition-colors"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, pageNumber)}
                >
                  {pageData?.components.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item, pageData.pageNumber)}
                      className="flex items-center p-3 bg-white rounded-lg border border-gray-200 
                        hover:bg-gray-50 transition-colors cursor-move group"
                    >
                      <GripVertical className="mr-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                      <span className="mr-3 text-xl" role="img" aria-label={item.component.name}>
                        {getComponentIcon(item.component.name)}
                      </span>
                      <span className="text-gray-700 capitalize">
                        {item.component.name.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                  
                  {(!pageData || pageData.components.length === 0) && (
                    <div className="p-4 text-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                      Drop components here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}