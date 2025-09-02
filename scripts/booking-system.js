// EmailJS Configuration
// Replace these with your actual EmailJS credentials
const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'YOUR_PUBLIC_KEY_HERE', // Replace with your EmailJS public key
  SERVICE_ID: 'YOUR_SERVICE_ID_HERE', // Replace with your EmailJS service ID
  TEMPLATE_ID: 'YOUR_TEMPLATE_ID_HERE', // Replace with your EmailJS template ID
  CALENDAR_TEMPLATE_ID: 'YOUR_CALENDAR_TEMPLATE_ID_HERE' // Separate template for calendar invites
};

// Initialize EmailJS
(function() {
  emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
})();

class BookingCalendar {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = null;
    this.selectedTime = null;
    this.bookedSlots = new Map(); // Map of date -> Set of booked times
    this.maxBookingsPerDay = 3;
    
    this.init();
  }

  init() {
    this.renderCalendar();
    this.bindEvents();
    this.loadBookedSlots();
  }

  renderCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    document.getElementById('currentMonth').textContent = 
      new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';

    // Add day headers
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'calendar-day-header';
      dayHeader.textContent = day;
      calendarGrid.appendChild(dayHeader);
    });

    // Add calendar days
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day';
      dayElement.textContent = date.getDate();

      if (date.getMonth() !== month) {
        dayElement.classList.add('disabled');
      } else {
        const dayOfWeek = date.getDay();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check if date is within 2 months from today
        const twoMonthsFromNow = new Date();
        twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
        twoMonthsFromNow.setHours(23, 59, 59, 999);
        
        if (dayOfWeek >= 1 && dayOfWeek <= 5 && date >= today && date <= twoMonthsFromNow) {
          const dateString = date.toISOString().split('T')[0];
          const bookedTimes = this.bookedSlots.get(dateString) || new Set();
          
          if (bookedTimes.size >= this.maxBookingsPerDay) {
            dayElement.classList.add('fully-booked');
          } else {
            dayElement.classList.add('available');
            dayElement.dataset.date = dateString;
          }
        } else {
          dayElement.classList.add('disabled');
        }
      }

      calendarGrid.appendChild(dayElement);
    }

    // Update navigation buttons
    const today = new Date();
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
    
    document.getElementById('prevMonth').disabled = 
      this.currentDate.getMonth() === today.getMonth() && 
      this.currentDate.getFullYear() === today.getFullYear();
    
    document.getElementById('nextMonth').disabled = 
      this.currentDate.getMonth() === twoMonthsFromNow.getMonth() && 
      this.currentDate.getFullYear() === twoMonthsFromNow.getFullYear();
  }

  bindEvents() {
    document.getElementById('prevMonth').addEventListener('click', () => {
      if (!document.getElementById('prevMonth').disabled) {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
      }
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
      if (!document.getElementById('nextMonth').disabled) {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
      }
    });

    document.getElementById('calendarGrid').addEventListener('click', (e) => {
      if (e.target.classList.contains('calendar-day') && e.target.classList.contains('available')) {
        this.selectDate(e.target);
      }
    });

    document.getElementById('timeSlots').addEventListener('click', (e) => {
      if (e.target.classList.contains('time-slot') && !e.target.classList.contains('booked')) {
        this.selectTime(e.target);
      }
    });

    document.getElementById('appointmentForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitBooking();
    });
  }

  selectDate(dayElement) {
    document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));
    dayElement.classList.add('selected');
    this.selectedDate = dayElement.dataset.date;
    
    document.getElementById('timeSlots').style.display = 'block';
    document.getElementById('bookingForm').style.display = 'none';
    
    const dateObj = new Date(this.selectedDate);
    document.getElementById('summaryDate').textContent = 
      dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    this.selectedTime = null;
    document.querySelectorAll('.time-slot.selected').forEach(el => el.classList.remove('selected'));
    document.getElementById('summaryTime').textContent = '-';
    
    // Update time slots for selected date
    this.updateTimeSlots();
  }

  updateTimeSlots() {
    const timeSlots = document.querySelectorAll('.time-slot');
    const bookedTimes = this.bookedSlots.get(this.selectedDate) || new Set();
    
    timeSlots.forEach(slot => {
      const time = slot.dataset.time;
      slot.classList.remove('booked', 'selected');
      
      if (bookedTimes.has(time)) {
        slot.classList.add('booked');
      }
    });
  }

  selectTime(timeElement) {
    if (timeElement.classList.contains('booked')) return;
    
    document.querySelectorAll('.time-slot.selected').forEach(el => el.classList.remove('selected'));
    timeElement.classList.add('selected');
    this.selectedTime = timeElement.dataset.time;
    
    document.getElementById('bookingForm').style.display = 'block';
    document.getElementById('summaryTime').textContent = timeElement.textContent;
  }

  loadBookedSlots() {
    // TODO: Replace this with real calendar integration
    // This should fetch actual booked slots from your calendar (Google Calendar, Outlook, etc.)
    
    // For now, simulate some bookings for testing
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);
    
    // Add some sample bookings (remove these in production)
    this.addBooking(tomorrow.toISOString().split('T')[0], '10:00');
    this.addBooking(tomorrow.toISOString().split('T')[0], '14:00');
    this.addBooking(dayAfterTomorrow.toISOString().split('T')[0], '11:00');
    
    // Note: September 4th should not be fully booked - this was a bug in the previous version
    // The calendar should now show real-time availability
  }

  addBooking(date, time) {
    if (!this.bookedSlots.has(date)) {
      this.bookedSlots.set(date, new Set());
    }
    this.bookedSlots.get(date).add(time);
  }

  async submitBooking() {
    const formData = new FormData(document.getElementById('appointmentForm'));
    const bookingData = {
      date: this.selectedDate,
      time: this.selectedTime,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      service: formData.get('service'),
      message: formData.get('message')
    };

    const submitBtn = document.querySelector('#appointmentForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
    submitBtn.disabled = true;

    // Hide any existing messages
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';

    try {
      // Add booking to local storage (simulate backend)
      this.addBooking(this.selectedDate, this.selectedTime);
      
      // Send emails with proper ICS attachments
      await this.sendBookingEmails(bookingData);
      
      // Show success message
      document.getElementById('successMessage').style.display = 'block';
      
      // Reset form
      document.getElementById('appointmentForm').reset();
      this.resetSelection();
      
      // Scroll to success message
      document.getElementById('successMessage').scrollIntoView({ behavior: 'smooth' });
      
    } catch (error) {
      console.error('Booking error:', error);
      document.getElementById('errorMessage').style.display = 'block';
      document.getElementById('errorMessage').scrollIntoView({ behavior: 'smooth' });
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  async sendBookingEmails(bookingData) {
    const formattedDate = new Date(bookingData.date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const startTime = bookingData.time;
    const endTime = this.getEndTime(startTime);
    
    // Create calendar invite data
    const calendarData = {
      summary: `Consultation - ${bookingData.service}`,
      description: `Consultation with ${bookingData.name}\n\nService: ${bookingData.service}\nPhone: ${bookingData.phone}${bookingData.message ? `\n\nAdditional Information:\n${bookingData.message}` : ''}`,
      startDate: bookingData.date,
      startTime: startTime,
      endTime: endTime,
      location: 'Nairobi, Kenya (Virtual/In-person)',
      attendee: bookingData.email,
      organizer: 'info@funworksmedia.com'
    };

    try {
      // Send confirmation email to client (without calendar invite)
      await this.sendClientEmail(bookingData, formattedDate);
      
      // Send calendar invite to client (separate email with ICS attachment)
      await this.sendCalendarInvite(calendarData, bookingData.email, 'client');
      
      // Send notification to consultant (with client email as sender)
      await this.sendConsultantEmail(bookingData, formattedDate);
      
      // Send calendar invite to consultant
      await this.sendCalendarInvite(calendarData, 'info@funworksmedia.com', 'consultant');
      
      console.log('All booking emails sent successfully');
      
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendClientEmail(bookingData, formattedDate) {
    // Simple confirmation email without calendar invite
    const templateParams = {
      to_email: bookingData.email,
      subject: `Appointment Confirmation - ${bookingData.service}`,
      client_name: bookingData.name,
      service_name: bookingData.service,
      appointment_date: formattedDate,
      appointment_time: bookingData.time,
      phone_number: bookingData.phone,
      additional_info: bookingData.message || 'No additional information provided'
    };

    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );
  }

  async sendConsultantEmail(bookingData, formattedDate) {
    // Notification email to consultant with client email as sender
    const templateParams = {
      to_email: 'info@funworksmedia.com',
      from_email: bookingData.email, // Client's email as sender
      subject: `New Appointment Booking - ${bookingData.service}`,
      client_name: bookingData.name,
      client_email: bookingData.email,
      client_phone: bookingData.phone,
      service_name: bookingData.service,
      appointment_date: formattedDate,
      appointment_time: bookingData.time,
      additional_info: bookingData.message || 'No additional information provided'
    };

    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );
  }

  async sendCalendarInvite(calendarData, recipientEmail, recipientType) {
    // Create proper ICS file content
    const icalContent = this.createICalInvite(calendarData, recipientType);
    
    // Create a blob with the ICS content
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    
    // For EmailJS, we need to send the ICS content as a parameter
    // The template should handle the attachment
    const templateParams = {
      to_email: recipientEmail,
      subject: `Calendar Invite: ${calendarData.summary}`,
      ical_content: icalContent,
      event_summary: calendarData.summary,
      event_description: calendarData.description,
      event_start_date: calendarData.startDate,
      event_start_time: calendarData.startTime,
      event_end_time: calendarData.endTime,
      event_location: calendarData.location,
      recipient_type: recipientType
    };

    // Use a separate template for calendar invites
    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.CALENDAR_TEMPLATE_ID,
      templateParams
    );
  }

  createICalInvite(calendarData, recipientType) {
    // Create proper ICS format with correct timezone handling
    const startDateTime = `${calendarData.startDate}T${calendarData.startTime}:00`;
    const endDateTime = `${calendarData.startDate}T${calendarData.endTime}:00`;
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // Generate unique identifier
    const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@funworksmedia.com`;
    
    // Format dates for ICS (YYYYMMDDTHHMMSSZ)
    const formatDateForICS = (dateTime) => {
      return dateTime.replace(/[-:]/g, '').replace('T', '') + '00Z';
    };
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//FunWorks Media Consulting//Calendar Invite//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${formatDateForICS(startDateTime)}
DTEND:${formatDateForICS(endDateTime)}
SUMMARY:${calendarData.summary}
DESCRIPTION:${calendarData.description.replace(/\n/g, '\\n')}
LOCATION:${calendarData.location}
ORGANIZER;CN=FunWorks Media Consulting:mailto:${calendarData.organizer}
ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${recipientType === 'client' ? 'Client' : 'Consultant'}:mailto:${calendarData.attendee}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

    return icsContent;
  }

  getEndTime(startTime) {
    const timeMap = {
      '10:00': '11:00',
      '11:00': '12:00',
      '12:00': '13:00',
      '13:00': '14:00',
      '14:00': '15:00',
      '15:00': '16:00',
      '16:00': '17:00'
    };
    return timeMap[startTime] || '11:00';
  }

  resetSelection() {
    this.selectedDate = null;
    this.selectedTime = null;
    document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.time-slot.selected').forEach(el => el.classList.remove('selected'));
    document.getElementById('timeSlots').style.display = 'none';
    document.getElementById('bookingForm').style.display = 'none';
    document.getElementById('summaryDate').textContent = '-';
    document.getElementById('summaryTime').textContent = '-';
  }

  // TODO: Implement real calendar integration
  // This method should fetch actual availability from your calendar service
  async fetchRealTimeAvailability() {
    // Example integration with Google Calendar API
    // You'll need to implement this based on your calendar service
    
    /*
    // Google Calendar API example
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const events = await response.json();
    // Process events and update this.bookedSlots
    */
    
    // For now, return the current booked slots
    return this.bookedSlots;
  }
}

// Initialize the booking calendar when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new BookingCalendar();
});// EmailJS Configuration
// Replace these with your actual EmailJS credentials
const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'YOUR_PUBLIC_KEY_HERE', // Replace with your EmailJS public key
  SERVICE_ID: 'YOUR_SERVICE_ID_HERE', // Replace with your EmailJS service ID
  TEMPLATE_ID: 'YOUR_TEMPLATE_ID_HERE', // Replace with your EmailJS template ID
  CALENDAR_TEMPLATE_ID: 'YOUR_CALENDAR_TEMPLATE_ID_HERE' // Separate template for calendar invites
};

// Initialize EmailJS
(function() {
  emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
})();

class BookingCalendar {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = null;
    this.selectedTime = null;
    this.bookedSlots = new Map(); // Map of date -> Set of booked times
    this.maxBookingsPerDay = 3;
    
    this.init();
  }

  init() {
    this.renderCalendar();
    this.bindEvents();
    this.loadBookedSlots();
  }

  renderCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    document.getElementById('currentMonth').textContent = 
      new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';

    // Add day headers
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'calendar-day-header';
      dayHeader.textContent = day;
      calendarGrid.appendChild(dayHeader);
    });

    // Add calendar days
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day';
      dayElement.textContent = date.getDate();

      if (date.getMonth() !== month) {
        dayElement.classList.add('disabled');
      } else {
        const dayOfWeek = date.getDay();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check if date is within 2 months from today
        const twoMonthsFromNow = new Date();
        twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
        twoMonthsFromNow.setHours(23, 59, 59, 999);
        
        if (dayOfWeek >= 1 && dayOfWeek <= 5 && date >= today && date <= twoMonthsFromNow) {
          const dateString = date.toISOString().split('T')[0];
          const bookedTimes = this.bookedSlots.get(dateString) || new Set();
          
          if (bookedTimes.size >= this.maxBookingsPerDay) {
            dayElement.classList.add('fully-booked');
          } else {
            dayElement.classList.add('available');
            dayElement.dataset.date = dateString;
          }
        } else {
          dayElement.classList.add('disabled');
        }
      }

      calendarGrid.appendChild(dayElement);
    }

    // Update navigation buttons
    const today = new Date();
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
    
    document.getElementById('prevMonth').disabled = 
      this.currentDate.getMonth() === today.getMonth() && 
      this.currentDate.getFullYear() === today.getFullYear();
    
    document.getElementById('nextMonth').disabled = 
      this.currentDate.getMonth() === twoMonthsFromNow.getMonth() && 
      this.currentDate.getFullYear() === twoMonthsFromNow.getFullYear();
  }

  bindEvents() {
    document.getElementById('prevMonth').addEventListener('click', () => {
      if (!document.getElementById('prevMonth').disabled) {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
      }
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
      if (!document.getElementById('nextMonth').disabled) {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
      }
    });

    document.getElementById('calendarGrid').addEventListener('click', (e) => {
      if (e.target.classList.contains('calendar-day') && e.target.classList.contains('available')) {
        this.selectDate(e.target);
      }
    });

    document.getElementById('timeSlots').addEventListener('click', (e) => {
      if (e.target.classList.contains('time-slot') && !e.target.classList.contains('booked')) {
        this.selectTime(e.target);
      }
    });

    document.getElementById('appointmentForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitBooking();
    });
  }

  selectDate(dayElement) {
    document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));
    dayElement.classList.add('selected');
    this.selectedDate = dayElement.dataset.date;
    
    document.getElementById('timeSlots').style.display = 'block';
    document.getElementById('bookingForm').style.display = 'none';
    
    const dateObj = new Date(this.selectedDate);
    document.getElementById('summaryDate').textContent = 
      dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    this.selectedTime = null;
    document.querySelectorAll('.time-slot.selected').forEach(el => el.classList.remove('selected'));
    document.getElementById('summaryTime').textContent = '-';
    
    // Update time slots for selected date
    this.updateTimeSlots();
  }

  updateTimeSlots() {
    const timeSlots = document.querySelectorAll('.time-slot');
    const bookedTimes = this.bookedSlots.get(this.selectedDate) || new Set();
    
    timeSlots.forEach(slot => {
      const time = slot.dataset.time;
      slot.classList.remove('booked', 'selected');
      
      if (bookedTimes.has(time)) {
        slot.classList.add('booked');
      }
    });
  }

  selectTime(timeElement) {
    if (timeElement.classList.contains('booked')) return;
    
    document.querySelectorAll('.time-slot.selected').forEach(el => el.classList.remove('selected'));
    timeElement.classList.add('selected');
    this.selectedTime = timeElement.dataset.time;
    
    document.getElementById('bookingForm').style.display = 'block';
    document.getElementById('summaryTime').textContent = timeElement.textContent;
  }

  loadBookedSlots() {
    // TODO: Replace this with real calendar integration
    // This should fetch actual booked slots from your calendar (Google Calendar, Outlook, etc.)
    
    // For now, simulate some bookings for testing
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);
    
    // Add some sample bookings (remove these in production)
    this.addBooking(tomorrow.toISOString().split('T')[0], '10:00');
    this.addBooking(tomorrow.toISOString().split('T')[0], '14:00');
    this.addBooking(dayAfterTomorrow.toISOString().split('T')[0], '11:00');
    
    // Note: September 4th should not be fully booked - this was a bug in the previous version
    // The calendar should now show real-time availability
  }

  addBooking(date, time) {
    if (!this.bookedSlots.has(date)) {
      this.bookedSlots.set(date, new Set());
    }
    this.bookedSlots.get(date).add(time);
  }

  async submitBooking() {
    const formData = new FormData(document.getElementById('appointmentForm'));
    const bookingData = {
      date: this.selectedDate,
      time: this.selectedTime,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      service: formData.get('service'),
      message: formData.get('message')
    };

    const submitBtn = document.querySelector('#appointmentForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
    submitBtn.disabled = true;

    // Hide any existing messages
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';

    try {
      // Add booking to local storage (simulate backend)
      this.addBooking(this.selectedDate, this.selectedTime);
      
      // Send emails with proper ICS attachments
      await this.sendBookingEmails(bookingData);
      
      // Show success message
      document.getElementById('successMessage').style.display = 'block';
      
      // Reset form
      document.getElementById('appointmentForm').reset();
      this.resetSelection();
      
      // Scroll to success message
      document.getElementById('successMessage').scrollIntoView({ behavior: 'smooth' });
      
    } catch (error) {
      console.error('Booking error:', error);
      document.getElementById('errorMessage').style.display = 'block';
      document.getElementById('errorMessage').scrollIntoView({ behavior: 'smooth' });
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  async sendBookingEmails(bookingData) {
    const formattedDate = new Date(bookingData.date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const startTime = bookingData.time;
    const endTime = this.getEndTime(startTime);
    
    // Create calendar invite data
    const calendarData = {
      summary: `Consultation - ${bookingData.service}`,
      description: `Consultation with ${bookingData.name}\n\nService: ${bookingData.service}\nPhone: ${bookingData.phone}${bookingData.message ? `\n\nAdditional Information:\n${bookingData.message}` : ''}`,
      startDate: bookingData.date,
      startTime: startTime,
      endTime: endTime,
      location: 'Nairobi, Kenya (Virtual/In-person)',
      attendee: bookingData.email,
      organizer: 'info@funworksmedia.com'
    };

    try {
      // Send confirmation email to client (without calendar invite)
      await this.sendClientEmail(bookingData, formattedDate);
      
      // Send calendar invite to client (separate email with ICS attachment)
      await this.sendCalendarInvite(calendarData, bookingData.email, 'client');
      
      // Send notification to consultant (with client email as sender)
      await this.sendConsultantEmail(bookingData, formattedDate);
      
      // Send calendar invite to consultant
      await this.sendCalendarInvite(calendarData, 'info@funworksmedia.com', 'consultant');
      
      console.log('All booking emails sent successfully');
      
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendClientEmail(bookingData, formattedDate) {
    // Simple confirmation email without calendar invite
    const templateParams = {
      to_email: bookingData.email,
      subject: `Appointment Confirmation - ${bookingData.service}`,
      client_name: bookingData.name,
      service_name: bookingData.service,
      appointment_date: formattedDate,
      appointment_time: bookingData.time,
      phone_number: bookingData.phone,
      additional_info: bookingData.message || 'No additional information provided'
    };

    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );
  }

  async sendConsultantEmail(bookingData, formattedDate) {
    // Notification email to consultant with client email as sender
    const templateParams = {
      to_email: 'info@funworksmedia.com',
      from_email: bookingData.email, // Client's email as sender
      subject: `New Appointment Booking - ${bookingData.service}`,
      client_name: bookingData.name,
      client_email: bookingData.email,
      client_phone: bookingData.phone,
      service_name: bookingData.service,
      appointment_date: formattedDate,
      appointment_time: bookingData.time,
      additional_info: bookingData.message || 'No additional information provided'
    };

    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );
  }

  async sendCalendarInvite(calendarData, recipientEmail, recipientType) {
    // Create proper ICS file content
    const icalContent = this.createICalInvite(calendarData, recipientType);
    
    // Create a blob with the ICS content
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    
    // For EmailJS, we need to send the ICS content as a parameter
    // The template should handle the attachment
    const templateParams = {
      to_email: recipientEmail,
      subject: `Calendar Invite: ${calendarData.summary}`,
      ical_content: icalContent,
      event_summary: calendarData.summary,
      event_description: calendarData.description,
      event_start_date: calendarData.startDate,
      event_start_time: calendarData.startTime,
      event_end_time: calendarData.endTime,
      event_location: calendarData.location,
      recipient_type: recipientType
    };

    // Use a separate template for calendar invites
    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.CALENDAR_TEMPLATE_ID,
      templateParams
    );
  }

  createICalInvite(calendarData, recipientType) {
    // Create proper ICS format with correct timezone handling
    const startDateTime = `${calendarData.startDate}T${calendarData.startTime}:00`;
    const endDateTime = `${calendarData.startDate}T${calendarData.endTime}:00`;
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // Generate unique identifier
    const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@funworksmedia.com`;
    
    // Format dates for ICS (YYYYMMDDTHHMMSSZ)
    const formatDateForICS = (dateTime) => {
      return dateTime.replace(/[-:]/g, '').replace('T', '') + '00Z';
    };
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//FunWorks Media Consulting//Calendar Invite//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${formatDateForICS(startDateTime)}
DTEND:${formatDateForICS(endDateTime)}
SUMMARY:${calendarData.summary}
DESCRIPTION:${calendarData.description.replace(/\n/g, '\\n')}
LOCATION:${calendarData.location}
ORGANIZER;CN=FunWorks Media Consulting:mailto:${calendarData.organizer}
ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${recipientType === 'client' ? 'Client' : 'Consultant'}:mailto:${calendarData.attendee}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

    return icsContent;
  }

  getEndTime(startTime) {
    const timeMap = {
      '10:00': '11:00',
      '11:00': '12:00',
      '12:00': '13:00',
      '13:00': '14:00',
      '14:00': '15:00',
      '15:00': '16:00',
      '16:00': '17:00'
    };
    return timeMap[startTime] || '11:00';
  }

  resetSelection() {
    this.selectedDate = null;
    this.selectedTime = null;
    document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.time-slot.selected').forEach(el => el.classList.remove('selected'));
    document.getElementById('timeSlots').style.display = 'none';
    document.getElementById('bookingForm').style.display = 'none';
    document.getElementById('summaryDate').textContent = '-';
    document.getElementById('summaryTime').textContent = '-';
  }

  // TODO: Implement real calendar integration
  // This method should fetch actual availability from your calendar service
  async fetchRealTimeAvailability() {
    // Example integration with Google Calendar API
    // You'll need to implement this based on your calendar service
    
    /*
    // Google Calendar API example
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const events = await response.json();
    // Process events and update this.bookedSlots
    */
    
    // For now, return the current booked slots
    return this.bookedSlots;
  }
}

// Initialize the booking calendar when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new BookingCalendar();
});
// Add this to your booking-system.js file
class GoogleCalendarIntegration {
  constructor() {
    this.calendarId = 'primary'; // or your specific calendar ID
    this.apiKey = 'YOUR_GOOGLE_API_KEY';
  }

  async fetchAvailability(startDate, endDate) {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events?` +
      `timeMin=${startDate}T00:00:00Z&timeMax=${endDate}T23:59:59Z&` +
      `key=${this.apiKey}`
    );
    
    const data = await response.json();
    return this.processEvents(data.items);
  }

  processEvents(events) {
    const bookedSlots = new Map();
    
    events.forEach(event => {
      const start = new Date(event.start.dateTime || event.start.date);
      const dateString = start.toISOString().split('T')[0];
      const timeString = start.toTimeString().substring(0, 5);
      
      if (!bookedSlots.has(dateString)) {
        bookedSlots.set(dateString, new Set());
      }
      bookedSlots.get(dateString).add(timeString);
    });
    
    return bookedSlots;
  }
}
