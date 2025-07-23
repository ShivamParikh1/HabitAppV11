import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useApp } from "@/context/AppContext";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Calendar, CheckCircle, ImagePlus, ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function BucketList() {
  const { state, dispatch } = useApp();
  const { bucketListItems } = state;
  
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const openNewDialog = () => {
    setIsEditing(false);
    setCurrentItem({});
    setShowDialog(true);
  };
  
  const openEditDialog = (item) => {
    setIsEditing(true);
    setCurrentItem(item);
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!currentItem || !currentItem.title) {
        alert("Title cannot be empty.");
        return;
    }
    
    let itemToSave = { ...currentItem };
    if (itemToSave.target_date) {
        try {
            const date = new Date(itemToSave.target_date);
            if (!isNaN(date.getTime())) {
                itemToSave.target_date = format(date, 'yyyy-MM-dd');
            } else {
                itemToSave.target_date = null;
            }
        } catch (e) {
            itemToSave.target_date = null;
        }
    }

    if (isEditing) {
      dispatch({
        type: 'UPDATE_BUCKET_LIST_ITEM',
        payload: { id: itemToSave.id, updates: itemToSave }
      });
    } else {
      dispatch({
        type: 'ADD_BUCKET_LIST_ITEM',
        payload: itemToSave
      });
    }
    setShowDialog(false);
  };
  
  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this item?")) {
        return;
    }
    dispatch({
      type: 'DELETE_BUCKET_LIST_ITEM',
      payload: { id }
    });
  };
  
  const toggleComplete = (item) => {
    dispatch({
      type: 'UPDATE_BUCKET_LIST_ITEM',
      payload: { id: item.id, updates: { completed: !item.completed } }
    });
  };

  const completedItems = bucketListItems.filter(i => i.completed);
  const incompleteItems = bucketListItems.filter(i => !i.completed);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Features")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bucket List</h1>
            <p className="text-gray-600 mt-1">Dream big, plan your adventures, and track your life goals.</p>
          </div>
        </div>
        <Button onClick={openNewDialog}><Plus className="w-4 h-4 mr-2" />Add Item</Button>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">To-Do ({incompleteItems.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {incompleteItems.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-span-full text-center text-gray-500 py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  No items to do! Add your first bucket list item above.
                </motion.div>
              )}
              {incompleteItems.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
                    {item.photo_url && <img src={item.photo_url} alt={item.title} className="w-full h-48 object-cover rounded-t-lg"/>}
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-4">
                        <Checkbox className="mt-1 flex-shrink-0" checked={item.completed} onCheckedChange={() => toggleComplete(item)}/>
                        <CardTitle className="text-lg font-semibold leading-tight">{item.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow text-sm text-gray-600">
                      <p className="line-clamp-3">{item.description || "No description provided."}</p>
                    </CardContent>
                    <div className="p-4 flex justify-between items-center text-sm text-gray-500 border-t border-gray-100">
                      {item.target_date ? (
                        <span className="flex items-center gap-1 text-gray-500"><Calendar className="w-4 h-4 mr-1"/>{format(parseISO(item.target_date), 'MMM d, yyyy')}</span>
                      ) : (
                        <span className="text-gray-400">No target date</span>
                      )}
                      <div>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}><Edit className="w-4 h-4 text-blue-500 hover:text-blue-600"/></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-red-500 hover:text-red-600"/></Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Completed ({completedItems.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {completedItems.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-span-full text-center text-gray-500 py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  No completed items yet. Keep going!
                </motion.div>
              )}
              {completedItems.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="opacity-80 bg-green-50 shadow-sm border-green-200">
                    {item.photo_url && <img src={item.photo_url} alt={item.title} className="w-full h-48 object-cover rounded-t-lg"/>}
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-4">
                        <Checkbox className="mt-1 flex-shrink-0" checked={item.completed} onCheckedChange={() => toggleComplete(item)}/>
                        <CardTitle className="line-through text-lg font-semibold leading-tight text-gray-700">{item.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-600">
                      <p className="line-clamp-3">{item.description || "No description provided."}</p>
                    </CardContent>
                    <div className="p-4 flex justify-between items-center text-sm text-gray-500 border-t border-green-100">
                        <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4 mr-1"/> Achieved!</span>
                        <div>
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}><Edit className="w-4 h-4 text-blue-400 hover:text-blue-500"/></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-red-400 hover:text-red-500"/></Button>
                        </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>{isEditing ? 'Edit' : 'Add'} Bucket List Item</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input id="title" value={currentItem?.title || ''} onChange={(e) => setCurrentItem({...currentItem, title: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" value={currentItem?.description || ''} onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="target_date" className="text-right">Target Date</Label>
                <Input id="target_date" type="date" value={currentItem?.target_date ? format(parseISO(currentItem.target_date), 'yyyy-MM-dd') : ''} onChange={(e) => setCurrentItem({...currentItem, target_date: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="photo_url" className="text-right">Photo URL</Label>
                <Input id="photo_url" value={currentItem?.photo_url || ''} onChange={(e) => setCurrentItem({...currentItem, photo_url: e.target.value})} placeholder="https://images.unsplash.com/..." className="col-span-3" />
            </div>
          </div>
          <div className="flex justify-end gap-2 p-4 pt-0">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}