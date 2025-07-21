
import React, { useState, useEffect } from 'react';
import { SchoolAssignment } from '@/entities/SchoolAssignment';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  GraduationCap, 
  Edit, 
  Trash2, 
  Calendar as CalendarIcon, 
  BookOpen, 
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Book, 
  CheckCircle2 
} from "lucide-react";
import { format, parseISO, startOfWeek, endOfWeek, addDays, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";


export default function School() {
  const [assignments, setAssignments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [filterSubject, setFilterSubject] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date()); // State for calendar month navigation

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        const assignmentData = await SchoolAssignment.filter({ user_id: userData.id });
        setAssignments(assignmentData.sort((a,b) => new Date(a.due_date) - new Date(b.due_date)));
      } catch (error) {
        console.error("Error loading school data:", error);
      }
      setLoading(false);
    };
    loadData();
  }, []);
  
  const subjects = [...new Set(assignments.map(a => a.subject))];

  const filteredAssignments = assignments.filter(a => filterSubject === 'all' || a.subject === filterSubject);

  const openNewDialog = () => {
    setIsEditing(false);
    setCurrentAssignment({ due_date: format(new Date(), 'yyyy-MM-dd') }); // Pre-fill with current date
    setShowDialog(true);
  };

  const openEditDialog = (assignment) => {
    setIsEditing(true);
    setCurrentAssignment(assignment);
    setShowDialog(true);
  };
  
  const handleSave = async () => {
    if (!currentAssignment || !currentAssignment.title || !currentAssignment.subject || !currentAssignment.due_date) {
      alert("Please fill in all required fields: Title, Subject, and Due Date.");
      return;
    }

    if (isEditing) {
      await SchoolAssignment.update(currentAssignment.id, currentAssignment);
    } else {
      await SchoolAssignment.create({ ...currentAssignment, user_id: user.id });
    }
    const assignmentData = await SchoolAssignment.filter({ user_id: user.id });
    setAssignments(assignmentData.sort((a,b) => new Date(a.due_date) - new Date(b.due_date)));
    setShowDialog(false);
  };
  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      await SchoolAssignment.delete(id);
      setAssignments(assignments.filter(a => a.id !== id));
    }
  };
  
  const toggleComplete = async (assignment) => {
    await SchoolAssignment.update(assignment.id, { completed: !assignment.completed });
    setAssignments(assignments.map(a => a.id === assignment.id ? {...a, completed: !a.completed} : a));
  };
  
  const renderCalendarView = () => {
    const startOfCurrentMonth = startOfMonth(currentMonth);
    const endOfCurrentMonth = endOfMonth(currentMonth);
    const startDate = startOfWeek(startOfCurrentMonth);
    const endDate = endOfWeek(endOfCurrentMonth);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={goToPrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 text-center font-bold text-gray-600">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              className={`border rounded-lg p-2 min-h-[120px] relative
                ${isSameMonth(day, currentMonth) ? 'bg-gray-50' : 'bg-gray-100 text-gray-400'}
                ${isSameDay(day, new Date()) ? 'border-2 border-blue-500 bg-blue-50' : ''}
              `}
            >
              <p className="font-semibold text-right">{format(day, 'd')}</p>
              <div className="space-y-1 mt-1 text-left">
                {assignments
                  .filter(a => isSameDay(parseISO(a.due_date), day))
                  .sort((a,b) => new Date(a.due_date) - new Date(b.due_date)) // Keep consistent sorting
                  .map(a => (
                    <div
                      key={a.id}
                      className={`text-xs p-1 rounded truncate cursor-pointer
                        ${a.completed ? 'bg-green-200 text-green-800 line-through' : 'bg-blue-200 text-blue-800'}
                      `}
                      onClick={() => openEditDialog(a)}
                      title={a.title}
                    >
                      {a.title}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
       {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Features")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">School Organizer</h1>
            <p className="text-gray-600 mt-1">Manage assignments, track deadlines, and stay on top of your studies.</p>
          </div>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}><Plus className="w-4 h-4 mr-2" />Add Assignment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{isEditing ? 'Edit' : 'Add'} Assignment</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={currentAssignment?.title || ''} onChange={(e) => setCurrentAssignment({...currentAssignment, title: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={currentAssignment?.subject || ''} onChange={(e) => setCurrentAssignment({...currentAssignment, subject: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" value={currentAssignment?.due_date || ''} onChange={(e) => setCurrentAssignment({...currentAssignment, due_date: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={currentAssignment?.notes || ''} onChange={(e) => setCurrentAssignment({...currentAssignment, notes: e.target.value})} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="list" onValueChange={setView} className="w-full">
        <div className="flex justify-between items-center">
            <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>
            {view === 'list' && (
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="p-2 border rounded-md">
                        <option value="all">All Subjects</option>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            )}
        </div>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAssignments.length === 0 ? (
                  <p className="text-center text-gray-500">No assignments found for this filter. <span className="underline cursor-pointer" onClick={openNewDialog}>Add one?</span></p>
                ) : (
                  filteredAssignments.map(a => (
                    <div key={a.id} className={`flex items-start gap-4 p-4 rounded-lg ${a.completed ? 'bg-green-50' : 'bg-white'} border border-gray-100 shadow-sm`}>
                        <Checkbox checked={a.completed} onCheckedChange={() => toggleComplete(a)} className="mt-1"/>
                        <div className="flex-1">
                          <p className={`font-semibold ${a.completed ? 'line-through text-gray-500' : ''}`}>{a.title}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4"/>{a.subject}</span>
                            <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4"/>Due: {format(parseISO(a.due_date), 'MMM dd, yyyy')}</span>
                          </div>
                          {a.notes && <p className="text-sm text-gray-600 mt-2">{a.notes}</p>}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(a)}><Edit className="w-4 h-4"/></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                        </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader><CardTitle>Monthly Calendar View</CardTitle></CardHeader>
            <CardContent>{renderCalendarView()}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
