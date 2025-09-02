// EmailJS Configuration
// Replace these with your actual EmailJS credentials
const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'BuaVL8Fc5jtxfZrdY', // Replace with your EmailJS public key
  SERVICE_ID: 'service_xc1ug1n', // Replace with your EmailJS service ID
  TEMPLATE_ID: 'template_dyuxwlo' // Replace with your EmailJS template ID
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
    // Simulate booked slots - replace with your backend data
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);
    
    // Add some sample bookings
    this.addBooking(tomorrow.toISOString().split('T')[0], '10:00');
    this.addBooking(tomorrow.toISOString().split('T')[0], '14:00');
    this.addBooking(dayAfterTomorrow.toISOString().split('T')[0], '11:00');
    this.addBooking(dayAfterTomorrow.toISOString().split('T')[0], '13:00');
    this.addBooking(dayAfterTomorrow.toISOString().split('T')[0], '15:00');
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
      
      // Send emails
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
      // Send confirmation email to client
      await this.sendClientEmail(bookingData, formattedDate);
      
      // Send calendar invite to client
      await this.sendCalendarInvite(calendarData, bookingData.email, 'client');
      
      // Send notification to consultant
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
    const templateParams = {
      to_email: bookingData.email,
      subject: `Appointment Confirmation - ${bookingData.service}`,
      name: bookingData.name,
      email: bookingData.email,
      phone: bookingData.phone,
      service: bookingData.service,
      date: formattedDate,
      time: bookingData.time,
      message: bookingData.message || 'No additional information provided'
    };

    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );
  }

  async sendConsultantEmail(bookingData, formattedDate) {
    const templateParams = {
      to_email: 'info@funworksmedia.com',
      subject: `New Appointment Booking - ${bookingData.service}`,
      name: bookingData.name,
      email: bookingData.email,
      phone: bookingData.phone,
      service: bookingData.service,
      date: formattedDate,
      time: bookingData.time,
      message: bookingData.message || 'No additional information provided'
    };

    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );
  }

  async sendCalendarInvite(calendarData, recipientEmail, recipientType) {
    // Create iCal format calendar invite
    const icalContent = this.createICalInvite(calendarData, recipientType);
    
    const templateParams = {
      to_email: recipientEmail,
      subject: `Calendar Invite: ${calendarData.summary}`,
      ical_content: icalContent,
      summary: calendarData.summary,
      description: calendarData.description,
      start_date: calendarData.startDate,
      start_time: calendarData.startTime,
      end_time: calendarData.endTime,
      location: calendarData.location
    };

    // You'll need to create a separate EmailJS template for calendar invites
    // or modify the existing template to include calendar attachment
    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID, // Create a separate template for calendar invites
      templateParams
    );
  }

  createICalInvite(calendarData, recipientType) {
    const startDateTime = `${calendarData.startDate}T${calendarData.startTime}:00`;
    const endDateTime = `${calendarData.startDate}T${calendarData.endTime}:00`;
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//FunWorks Media Consulting//Calendar Invite//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${Date.now()}@funworksmedia.com
DTSTAMP:${now}
DTSTART:${startDateTime.replace(/[-:]/g, '')}00Z
DTEND:${endDateTime.replace(/[-:]/g, '')}00Z
SUMMARY:${calendarData.summary}
DESCRIPTION:${calendarData.description.replace(/\n/g, '\\n')}
LOCATION:${calendarData.location}
ORGANIZER;CN=FunWorks Media Consulting:mailto:${calendarData.organizer}
ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${recipientType === 'client' ? 'Client' : 'Consultant'}:mailto:${calendarData.attendee}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
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
}

// Initialize the booking calendar when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new BookingCalendar();
});
