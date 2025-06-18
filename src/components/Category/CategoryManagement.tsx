// src/components/Category/CategoryManagement.tsx
import React, { useState, useEffect } from 'react';
import type { Category } from '../../interfaces/Task'; // Ensure Category interface is imported

interface CategoryManagementProps {
  categories: Category[];
  onAddCategory: (name: string, color: string) => void;
  onEditCategory: (id: string, newName: string, newColor: string) => void;
  onDeleteCategory: (id: string) => void;
  onClose: () => void; // To allow closing this view
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onClose,
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#007bff'); // Default color
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategoryColor, setEditingCategoryColor] = useState('#007bff');

  // Effect to populate edit form when editingCategoryId changes
  useEffect(() => {
    if (editingCategoryId) {
      const categoryToEdit = categories.find(cat => cat.id === editingCategoryId);
      if (categoryToEdit) {
        setEditingCategoryName(categoryToEdit.name);
        setEditingCategoryColor(categoryToEdit.color);
      }
    } else {
      // Clear edit form if no category is being edited
      setEditingCategoryName('');
      setEditingCategoryColor('#007bff');
    }
  }, [editingCategoryId, categories]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim(), newCategoryColor);
      setNewCategoryName('');
      setNewCategoryColor('#007bff');
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategoryId && editingCategoryName.trim()) {
      onEditCategory(editingCategoryId, editingCategoryName.trim(), editingCategoryColor);
      setEditingCategoryId(null); // Exit edit mode
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
    setEditingCategoryColor(category.color);
    setNewCategoryName(''); // Clear new category input if it was open
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditingCategoryName('');
    setEditingCategoryColor('#007bff');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Manage Categories</h2>

      {/* Add New Category Form */}
      <div className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
        <h3 className="text-xl font-medium mb-3 text-gray-800 dark:text-gray-200">
          {editingCategoryId ? 'Edit Category' : 'Add New Category'}
        </h3>
        <form onSubmit={editingCategoryId ? handleEditSubmit : handleAddSubmit} className="flex flex-col sm:flex-row gap-3 items-center">
          <input
            type="text"
            placeholder={editingCategoryId ? "Edit category name" : "New category name"}
            value={editingCategoryId ? editingCategoryName : newCategoryName}
            onChange={(e) => editingCategoryId ? setEditingCategoryName(e.target.value) : setNewCategoryName(e.target.value)}
            className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
            required
          />
          <input
            type="color"
            value={editingCategoryId ? editingCategoryColor : newCategoryColor}
            onChange={(e) => editingCategoryId ? setEditingCategoryColor(e.target.value) : setNewCategoryColor(e.target.value)}
            className="w-10 h-10 p-1 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
            title="Select color"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              {editingCategoryId ? 'Save Changes' : 'Add Category'}
            </button>
            {editingCategoryId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Existing Categories List */}
      <h3 className="text-xl font-medium mb-3 text-gray-800 dark:text-gray-200">Existing Categories</h3>
      {categories.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No categories added yet. Add one above!</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {categories.map(category => (
            <li key={category.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <span
                  className="w-5 h-5 rounded-full mr-3"
                  style={{ backgroundColor: category.color }}
                  title={`Color: ${category.color}`}
                ></span>
                <span className="text-lg text-gray-900 dark:text-gray-100">{category.name}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleStartEdit(category)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteCategory(category.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Close Button */}
      <div className="mt-8 text-right">
        <button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          Close Category Management
        </button>
      </div>
    </div>
  );
};

export default CategoryManagement;