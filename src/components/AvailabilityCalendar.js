import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth } from 'date-fns';
import { Calendar as CalendarIcon, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import * as XLSX from 'xlsx';

const AvailabilityCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availabilitySlots, setAvailabilitySlots] = useState({});
  const [hoveredDate, setHoveredDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [email, setEmail] = useState('');
  const [oneTimePassword, setOneTimePassword] = useState('');
  const [bookingStatus, setBookingStatus] = useState(null);
  const [bookedMeetings, setBookedMeetings] = useState([]);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Mock one-time passwords (in a real app, this would be managed securely on the server)
  const validOneTimePasswords = ['OTP123', 'OTP456', 'OTP789'];

  // Mock admin password (in a real app, this would be securely managed on the server)
  const ADMIN_PASSWORD = 'admin123';

  useEffect(() => {
    // Simulating fetching availability data
    const mockAvailability = {
      '2024-09-15': ['09:00 AM', '10:00 AM', '2:00 PM'],
      '2024-09-16': ['11:00 AM', '3:00 PM'],
      '2024-09-20': ['10:00 AM', '1:00 PM', '4:00 PM'],
    };
    setAvailabilitySlots(mockAvailability);
  }, []);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const handlePrevMonth = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1));
  };

  const handleDateHover = (date) => {
    setHoveredDate(date);
  };

  const handleDateLeave = () => {
    setHoveredDate(null);
  };

  const handleSlotSelect = (date, slot) => {
    setSelectedSlot({ date, slot });
  };

  const handleCloseModal = () => {
    setSelectedSlot(null);
    setEmail('');
    setOneTimePassword('');
    setBookingStatus(null);
  };

  const handleBooking = () => {
    if (validOneTimePasswords.includes(oneTimePassword)) {
      setBookingStatus('success');
      const dateKey = format(selectedSlot.date, 'yyyy-MM-dd');
      setAvailabilitySlots(prev => ({
        ...prev,
        [dateKey]: prev[dateKey].filter(slot => slot !== selectedSlot.slot)
      }));
      setBookedMeetings(prev => [...prev, { date: dateKey, time: selectedSlot.slot, email }]);
    } else {
      setBookingStatus('error');
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setAdminPassword('');
    } else {
      alert('Incorrect password');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(bookedMeetings);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Booked Meetings");
    XLSX.writeFile(wb, "booked_meetings.xlsx");
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg max-w-md mx-auto relative">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="text-gray-600 hover:text-gray-800">
          &lt; Prev
        </button>
        <h2 className="text-xl font-bold text-gray-800">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button onClick={handleNextMonth} className="text-gray-600 hover:text-gray-800">
          Next &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-medium text-gray-500">
            {day}
          </div>
        ))}
        {daysInMonth.map(date => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const hasAvailability = availabilitySlots[dateKey] && availabilitySlots[dateKey].length > 0;
          return (
            <div
              key={date.toString()}
              className={`
                p-2 text-center rounded-full
                ${!isSameMonth(date, currentDate) ? 'text-gray-300' : ''}
                ${isToday(date) ? 'bg-blue-100 text-blue-800' : ''}
                ${hasAvailability ? 'cursor-pointer hover:bg-green-100' : ''}
              `}
              onMouseEnter={() => handleDateHover(date)}
              onMouseLeave={handleDateLeave}
            >
              {format(date, 'd')}
              {hasAvailability && (
                <div className="mt-1">
                  <CalendarIcon size={16} className="inline text-green-500" />
                </div>
              )}
              {hoveredDate && isSameMonth(hoveredDate, date) && format(hoveredDate, 'yyyy-MM-dd') === dateKey && availabilitySlots[dateKey] && (
                <div className="absolute z-10 bg-white p-2 rounded shadow-lg mt-1">
                  <p className="font-bold">Available times:</p>
                  <ul>
                    {availabilitySlots[dateKey].map(slot => (
                      <li 
                        key={slot} 
                        className="cursor-pointer hover:bg-blue-100 p-1 rounded"
                        onClick={() => handleSlotSelect(date, slot)}
                      >
                        {slot}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={selectedSlot !== null} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
          </DialogHeader>
          {selectedSlot && (
            <div className="py-4">
              <p>Date: {format(selectedSlot.date, 'MMMM d, yyyy')}</p>
              <p>Time: {selectedSlot.slot}</p>
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2"
              />
              <Input
                type="password"
                placeholder="One-time password"
                value={oneTimePassword}
                onChange={(e) => setOneTimePassword(e.target.value)}
                className="mt-2"
              />
              {bookingStatus === 'success' && (
                <Alert className="mt-2">
                  <AlertDescription>Booking successful!</AlertDescription>
                </Alert>
              )}
              {bookingStatus === 'error' && (
                <Alert className="mt-2" variant="destructive">
                  <AlertDescription>Invalid one-time password. Please try again.</AlertDescription>
                </Alert>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleCloseModal} variant="outline">Cancel</Button>
            <Button onClick={handleBooking}>Book</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Button */}
      <div className="absolute bottom-4 right-4">
        <Button
          onClick={() => setIsAdminModalOpen(true)}
          className="rounded-full w-12 h-12 flex items-center justify-center"
        >
          <Lock size={20} />
        </Button>
      </div>

      {/* Admin Login Modal */}
      <Dialog open={isAdminModalOpen} onOpenChange={setIsAdminModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
          </DialogHeader>
          {!isAdminAuthenticated ? (
            <div className="py-4">
              <Input
                type="password"
                placeholder="Admin Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="mt-2"
              />
            </div>
          ) : (
            <div className="py-4">
              <h3 className="text-lg font-semibold mb-2">Admin Controls</h3>
              <Button onClick={exportToExcel} className="mb-2 w-full">
                Export Booked Meetings to Excel
              </Button>
              <Button onClick={handleAdminLogout} variant="outline" className="w-full">
                Logout
              </Button>
            </div>
          )}
          <DialogFooter>
            {!isAdminAuthenticated && (
              <Button onClick={handleAdminLogin}>Login</Button>
            )}
            <Button onClick={() => setIsAdminModalOpen(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AvailabilityCalendar;