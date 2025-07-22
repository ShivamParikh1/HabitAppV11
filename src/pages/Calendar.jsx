import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppContext } from '../context/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Repeat,
  Edit,
  Trash2
} from 'lucide-react'

const Calendar = () => {
  const { state, dispatch } = useAppContext()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'personal',
    recurring: 'none',
    attendees: ''
  })

  const categories = [
    { value: 'personal', label: 'Personal', color: 'bg-blue-500' },
    { value: 'work', label: 'Work', color: 'bg-green-500' },
    { value: 'health', label: 'Health', color: 'bg-red-500' },
    { value: 'social', label: 'Social', color: 'bg-purple-500' },
    { value: 'education', label: 'Education', color: 'bg-yellow-500' }
  ]

  const recurringOptions = [
    { value: 'none', label: 'No Repeat' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ]

  // Get calendar days for current month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  // Get events for a specific date
  const getEventsForDate = (date) => {
    if (!date) return []
    const dateString = date.toISOString().split('T')[0]
    return state.calendarEvents.filter(event => event.date === dateString)
  }

  // Navigate months
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    
    const eventData = {
      ...eventForm,
      id: editingEvent ? editingEvent.id : Date.now().toString(),
      createdAt: editingEvent ? editingEvent.createdAt : new Date().toISOString()
    }

    if (editingEvent) {
      dispatch({ type: 'UPDATE_CALENDAR_EVENT', payload: eventData })
    } else {
      dispatch({ type: 'ADD_CALENDAR_EVENT', payload: eventData })
    }

    resetForm()
    setShowEventDialog(false)
  }

  // Reset form
  const resetForm = () => {
    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      category: 'personal',
      recurring: 'none',
      attendees: ''
    })
    setEditingEvent(null)
  }

  // Edit event
  const handleEditEvent = (event) => {
    setEventForm(event)
    setEditingEvent(event)
    setShowEventDialog(true)
  }

  // Delete event
  const handleDeleteEvent = (eventId) => {
    dispatch({ type: 'DELETE_CALENDAR_EVENT', payload: eventId })
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Calendar
              </h1>
              <p className="text-gray-600 mt-2">Organize your schedule and never miss an event</p>
            </div>
            
            <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    resetForm()
                    if (selectedDate) {
                      setEventForm(prev => ({ ...prev, date: selectedDate.toISOString().split('T')[0] }))
                    }
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      value={eventForm.title}
                      onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter event title"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={eventForm.description}
                      onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Event description (optional)"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={eventForm.date}
                        onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={eventForm.time}
                        onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={eventForm.location}
                      onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Event location (optional)"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select value={eventForm.category} onValueChange={(value) => setEventForm(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Recurring</Label>
                      <Select value={eventForm.recurring} onValueChange={(value) => setEventForm(prev => ({ ...prev, recurring: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {recurringOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="attendees">Attendees</Label>
                    <Input
                      id="attendees"
                      value={eventForm.attendees}
                      onChange={(e) => setEventForm(prev => ({ ...prev, attendees: e.target.value }))}
                      placeholder="Comma-separated list of attendees"
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingEvent ? 'Update Event' : 'Create Event'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowEventDialog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Grid */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth(-1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(new Date())}
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth(1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map(day => (
                    <div key={day} className="p-2 text-center font-semibold text-gray-600 text-sm">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    const events = day ? getEventsForDate(day) : []
                    const isToday = day && day.toDateString() === new Date().toDateString()
                    const isSelected = selectedDate && day && day.toDateString() === selectedDate.toDateString()
                    
                    return (
                      <motion.div
                        key={index}
                        whileHover={{ scale: day ? 1.05 : 1 }}
                        className={`
                          min-h-[80px] p-1 border rounded-lg cursor-pointer transition-all
                          ${day ? 'bg-white hover:bg-gray-50' : 'bg-transparent'}
                          ${isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                          ${isSelected ? 'ring-2 ring-purple-500 bg-purple-50' : ''}
                        `}
                        onClick={() => day && setSelectedDate(day)}
                      >
                        {day && (
                          <>
                            <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                              {day.getDate()}
                            </div>
                            <div className="space-y-1 mt-1">
                              {events.slice(0, 2).map(event => {
                                const category = categories.find(cat => cat.value === event.category)
                                return (
                                  <div
                                    key={event.id}
                                    className={`text-xs p-1 rounded text-white truncate ${category?.color || 'bg-gray-500'}`}
                                    title={event.title}
                                  >
                                    {event.title}
                                  </div>
                                )
                              })}
                              {events.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{events.length - 2} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Events Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Today's Events */}
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Today's Events</CardTitle>
              </CardHeader>
              <CardContent>
                {getEventsForDate(new Date()).length > 0 ? (
                  <div className="space-y-3">
                    {getEventsForDate(new Date()).map(event => {
                      const category = categories.find(cat => cat.value === event.category)
                      return (
                        <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{event.title}</h4>
                              {event.time && (
                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {event.time}
                                </div>
                              )}
                              {event.location && (
                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {event.location}
                                </div>
                              )}
                            </div>
                            <Badge className={`${category?.color || 'bg-gray-500'} text-white`}>
                              {category?.label || 'Other'}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No events today</p>
                )}
              </CardContent>
            </Card>

            {/* Selected Date Events */}
            {selectedDate && (
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getEventsForDate(selectedDate).length > 0 ? (
                    <div className="space-y-3">
                      {getEventsForDate(selectedDate).map(event => {
                        const category = categories.find(cat => cat.value === event.category)
                        return (
                          <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{event.title}</h4>
                                {event.description && (
                                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                )}
                              </div>
                              <div className="flex gap-1 ml-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditEvent(event)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {event.time && (
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {event.time}
                                </div>
                              )}
                              {event.location && (
                                <div className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {event.location}
                                </div>
                              )}
                              {event.recurring !== 'none' && (
                                <div className="flex items-center">
                                  <Repeat className="w-3 h-3 mr-1" />
                                  {recurringOptions.find(opt => opt.value === event.recurring)?.label}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                              <Badge className={`${category?.color || 'bg-gray-500'} text-white`}>
                                {category?.label || 'Other'}
                              </Badge>
                              {event.attendees && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Users className="w-3 h-3 mr-1" />
                                  {event.attendees.split(',').length} attendees
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No events on this date</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Events</span>
                    <span className="font-medium">{state.calendarEvents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">This Month</span>
                    <span className="font-medium">
                      {state.calendarEvents.filter(event => {
                        const eventDate = new Date(event.date)
                        return eventDate.getMonth() === currentDate.getMonth() && 
                               eventDate.getFullYear() === currentDate.getFullYear()
                      }).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Upcoming</span>
                    <span className="font-medium">
                      {state.calendarEvents.filter(event => new Date(event.date) > new Date()).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Calendar