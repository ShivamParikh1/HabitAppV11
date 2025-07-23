import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useApp } from "@/context/AppContext";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Lock, Unlock, Mail, Calendar, ArrowLeft } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function FutureSelf() {
  const { state, dispatch } = useApp();
  const { futureLetters } = state;
  
  const [showDialog, setShowDialog] = useState(false);
  const [newLetter, setNewLetter] = useState({ title: '', content: '', unlock_date: '' });

  const handleSave = () => {
    if (!newLetter.title || !newLetter.content || !newLetter.unlock_date) {
      alert("Please fill in all fields.");
      return;
    }

    dispatch({
      type: 'ADD_FUTURE_LETTER',
      payload: newLetter
    });

    setShowDialog(false);
    setNewLetter({ title: '', content: '', unlock_date: '' });
  };

  const lockedLetters = futureLetters.filter(l => !isPast(parseISO(l.unlock_date)));
  const unlockedLetters = futureLetters.filter(l => isPast(parseISO(l.unlock_date)));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Features")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Letter to Future Self</h1>
            <p className="text-gray-600 mt-1">Write messages to be unlocked on a future date.</p>
          </div>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Write a New Letter</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Write to Your Future Self</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label htmlFor="title">Title</Label><Input id="title" value={newLetter.title} onChange={e => setNewLetter({...newLetter, title: e.target.value})} placeholder="A message of hope" /></div>
              <div><Label htmlFor="content">Your Letter</Label><Textarea id="content" value={newLetter.content} onChange={e => setNewLetter({...newLetter, content: e.target.value})} rows={10} placeholder="Dear Future Me..."/></div>
              <div><Label htmlFor="unlock-date">Unlock Date</Label><Input id="unlock-date" type="date" value={newLetter.unlock_date} onChange={e => setNewLetter({...newLetter, unlock_date: e.target.value})} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleSave}>Lock Letter</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Lock className="text-gray-500"/>Locked Letters</h2>
          <div className="space-y-4">
            {lockedLetters.length === 0 ? (
              <p className="text-gray-500">No locked letters yet. Write one today!</p>
            ) : (
              lockedLetters.map(l => (
                <Card key={l.id} className="bg-gray-100">
                  <CardHeader><CardTitle className="truncate">{l.title}</CardTitle></CardHeader>
                  <CardContent className="text-center py-8">
                    <Lock className="w-16 h-16 text-gray-400 mx-auto"/>
                    <p className="mt-4 text-gray-600">Unlocks on {format(parseISO(l.unlock_date), 'MMMM d, yyyy')}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Unlock className="text-green-500"/>Unlocked Letters</h2>
          <div className="space-y-4">
            {unlockedLetters.length === 0 ? (
              <p className="text-gray-500">No unlocked letters yet. Check back later!</p>
            ) : (
              unlockedLetters.map(l => (
                <Card key={l.id} className="cursor-pointer hover:shadow-lg">
                  <CardHeader><CardTitle className="truncate">{l.title}</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm italic truncate">{l.content}</p>
                    <p className="mt-4 text-xs text-gray-500">Unlocked on {format(parseISO(l.unlock_date), 'MMMM d, yyyy')}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}