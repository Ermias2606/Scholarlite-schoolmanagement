import React, { useState } from 'react';
import { AppData, UserProfile, SchoolEvent, EventType } from '../types';
import { Calendar, Plus, Edit2, Trash2, CalendarClock, Clock, Info } from 'lucide-react';
import { generateId } from '../utils/storage';

interface CalendarTabProps {
  appData: AppData;
  currentUser: UserProfile;
  onSaveEvent: (event: SchoolEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({
  appData,
  currentUser,
  onSaveEvent,
  onDeleteEvent,
}) => {
  const [isEditing, setIsEditing] = useState<SchoolEvent | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<SchoolEvent>>({
    title: '',
    date: '',
    endDate: '',
    type: 'event',
    description: '',
  });

  const hasAdminRole = currentUser.roles?.includes('admin') || currentUser.role === 'admin';

  const handleOpenForm = (event?: SchoolEvent) => {
    if (event) {
      setIsEditing(event);
      setFormData(event);
    } else {
      setIsEditing(null);
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        endDate: '',
        type: 'event',
        description: '',
      });
    }
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.type) return;

    const newEvent: SchoolEvent = {
      id: isEditing ? isEditing.id : generateId('evt'),
      title: formData.title,
      date: formData.date,
      endDate: formData.endDate || undefined,
      type: formData.type as EventType,
      description: formData.description,
    };

    onSaveEvent(newEvent);
    setIsFormOpen(false);
  };

  const getTypeStyle = (type: EventType) => {
    switch (type) {
      case 'holiday': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'exam': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const events = appData.events || [];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#003366] flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#00A896]" />
            School Calendar
          </h2>
          <p className="text-sm text-gray-500">Manage academic events, exams, and holidays.</p>
        </div>
        
        {hasAdminRole && (
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2 bg-[#00A896] hover:bg-[#008f7f] text-white px-4 py-2 rounded-xl font-bold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {events.length === 0 ? (
          <div className="text-center py-10">
            <CalendarClock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No upcoming events scheduled.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition gap-4">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 px-3 py-1 rounded-lg border text-xs font-bold uppercase tracking-wide shrink-0 ${getTypeStyle(event.type)}`}>
                    {event.type}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{event.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          {event.endDate && event.endDate !== event.date && ` - ${new Date(event.endDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}`}
                        </span>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                    )}
                  </div>
                </div>
                
                {hasAdminRole && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenForm(event)}
                      className="p-2 text-gray-400 hover:text-[#00A896] hover:bg-emerald-50 rounded-lg transition"
                      title="Edit Event"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this event?')) {
                          onDeleteEvent(event.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#00A896]" />
                {isEditing ? 'Edit Event' : 'Add New Event'}
              </h3>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Event Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#00A896] outline-none"
                  placeholder="e.g. End of Term Exams"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Event Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#00A896] outline-none bg-white"
                  >
                    <option value="event">General Event</option>
                    <option value="exam">Examination</option>
                    <option value="holiday">Holiday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Start Date</label>
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#00A896] outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">End Date (Optional)</label>
                <input
                  type="date"
                  value={formData.endDate || ''}
                  min={formData.date}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#00A896] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#00A896] outline-none"
                  rows={3}
                  placeholder="Additional details..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-bold text-white bg-[#003366] hover:bg-[#002244] rounded-xl transition shadow-sm"
                >
                  {isEditing ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
