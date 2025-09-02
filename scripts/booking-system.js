// EmailJS Configuration
// Replace these with your actual EmailJS credentials
const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'BuaVL8Fc5jtxfZrdY', // Replace with your EmailJS public key
  SERVICE_ID: 'service_xc1ug1n', // Replace with your EmailJS service ID
  TEMPLATE_ID: 'template_dyuxwlo', // Replace with your EmailJS template ID
  CALENDAR_TEMPLATE_ID: 'template_vbfro99' // Separate template for calendar invites
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
    this.bookedSlots = new Map();
    this.maxBookingsPerDay = 3;
    this.calendarIntegration = null;
    
    this.init();
  }

  async init() {
    // Initialize Google Calendar integration
    this.calendarIntegration = new GoogleCalendarIntegration();
    
    // Load real-time availability
    await this.loadRealTimeAvailability();
    
    this.renderCalendar();
    this.bindEvents();
  }

  async loadRealTimeAvailability() {
    try {
      console.log('Loading real-time calendar availability...');
      
      // Get availability for next 2 months
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 2);
      
      this.bookedSlots = await this.calendarIntegration.fetchAvailability(startDate, endDate);
      
      console.log('Loaded calendar availability:', this.bookedSlots);
      
    } catch (error) {
      console.error('Error loading calendar availability:', error);
      // Fallback to empty availability if API fails
      this.bookedSlots = new Map();
    }
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

  async selectDate(dayElement) {
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
    
    // Update time slots for selected date with real-time data
    await this.updateTimeSlots();
  }

  async updateTimeSlots() {
    const timeSlots = document.querySelectorAll('.time-slot');
    const bookedTimes = this.bookedSlots.get(this.selectedDate) || new Set();
    
    // Get real-time availability for this date
    const availableSlots = await this.calendarIntegration.getAvailableTimeSlots(this.selectedDate);
    
    timeSlots.forEach(slot => {
      const time = slot.dataset.time;
      slot.classList.remove('booked', 'selected');
      
      if (!availableSlots.includes(time)) {
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
      // First, add booking to Google Calendar
      const calendarSuccess = await this.calendarIntegration.addBookingToCalendar(bookingData);
      
      if (!calendarSuccess) {
        throw new Error('Failed to add booking to calendar');
      }
      
      // Update local availability
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

  addBooking(date, time) {
    if (!this.bookedSlots.has(date)) {
      this.bookedSlots.set(date, new Set());
    }
    this.bookedSlots.get(date).add(time);
  }

  // ... rest of the email methods remain the same as in the previous version
  async sendBookingEmails(bookingData) {
    // Implementation remains the same as before
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
